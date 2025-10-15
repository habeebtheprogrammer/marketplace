 
const { processProductMessage } = require("../utils/lib/product-service")
const { getVendorIdFromPhone, isPhoneAuthorized } = require("../utils/lib/config")
const { usersService, journeyService } = require("../service")
const { successResponse, errorResponse } = require("../utils/responder")
const bcrypt = require("bcryptjs")
const { createToken, generateRandomNumber, sendOtpCode, removeCountryCode } = require("../utils/helpers")
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

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
    console.log(req.body)
      // If request comes from WhatsApp Flows, it will be encrypted
      const isEncrypted = !!req.body?.encrypted_aes_key
      // Decrypt if necessary
      let decryptedBody, aesKeyBuffer, initialVectorBuffer
        if (isEncrypted) {
            const privateKeyPem = resolvePrivateKey()
            const passphrase = process.env.PRIVATE_KEY_PASSPHRASE || undefined
            ;({ decryptedBody, aesKeyBuffer, initialVectorBuffer } = decryptRequest(req.body, privateKeyPem, passphrase))
            console.log('Flows decrypted:', JSON.stringify(decryptedBody, null, 2))
            // Handle Health Check: action === 'ping' -> respond with encrypted Base64
            if (decryptedBody?.action === 'ping') {
                const payload = { data: { status: 'active' } }
                return res.send(encryptResponse(payload, aesKeyBuffer, initialVectorBuffer))
            }

            // Handle onboarding/signin/forgot via Flows screens
            const screen = String(decryptedBody?.screen || '').toUpperCase()
            const data = decryptedBody?.data || {}

            if (screen === 'SIGN_UP') {
                const firstName = String(data.first_name || '').trim()
                const lastName = String(data.last_name || '').trim() || firstName
                const email = String(data.email || '').trim().toLowerCase()
                const password = String(data.password || '')
                const confirm = String(data.confirm_password || '')
                const termsOk = !!data.terms_agreement
                if (!firstName || !email || !password) return successResponse(res, { ok: false, message: 'Missing first_name, email or password' })
                if (password !== confirm) return successResponse(res, { ok: false, message: 'Passwords do not match' })
                if (!termsOk) return successResponse(res, { ok: false, message: 'Terms must be accepted' })

                const existing = await usersService.getUsers({ email })
                if (existing?.totalDocs) {
                    return successResponse(res, { ok: false, message: 'Email already exists. Please sign in or use forgot password.' })
                }
                const hash = await bcrypt.hash(password, 10)
                const referralCode = firstName.substring(0, 4).toUpperCase() + generateRandomNumber(4)
                const created = await usersService.createUser({
                    email,
                    firstName,
                    lastName: lastName || firstName,
                    password: hash,
                    referralCode,
                })
                try { journeyService.handleUserSignup(created?._id) } catch (e) { console.log('journey signup error', e?.message) }
                return successResponse(res, { ok: true, user: { id: created?._id, email: created?.email, firstName: created?.firstName, lastName: created?.lastName } })
            }

            if (screen === 'SIGN_IN') {
                const email = String(data.email || '').trim().toLowerCase()
                const password = String(data.password || '')
                if (!email || !password) return successResponse(res, { ok: false, message: 'Missing email or password' })
                const userRes = await usersService.getUsers({ email })
                if (!userRes?.totalDocs) return successResponse(res, { ok: false, message: 'Invalid credentials' })
                const user = userRes.docs[0]
                const ok = await bcrypt.compare(password, user.password)
                if (!ok) return successResponse(res, { ok: false, message: 'Invalid credentials' })
                const token = createToken(JSON.stringify(user))
                return successResponse(res, { ok: true, token, user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName } })
            }

            if (screen === 'FORGOT_PASSWORD') {
                const email = String(data.email || '').trim().toLowerCase()
                if (!email) return successResponse(res, { ok: false, message: 'Email is required' })
                const userRes = await usersService.getUsers({ email })
                if (!userRes?.totalDocs) return successResponse(res, { ok: false, message: 'If the email exists, an OTP will be sent.' })
                const code = generateRandomNumber(5)
                await usersService.updateUsers({ _id: userRes.docs[0]._id }, { verificationCode: String(code) })
                sendOtpCode(email, code)
                return successResponse(res, { ok: true, message: 'OTP sent to email' })
            }

            // Unknown screen: return decrypted payload for inspection
            return successResponse(res, { ok: false, message: 'Unknown screen', payload: decryptedBody })
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
            const fromNumber = message.from
            const messageId = message.id
    
            if (!isPhoneAuthorized(fromNumber)) {
              await sendWhatsAppMessage(fromNumber, '❌ Your phone number is not authorized to create products. Please contact the administrator.')
              return
            }
    
            const vendorId = getVendorIdFromPhone(fromNumber)
            if (!vendorId) {
              await sendWhatsAppMessage(fromNumber, '❌ System error: Could not find your vendor account. Please contact support.')
              return
            }
    
            if (message.type === 'image') {
              const imageId = message.image.id
              const caption = message.image.caption || ''
              if (!caption.trim()) {
                await sendWhatsAppMessage(fromNumber, 'Please provide a description or price with your product image.')
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
          } catch (err) {
            console.error('Background processing error:', err)
          }
        })
      } catch (err) {
        console.error('Webhook handler error:', err)
        try { res.status(200).json({ status: 'accepted-with-error' }) } catch {}
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
  
  async function sendWhatsAppMessage(to, message) {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
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