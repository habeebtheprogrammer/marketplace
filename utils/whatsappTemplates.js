const fetch = require('node-fetch')

async function sendWhatsAppMessage(phoneNumberId, message) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
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
          { type: 'text', text: String(title || '').slice(0, 1024) },
          { type: 'text', text: String(description || '').slice(0, 1024) },
          { type: 'text', text: String(priceLine || '').slice(0, 1024) },
        ] },
        { type: 'button', sub_type: 'url', index: 0, parameters: [ { type: 'text', text: productUrl } ] }
      ]
    }
  }
  await sendWhatsAppMessage(phoneNumberId, templateMsg)
}

module.exports = { sendProductTemplate }


