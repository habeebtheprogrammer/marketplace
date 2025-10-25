const fetch = require('node-fetch')

function sanitizeParam(input, maxLen = 1024) {
  try {
    let s = String(input == null ? '' : input)
    // Remove newlines/tabs and collapse multiple spaces
    s = s.replace(/[\n\r\t]+/g, ' ')
         .replace(/ {2,}/g, ' ')
         .trim()
    // Enforce WA param length
    if (s.length > maxLen) s = s.slice(0, maxLen)
    return s
  } catch {
    return ''
  }
}

function normalizeUrl(url) {
  const base = 'https://360gadgetsafrica.com/gadgets'
  const home = 'https://360gadgetsafrica.com'
  if (!url) return home
  const s = String(url).trim()
  if (!s) return home
  if (/^https?:\/\//i.test(s)) return s
  if (s.startsWith('/')) return base + s
  return base + '/' + s
}

async function sendWhatsAppMessage(phoneNumberId, message) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const response = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  })
  if (!response.ok) {
    const errorBody = await response.text()
    console.error('sendWhatsAppMessage error:', response.status, errorBody)
  }
}

async function sendProductTemplate(phoneNumberId, toNumber, { title, description, priceLine, imageUrl, productUrl }) {
  // Trim aggressively to satisfy WA 1024 char limit for the body (template text + params)
  let safeTitle = sanitizeParam(title, 120)
  let safeDescription = sanitizeParam(description, 600)
  let safePrice = sanitizeParam(priceLine, 80)

  // Safety: ensure combined params stay under ~900 chars to account for template body text
  const combinedLen = (safeTitle.length + safeDescription.length + safePrice.length)
  const MAX_COMBINED = 300
  if (combinedLen > MAX_COMBINED) {
    const overflow = combinedLen - MAX_COMBINED
    // Reduce description primarily
    const newDescLen = Math.max(0, safeDescription.length - overflow)
    safeDescription = safeDescription.slice(0, newDescLen)
  }
  const safeUrl = normalizeUrl(productUrl)

  const templateMsg = {
    messaging_product: 'whatsapp',
    to: toNumber.replace('+', ''),
    type: 'template',
    template: {
      name: 'buy_now',
      language: { code: 'en_US' },
      components: [
        { type: 'header', parameters: [ { type: 'image', image: { link: imageUrl || 'https://terra01.s3.amazonaws.com/images/photo-1609081219090-a6d81d3085bf%20%281%29.jpeg' } } ] },
        { type: 'body', parameters: [
          { type: 'text', text: safeTitle },
          { type: 'text', text: safeDescription },
          { type: 'text', text: safePrice },
        ] },
        { type: 'button', sub_type: 'url', index: 0, parameters: [ { type: 'text', text: safeUrl } ] }
      ]
    }
  }
  console.log(phoneNumberId)
  await sendWhatsAppMessage(phoneNumberId, templateMsg)
}

async function sendReceiptTemplate(phoneNumberId, toNumber, { ref, description, balance, imageUrl } = {}) {
  const safeRef = sanitizeParam(ref, 120)
  const safeDescription = sanitizeParam(description, 600)
  const safeBalance = sanitizeParam(balance, 60)
  const receiptImage = imageUrl || 'https://terra01.s3.amazonaws.com/images/receipt-1.jpg'

  const to = String(toNumber || '').replace(/^\+/, '')
  if (!to) return

  const templateMsg = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: 'transaction_successful',
      language: { code: 'en_US' },
      components: [
        {
          type: 'header',
          parameters: [
            {
              type: 'image',
              image: { link: receiptImage },
            },
          ],
        },
        {
          type: 'body',
          parameters: [
            { type: 'text', text: safeDescription },
            { type: 'text', text: safeRef },
            { type: 'text', text: safeBalance },
          ],
        },
      ],
    },
  }

  await sendWhatsAppMessage(phoneNumberId, templateMsg)
}

async function sendConfirmationTemplate(phoneNumberId, toNumber, { text } = {}) {
  const safeText = sanitizeParam(text, 600)

  const to = String(toNumber || '').replace(/^[+]/, '')
  if (!to || !safeText) return

  const templateMsg = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: 'confirmation',
      language: { code: 'en_US' },
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: safeText,
            },
          ],
        },
      ],
    },
  }

  await sendWhatsAppMessage(phoneNumberId, templateMsg)
}

async function sendTextMessage(phoneNumberId, toNumber, body) {
  const text = sanitizeParam(body, 4000)
  if (!text) return
  const message = {
    messaging_product: 'whatsapp',
    to: toNumber.replace('+', ''),
    type: 'text',
    text: { body: text, preview_url: true },
  }
  await sendWhatsAppMessage(phoneNumberId, message)
}

module.exports = { sendProductTemplate, sendReceiptTemplate, sendConfirmationTemplate, sendTextMessage }


