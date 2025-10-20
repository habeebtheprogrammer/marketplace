const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { processProductMessage } = require('./lib/product-service')
const { getVendorIdFromPhone, isPhoneAuthorized } = require('./lib/config')
const { usersService } = require('../service')
const { processAIChat } = require('./aiChat')
const { removeCountryCode } = require('./helpers')

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

// Schedules a function to run asynchronously on the event loop ASAP
function runAsyncImmediate(fn) {
  return setImmediate(fn)
}

// Full background processing of an incoming WhatsApp webhook body
async function handleWebhookBackground(body) {
  try {
    const change = body?.entry?.[0]?.changes?.[0]
    if (!change || change.field !== 'messages' || !change.value?.messages?.length) return
    const message = change.value.messages[0]
    const fromNumber = message.from
    const messageId = message.id

    if (!isPhoneAuthorized(fromNumber)) {
      await sendWhatsAppMessage(process.env.WHATSAPP_PHONE_NUMBER_ID, 
        {
          messaging_product: 'whatsapp',
          to: fromNumber,
          type: 'text',
          text: {
            body: '❌ Your phone number is not authorized to create products. Please contact the administrator.'
          }
        }
      )
      return
    }

    const vendorId = getVendorIdFromPhone(fromNumber)
    if (!vendorId) {
      await sendWhatsAppMessage(process.env.WHATSAPP_PHONE_NUMBER_ID, 
        {
          messaging_product: 'whatsapp',
          to: fromNumber,
          type: 'text',
          text: {
            body: '❌ System error: Could not find your vendor account. Please contact support.'
          }
        }
      )
      return
    }

    if (message.type === 'image') {
      const imageId = message.image.id
      const caption = message.image.caption || ''
      if (!caption.trim()) {
        await sendWhatsAppMessage(process.env.WHATSAPP_PHONE_NUMBER_ID, 
          {
            messaging_product: 'whatsapp',
            to: fromNumber,
            type: 'text',
            text: {
              body: 'Please provide a description or price with your product image.'
            }
          }
        )
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
}

async function handleBotMessage(body){
  try {
        console.log('Webhook received:', JSON.stringify(body, null, 2))
    const change = body?.entry?.[0]?.changes?.[0]
    if (!change || change.field !== 'messages' || !change.value?.messages?.length) return
    const message = change.value.messages[0]
    const fromNumber = "+"+message.from
    console.log(fromNumber)
    // 1) Lookup user by phone number
    let foundUser = null
    try {
        // Fallback: explicit $in-style query for array fields (if supported by service layer)
        const byIn = await usersService.getUsers({ phoneNumber: { $in: [fromNumber] } })
        if (byIn?.totalDocs) foundUser = byIn.docs[0]
    } catch (e) {
      console.error('handleBotMessage user lookup error:', e?.message)
    }
    const phoneNumberId = change.value.metadata?.phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID

    if (foundUser) {
      // 2) Use local AI service (no HTTP)
      const prompt = (message?.text?.body || '').trim()
      if (!prompt) return

      let aiText = 'I had trouble processing your request. Please try again.'
      try {
        // Use userId as both sessionId and user scope for persistent memory
        aiText = await processAIChat(prompt, String(foundUser?._id), String(foundUser?._id), null)
      } catch (e) {
        console.error('AI chat local call failed:', e?.message)
      }

      // 3) Send AI response back to user
      const textMsg = {
        messaging_product: 'whatsapp',
        to: fromNumber,
        type: 'text',
        text: { body: aiText.slice(0, 4000) },
      }
      await sendWhatsAppMessage(phoneNumberId, textMsg)
      return
    }

    // 4) Not found: send onboarding template
    const templateMsg = {
      messaging_product: 'whatsapp',
      to: fromNumber,
      type: 'template',
      template: {
        name: 'onboard',
        language: { code: 'en' },
        components: [
          {
            type: 'HEADER',
            parameters: [
              {
                type: 'image',
                image: {
                  link: 'https://terra01.s3.amazonaws.com/images/photo-1609081219090-a6d81d3085bf%20%281%29.jpeg',
                },
              },
            ],
          },
          {
            type: 'BUTTON',
            sub_type: 'flow',
            index: '0',
            parameters: [
              {
                type: 'payload',
                payload: '{"flow_id": "823216183404453", "screen":"SIGN_UP"}',
              },
            ],
          },
        ],
      },
    }
    await sendWhatsAppMessage(phoneNumberId, templateMsg)
  } catch (err) {
    console.error('handleBotMessage error:', err)
  }
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
  if (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.trim()) {
    const maybe = process.env.PRIVATE_KEY
    return maybe.includes("\\n") ? maybe.replace(/\\n/g, "\n") : maybe
  }
  const keyPath = process.env.PRIVATE_KEY_PATH
  if (keyPath && fs.existsSync(keyPath)) {
    return fs.readFileSync(keyPath, 'utf8')
  }
  try {
    const projectRoot = path.resolve(__dirname, '..')
    const defaultRel = path.join(projectRoot, 'keys', '360-wa.pem')
    if (fs.existsSync(defaultRel)) return fs.readFileSync(defaultRel, 'utf8')
  } catch {}
  const absoluteHint = '/keys/360-wa.pem'
  if (fs.existsSync(absoluteHint)) {
    return fs.readFileSync(absoluteHint, 'utf8')
  }
  throw new Error('Missing RSA PRIVATE_KEY/PRIVATE_KEY_PATH for WhatsApp Flows encryption')
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

async function sendWhatsAppMessage(phoneNumberId, message) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  })
  if (!response.ok) {
    const errorBody = await response.text()
    console.error('sendWhatsAppMessage error:', response.status, errorBody)
  }
}



module.exports = {
  decryptRequest,
  encryptResponse,
  resolvePrivateKey,
  getWhatsAppMediaUrl,
  downloadWhatsAppMedia,
  uploadImageToExternalServer,
  sendWhatsAppMessage,
  runAsyncImmediate,
  handleWebhookBackground,
  handleBotMessage,
}
