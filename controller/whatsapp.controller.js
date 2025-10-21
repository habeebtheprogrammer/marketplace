 
const { processProductMessage } = require("../utils/lib/product-service")
const { getVendorIdFromPhone, isPhoneAuthorized } = require("../utils/lib/config")
const { usersService, journeyService } = require("../service")
const { successResponse, errorResponse } = require("../utils/responder")
const bcrypt = require("bcryptjs")
const { createToken, generateRandomNumber, sendOtpCode, removeCountryCode } = require("../utils/helpers")
const { decryptRequest, encryptResponse, resolvePrivateKey, getWhatsAppMediaUrl, downloadWhatsAppMedia, uploadImageToExternalServer, sendWhatsAppMessage, sendWhatsAppBotMessage, runAsyncImmediate, handleWebhookBackground, handleBotMessage } = require('../utils/whatsapp')

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
  // console.log(req.body)
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
          const currentScreen = screen
          const flowToken = decryptedBody?.flow_token || decryptedBody?.data?.flow_token || null

          if (screen === 'SIGN_UP') {
              const firstName = String(data.first_name || '').trim()
              const lastName = String(data.last_name || '').trim() || firstName
              const email = String(data.email || '').trim().toLowerCase()
              const password = String(data.password || '')
              const confirm = String(data.confirm_password || '')
              const termsOk = !!data.terms_agreement
              
              // --- Validation only (don't create user yet) ---
              if (!firstName || !email || !password) { 
                  res.set('Content-Type', 'text/plain')
                  return res.send(encryptResponse({ screen: currentScreen, data: { error_message: 'Missing first_name, email or password' } }, aesKeyBuffer, initialVectorBuffer)) 
              }
              if (password !== confirm) { 
                  res.set('Content-Type', 'text/plain')
                  return res.send(encryptResponse({ screen: currentScreen, data: { error_message: 'Passwords do not match' } }, aesKeyBuffer, initialVectorBuffer)) 
              }
              if (!termsOk) { 
                  res.set('Content-Type', 'text/plain')
                  return res.send(encryptResponse({ screen: currentScreen, data: { error_message: 'Terms must be accepted' } }, aesKeyBuffer, initialVectorBuffer)) 
              }
              
              const existing = await usersService.getUsers({ email })
              if (existing?.totalDocs) {
                  res.set('Content-Type', 'text/plain')
                  return res.send(encryptResponse({ screen: currentScreen, data: { error_message: 'Email already exists. Please sign in or use forgot password.' } }, aesKeyBuffer, initialVectorBuffer))
              }
              
              // Pass form data to webhook via optional params (webhook will create user)
              const formData = JSON.stringify({
                  firstName,
                  lastName,
                  email,
                  password, // Will be hashed in webhook
                  action: 'SIGN_UP'
              })
              
              const successPayload = {
                  screen: 'SUCCESS',
                  data: {
                      extension_message_response: {
                          params: {
                              flow_token: flowToken || 'unused',
                              optional_param1: formData
                          }
                      }
                  }
              }
              res.set('Content-Type', 'text/plain')
              return res.send(encryptResponse(successPayload, aesKeyBuffer, initialVectorBuffer))
          }

          if (screen === 'SIGN_IN') {
              const email = String(data.email || '').trim().toLowerCase()
              const password = String(data.password || '')
              
              // --- Validation only (don't authenticate yet) ---
              if (!email || !password) { 
                  res.set('Content-Type', 'text/plain')
                  return res.send(encryptResponse({ screen: currentScreen, data: { error_message: 'Missing email or password' } }, aesKeyBuffer, initialVectorBuffer)) 
              }
              
              const userRes = await usersService.getUsers({ email })
              if (!userRes?.totalDocs) { 
                  res.set('Content-Type', 'text/plain')
                  return res.send(encryptResponse({ screen: currentScreen, data: { error_message: 'Invalid credentials' } }, aesKeyBuffer, initialVectorBuffer)) 
              }
              
              const user = userRes.docs[0]
              const ok = await bcrypt.compare(password, user.password)
              if (!ok) { 
                  res.set('Content-Type', 'text/plain')
                  return res.send(encryptResponse({ screen: currentScreen, data: { error_message: 'Invalid credentials' } }, aesKeyBuffer, initialVectorBuffer)) 
              }
              
              // Pass user data to webhook via optional params (webhook will update phone and send welcome)
              const formData = JSON.stringify({
                  userId: String(user._id),
                  email: user.email,
                  action: 'SIGN_IN'
              })
              
              const successPayload = {
                  screen: 'SUCCESS',
                  data: {
                      extension_message_response: {
                          params: {
                              flow_token: flowToken || 'unused',
                              optional_param1: formData
                          }
                      }
                  }
              }
              res.set('Content-Type', 'text/plain')
              return res.send(encryptResponse(successPayload, aesKeyBuffer, initialVectorBuffer))
          }

          if (screen === 'FORGOT_PASSWORD') {
              const email = String(data.email || '').trim().toLowerCase()
              if (!email) { res.set('Content-Type', 'text/plain'); return res.send(encryptResponse({ screen: currentScreen, data: { error_message: 'Email is required' } }, aesKeyBuffer, initialVectorBuffer)) }
              const userRes = await usersService.getUsers({ email })
              if (!userRes?.totalDocs) { res.set('Content-Type', 'text/plain'); return res.send(encryptResponse({ screen: currentScreen, data: { error_message: 'If the email exists, an OTP will be sent.' } }, aesKeyBuffer, initialVectorBuffer)) }
              const code = generateRandomNumber(5)
              await usersService.updateUsers({ _id: userRes.docs[0]._id }, { verificationCode: String(code) })
              sendOtpCode(email, code)
              // Non-final success: prompt user to enter OTP in next step
              res.set('Content-Type', 'text/plain')
              return res.send(encryptResponse({ screen: currentScreen, data: { message: 'OTP sent to email' } }, aesKeyBuffer, initialVectorBuffer))
          }

          // Unknown screen: return error in required schema
          res.set('Content-Type', 'text/plain')
          return res.send(encryptResponse({ screen: currentScreen, data: { error_message: 'Unknown screen' } }, aesKeyBuffer, initialVectorBuffer))
        }
}

// Decrypt request from WhatsApp Flows (RSA-OAEP + AES-128-GCM)
// helpers now imported from utils/whatsapp

// Encrypt response to WhatsApp Flows (AES-128-GCM, Base64, IV flipped)
// helpers now imported from utils/whatsapp


// Handle incoming WhatsApp messages
exports.webhook = async (req, res, next) => {
    try {
        const body = req.body
    
        // respond fast to WhatsApp
        res.status(200).json({ status: 'accepted' })
        const change = body?.entry?.[0]?.changes?.[0]
        if (!change || change.field !== 'messages' || !change.value?.messages?.length) return
        const phoneNumberId = change.value.metadata.phone_number_id

        if(phoneNumberId == process.env.WHATSAPP_PHONE_NUMBER_ID){
          runAsyncImmediate(() => handleWebhookBackground(body))
        } else {
          handleBotMessage(body)
        }
        // Defer full processing to utils
    } catch (err) {
        console.error('Webhook handler error:', err)
        try { res.status(200).json({ status: 'accepted-with-error' }) } catch {}
    }
}