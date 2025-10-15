 
const { processProductMessage } = require("../utils/lib/product-service")
const { getVendorIdFromPhone, isPhoneAuthorized } = require("../utils/lib/config")
const { usersService, journeyService } = require("../service")
const { successResponse, errorResponse } = require("../utils/responder")
const bcrypt = require("bcryptjs")
const { createToken, generateRandomNumber, sendOtpCode, removeCountryCode } = require("../utils/helpers")
const crypto = require("crypto")
const fs = require("fs")
const path = require("path")

// WhatsApp webhook verification
exports.getWhatsapp = async (req, res, next) => {
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN
    if (mode === 'subscribe' && token === VERIFY_TOKEN) return res.status(200).send(challenge)
    return res.status(403).send('Forbidden')
}

// WhatsApp Onboarding (init + verify)
exports.onboardWhatsApp = async (req, res, next) => {
    try {
      console.log(req.body)
        // If request comes from WhatsApp Flows, it will be encrypted
        const isEncrypted = !!req.body?.encrypted_aes_key
        // Decrypt if necessary
        let decryptedBody, aesKeyBuffer, initialVectorBuffer
        if (isEncrypted) {
            const privateKeyPem = resolvePrivateKey()
            console.log(String(privateKeyPem))
            const passphrase = process.env.PRIVATE_KEY_PASSPHRASE || undefined
            ;({ decryptedBody, aesKeyBuffer, initialVectorBuffer } = decryptRequest(req.body, privateKeyPem, passphrase))
            // Handle Health Check: action === 'ping' -> respond with encrypted Base64
            if (decryptedBody?.action === 'ping') {
                const payload = { data: { status: 'active' } }
                return res.send(encryptResponse(payload, aesKeyBuffer, initialVectorBuffer))
            }
        }
    } catch (error) {
        return errorResponse(res, error)
    }
}

// Decrypt request from WhatsApp Flows (RSA-OAEP + AES-128-GCM)
function decryptRequest(body, privatePem, passphrase) {
    const { encrypted_aes_key, encrypted_flow_data, initial_vector } = body
    const privateKey = crypto.createPrivateKey(passphrase ? { key: privatePem, passphrase } : { key: privatePem })
    const decryptedAesKey = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        },
        Buffer.from(encrypted_aes_key, 'base64')
    )

    const flowDataBuffer = Buffer.from(encrypted_flow_data, 'base64')
    const initialVectorBuffer = Buffer.from(initial_vector, 'base64')
    const TAG_LENGTH = 16
    const encryptedBody = flowDataBuffer.subarray(0, -TAG_LENGTH)
    const encryptedTag = flowDataBuffer.subarray(-TAG_LENGTH)

    const decipher = crypto.createDecipheriv('aes-128-gcm', decryptedAesKey, initialVectorBuffer)
    decipher.setAuthTag(encryptedTag)
    const decryptedJSONString = Buffer.concat([decipher.update(encryptedBody), decipher.final()]).toString('utf-8')
    return { decryptedBody: JSON.parse(decryptedJSONString), aesKeyBuffer: decryptedAesKey, initialVectorBuffer }
}

// Encrypt response to WhatsApp Flows (AES-128-GCM, Base64, IV flipped)
function encryptResponse(response, aesKeyBuffer, initialVectorBuffer) {
    const flipped = []
    for (const pair of initialVectorBuffer.entries()) {
        const byte = pair[1]
        flipped.push((~byte) & 0xff)
    }
    const cipher = crypto.createCipheriv('aes-128-gcm', aesKeyBuffer, Buffer.from(flipped))
    const enc = Buffer.concat([
        cipher.update(JSON.stringify(response), 'utf-8'),
        cipher.final(),
        cipher.getAuthTag(),
    ])
    return enc.toString('base64')
}

function resolvePrivateKey() {
    // Prefer env var PRIVATE_KEY (supports \n-escaped)
    if (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.trim()) {
        const maybe = process.env.PRIVATE_KEY
        // Replace literal \n with newline for env-friendly storage
        return maybe.includes("\\n") ? maybe.replace(/\\n/g, "\n") : maybe
    }
    // Support PRIVATE_KEY_PATH pointing to PEM file
    const keyPath = process.env.PRIVATE_KEY_PATH
    if (keyPath && fs.existsSync(keyPath)) {
        return fs.readFileSync(keyPath, 'utf8')
    }
    // Fallbacks: common default locations
    try {
        const projectRoot = path.resolve(__dirname, '..')
        const defaultRel = path.join(projectRoot, 'keys', '360-wa.pem')
        if (fs.existsSync(defaultRel)) return fs.readFileSync(defaultRel, 'utf8')
    } catch{}
    // Absolute path provided by user (as last resort)
    const absoluteHint = '/keys/360-wa.pem'
    if (fs.existsSync(absoluteHint)) {
        return fs.readFileSync(absoluteHint, 'utf8')
    }
    throw new Error('Missing RSA PRIVATE_KEY/PRIVATE_KEY_PATH for WhatsApp Flows encryption')
}

