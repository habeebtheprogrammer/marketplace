 
const { processProductMessage } = require("../utils/lib/product-service")
const { getVendorIdFromPhone, isPhoneAuthorized } = require("../utils/lib/config")
const { usersService, journeyService } = require("../service")
const { successResponse, errorResponse } = require("../utils/responder")
const bcrypt = require("bcryptjs")
const { createToken, generateRandomNumber, sendOtpCode, removeCountryCode } = require("../utils/helpers")

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
        const { firstName, lastName, email, phone, code ,encrypted_flow_data,encrypted_aes_key,initial_vector} = req.body || {}
        if(encrypted_flow_data && encrypted_aes_key && initial_vector){
          res.status(200).json({})
          return
        }
      
        const normalizedEmail = String(email || '').trim().toLowerCase()
        const phoneNormalized = phone ? removeCountryCode(String(phone)) : undefined

        // If code is provided, this is the verification step
        if (code) {
            if (!normalizedEmail) throw new Error('Email is required')
            const userRes = await usersService.getUsers({ email: normalizedEmail, verificationCode: String(code) })
            if (!userRes?.totalDocs) throw new Error('Incorrect otp. please try again')

            const userDoc = userRes.docs[0]
            const update = { verificationCode: "" }
            if (phoneNormalized) {
                // ensure phone number is saved and unique
                update.$addToSet = { phoneNumber: phoneNormalized }
            }
            const updated = await usersService.updateUsers({ _id: userDoc._id }, update)
            const token = createToken(JSON.stringify(updated))
            return successResponse(res, { verified: true, user: updated, token })
        }

        // Init step: requires firstName, email, and phone for WhatsApp
        if (!normalizedEmail) throw new Error('Email is required')
        if (!firstName) throw new Error('First name is required')

        const existing = await usersService.getUsers({ email: normalizedEmail })
        const verificationCode = generateRandomNumber(5)

        if (existing?.totalDocs) {
            // Existing user: update verification code and attach phone
            const update = { verificationCode: String(verificationCode) }
            if (phoneNormalized) update.$addToSet = { phoneNumber: phoneNormalized }
            const updated = await usersService.updateUsers({ _id: existing.docs[0]._id }, update)
            // send email
            sendOtpCode(normalizedEmail, verificationCode)
            return successResponse(res, { next: 'verify', exists: true })
        } else {
            // New user: create with random password, save phone, and send code
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
            // Fire and forget journey signup
            try { journeyService.handleUserSignup(created?._id) } catch (e) { console.log('journey signup error', e?.message) }
            // send email
            sendOtpCode(normalizedEmail, verificationCode)
            return successResponse(res, { next: 'verify', exists: false })
        }
    } catch (error) {
        return errorResponse(res, error)
    }
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