// Handle incoming WhatsApp messages
exports.postWhatsapp = async (req, res, next) => {
    try {
        const body = req.body
        console.log('Webhook received:', JSON.stringify(body, null, 2))

        // respond fast to WhatsApp
        res.status(200).json({ status: 'accepted' })

        // background processing
        setImmediate(async () => {
          try {
            const change = body?.entry?.[0]?.changes?.[0]
            if (!change || change.field !== 'messages' || !change.value?.messages?.length) return
            const message = change.value.messages[0]
            const fromNumber = message.from // user wa id
            const businessNumber = message?.context?.from // business line

            // Route based on business line
            if (businessNumber === '2349084535024') {
              await handleOnboardingFlow(change.value, message, fromNumber, businessNumber)
              return
            }

            if (businessNumber === '2348039938596') {
              await handleProductFlow(change.value, message, fromNumber, businessNumber)
              return
            }

            // Default: ignore or extend with future handlers
          } catch (err) {
            console.error('Background processing error:', err)
          }
        })
      } catch (err) {
        console.error('Webhook handler error:', err)
        try { res.status(200).json({ status: 'accepted-with-error' }) } catch {}
      }
}

async function handleOnboardingFlow(value, message, fromNumber, businessNumber) {
  try {
    const contacts = value?.contacts || []
    const waId = contacts?.[0]?.wa_id || fromNumber
    const phoneNormalized = waId ? removeCountryCode(String(waId)) : undefined

    // Parse flow interactive response if present
    let payload = {}
    if (message?.type === 'interactive' && message?.interactive?.type === 'nfm_reply') {
      const resp = message?.interactive?.nfm_reply?.response_json
      try { payload = JSON.parse(resp || '{}') } catch {}
    }

    const firstName = payload?.screen_0_First_Name_0
    const lastName = payload?.screen_0_Last_Name_1 || firstName
    const email = payload?.screen_0_Email_Address_2
    const code = payload?.screen_1_User_Pin_0 || payload?.pin

    if (code && email) {
      // Verify path
      const normalizedEmail = String(email).trim().toLowerCase()
      const userRes = await usersService.getUsers({ email: normalizedEmail, verificationCode: String(code) })
      if (!userRes?.totalDocs) {
        await sendWhatsAppMessage(fromNumber, '❌ Incorrect code. Please try again.', businessNumber)
        return
      }
      const update = { verificationCode: '' }
      if (phoneNormalized) update.$addToSet = { phoneNumber: phoneNormalized }
      const updated = await usersService.updateUsers({ _id: userRes.docs[0]._id }, update)
      await sendWhatsAppMessage(fromNumber, `✅ Verified! Welcome, ${updated.firstName}.`, businessNumber)
      return
    }

    // Init path
    if (!email || !firstName) {
      await sendWhatsAppMessage(fromNumber, 'Please provide your first name and email in the flow to continue.', businessNumber)
      return
    }
    const normalizedEmail = String(email).trim().toLowerCase()
    const existing = await usersService.getUsers({ email: normalizedEmail })
    const verificationCode = generateRandomNumber(5)

    if (existing?.totalDocs) {
      const update = { verificationCode: String(verificationCode) }
      if (phoneNormalized) update.$addToSet = { phoneNumber: phoneNormalized }
      await usersService.updateUsers({ _id: existing.docs[0]._id }, update)
      sendOtpCode(normalizedEmail, verificationCode)
      await sendWhatsAppMessage(fromNumber, 'We sent a verification code to your email. Enter it in the next screen.', businessNumber)
      return
    }

    const randPassword = Math.random().toString(36).slice(-10)
    const hash = await bcrypt.hash(randPassword, 10)
    const referralCode = String(firstName).substring(0, 4).toUpperCase() + generateRandomNumber(4)
    const userPayload = {
      email: normalizedEmail,
      firstName: String(firstName).trim(),
      lastName: String(lastName || firstName).trim(),
      password: hash,
      referralCode,
      verificationCode: String(verificationCode),
    }
    if (phoneNormalized) userPayload.phoneNumber = [phoneNormalized]
    const created = await usersService.createUser(userPayload)
    try { journeyService.handleUserSignup(created?._id) } catch (e) { console.log('journey signup error', e?.message) }
    sendOtpCode(normalizedEmail, verificationCode)
    await sendWhatsAppMessage(fromNumber, 'Account created! We sent a verification code to your email. Enter it in the next screen.', businessNumber)
  } catch (e) {
    console.error('handleOnboardingFlow error:', e)
    try { await sendWhatsAppMessage(fromNumber, 'An error occurred. Please try again later.', businessNumber) } catch {}
  }
}

async function handleProductFlow(value, message, fromNumber, businessNumber) {
  // Keep existing product processing logic
  if (!isPhoneAuthorized(fromNumber)) {
    await sendWhatsAppMessage(fromNumber, '❌ Your phone number is not authorized to create products. Please contact the administrator.', businessNumber)
    return
  }

  const vendorId = getVendorIdFromPhone(fromNumber)
  if (!vendorId) {
    await sendWhatsAppMessage(fromNumber, '❌ System error: Could not find your vendor account. Please contact support.', businessNumber)
    return
  }

  const messageId = message.id
  if (message.type === 'image') {
    const imageId = message.image.id
    const caption = message.image.caption || ''
    if (!caption.trim()) {
      await sendWhatsAppMessage(fromNumber, 'Please provide a description or price with your product image.', businessNumber)
      return
    }
    const whatsappMediaUrl = await getWhatsAppMediaUrl(imageId)
    if (!whatsappMediaUrl) throw new Error('Could not retrieve WhatsApp media URL.')
    const { buffer, contentType } = await downloadWhatsAppMedia(whatsappMediaUrl)
    const uploadedImageUrl = await uploadImageToExternalServer(buffer, contentType, imageId)
    const imageDataBase64 = buffer.toString('base64')
    await processProductMessage(
      uploadedImageUrl,
      `data:${contentType};base64,${imageDataBase64}`,
      caption,
      messageId,
      fromNumber,
      vendorId
    )
  } else if (message.type === 'text') {
    const messageText = message.text?.body || ''
    await processProductMessage('', '', messageText, messageId, fromNumber, vendorId)
  }
}

async function getWhatsAppMediaUrl(mediaId) {
    try {
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
      const response = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`Failed to get media URL: ${response.status} ${response.statusText}. Body: ${errorBody}`)
      }
      const data = await response.json()
      return data.url
    } catch (e) {
      console.error('getWhatsAppMediaUrl error:', e)
      return null
    }
  }
  
  async function downloadWhatsAppMedia(mediaUrl) {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const response = await fetch(mediaUrl, { headers: { Authorization: `Bearer ${accessToken}` } })
    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`Failed to download media: ${response.status} ${response.statusText}. Body: ${errorBody}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    return { buffer, contentType }
  }
  
  async function uploadImageToExternalServer(imageBuffer, contentType, imageId) {
    const API_UPLOAD_URL = process.env.API_BASE_URL + '/products/pushimgs'
    const API_KEY = process.env.GADGETS_API_KEY
  
    const formData = new FormData()
    const blob = new Blob([imageBuffer], { type: contentType })
    formData.append('images', blob, `${imageId}.${(contentType.split('/')?.[1]) || 'jpeg'}`)
  
    const response = await fetch(API_UPLOAD_URL, {
      method: 'POST',
      headers: {
        ...(API_KEY && { Authorization: `Bearer ${API_KEY}` }),
        ...(API_KEY && { 'X-API-Key': API_KEY }),
      },
      body: formData,
    })
    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`Failed to upload image: ${response.status} ${response.statusText}. Body: ${errorBody}`)
    }
    const data = await response.json()
    const url = data?.data?.images?.[0]
    if (!url) throw new Error('Upload API did not return images[0]')
    return url
  }
  
  async function sendWhatsAppMessage(to, message, businessNumber) {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = resolvePhoneNumberId(businessNumber)
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: message } }),
    })
    if (!response.ok) {
      const errorBody = await response.text()
      console.error('sendWhatsAppMessage error:', response.status, errorBody)
    }
  }

  function resolvePhoneNumberId(businessNumber) {
    // Allow specific env var per business number, fallback to defaults
    if (businessNumber) {
      const specificVar = process.env[`WHATSAPP_PHONE_ID_${businessNumber}`]
      if (specificVar) return specificVar
    }
    // Named envs for known lines
    if (businessNumber === '2349084535024' && process.env.WHATSAPP_PHONE_NUMBER_ID_ONBOARD) {
      return process.env.WHATSAPP_PHONE_NUMBER_ID_ONBOARD
    }
    if (businessNumber === '2348039938596' && process.env.WHATSAPP_PHONE_NUMBER_ID_PRODUCTS) {
      return process.env.WHATSAPP_PHONE_NUMBER_ID_PRODUCTS
    }
    // Global fallback
    return process.env.WHATSAPP_PHONE_NUMBER_ID
  }