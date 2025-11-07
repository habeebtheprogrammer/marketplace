const { GoogleGenerativeAI } = require('@google/generative-ai')
const mongoose = require('mongoose')
const fetch = require('node-fetch')
const { createToken } = require('./helpers')
const { detectNetwork, isValidNigerianPhone, sanitizePhone } = require('./vtu')
const {
  ALLOWED_NETWORKS,
  CONFIRM_WORDS,
  DEFAULT_PAGE_LIMIT,
  DEFAULT_PRODUCT_TEMPLATE_LIMIT,
  SESSION_HISTORY_LIMIT,
  SESSION_FETCH_LIMIT,
  PENDING_PURCHASE_TIMEOUT_MS,
} = require('./constants')
const { sendConfirmationTemplate, sendTextMessage } = require('./whatsappTemplates')
const waChatSessions = require('../service/whatsappChatSessions.service')
const services = require('../service')
const moment = require('moment')
const { formatKnowledgeBase } = require('./knowledgeBase')
const CONFIRM_WORD_SET = new Set(CONFIRM_WORDS.map(w => w.toLowerCase()))
// Initialize Gemini once
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-pro'
// System instruction tailored for WhatsApp bot (persona + behavior)
function getSystemPrompt(userContext = {}) {
  const { userPhone, userNetwork, userName } = userContext

  let contextInfo = ''
  if (userPhone && userNetwork) {
    contextInfo = `
USER CONTEXT:
- User's WhatsApp phone: ${userPhone}
- User's network: ${userNetwork}
- User's name: ${userName || 'User'}
IMPORTANT: When the user wants to buy airtime or data for their own phone line, automatically use their phone number (${userPhone}) and network (${userNetwork}). Do NOT ask for phone number or network in such cases.
`
  }
  // Load knowledge base
  const knowledgeBaseText = formatKnowledgeBase()
  
  return `You are an advanced AI assistant designed to act as a smart customer support & operations chatbot for 360 Gadgets Africa.
Your purpose is to help users manage their accounts, perform wallet & VTU transactions, and make product inquiries intelligently.
Company website: https://www.360gadgetsafrica.com. You may learn business information dynamically from this website and its sitemap and use it to improve answers (product types, services, pricing, etc.).
${contextInfo}
${knowledgeBaseText}
Core Functional Areas
1) User Profile Management
- Get user profile details (name, email, wallet balance, activity).
- Update user details (e.g., name, email, phone number).
- Check and display referral code or bonus.
2) Data & Airtime Top-up
- For AIRTIME: Network is ALWAYS automatically detected from the phone number. NEVER ask the user for network when buying airtime. Just use the phone number provided and the system will detect the network automatically.
- For DATA: Help user select network (MTN, GLO, Airtel, 9mobile) if not specified. Network can be detected from phone number if provided.
- Show paginated data or airtime plan lists dynamically from backend datalists.
- Guide the purchase flow: For airtime: Enter phone/amount → Confirm → Execute (network auto-detected). For data: Select network → Select plan → Enter phone → Confirm purchase → Execute.
- Handle failed transactions gracefully with recovery steps.
- AUTO-DETECT: When user wants airtime/data for themselves, use their phone and network automatically.
- CRITICAL: When user asks for a data plan (e.g., "MTN 3.2GB under 2000"), you MUST call getDataPlans with planName set to the size mentioned (e.g., planName: "3.2GB"). NEVER say a plan doesn't exist without calling the tool first.
- CRITICAL TRANSACTION ISSUES: When customers report transaction problems (e.g., data/airtime not delivered, payment issues, transaction marked successful but service not received, delivery failures, etc.), DO NOT claim to escalate, log, file complaints, or handle the issue yourself. You CANNOT escalate issues or log complaints. Simply direct them to contact support directly: Phone/WhatsApp: 0705 722 1476, Email: support@360gadgetsafrica.com. Be empathetic and apologize, but make it clear they need to contact support for resolution.
3) Wallet Management
- Show current wallet balance; provide funding guidance.
- Show transaction history.
- Deduct wallet balance after successful purchases.
4) Product Enquiry
- Let users ask about available gadgets (e.g., iPhones, laptops, accessories).
- Fetch product details (price, availability, specs, promotions) using backend product services.
- Support filtering by price range, category, availability. Recommend similar products if unavailable.
- CRITICAL: When searchProducts returns "SEARCH_COMPLETE:X:Y", it means X WhatsApp template cards have been sent automatically (out of Y total matches). DO NOT list products in text. Simply say something like "I found Y products and sent you the top X. Reply with a number to see details, or 'more' to load more."
Integration Instructions
- You may call controller/service functions in-process to fetch/update data, and you may guide users through flows on WhatsApp.
- Use natural language understanding to map user intents to the correct function call.
- When unsure, ask clarifying questions; always confirm before executing transactions.
- For self-purchases (airtime/data to user's own phone), automatically use their phone number and network.
- Smart Behavior
- Respond conversationally in short, readable WhatsApp-friendly text (not JSON).
- Personalize using user profile data when available.
- Handle errors gracefully and propose next steps.
- Be proactive: if user says "buy airtime" or "buy data" without specifying phone, assume they mean their own phone.
- IMPORTANT: When user says "yes", "confirm", "ok", "proceed", etc., look at the conversation history to understand what they're confirming.
- If the last assistant message was asking for confirmation of a purchase, interpret "yes" as confirmation with confirm: true.
- Always maintain context from previous messages in the conversation.
- RETRY FUNCTIONALITY: When user says "retry", "buy again", "purchase again", "repeat", or "redo", call retryLastTransaction to fetch their last transaction and show confirmation. The system will automatically detect if it's a data or airtime purchase and prepare the retry with all details from the database.
- TRANSACTION ISSUES POLICY: If a customer reports any transaction problem (data/airtime not delivered, payment deducted but service not received, delivery failures, etc.), respond with empathy and immediately direct them to support. Example response: "I'm sorry to hear about this issue. Please contact our support team directly for immediate assistance: Phone/WhatsApp: 0705 722 1476, Email: support@360gadgetsafrica.com. They will investigate and resolve this for you." DO NOT claim you will escalate, log, file complaints, or handle it yourself. You are a chatbot and cannot perform these actions.
- TECHNICIAN & REPAIR SERVICES: When customers ask about repairs, diagnostics, or need a technician, ALWAYS call the getTechnician tool. The tool will ask for location conversationally first (if not recently asked) to make the conversation natural, but location is NOT used for filtering - all technicians are always returned. After the tool sends all technicians individually, continue the conversation naturally and personally. Relate your response to their specific query (e.g., if they asked about phone repair, mention that these partners can help with phone repairs). Be friendly and helpful, and ask if there's anything else you can help with. The URL format is: https://360gadgetsafrica.com/technicians/{slug}. The technician information will be saved to session metadata with the URL included.
`
}
// Helpers for WhatsApp-friendly formatting
function formatMoney(amount, currency = 'NGN') {
  const n = Number(amount || 0)
  const sym = currency === 'NGN' ? '₦' : ''
  return `${sym}${n.toLocaleString('en-NG', { maximumFractionDigits: 2 })}`
}
function formatDate(dt) {
  try { return new Date(dt).toLocaleString('en-NG') } catch { return String(dt || '') }
}
function parseSizeToMB(value) {
  if (value == null) return null
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  const match = String(value).toUpperCase().match(/([0-9]+(?:\.[0-9]+)?)\s*(TB|GB|MB)?/)
  if (!match) return null
  const num = parseFloat(match[1])
  const unit = match[2] || 'MB'
  if (unit === 'TB') return num * 1024 * 1024
  if (unit === 'GB') return num * 1024
  return num
}
function megabytesFromPlanName(name) {
  const mb = parseSizeToMB(name)
  return mb == null ? Number.MAX_SAFE_INTEGER : mb
}
function isConfirmationMessage(message) {
  if (!message) return false
  const tokens = String(message).toLowerCase().match(/[a-z]+/g) || []
  return tokens.some(token => CONFIRM_WORD_SET.has(token))
}
const nowIso = () => new Date().toISOString()
const hasPendingPurchaseExpired = (pending) => {
  if (!pending?.expiresAt) return false
  const expires = new Date(pending.expiresAt).getTime()
  return Number.isFinite(expires) && expires < Date.now()
}
function extractErrorMessage(data, fallback = 'Unknown error') {
  if (!data) return fallback
  const parts = [].concat(data?.errors || data?.error || [])
    .map(item => {
      if (!item) return null
      if (typeof item === 'string') return item
      if (typeof item === 'object') {
        return item.message || item.msg || item.reason || null
      }
      return null
    })
    .filter(Boolean)
  if (parts.length) return parts[0]
  if (typeof data?.message === 'string') return data.message
  if (typeof data?.error === 'string') return data.error
  return fallback
}
async function updateSessionMetadata(sessionId, metadata, userId, waId) {
  if (!sessionId) return
  try {
    await waChatSessions.updateSession(String(sessionId), metadata, userId, waId)
  } catch (error) {
    console.log('Failed to update session metadata', {
      sessionId,
      userId,
      deviceId: waId,
      metadata,
      error: error?.message,
    })
  }
}
function getSupportContactInfo() {
  return {
    phone: '0705 722 1476',
    whatsapp: '0705 722 1476',
    email: 'support@360gadgetsafrica.com',
    message: 'For assistance with this transaction, please contact our support team:\nPhone/WhatsApp: 0705 722 1476\nEmail: support@360gadgetsafrica.com'
  }
}

async function getFundingAccountDetails(userId) {
  try {
    const user = await services.usersService.getUserById(userId)
    if (!user) return null
    const token = createToken(JSON.stringify({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      email: user.email,
      banned: user.banned,
      phoneNumber: user.phoneNumber,
      oneSignalId: user.oneSignalId
    }))
    const base = process.env.API_BASE_URL || 'http://localhost:4000/api'
    const resp = await fetch(`${base}/wallets`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })
    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) return null
    const accounts = Array.isArray(data?.accounts) ? data.accounts : []
    if (accounts.length === 0) return null
    const lines = accounts.map((a) => `*${a.accountName}*\n*${a.accountNumber}*\n*${a.bankName}*`)
    return `To fund your wallet, kindly send any amount to your virtual account below:\n\n${lines.join('\n\n')}\n\n📌 Please pin this chat to easily access your account details.`
  } catch (e) {
    console.error('Error fetching funding account:', e.message)
    return null
  }
}
async function getConversationHistory(userId, waId, limit = SESSION_HISTORY_LIMIT) {
  try {
    const list = await waChatSessions.getUserSessions(userId, waId, {
      page: 1,
      limit: SESSION_FETCH_LIMIT,
      sort: { updatedAt: -1 },
    })
    const session = Array.isArray(list?.docs) ? list.docs[0] : null
    const messages = Array.isArray(session?.messages) ? session.messages : []
    return messages.slice(-limit)
  } catch (error) {
    console.warn('Failed to load conversation history', {
      userId,
      deviceId: waId,
      error: error?.message,
    })
    return []
  }
}
function toolDeclarations() {
  return [{
    functionDeclarations: [
      {
        name: 'getUserAccount',
        description: 'Retrieve the user account summary including wallet balance',
        parameters: { type: 'object', properties: {} }
      },
      {
        name: 'getWalletBalance',
        description: 'Get wallet balance only',
        parameters: { type: 'object', properties: {} }
      },
      {
        name: 'getFundingAccount',
        description: 'Fetch user\'s Monnify virtual account details and current balance for funding the wallet',
        parameters: { type: 'object', properties: {} }
      },
      {
        name: 'updateUserAccount',
        description: 'Update the user\'s profile fields',
        parameters: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            phoneNumber: { type: 'array', items: { type: 'string' } },
            password: { type: 'string' },
          }
        }
      },
      {
        name: 'getTransactions',
        description: 'Get wallet transactions with pagination and optional type',
        parameters: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            type: { type: 'string' },
          }
        }
      },
      {
        name: 'getCategories',
        description: 'List non-archived categories',
        parameters: { type: 'object', properties: {} }
      },
      {
        name: 'getCategoryById',
        description: 'Get category by ID',
        parameters: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] }
      },
      {
        name: 'searchProducts',
        description: 'Search products by title and filters',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            categoryId: { type: 'string' },
            vendorId: { type: 'string' },
            minPrice: { type: 'number' },
            maxPrice: { type: 'number' },
            trending: { type: 'boolean' },
            page: { type: 'number' },
            limit: { type: 'number' },
          }
        }
      },
      {
        name: 'getProductDetails',
        description: 'Get a single product by ID and return details',
        parameters: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] }
      },
      {
        name: 'getDataPlans',
        description: 'Get data plans from local dataplan.json with optional filters. IMPORTANT: If user mentions a specific size (e.g., "3.2GB", "500MB"), you MUST pass it as planName parameter to find that exact size.',
        parameters: {
          type: 'object',
          properties: {
            network: { type: 'string', description: 'MTN | GLO | Airtel | 9MOBILE. If omitted, bot will detect from user phone.' },
            vendor: { type: 'string' },
            planType: { type: 'string', description: 'SME | GIFTING | COOPERATE GIFTING | etc. Optional; if strict match fails, system relaxes to show all types for the requested size.' },
            planName: { type: 'string', description: 'CRITICAL: Use when user specifies a data size like 3.2GB, 1GB, 500MB. This will find plans with that size regardless of type.' },
            search: { type: 'string', description: 'Free-text contains filter across name/type/duration/network' },
            amount: { type: 'number', description: 'Exact amount match' },
            minAmount: { type: 'number', description: 'Minimum amount (NGN). Use when user says at least X.' },
            maxAmount: { type: 'number', description: 'Maximum amount (NGN). Use when user says below/not above X.' },
            minSizeMB: { type: 'number', description: 'Minimum size in MB' },
            maxSizeMB: { type: 'number', description: 'Maximum size in MB' },
            minSize: { type: 'string', description: 'Minimum size like 1GB/500MB' },
            maxSize: { type: 'string', description: 'Maximum size like 3GB/1500MB' },
            page: { type: 'number' },
            limit: { type: 'number' }
          }
        }
      },
      {
        name: 'purchaseData',
        description: 'Purchase a data plan for a phone number. If no phone/network specified, use user\'s own phone and network. Always confirm before executing.',
        parameters: {
          type: 'object',
          properties: {
            planId: { type: 'string' },
            vendor: { type: 'string', description: 'quickvtu | bilal' },
            network: { type: 'string', description: 'If not provided, will auto-detect from user\'s phone' },
            planType: { type: 'string' },
            amount: { type: 'number' },
            phone: { type: 'string', description: 'If not provided, will use user\'s own phone' },
            confirm: { type: 'boolean', description: 'Must be true to execute the purchase' }
          },
          required: ['planId', 'vendor', 'planType', 'amount']
        }
      },
      {
        name: 'buyAirtime',
        description: 'Buy airtime for a phone number. Network is automatically detected from the phone number - NEVER ask the user for network. If no phone specified, use user\'s own phone. Always confirm before executing.',
        parameters: {
          type: 'object',
          properties: {
            amount: { type: 'number' },
            phone: { type: 'string', description: 'Phone number (11 digits, e.g., 08031234567). Network will be auto-detected from this number. If not provided, will use user\'s own phone' },
            confirm: { type: 'boolean', description: 'Must be true to execute the purchase' }
          },
          required: ['amount']
        }
      },
      {
        name: 'airtimeInfo',
        description: 'Provide information about airtime purchase limits and flow',
        parameters: { type: 'object', properties: {} }
      },
      {
        name: 'retryLastTransaction',
        description: 'Retry the last failed or successful transaction (data or airtime). Fetches the last transaction from history and prepares it for retry with confirmation.',
        parameters: { type: 'object', properties: {} }
      },
      {
        name: 'getTechnician',
        description: 'Get technician information for repairs, diagnostics, or technician services. Use this when customers ask about repairs, diagnostics, or need a technician. The tool will ask for location conversationally first (if not recently asked), then return all available technicians with a helpful message.',
        parameters: { type: 'object', properties: {} }
      }
    ]
  }]
}
async function executeTool(name, args, { userId, contacts, sessionId } = {}) {
  switch (name) {
    case 'getUserAccount': {
      if (!userId) return '⚠️ Please sign in to view your account.'
      try {
        // getUserById expects ObjectId or string, returns single user doc
        const user = await services.usersService.getUserById(userId)
        if (!user) return '⚠️ User account not found.'

        // getWallets returns paginated { docs: [...], totalDocs, ... }
        let walletList = await services.walletsService.getWallets({ userId: user._id })

        // Create wallet if it doesn't exist
        // No wallet creation here; the /wallets fetch endpoint will handle setup via Monnify

        const walletDoc = walletList?.docs?.[0]
        const balance = walletDoc?.balance || 0
        const currency = walletDoc?.currency || 'NGN'
        const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
        const phones = Array.isArray(user.phoneNumber) && user.phoneNumber.length > 0 ? user.phoneNumber.join(', ') : '—'
        const fmtBal = formatMoney(balance, currency)

        let msg = `*Account Summary*\n`
        msg += `*Balance:* *${fmtBal}*\n\n`
        msg += `Name: ${name || '—'}\n`
        msg += `Email: ${user.email || '—'}\n`
        msg += `Phones: ${phones}`

        if (user.referralCode) msg += `\nReferral Code: ${user.referralCode}`
        if (user.referrals) msg += `\nReferrals: ${user.referrals}`

        return msg
      } catch (e) {
        return `⚠️ Error fetching account: ${e.message}`
      }
    }
    case 'getWalletBalance': {
      if (!userId) return '⚠️ Please sign in to view your wallet.'
      try {
        let walletList = await services.walletsService.getWallets({ userId })

        const walletDoc = walletList?.docs?.[0]
        const balance = walletDoc?.balance || 0
        const currency = walletDoc?.currency || 'NGN'
        return `💰 Wallet Balance: ${formatMoney(balance, currency)}`
      } catch (e) {
        return `⚠️ Error fetching wallet: ${e.message}`
      }
    }
    case 'getFundingAccount': {
      if (!userId) return '⚠️ Please sign in to view funding account.'
      try {
        // Create minimal JWT to satisfy checkAuth
        const user = await services.usersService.getUserById(userId)
        if (!user) return '⚠️ User not found.'
        const token = createToken(JSON.stringify({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          email: user.email,
          banned: user.banned,
          phoneNumber: user.phoneNumber,
          oneSignalId: user.oneSignalId
        }))
        const base = process.env.API_BASE_URL || 'http://localhost:4000/api'
        const resp = await fetch(`${base}/wallets`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        })
        const data = await resp.json().catch(() => ({}))
        if (!resp.ok) {
          const msg = extractErrorMessage(data, resp.statusText || 'Unknown error')
          return `⚠️ Could not fetch account: ${msg}`
        }
        const bal = formatMoney(Number(data?.balance || 0))
        const accounts = Array.isArray(data?.accounts) ? data.accounts : []
        if (accounts.length === 0) return `Your wallet balance is ${bal}. Funding account is not yet available. Please try again shortly.`
        const lines = accounts.map((a, i) => `*${a.accountName}*\n*${a.accountNumber}*\n*${a.bankName}*`)
        return `To fund your wallet, kindly send any amount to your virtual account below:\n\n${lines.join('\n\n')}\n\n📌 Please pin this chat to easily access your account details.`
      } catch (e) {
        return `⚠️ Error fetching funding account: ${e.message}`
      }
    }
    case 'updateUserAccount': {
      if (!userId) return '⚠️ Please sign in to update your account.'
      try {
        const payload = {}
        if (args?.firstName != null) payload.firstName = String(args.firstName).toLowerCase()
        if (args?.lastName != null) payload.lastName = String(args.lastName).toLowerCase()
        if (args?.email != null) payload.email = String(args.email).toLowerCase()
        if (Array.isArray(args?.phoneNumber)) payload.phoneNumber = args.phoneNumber
        if (args?.password != null) payload.password = args.password

        if (Object.keys(payload).length === 0) return '⚠️ No fields to update.'

        // updateUsers expects filter { _id }, returns updated doc or null
        await services.usersService.updateUsers({ _id: userId }, payload)
        const fields = Object.keys(payload).join(', ')
        return `✅ Profile updated successfully!\nFields: ${fields}`
      } catch (e) {
        return `⚠️ Update failed: ${e.message}`
      }
    }
    case 'getTransactions': {
      if (!userId) return '⚠️ Please sign in to view transactions.'
      try {
        const page = args?.page != null ? args.page : 1
        const limit = args?.limit != null ? args.limit : 10
        const type = args?.type // 'debit' or 'credit'

        // fetchTransactions expects filter with ObjectId userId, returns paginated result
        const filter = { userId: new mongoose.Types.ObjectId(String(userId)) }
        if (type) filter.type = type

        const tx = await services.walletsService.fetchTransactions(filter, { page, limit, sort: { _id: -1 } })

        if (!tx?.docs || tx.docs.length === 0) {
          return type
            ? `No ${type} transactions found.`
            : 'No transactions found. Start by funding your wallet or making a purchase!'
        }

        const lines = tx.docs.map(t => {
          const sign = t.type === 'credit' ? '+' : '-'
          const status = t.status === 'successful' ? '✅' : (t.status === 'failed' ? '❌' : '⏳')
          return `${status} ${sign}${formatMoney(t.amount)} | ${t.narration}\n ${formatDate(t.createdAt)}`
        })

        return `*Recent Transactions* (Page ${tx.page}/${tx.totalPages})\n\n` + lines.join('\n\n')
      } catch (e) {
        return `⚠️ Error fetching transactions: ${e.message}`
      }
    }
    case 'getCategories': {
      try {
        // getCategories returns paginated { docs: [...], totalDocs, ... }
        const cats = await services.categoriesService.getCategories({ archive: { $ne: true } }, { limit: 100, sort: { title: 1 } })
 
        if (!cats?.docs || cats.docs.length === 0) return 'No categories available at the moment.'
 
        const items = cats.docs.map((c, i) => `${i + 1}. ${c.title}`)
 
         // Persist categories for numeric selection
         if (sessionId) {
           const compact = cats.docs.map(c => ({
             id: String(c._id),
             title: c.title,
             slug: c.slug || ''
           }))
           await updateSessionMetadata(String(sessionId), {
             'metadata.selectionContext': 'categories',
             'metadata.lastCategoryList': { items: compact, savedAt: nowIso() }
           }, userId, contacts?.wa_id)
         }
 
        return `*Product Categories* (${cats.totalDocs} total):\n\n${items.join('\n')}\n\nReply with the number of the category to browse gadgets from that section.`
      } catch (e) {
        return `⚠️ Error fetching categories: ${e.message}`
      }
    }
    case 'getCategoryById': {
      try {
        const id = args?.id
        if (!id) return '⚠️ Category ID is required.'

        // getCategoryById returns single category doc or null
        const c = await services.categoriesService.getCategoryById(id)
        if (!c || c.archive) return '⚠️ Category not found.'

        return `*${c.title}*\n${c.description || 'No description'}\nSlug: ${c.slug}`
      } catch (e) {
        return `⚠️ Error fetching category: ${e.message}`
      }
    }
    case 'searchProducts': {
      try {
        const query = { archive: { $ne: true } }
        // Normalize keyword
        const rawKeyword = String(args?.title || '').trim()
        const keyword = rawKeyword.toLowerCase()
        // Attempt to infer closest category from keyword if categoryId not supplied
        let inferredCategoryId = null
        if (!args?.categoryId && keyword) {
          try {
            const cats = await services.categoriesService.getCategories({ archive: { $ne: true } }, { limit: 200 })
            const list = Array.isArray(cats?.docs) ? cats.docs : []
            let best = { score: 0, id: null }
            for (const c of list) {
              const title = String(c.title || '').toLowerCase()
              const slug = String(c.slug || '').toLowerCase()
              let score = 0
              if (title && keyword.includes(title)) score += 3
              if (slug && keyword.includes(slug)) score += 3
              // token overlap
              const tTokens = title.split(/[^a-z0-9]+/).filter(Boolean)
              for (const t of tTokens) {
                if (t.length >= 3 && keyword.includes(t)) score += 1
              }
              if (score > best.score) best = { score, id: c._id }
            }
            if (best.score >= 2 && best.id) inferredCategoryId = String(best.id)
          } catch { }
        }
        // Build product query
        if (rawKeyword) {
          query.$text = { $search: rawKeyword }
        }
        const effectiveCategoryId = args?.categoryId || inferredCategoryId
        if (effectiveCategoryId) {
          try { query.categoryId = new mongoose.Types.ObjectId(String(effectiveCategoryId)) } catch { query.categoryId = String(effectiveCategoryId) }
        }
        if (args?.vendorId) {
          try { query.vendorId = new mongoose.Types.ObjectId(String(args.vendorId)) } catch { query.vendorId = String(args.vendorId) }
        }
        if (args?.trending === true) query.trending = true
        // Price range filter (use discounted_price as primary)
        if (args?.minPrice != null || args?.maxPrice != null) {
          query.discounted_price = {}
          if (args?.minPrice != null) query.discounted_price.$gte = Number(args.minPrice)
          if (args?.maxPrice != null) query.discounted_price.$lte = Number(args.maxPrice)
        }
        const options = {
          page: args?.page || 1,
          limit: args?.limit || DEFAULT_PAGE_LIMIT,
          sort: query.$text ? { score: { $meta: 'textScore' } } : { createdAt: -1 },
          projection: query.$text ? { score: { $meta: 'textScore' } } : undefined,
        }
        let resp = await services.productsService.getProducts({ query, options })
        // Fallback: if none found and we inferred a category, retry with only category filter
        if ((!resp?.docs || resp.docs.length === 0) && inferredCategoryId) {
          const fallbackQuery = { archive: { $ne: true } }
          try { fallbackQuery.categoryId = new mongoose.Types.ObjectId(String(inferredCategoryId)) } catch { fallbackQuery.categoryId = String(inferredCategoryId) }
          resp = await services.productsService.getProducts({ query: fallbackQuery, options })
        }

        if (!resp?.docs || resp.docs.length === 0) {
          return 'No products found matching your criteria. Try different filters or keywords.'
        }
        // Persist last product list and original query for pagination and numeric selection
        try {
          const compact = resp.docs.map(p => ({
            id: String(p._id),
            title: p.title,
            slug: p.slug,
            categorySlug: p?.categoryId?.slug || '',
            image: Array.isArray(p.images) && p.images[0] ? p.images[0] : null,
            updatedAt: p.priceUpdatedAt || p.updatedAt || p.createdAt,
            price: p.discounted_price || p.original_price || 0,
            wasPrice: (p.discounted_price && p.original_price > p.discounted_price) ? p.original_price : null
          }))
          if (sessionId) await updateSessionMetadata(String(sessionId), {
            'metadata.selectionContext': 'products',
            'metadata.lastProductList': { items: compact, savedAt: nowIso(), page: options.page, limit: options.limit, totalPages: resp.totalPages },
            'metadata.lastProductQuery': {
              title: rawKeyword || null,
              categoryId: effectiveCategoryId || null,
              vendorId: args?.vendorId || null,
              trending: args?.trending === true ? true : null,
              minPrice: args?.minPrice ?? null,
              maxPrice: args?.maxPrice ?? null
            }
          }, userId, contacts?.wa_id)
        } catch { }
        // Send top 4 results as WhatsApp messages
        try {
          const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID2
          const toNumber = contacts?.wa_id ? `+${contacts.wa_id}` : ''
          if (phoneNumberId && toNumber) {
            const { sendTextMessage } = require('./whatsappTemplates')
            const top = resp.docs.slice(0, DEFAULT_PRODUCT_TEMPLATE_LIMIT)
            for (const p of top) {
              const price = p.discounted_price || p.original_price || 0
              const updatedAt = p.priceUpdatedAt || p.updatedAt || p.createdAt
              const updatedText = updatedAt ? `*(Price last updated: ${moment(updatedAt).fromNow()})*` : ''
              const productLink = (p?.categoryId?.slug && p.slug) 
                ? `https://360gadgetsafrica.com/gadgets/${p.categoryId.slug}/${encodeURIComponent(p.slug)}`
                : ''
              
              // Format message as: "*Title*, \n\n*Price:* *₦364,000* *(Price last updated: 2 months ago)*  \n\n{productlink}"
              const messageText = `*${p.title}*,\n\n*Price:* *${formatMoney(price)}*${updatedText ? ` ${updatedText}` : ''}\n\n${productLink}`
              
              console.log('Sending product message', { phoneNumberId, toNumber, title: p.title, productUrl: productLink })
              
              // Send as text message
              await sendTextMessage(phoneNumberId, toNumber, messageText)
              
              // Save to session metadata
              if (sessionId) {
                try {
                  await waChatSessions.addMessage(String(sessionId), { 
                    role: 'assistant', 
                    content: messageText 
                  }, userId, contacts?.wa_id || null)
                } catch (e) {
                  console.error('Failed to save product message to session:', e.message)
                }
              }
            }
          }
        } catch (error) {
          console.log('Failed to send product messages', { error: error?.message })
        }
        // Only prompt to see more if there are more pages available
        const hasMore = Number(options.page || 1) < Number(resp.totalPages || 1)
        if (hasMore) {
          return `Would you like to see more results?`
        }
        // No extra text if no more pages
        return ''
      } catch (e) {
        return `⚠️ Error searching products: ${e.message}`
      }
    }
    case 'getProductDetails': {
      try {
        const id = args?.id
        if (!id) return '⚠️ Product ID is required.'
        const p = await services.productsService.getProductById(id)
        const price = p.discounted_price || p.original_price || 0
        const wasPrice = p.discounted_price && p.original_price > p.discounted_price
          ? ` ~${formatMoney(p.original_price)}~`
          : ''
        const inStock = (p.is_stock ?? 0) > 0 ? '✅ In stock' : '❌ Out of stock'
        const cat = p.categoryId?.title ? `\nCategory: ${p.categoryId.title}` : ''
        const vendor = p.vendorId?.title ? `\nVendor: ${p.vendorId.title}` : ''
        const link = (p.categoryId?.slug && p.slug) ? `\nLink: https://360gadgetsafrica.com/gadgets/${p.categoryId.slug}/${encodeURIComponent(p.slug)}` : ''
        const desc = p.description ? `\n\n${p.description}` : ''
        const updatedAt = p.priceUpdatedAt ? `\nUpdated: ${new Date(p.priceUpdatedAt).toLocaleString('en-NG')}` : ''
        const vendorFollowup = `\n\nWould you like me to connect you with the partnered vendor for more details?`
        return `*${p.title}*\n${formatMoney(price)}${wasPrice}${updatedAt}\n${inStock}${cat}${vendor}${link}${desc}${vendorFollowup}`
      } catch (e) {
        return `⚠️ Error fetching product: ${e.message}`
      }
    }
    case 'getDataPlans': {
      try {
        console.log('📊 getDataPlans called with args:', JSON.stringify(args, null, 2))
        const plans = require('../dataplan.json')
        let list = Array.isArray(plans) ? plans : []
        const debug = { total: list.length, argsReceived: args }
        // Derive network if not provided using user's phone
        let effectiveNetwork = args?.network
        if (!effectiveNetwork) {
          try {
            const waPhone = contacts?.wa_id ? `0${String(contacts.wa_id).replace(/^234/, '').replace(/^\+234/, '')}` : undefined
            let userPhone
            if (userId && !waPhone) {
              const user = await services.usersService.getUserById(userId)
              if (user && Array.isArray(user.phoneNumber) && user.phoneNumber.length > 0) userPhone = user.phoneNumber[0]
            }
            const phone = waPhone || userPhone
            if (phone) effectiveNetwork = detectNetwork(phone)
          } catch { }
        }
        // Ignore unknown/invalid network values
        const allowedNetworks = ['MTN', 'GLO', 'AIRTEL', '9MOBILE']
        if (!allowedNetworks.includes(String(effectiveNetwork || '').toUpperCase())) {
          effectiveNetwork = null
        }
        if (effectiveNetwork) {
          list = list.filter(p => String(p.network).toUpperCase() === String(effectiveNetwork).toUpperCase())
          debug.afterNetwork = list.length
        }
        if (args?.vendor) {
          list = list.filter(p => String(p.vendor).toLowerCase() === String(args.vendor).toLowerCase())
          debug.afterVendor = list.length
        }
        // Flexible planType matching (partial + synonyms)
        if (args?.planType) {
          const q = String(args.planType).toUpperCase()
          const matchesType = (pt) => {
            const s = String(pt || '').toUpperCase()
            if (!q) return true
            if (s.includes(q)) return true
            // Synonyms/normalizations
            if (q.includes('GIFT')) return s.includes('GIFT') // matches GIFTING, GIFTING PROMO
            if (q.includes('PROMO')) return s.includes('PROMO')
            if (q.includes('CORP') || q.includes('COOP') || q.includes('CORPORATE') || q.includes('COOPERATE')) return s.includes('COOPERATE')
            if (q === 'SME') return s.includes('SME')
            return false
          }
          list = list.filter(p => matchesType(p.planType))
          debug.afterPlanType = list.length
        }
        // If planName is a size (e.g., 1GB/500MB), prefer numeric size filtering and skip string contains filter
        const planNameSizeMB = parseSizeToMB(args?.planName)
        if (args?.planName && planNameSizeMB == null) {
          const q = String(args.planName).toLowerCase()
          list = list.filter(p => String(p.planName).toLowerCase().includes(q))
          debug.afterPlanName = list.length
        }
        if (args?.amount != null) list = list.filter(p => Number(p.amount) === Number(args.amount))
        if (args?.amount != null) debug.afterAmount = list.length
        if (args?.search) {
          const q = String(args.search).toLowerCase()
          list = list.filter(p => [p.planName, p.planType, p.duration, p.network].some(v => String(v || '').toLowerCase().includes(q)))
          debug.afterSearch = list.length
        }
        if (args?.minAmount != null) list = list.filter(p => Number(p.amount) >= Number(args.minAmount))
        if (args?.minAmount != null) debug.afterMinAmount = list.length
        if (args?.maxAmount != null) list = list.filter(p => Number(p.amount) <= Number(args.maxAmount))
        if (args?.maxAmount != null) debug.afterMaxAmount = list.length
        // Sort by data size ascending (parse planName like 500MB, 1.5GB, 1TB)
        function toMegabytes(name) {
          try {
            const m = String(name || '').toUpperCase().match(/([0-9]+(?:\.[0-9]+)?)\s*(TB|GB|MB)/)
            if (!m) return Number.MAX_SAFE_INTEGER
            const val = parseFloat(m[1])
            const unit = m[2]
            if (unit === 'TB') return val * 1024 * 1024
            if (unit === 'GB') return val * 1024
            return val
          } catch { return Number.MAX_SAFE_INTEGER }
        }
        function parseSizeToMB(val) {
          if (val == null) return null
          if (typeof val === 'number') return val
          const m = String(val).toUpperCase().match(/([0-9]+(?:\.[0-9]+)?)\s*(TB|GB|MB)?/)
          if (!m) return null
          const num = parseFloat(m[1])
          const unit = m[2] || 'MB'
          if (unit === 'TB') return num * 1024 * 1024
          if (unit === 'GB') return num * 1024
          return num
        }
        let minSize = parseSizeToMB(args?.minSizeMB != null ? args.minSizeMB : args?.minSize)
        let maxSize = parseSizeToMB(args?.maxSizeMB != null ? args.maxSizeMB : args?.maxSize)
        // Derive size from planName/search if explicit size bounds not set
        const derivedSizeFromPlanName = parseSizeToMB(args?.planName)
        const derivedSizeFromSearch = parseSizeToMB(args?.search)

        // If user explicitly requested a size via planName (e.g., "3.2GB"), ALWAYS apply a tolerance window
        const explicitSizeRequested = derivedSizeFromPlanName != null
        // Only apply implicit size filtering (from generic search) if there's a price constraint
        const hasAmountConstraint = (args?.minAmount != null) || (args?.maxAmount != null) || (args?.amount != null)

        if (minSize == null && maxSize == null) {
          if (explicitSizeRequested) {
            const d = derivedSizeFromPlanName
            const tolerance = d * 0.15
            minSize = Math.max(0, d - tolerance)
            maxSize = d + tolerance
          } else if (hasAmountConstraint) {
            const d = derivedSizeFromSearch
            if (d != null) {
              const tolerance = d * 0.15
              minSize = Math.max(0, d - tolerance)
              maxSize = d + tolerance
            }
          }
        }
        if (minSize != null) list = list.filter(p => toMegabytes(p.planName) >= minSize)
        if (minSize != null) debug.afterMinSize = list.length
        if (maxSize != null) list = list.filter(p => toMegabytes(p.planName) <= maxSize)
        if (maxSize != null) debug.afterMaxSize = list.length
        console.log('📊 DATA PLAN FILTER DEBUG:', { userId, args, effectiveNetwork, ...debug })
        list = list.sort((a, b) => {
          const sa = toMegabytes(a.planName)
          const sb = toMegabytes(b.planName)
          if (sa !== sb) return sa - sb
          return Number(a.amount) - Number(b.amount)
        })
        const page = args?.page || 1
        const unpaginated = (effectiveNetwork != null) || (args?.vendor != null) || (args?.planType != null) || (args?.planName != null) || (args?.amount != null) || (args?.minAmount != null) || (args?.maxAmount != null) || (minSize != null) || (maxSize != null) || (args?.search != null)
        const limit = args?.limit || (unpaginated ? list.length : 10)
        const start = (page - 1) * limit
        let pageItems = list.slice(start, start + limit)
        let titleHint = ''
        if (pageItems.length === 0) {
          // Relaxed fallback tier 1: if a target size was requested, try to surface that size across types/vendors
          try {
            const targetMin = (minSize != null && maxSize == null) ? minSize : null
            const targetMax = (maxSize != null && minSize == null) ? maxSize : null
            const targetingExactSize = (targetMin != null && targetMax == null) || (targetMax != null && targetMin == null)
            let alt = Array.isArray(plans) ? plans : []
            if (effectiveNetwork) alt = alt.filter(p => String(p.network).toUpperCase() === String(effectiveNetwork).toUpperCase())
            if (args?.minAmount != null) alt = alt.filter(p => Number(p.amount) >= Number(args.minAmount))
            if (args?.maxAmount != null) alt = alt.filter(p => Number(p.amount) <= Number(args.maxAmount))
            if (minSize != null) alt = alt.filter(p => toMegabytes(p.planName) >= minSize)
            if (maxSize != null) alt = alt.filter(p => toMegabytes(p.planName) <= maxSize)
            // If user hinted a specific size (e.g., 3.2GB), prefer exact size match before others
            if (targetingExactSize) {
              const exactMB = targetMin != null ? targetMin : targetMax
              const exact = alt.filter(p => Math.abs(toMegabytes(p.planName) - exactMB) < 0.5)
              if (exact.length > 0) {
                alt = exact
              } else {
                // No exact: take nearest by size distance
                const nearest = alt
                  .map(p => ({ p, d: Math.abs(toMegabytes(p.planName) - exactMB) }))
                  .sort((x, y) => x.d - y.d || (Number(x.p.amount) - Number(y.p.amount)))
                  .slice(0, limit)
                  .map(x => x.p)
                alt = nearest
                // Human label for requested size
                const sizeLabel = exactMB >= 1024 ? `${(exactMB / 1024).toFixed(1)}GB` : `${exactMB}MB`
                titleHint = ` (closest to ${sizeLabel})`
              }
            }
            alt = alt.sort((a, b) => {
              const sa = toMegabytes(a.planName), sb = toMegabytes(b.planName)
              if (sa !== sb) return sa - sb
              return Number(a.amount) - Number(b.amount)
            })
            pageItems = alt
            if (pageItems.length === 0) return 'No plans found for your filters.'
          } catch {
            return 'No plans found for your filters.'
          }
        }
        // Relaxed fallback tier 2: If still empty and a planName text exists, prefer textual match by planName
        if (pageItems.length === 0 && args?.planName && parseSizeToMB(args.planName) == null) {
          try {
            const q = String(args.planName).toLowerCase()
            let alt = Array.isArray(plans) ? plans : []
            if (effectiveNetwork) alt = alt.filter(p => String(p.network).toUpperCase() === String(effectiveNetwork).toUpperCase())
            if (args?.minAmount != null) alt = alt.filter(p => Number(p.amount) >= Number(args.minAmount))
            if (args?.maxAmount != null) alt = alt.filter(p => Number(p.amount) <= Number(args.maxAmount))
            alt = alt.filter(p => String(p.planName).toLowerCase().includes(q))
            alt = alt.sort((a, b) => {
              const sa = toMegabytes(a.planName), sb = toMegabytes(b.planName)
              if (sa !== sb) return sa - sb
              return Number(a.amount) - Number(b.amount)
            })
            pageItems = alt
          } catch { }
        }
        const lines = pageItems.map((p, i) => `${start + i + 1}. *${p.planName} (${p.planType})* - ${formatMoney(p.amount)} (${p.duration}) `)
        // Persist last data list for numeric selection and set context
        try {
          const compact = pageItems.map(p => ({ planId: String(p.planId), vendor: String(p.vendor), network: String(p.network), planType: String(p.planType), amount: Number(p.amount), planName: p.planName }))
          if (sessionId) await updateSessionMetadata(String(sessionId), {
            'metadata.selectionContext': 'data',
            'metadata.lastDataList': { items: compact, savedAt: nowIso(), page, limit }
          }, userId, contacts?.wa_id)
        } catch { }
        const networkLabel = effectiveNetwork ? ` (${effectiveNetwork})` : ''
        return `*Data Plans${titleHint}${networkLabel}* (Page ${page}/${Math.ceil(list.length / limit)}, ${list.length} total)\n\n${lines.join('\n')}\n\nReply with the number to select a plan.`
      } catch (e) {
        return `⚠️ Error loading plans: ${e.message}`
      }
    }
    case 'purchaseData': {
      if (!userId) return '⚠️ Please sign in to purchase data.';
      console.log('🔄 PROCESSING DATA PURCHASE REQUEST:', {
        userId,
        args,
        timestamp: new Date().toISOString(),
      });
  
  // Clear any existing retry transaction metadata when starting a NEW purchase
  if (!args?.confirm && sessionId) {
    try {
      await waChatSessions.updateSession(String(sessionId), {
        'metadata.retryTransaction': null
      }, userId, contacts?.wa_id || null)
    } catch (e) {
      console.error('Error clearing retry metadata:', e.message)
    }
  }
  
      let pendingPhone = null;
      let pendingNetwork = null;
      try {
        if (sessionId) {
          const currentSession = await waChatSessions.getSession(String(sessionId), userId, contacts?.wa_id || null);
          pendingPhone = currentSession?.metadata?.get?.('pendingPhone') || currentSession?.metadata?.pendingPhone || null;
          pendingNetwork = currentSession?.metadata?.get?.('pendingNetwork') || currentSession?.metadata?.pendingNetwork || null;
          if (!args?.planId) {
            const pendingPurchase = currentSession?.metadata?.get?.('pendingPurchase') || currentSession?.metadata?.pendingPurchase;
            if (pendingPurchase) {
              args.planId = args?.planId || pendingPurchase.planId;
              args.vendor = args?.vendor || pendingPurchase.vendor;
              args.planType = args?.planType || pendingPurchase.planType;
              args.amount = args?.amount ?? pendingPurchase.amount;
              if (!pendingNetwork) pendingNetwork = pendingPurchase.network || null;
            }
          }
        }
      } catch (e) {
        console.error('Error fetching session metadata:', e.message);
      }
      // Prioritize phone number: args.phone > pendingPhone > contacts.wa_id > user.phoneNumber
      let phoneNumber = args?.phone || pendingPhone || null;
      let network = args?.network || pendingNetwork || null;
      if (!phoneNumber && contacts?.wa_id) {
        phoneNumber = `0${String(contacts.wa_id).replace(/^234/, '').replace(/^\+234/, '')}`;
      }
      if (!phoneNumber || !network) {
        try {
          const user = await services.usersService.getUserById(userId);
          if (!user) return '⚠️ User not found.';
          if (!phoneNumber && user.phoneNumber?.length > 0) phoneNumber = user.phoneNumber[0];
          if (!network && phoneNumber) network = detectNetwork(phoneNumber);
        } catch (e) {
          console.error('Error fetching user phone/network:', e.message);
        }
      }
      const missing = [];
      if (!args?.planId) missing.push('planId');
      if (!args?.vendor) missing.push('vendor');
      if (!args?.planType) missing.push('planType');
      if (args?.amount == null) missing.push('amount');
      if (!phoneNumber) missing.push('phone (or add phone to your profile)');
      if (!network) {
        network = detectNetwork(phoneNumber);
        if (!network || network === 'Unknown') missing.push('network');
      }
      // Try to extract plan from lastDataList if selection index provided
      if (missing.length && sessionId && /^\d{1,2}$/.test(String(args?.selection || ''))) {
        try {
          const currentSession = await waChatSessions.getSession(String(sessionId), userId, contacts?.wa_id || null);
          const dataList = currentSession?.metadata?.get?.('lastDataList') || currentSession?.metadata?.lastDataList;
          const idx = parseInt(String(args.selection), 10) - 1;
          const chosen = dataList && Array.isArray(dataList.items) ? dataList.items[idx] : null;
          if (chosen) {
            args.planId = chosen.planId;
            args.vendor = chosen.vendor;
            args.planType = chosen.planType;
            args.amount = chosen.amount;
            network = chosen.network;
            // Ensure pendingPhone is respected if it exists
            phoneNumber = phoneNumber || pendingPhone || chosen.phone || phoneNumber;
          }
        } catch (e) {
          console.error('Error extracting plan from selection:', e.message);
        }
      }
      if (missing.length) {
        return `To buy data, I need: ${missing.join(', ')}.
Example: purchaseData { planId: '123', vendor: 'quickvtu', network: 'MTN', planType: 'SME', amount: 520, phone: '08031234567' }`;
      }
      if (!args?.confirm) {
        const isOwnPhone = !args?.phone && !pendingPhone; // Only assume own phone if neither args.phone nor pendingPhone is provided
        const cleanedPhone = sanitizePhone(phoneNumber || '');
        const displayPhone = cleanedPhone && cleanedPhone.length === 11 ? cleanedPhone : String(phoneNumber || '');
        const phoneLabel = isOwnPhone ? `your phone (${displayPhone})` : displayPhone;
        const detectedNet = detectNetwork(displayPhone)
        const netWarning = (detectedNet && detectedNet !== network && detectedNet !== 'Unknown') ? `\nNote: Phone network (${detectedNet}) may not match plan network (${network}). Proceed?` : ''
    
    // Update session metadata first
        try {
          if (sessionId) {
            await waChatSessions.updateSession(String(sessionId), {
              'metadata.pendingPhone': displayPhone || null,
              'metadata.pendingNetwork': network || null,
              'metadata.pendingPurchase': {
                planId: String(args.planId),
                vendor: String(args.vendor),
                network: String(network),
                planType: String(args.planType),
                amount: Number(args.amount),
                expiresAt: new Date(Date.now() + PENDING_PURCHASE_TIMEOUT_MS).toISOString(),
              },
              'metadata.pendingAmount': Number(args.amount) || null,
            }, userId, contacts?.wa_id || null);
          }
        } catch (e) {
          console.error('Error updating session metadata:', e.message);
        }
    
    // CRITICAL: ALWAYS send WhatsApp confirmation template before returning
          const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID2 || process.env.WHATSAPP_PHONE_NUMBER_ID
          const toNumber = contacts?.wa_id
    if (!phoneNumberId || !toNumber) {
      console.error('❌ Missing WhatsApp credentials for confirmation template:', { phoneNumberId: !!phoneNumberId, toNumber: !!toNumber })
      const supportInfo = getSupportContactInfo();
      return `Unable to send confirmation. Please check your WhatsApp connection and try again. If the issue persists, ${supportInfo.message}`;
    }
    
    try {
            const text = `buy *${network} ${args.planType}* (Plan ID ${args.planId}) for *${formatMoney(args.amount)}* to *${phoneLabel}*.${netWarning}\n`
            await sendConfirmationTemplate(phoneNumberId, toNumber, { text })
            // Save confirmation message to session so it can be detected later
            if (sessionId) {
              try {
                await waChatSessions.addMessage(String(sessionId), { 
                  role: 'assistant', 
                  content: `You are about to: ${text}\n\nPlease confirm if you'd like to proceed with this action.` 
                }, userId, contacts?.wa_id || null)
              } catch (e) {
                console.error('Failed to save confirmation message to session:', e.message)
              }
            }
      console.log('✅ WhatsApp confirmation template sent successfully (data purchase)')
        } catch (e) {
      console.error('❌ CRITICAL: Failed to send WA confirmation template (data):', e?.message, e?.stack)
      // Don't proceed if template fails - return error message
      const supportInfo = getSupportContactInfo();
      return `I couldn't send the confirmation message. Please try again. If the issue persists, ${supportInfo.message}`;
        }
        return '';
      }
      try {
        const user = await services.usersService.getUserById(userId);
        if (!user) return '⚠️ User not found.';
        const token = createToken({
          _id: user._id,
          userType: user.userType,
          banned: user.banned,
          oneSignalId: user.oneSignalId,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,

        });
        const normalizedNetwork = String(network || '').toUpperCase();
        if (!ALLOWED_NETWORKS.includes(normalizedNetwork)) {
          return 'Please tell me your network to proceed (MTN, GLO, Airtel, 9mobile).';
        }
        const normalizedPhone = isValidNigerianPhone(phoneNumber) ? sanitizePhone(phoneNumber) : null;
        if (!normalizedPhone) {
          return 'Please send the 11-digit phone number to receive the data (e.g., 08031234567).';
        }
        // Idempotency guard: prevent immediate duplicate confirms for same purchase
        try {
          const confirmHash = ['data', normalizedNetwork, normalizedPhone, String(args.planId), String(args.planType), String(args.vendor), String(args.amount)].join('|')
          const { duplicate } = await waChatSessions.checkAndStampConfirm(String(sessionId), confirmHash, 10000, userId, contacts?.wa_id || null)
          if (duplicate) {
            return ''
          }
        } catch { }
        
        // Send "Please wait" message immediately before processing
        const waitMessage = 'Please wait while we process your data topup...'
        try {
          if (sessionId) {
            await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: waitMessage }, userId, contacts?.wa_id || null)
          }
          // Also send via WhatsApp if possible
          const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID2 || process.env.WHATSAPP_PHONE_NUMBER_ID
          const toNumber = contacts?.wa_id
          if (phoneNumberId && toNumber) {
            const { sendTextMessage } = require('./whatsappTemplates')
            await sendTextMessage(phoneNumberId, toNumber, waitMessage).catch(e => {
              console.error('Failed to send wait message via WhatsApp:', e.message)
            })
          }
        } catch (e) {
          console.error('Error sending wait message:', e.message)
        }
        
        const requestData = {
          plan: {
            planId: String(args.planId),
            vendor: String(args.vendor),
            network: normalizedNetwork,
            planType: String(args.planType).toUpperCase(),
            amount: Number(args.amount),
          },
          phone: normalizedPhone,
          source: 'whatsapp',
          wa_id: contacts?.wa_id,
        };
        console.log('Processing data purchase', {
          userId,
          userPhone: normalizedPhone,
          userNetwork: normalizedNetwork,
          timestamp: nowIso(),
        });
        const resp = await fetch(`${process.env.API_BASE_URL || 'http://localhost:4000/api'}/wallets/buyDataPlan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(requestData),
        });
        const data = await resp.json().catch(() => ({}));
        console.log('Data purchase response', {
          status: resp.status,
          statusText: resp.statusText,
          timestamp: nowIso(),
        });
        if (!resp.ok) {
          const rawMsg = extractErrorMessage(data, resp.statusText || '');
          const supportInfo = getSupportContactInfo();
          let friendly = 'I could not complete the purchase.';
          const msgStr = String(rawMsg || '').toLowerCase();
          if (msgStr.includes('insufficient')) {
            friendly = 'You have an insufficient wallet balance to complete this transaction. Please fund your wallet and try again.';
            // Automatically send funding account details
            try {
              const fundingDetails = await getFundingAccountDetails(userId);
              if (fundingDetails) {
                // Save to session
                if (sessionId) {
                  await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: fundingDetails }, userId, contacts?.wa_id || null);
                }
                // Send via WhatsApp
                const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID2 || process.env.WHATSAPP_PHONE_NUMBER_ID;
                const toNumber = contacts?.wa_id;
                if (phoneNumberId && toNumber) {
                  await sendTextMessage(phoneNumberId, toNumber, fundingDetails).catch(e => {
                    console.error('Failed to send funding account details via WhatsApp:', e.message);
                  });
                }
              }
            } catch (e) {
              console.error('Error sending funding account details:', e.message);
            }
          } else if (msgStr.includes('network')) {
            friendly = 'I still need your network to proceed (MTN, GLO, Airtel, 9mobile).';
          } else if (resp.status >= 500) {
            friendly = `The service had an issue processing your request. ${supportInfo.message}`;
          } else if (msgStr.includes('phone')) {
            friendly = 'That phone number looks invalid. Please send an 11-digit number that starts with 0.';
          } else {
            // For any other transaction errors, include support contact
            friendly = `I encountered an issue with your transaction. ${supportInfo.message}`;
          }
          return `${friendly}`;
        }
        console.log('Data purchase success', {
          reference: data?.transaction?.reference,
          userId,
          timestamp: nowIso(),
        }, data);
        try {
          if (sessionId) {
            await updateSessionMetadata(String(sessionId), {
              'metadata.lastDataPhone': String(normalizedPhone),
              'metadata.lastDataNetwork': String(normalizedNetwork),
              'metadata.pendingPhone': null,
              'metadata.pendingNetwork': null,
              'metadata.pendingPurchase': null,
              'metadata.pendingAmount': null,
              'metadata.retryTransaction': null, // Clear retry metadata on successful purchase
            }, userId, contacts?.wa_id || null);
          }
        } catch (e) {
          console.error('Error updating session metadata:', e.message);
        }
        // Backend will send success notification via WhatsApp receipt template
        // So we don't need to send another message here
        // Just return empty or a brief acknowledgment
        console.log('✅ Data purchase initiated successfully', {
          reference: data?.transaction?.reference,
          userId,
          phone: normalizedPhone,
          network: normalizedNetwork,
          planId: args.planId,
          amount: args.amount,
          timestamp: new Date().toISOString(),
        });
        return ''; // Return empty string as backend will send receipt template
      } catch (e) {
        console.log('Data purchase error', {
          error: e.message,
          userId,
          timestamp: nowIso(),
        });
        const supportInfo = getSupportContactInfo();
        return `I had trouble completing your transaction. ${supportInfo.message}`;
      }
    }
    case 'buyAirtime': {
      if (!userId) return '⚠️ Please sign in to buy airtime.'

      console.log('🔄 PROCESSING AIRTIME PURCHASE REQUEST:', {
        userId: userId,
        args: args,
        timestamp: new Date().toISOString()
      })

      // Clear any existing retry transaction metadata when starting a NEW purchase
      if (!args?.confirm && sessionId) {
        try {
          await waChatSessions.updateSession(String(sessionId), {
            'metadata.retryTransaction': null
          }, userId, contacts?.wa_id || null)
        } catch (e) {
          console.error('Error clearing retry metadata:', e.message)
        }
      }

      // Get user's phone number if not provided
      let phoneNumber = args?.phone || (contacts?.wa_id ? `0${String(contacts.wa_id).replace(/^234/, '').replace(/^\+234/, '')}` : undefined)
      if (!phoneNumber) {
        try {
          const user = await services.usersService.getUserById(userId)
          if (user && user.phoneNumber && user.phoneNumber.length > 0) {
            phoneNumber = user.phoneNumber[0]
          }
        } catch (e) {
          console.error('Error fetching user phone:', e.message)
        }
      }
      // Do not create wallets here; rely on /wallets endpoint to provision via Monnify

      const missing = []
      if (args?.amount == null) missing.push('amount')
      if (!phoneNumber) missing.push('phone (or add phone to your profile)')
      if (missing.length) {
        return `To buy airtime, I need: ${missing.join(', ')}.
Example: buyAirtime { amount: 200, phone: '08031234567' }`
      }

      if (!args?.confirm) {
        // Sanitize phone number before storing
        const sanitizedPhoneForStorage = phoneNumber ? (isValidNigerianPhone(phoneNumber) ? sanitizePhone(phoneNumber) : phoneNumber) : phoneNumber
        const isOwnPhone = !args?.phone // If no phone was provided, it's their own phone
        const phoneLabel = isOwnPhone ? 'your phone' : (sanitizedPhoneForStorage || phoneNumber)
        
        // Validate phone number before proceeding
        if (sanitizedPhoneForStorage && !isValidNigerianPhone(sanitizedPhoneForStorage)) {
          return '⚠️ Please provide a valid 11-digit Nigerian phone number (e.g., 08031234567).'
        }
        
        // Store pending airtime purchase in session metadata with sanitized phone
        try {
          if (sessionId) {
            await waChatSessions.updateSession(String(sessionId), {
              'metadata.pendingAirtime': {
                amount: Number(args.amount),
                phone: String(sanitizedPhoneForStorage || phoneNumber || ''),
                expiresAt: new Date(Date.now() + PENDING_PURCHASE_TIMEOUT_MS).toISOString(),
              },
            }, userId, contacts?.wa_id || null);
          }
        } catch (e) {
          console.error('Error updating session metadata for airtime:', e.message);
        }
        
        // CRITICAL: ALWAYS send WhatsApp confirmation template before returning
          const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID2 || process.env.WHATSAPP_PHONE_NUMBER_ID
          const toNumber = contacts?.wa_id
        if (!phoneNumberId || !toNumber) {
          console.error('❌ Missing WhatsApp credentials for confirmation template:', { phoneNumberId: !!phoneNumberId, toNumber: !!toNumber })
          const supportInfo = getSupportContactInfo();
          return `Unable to send confirmation. Please check your WhatsApp connection and try again. If the issue persists, ${supportInfo.message}`;
        }
        
        try {
            const text = `buy airtime of *${formatMoney(args.amount)}* for *${phoneLabel}*.\n`
            await sendConfirmationTemplate(phoneNumberId, toNumber, { text })
            // Save confirmation message to session so it can be detected later
            if (sessionId) {
              try {
                await waChatSessions.addMessage(String(sessionId), { 
                  role: 'assistant', 
                  content: `You are about to: ${text}\n\nPlease confirm if you'd like to proceed with this action.` 
                }, userId, contacts?.wa_id || null)
              } catch (e) {
                console.error('Failed to save confirmation message to session:', e.message)
              }
            }
          console.log('✅ WhatsApp confirmation template sent successfully (airtime purchase)')
        } catch (e) {
          console.error('❌ CRITICAL: Failed to send WA confirmation template (airtime):', e?.message, e?.stack)
          // Don't proceed if template fails - return error message
          const supportInfo = getSupportContactInfo();
          return `I couldn't send the confirmation message. Please try again. If the issue persists, ${supportInfo.message}`;
        }
        return ''
      }
      // Validate and sanitize phone number BEFORE proceeding
      const normalizedPhone = isValidNigerianPhone(phoneNumber) ? sanitizePhone(phoneNumber) : null
      if (!normalizedPhone) {
        return '⚠️ Please provide a valid 11-digit Nigerian phone number (e.g., 08031234567).'
      }
      
      // Detect network for logging (backend will also detect, but we validate here)
      const detectedNetwork = detectNetwork(normalizedPhone)
      if (detectedNetwork === 'Unknown') {
        // For airtime, we can still proceed even if network is unknown - backend will handle it
        // But log a warning
        console.warn('⚠️ Could not detect network for phone:', normalizedPhone, '- proceeding anyway for airtime')
      } else {
        console.log('✅ Detected network for airtime purchase:', detectedNetwork, 'for phone:', normalizedPhone)
      }
      
      // Idempotency guard to avoid accidental duplicate airtime purchases on rapid double-confirm
      try {
        const confirmHash = ['airtime', normalizedPhone, String(args.amount)].join('|')
        const { duplicate } = await waChatSessions.checkAndStampConfirm(String(sessionId), confirmHash, 10000, userId, contacts?.wa_id || null)
        if (duplicate) {
          return ''
        }
      } catch { }
      
      // Send "Please wait" message immediately before processing
      const waitMessage = 'Please wait while we process your airtime recharge...'
      try {
        if (sessionId) {
          await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: waitMessage }, userId, contacts?.wa_id || null)
        }
        // Also send via WhatsApp if possible
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID2 || process.env.WHATSAPP_PHONE_NUMBER_ID
        const toNumber = contacts?.wa_id
        if (phoneNumberId && toNumber) {
          const { sendTextMessage } = require('./whatsappTemplates')
          await sendTextMessage(phoneNumberId, toNumber, waitMessage).catch(e => {
            console.error('Failed to send wait message via WhatsApp:', e.message)
          })
        }
      } catch (e) {
        console.error('Error sending wait message:', e.message)
      }
      
      try {
        const user = await services.usersService.getUserById(userId)
        if (!user) return '⚠️ User not found.'
        const token = createToken(JSON.stringify({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          email: user.email,
          banned: user.banned,
        }))
        const requestData = {
          amount: Number(args.amount),
          phone: normalizedPhone, // Use sanitized phone number
          wa_id: contacts?.wa_id,
          source: 'whatsapp'
        }
        const resp = await fetch(`${process.env.API_BASE_URL || 'http://localhost:4000/api'}/wallets/buyAirtime`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(requestData)
        })
        const data = await resp.json().catch(() => ({}))
        if (!resp.ok) {
          const msg = extractErrorMessage(data, resp.statusText || 'Unknown error')
          console.log('Airtime purchase failed', { userId, phone: normalizedPhone, amount: args.amount, error: msg, detectedNetwork })
          
          const supportInfo = getSupportContactInfo();
          // For airtime, network is auto-detected, so don't show network-related errors
          // Provide more helpful error messages
          const msgStr = String(msg || '').toLowerCase()
          let friendly = ''
          
          if (msgStr.includes('insufficient')) {
            friendly = 'You have insufficient wallet balance. Please fund your wallet and try again.';
            // Automatically send funding account details
            try {
              const fundingDetails = await getFundingAccountDetails(userId);
              if (fundingDetails) {
                // Save to session
                if (sessionId) {
                  await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: fundingDetails }, userId, contacts?.wa_id || null);
                }
                // Send via WhatsApp
                const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID2 || process.env.WHATSAPP_PHONE_NUMBER_ID;
                const toNumber = contacts?.wa_id;
                if (phoneNumberId && toNumber) {
                  await sendTextMessage(phoneNumberId, toNumber, fundingDetails).catch(e => {
                    console.error('Failed to send funding account details via WhatsApp:', e.message);
                  });
                }
              }
      } catch (e) {
              console.error('Error sending funding account details:', e.message);
            }
          } else if (msgStr.includes('phone') || msgStr.includes('invalid')) {
            friendly = `Invalid phone number: ${normalizedPhone}. Please provide a valid 11-digit Nigerian phone number (e.g., 08031234567).`
          } else if (msgStr.includes('network')) {
            // This shouldn't happen for airtime, but if it does, provide helpful message
            friendly = `Network detection issue. ${supportInfo.message}`
          } else if (resp.status >= 500) {
            friendly = `Service temporarily unavailable. ${supportInfo.message}`
          } else {
            // For any other transaction errors, include support contact
            friendly = `Airtime purchase failed. ${supportInfo.message}`
          }
          
          // Send error message via WhatsApp and save to session
          try {
            if (sessionId) {
              await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: friendly }, userId, contacts?.wa_id || null)
            }
            const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID2 || process.env.WHATSAPP_PHONE_NUMBER_ID
            const toNumber = contacts?.wa_id
            if (phoneNumberId && toNumber) {
              const { sendTextMessage } = require('./whatsappTemplates')
              await sendTextMessage(phoneNumberId, toNumber, friendly).catch(e => {
                console.error('Failed to send error message via WhatsApp:', e.message)
              })
            }
          } catch (e) {
            console.error('Error sending error message:', e.message)
          }
          
          return friendly
        }
        // Clear pending airtime metadata and retry metadata on success
        try {
          if (sessionId) {
            await waChatSessions.updateSession(String(sessionId), {
              'metadata.pendingAirtime': null,
              'metadata.retryTransaction': null // Clear retry metadata on successful purchase
            }, userId, contacts?.wa_id || null)
          }
        } catch (e) {
          console.error('Error clearing pending airtime metadata:', e.message)
        }
        
        // Backend will send success notification via WhatsApp receipt template
        // So we don't need to send another message here
        // Just return empty or a brief acknowledgment
        console.log('✅ Airtime purchase initiated successfully', {
          reference: data?.reference || data?.data?.reference,
          userId,
          phone: normalizedPhone,
          amount: args.amount,
          detectedNetwork
        })
        
        // Return empty since backend will send the receipt template
        return ''
      } catch (e) {
        const supportInfo = getSupportContactInfo();
        return `I encountered an error processing your airtime purchase. ${supportInfo.message}`;
      }
    }
    case 'airtimeInfo': {
      return (
        'Airtime/Data Help:\n' +
        '- Networks: MTN, GLO, Airtel, 9mobile.\n' +
        '- Flow: Select network → Select plan/amount → Enter phone → Confirm → We process.\n' +
        '- Tip: Ensure enough wallet balance before purchase.\n' +
        '- Tier Points: 1 point per ₦100 VTU spend. Tiers unlock higher emergency access limits.'
      )
    }
    case 'retryLastTransaction': {
      if (!userId) return '⚠️ Please sign in to retry transactions.'
      try {
        // Fetch last transaction (debit type for purchases)
        const filter = { 
          userId: new mongoose.Types.ObjectId(String(userId)),
          type: 'debit',
          $or: [
            { narration: { $regex: /data|airtime/i } },
            { planName: { $exists: true } },
            { network: { $exists: true } }
          ]
        }
        const txResult = await services.walletsService.fetchTransactions(filter, { 
          page: 1, 
          limit: 1, 
          sort: { _id: -1 } 
        })
        
        if (!txResult?.docs || txResult.docs.length === 0) {
          const supportInfo = getSupportContactInfo();
          return `No previous transaction found to retry. Please make a purchase first. If you believe this is an error, ${supportInfo.message}`;
        }
        
        const lastTx = txResult.docs[0]
        const isData = !!lastTx.planName || !!lastTx.planType
        const isAirtime = !isData && lastTx.narration && /airtime/i.test(lastTx.narration)
        
        if (!isData && !isAirtime) {
          return '⚠️ Last transaction is not a data or airtime purchase. Cannot retry.'
        }
        
        // For data purchases, look up planId from dataplan.json if not stored in transaction
        let planId = lastTx.planId || null
        if (isData && !planId && lastTx.planName && lastTx.network && lastTx.vendor) {
          try {
            const plans = require('../dataplan.json')
            const matchingPlan = Array.isArray(plans) ? plans.find(p => 
              String(p.planName).toLowerCase() === String(lastTx.planName).toLowerCase() &&
              String(p.network).toUpperCase() === String(lastTx.network).toUpperCase() &&
              String(p.vendor).toLowerCase() === String(lastTx.vendor).toLowerCase() &&
              (lastTx.planType ? String(p.planType).toUpperCase() === String(lastTx.planType).toUpperCase() : true)
            ) : null
            if (matchingPlan) {
              planId = String(matchingPlan.planId)
            }
          } catch (e) {
            console.error('Error looking up planId from dataplan.json:', e.message)
          }
        }
        
        // Store retry transaction details in session metadata
        if (sessionId) {
          try {
            await waChatSessions.updateSession(String(sessionId), {
              'metadata.retryTransaction': {
                transactionId: String(lastTx._id),
                type: isData ? 'data' : 'airtime',
                amount: Number(lastTx.amount),
                phone: String(lastTx.phone || ''),
                network: String(lastTx.network || ''),
                planId: planId || '',
                planType: String(lastTx.planType || ''),
                planName: String(lastTx.planName || ''),
                vendor: String(lastTx.vendor || 'quickvtu'),
                reference: String(lastTx.reference || ''),
                status: String(lastTx.status || ''),
                createdAt: lastTx.createdAt ? new Date(lastTx.createdAt).toISOString() : null
              }
            }, userId, contacts?.wa_id || null)
          } catch (e) {
            console.error('Error storing retry transaction:', e.message)
          }
        }
        
        // Check if there's existing retry metadata that might be stale
        // If the last transaction we found is different from what's stored, clear old metadata
        if (sessionId) {
          try {
            const currentSession = await waChatSessions.getSession(String(sessionId), userId, contacts?.wa_id || null)
            const existingRetryTx = currentSession?.metadata?.get?.('retryTransaction') || currentSession?.metadata?.retryTransaction
            if (existingRetryTx && existingRetryTx.transactionId) {
              // If stored transaction ID doesn't match current last transaction, clear it
              // This means the user already completed a retry and is trying to retry again
              if (String(existingRetryTx.transactionId) !== String(lastTx._id)) {
                console.log('🧹 Clearing stale retry metadata - last transaction has changed')
                await waChatSessions.updateSession(String(sessionId), {
                  'metadata.retryTransaction': null
                }, userId, contacts?.wa_id || null)
              }
            }
          } catch (e) {
            console.error('Error checking existing retry metadata:', e.message)
          }
        }
        
        // Prepare confirmation message
        let confirmText = ''
        if (isData) {
          const phoneLabel = lastTx.phone || 'your phone'
          confirmText = `retry last data purchase:\n\n` +
            `Network: *${lastTx.network || 'N/A'}*\n` +
            `Plan: *${lastTx.planName || lastTx.planType || 'N/A'}*\n` +
            `Amount: *${formatMoney(lastTx.amount)}*\n` +
            `Phone: *${phoneLabel}*`
        } else {
          const phoneLabel = lastTx.phone || 'your phone'
          confirmText = `retry last airtime purchase:\n\n` +
            `Amount: *${formatMoney(lastTx.amount)}*\n` +
            `Phone: *${phoneLabel}*`
        }
        
        // CRITICAL: ALWAYS send WhatsApp confirmation template
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID2 || process.env.WHATSAPP_PHONE_NUMBER_ID
        const toNumber = contacts?.wa_id
        if (!phoneNumberId || !toNumber) {
          console.error('❌ Missing WhatsApp credentials for retry confirmation:', { phoneNumberId: !!phoneNumberId, toNumber: !!toNumber })
          const supportInfo = getSupportContactInfo();
          return `Unable to send confirmation. Please check your WhatsApp connection and try again. If the issue persists, ${supportInfo.message}`;
        }
        
        try {
          await sendConfirmationTemplate(phoneNumberId, toNumber, { text: confirmText })
          // Save confirmation message to session so it can be detected later
          if (sessionId) {
            try {
              await waChatSessions.addMessage(String(sessionId), { 
                role: 'assistant', 
                content: `You are about to: ${confirmText}\n\nPlease confirm if you'd like to proceed with this action.` 
              }, userId, contacts?.wa_id || null)
            } catch (e) {
              console.error('Failed to save retry confirmation message to session:', e.message)
            }
          }
          console.log('✅ WhatsApp retry confirmation template sent successfully')
        } catch (e) {
          console.error('❌ CRITICAL: Failed to send WA retry confirmation template:', e?.message, e?.stack)
          const supportInfo = getSupportContactInfo();
          return `I couldn't send the confirmation message. Please try again. If the issue persists, ${supportInfo.message}`;
        }
        
        return '' // Return empty to indicate template was sent
      } catch (e) {
        console.error('Error in retryLastTransaction:', e.message, e.stack)
        const supportInfo = getSupportContactInfo();
        return `I encountered an error retrieving your last transaction. ${supportInfo.message}`;
      }
    }
    case 'getTechnician': {
      try {
        const { knowledgeBase } = require('./knowledgeBase')
        const technicians = knowledgeBase.technicians || []
        
        if (technicians.length === 0) {
          return 'No technicians available at the moment. Please contact our support team for assistance: Phone/WhatsApp: 0705 722 1476, Email: support@360gadgetsafrica.com'
        }
        
        // Check if location was already asked in this session
        let shouldAskLocation = true
        if (sessionId) {
          try {
            const currentSession = await waChatSessions.getSession(String(sessionId), userId, contacts?.wa_id || null)
            const messages = Array.isArray(currentSession?.messages) ? currentSession.messages : []
            // Check if we recently asked for location (in last 3 messages)
            const recentMessages = messages.slice(-3)
            const recentlyAskedLocation = recentMessages.some(m => 
              m.role === 'assistant' && 
              String(m.content || '').toLowerCase().includes('location') &&
              String(m.content || '').toLowerCase().includes('city')
            )
            if (recentlyAskedLocation) {
              shouldAskLocation = false
            }
          } catch (e) {
            console.error('Error checking session for location question:', e.message)
          }
        }
        
        // Ask for location conversationally (not used for anything, just to make it conversational)
        if (shouldAskLocation) {
          const askLocationMessage = 'To help you better, could you please share your location? You can tell me your city and state (e.g., "Ikeja, Lagos" or "Ilorin, Kwara").'
          
          // Save to session
          if (sessionId) {
            try {
              await waChatSessions.addMessage(String(sessionId), { 
                role: 'assistant', 
                content: askLocationMessage 
              }, userId, contacts?.wa_id || null)
            } catch (e) {
              console.error('Failed to save location request to session:', e.message)
            }
          }
          
          // Send via WhatsApp if possible
          const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID2 || process.env.WHATSAPP_PHONE_NUMBER_ID
          const toNumber = contacts?.wa_id
          if (phoneNumberId && toNumber) {
            try {
              const { sendTextMessage } = require('./whatsappTemplates')
              await sendTextMessage(phoneNumberId, toNumber, askLocationMessage).catch(e => {
                console.error('Failed to send location request via WhatsApp:', e.message)
              })
            } catch (e) {
              console.error('Error sending location request:', e.message)
            }
          }
          
          return askLocationMessage
        }
        
        // Send all technicians individually (like products)
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID2 || process.env.WHATSAPP_PHONE_NUMBER_ID
        const toNumber = contacts?.wa_id
        
        if (!phoneNumberId || !toNumber) {
          // Fallback: return text list if WhatsApp not available
          let techList = `I've found our repair & diagnostics partners who can help you with that. Here they are:\n\n`
          technicians.forEach((tech, index) => {
            techList += `${index + 1}. *${tech.title}*\n`
            techList += `   Location: ${tech.city}, ${tech.state}\n`
            techList += `   Phone: ${tech.phone}\n`
            techList += `   ${tech.url}\n\n`
          })
          techList += `You can reach out to any of them directly and they'll be happy to assist you.`
          return techList
        }
        
        // Send each technician individually in product format (like products are sent)
        const { sendTextMessage } = require('./whatsappTemplates')
        
        for (const tech of technicians) {
          // Format same as products: "*Title*,\n\n*Price:* *₦364,000* *(Price last updated: 2 months ago)*  \n\n{productlink}"
          // For technicians: "*Title*,\n\n*Location:* *City, State*\n*Phone:* *Phone*\n*Address:* *Address*\n\n{url}"
          // Ensure URL is always present - use from tech.url or construct from slug
          const techUrl = tech.url || `https://360gadgetsafrica.com/technicians/${tech.slug}`
          const messageText = `*${tech.title}*,\n\n*Location:* *${tech.city}, ${tech.state}*\n*Phone:* *${tech.phone}*\n*Address:* *${tech.address}*\n\n${techUrl}`
          
          try {
            await sendTextMessage(phoneNumberId, toNumber, messageText)
            
            // Save to session
            if (sessionId) {
              try {
                await waChatSessions.addMessage(String(sessionId), { 
                  role: 'assistant', 
                  content: messageText 
                }, userId, contacts?.wa_id || null)
              } catch (e) {
                console.error('Failed to save technician message to session:', e.message)
              }
            }
          } catch (e) {
            console.error(`Failed to send technician ${tech.title} via WhatsApp:`, e.message)
          }
        }
        
        // Save technicians to metadata
        if (sessionId) {
          try {
            await waChatSessions.updateSession(String(sessionId), {
              'metadata.technicians': technicians.map(tech => ({
                slug: tech.slug,
                title: tech.title,
                url: tech.url,
                city: tech.city,
                state: tech.state,
                phone: tech.phone,
                address: tech.address
              }))
            }, userId, contacts?.wa_id || null)
          } catch (e) {
            console.error('Error saving technicians to session metadata:', e.message)
          }
        }
        
        // Return empty string to let AI continue the conversation naturally and personally
        // The AI will generate a friendly, personalized response based on the user's query
        return ''
      } catch (e) {
        console.error('Error in getTechnician:', e.message, e.stack)
        const supportInfo = getSupportContactInfo()
        return `I encountered an error finding technicians. ${supportInfo.message}`
      }
    }
    default:
      return `⚠️ Unknown function: ${name}`
  }
}
function toGeminiHistory(messages) {
  try {
    return (messages || [])
      .filter(m => m && m.role && m.content)
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.content) }],
      }))
  } catch {
    return []
  }
}
// Extract function calls in a robust way across SDK versions
function extractFunctionCalls(result) {
  try {
    const maybeFn = result?.response?.functionCalls
    if (typeof maybeFn === 'function') {
      return maybeFn() || []
    }
  } catch { }
  try {
    const parts = result?.response?.candidates?.[0]?.content?.parts || []
    const calls = []
    for (const p of parts) {
      if (p?.functionCall?.name) {
        let args = p.functionCall.args
        if (typeof args === 'string') {
          try { args = JSON.parse(args) } catch { }
        }
        calls.push({ name: p.functionCall.name, args: args || {} })
      }
    }
    return calls
  } catch {
    return []
  }
}
async function ensureSession(sessionId, userId = null, waId = null) {
  let session = await waChatSessions.getSession(sessionId, userId, waId)
  if (!session) {
    try {
      session = await waChatSessions.createSession({
        sessionId,
        ...(userId ? { userId } : {}),
        ...(waId ? { waId, phoneNumberId: (process.env.WHATSAPP_PHONE_NUMBER_ID2 || process.env.WHATSAPP_PHONE_NUMBER_ID) } : {}),
        isActive: true,
        messages: [],
      })
    } catch (e) {
      // Another process may have created it; try fetch again
      session = await waChatSessions.getSession(sessionId, userId, waId)
    }
  }
  return session
}
async function processAIChat(prompt, sessionId, userId = null, contacts) {
  if (!prompt) return 'Please provide a question.'
  const waId = contacts?.wa_id || null
  console.log(waId, userId, 'asdfasdf sadf')
  const session = await ensureSession(String(sessionId), userId, waId)
  
  // CRITICAL: Clear retry metadata at the very start if this looks like a NEW purchase request
  // This must happen BEFORE saving the message to avoid any race conditions
  const promptLower = String(prompt || '').toLowerCase()
  const looksLikeNewPurchase = /\b(buy|topup|top\s*up|purchase|airtime|data)\b/i.test(promptLower)
  const looksLikeRetry = /\b(retry|buy again|purchase again|repeat|redo)\b/i.test(promptLower)
  
  if (looksLikeNewPurchase && !looksLikeRetry && sessionId && userId) {
    try {
      const currentSession = await waChatSessions.getSession(String(sessionId), userId, waId)
      const hasRetryMetadata = currentSession?.metadata?.get?.('retryTransaction') || currentSession?.metadata?.retryTransaction
      if (hasRetryMetadata) {
        await waChatSessions.updateSession(String(sessionId), {
          'metadata.retryTransaction': null
        }, userId, waId)
        console.log('🧹 EARLY CLEAR: Cleared retry metadata at processAIChat start for new purchase')
      }
    } catch (e) {
      console.error('Error clearing retry metadata at processAIChat start:', e.message)
    }
  }
  
  // Save user message in this session
  await waChatSessions.addMessage(String(sessionId), { role: 'user', content: String(prompt) }, userId, waId)
  // Build history from ALL active sessions for this user/device to maintain memory
  let allMessages = []
  try {
    const pageSize = 50
    const list = await waChatSessions.getUserSessions(userId, waId, { page: 1, limit: pageSize })
    const sessions = Array.isArray(list?.docs) ? list.docs : []
    // Oldest to newest by updatedAt, then concatenate messages
    const ordered = sessions.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
    for (const s of ordered) {
      if (Array.isArray(s.messages)) {
        allMessages = allMessages.concat(s.messages)
      }
    }
  } catch (e) {
    // fallback to current session only
    allMessages = Array.isArray(session?.messages) ? session.messages : []
  }
  // Trim history to last 40 messages to keep context tight
  const trimmed = allMessages.slice(-40)
  let history = toGeminiHistory(trimmed)
  // Ensure history starts with a user message as required by Gemini
  if (history.length && history[0].role !== 'user') {
    const firstUserIdx = history.findIndex(h => h && h.role === 'user')
    history = firstUserIdx >= 0 ? history.slice(firstUserIdx) : []
  }
  console.log('💬 CONVERSATION HISTORY:', {
    userId: userId,
    messageCount: allMessages.length,
    lastMessages: allMessages.slice(-5), // Last 5 messages for context
    currentPrompt: prompt,
    timestamp: new Date().toISOString()
  })
  // Get user context for personalized system prompt
  let userContext = {}
  if (userId) {
    try {
      const user = await services.usersService.getUserById(userId)
      const waPhone = contacts?.wa_id ? `0${String(contacts.wa_id).replace(/^234/, '').replace(/^\+234/, '')}` : undefined
      const savedPhone = (user && user.phoneNumber && user.phoneNumber.length > 0) ? user.phoneNumber[0] : undefined
      const userPhone = waPhone || savedPhone
      const userNetwork = userPhone ? detectNetwork(userPhone) : undefined
      if (userPhone) {
        userContext = {
          userPhone,
          userNetwork,
          userName: contacts?.profile?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' '),
        }
        console.log('👤 USER CONTEXT LOADED:', {
          userId: userId,
          userPhone: userPhone,
          userNetwork: userNetwork,
          userName: userContext.userName,
          timestamp: new Date().toISOString()
        })
      }
    } catch (e) {
      console.error('Error fetching user context:', e.message)
    }
  }
  const modelName = DEFAULT_GEMINI_MODEL
  const model = genAI.getGenerativeModel({
    model: modelName,
    tools: toolDeclarations(),
    systemInstruction: getSystemPrompt(userContext),
  })
  // Start chat with history and send message
  const chat = model.startChat({ history })
  let text = 'I had trouble processing your request.'
  try {
    // Try to resolve selection from the last search only when the user clearly intends to select
    if (sessionId) {
      try {
        const currentSession = await waChatSessions.getSession(String(sessionId), userId, waId)
        const ctx = currentSession?.metadata?.get?.('selectionContext') || currentSession?.metadata?.selectionContext
        const isProductCtx = ctx === 'products'
        const isCategoryCtx = ctx === 'categories'
        const productList = currentSession?.metadata?.get?.('lastProductList') || currentSession?.metadata?.lastProductList
        const dataList = currentSession?.metadata?.get?.('lastDataList') || currentSession?.metadata?.lastDataList
        const categoryList = currentSession?.metadata?.get?.('lastCategoryList') || currentSession?.metadata?.lastCategoryList
        const items = isProductCtx
          ? ((productList && Array.isArray(productList.items)) ? productList.items : [])
          : (isCategoryCtx
              ? ((categoryList && Array.isArray(categoryList.items)) ? categoryList.items : [])
              : ((dataList && Array.isArray(dataList.items)) ? dataList.items : []))
        if (items.length > 0) {
          const raw = String(prompt).trim()
          const lower = raw.toLowerCase()
          // Detect explicit selection intent; avoid hijacking normal keyword queries (e.g., "hp 8th gen")
          const selectionRegexes = [
            /^(pick|choose|option|number|no|item)?\s*\d{1,2}(?:st|nd|rd|th)?[.!]?$/i,
            /^(the\s+)?(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)(\s+one)?[.!]?$/i
          ]
          const selectionIntent = selectionRegexes.some(r => r.test(raw))
          if (!selectionIntent) {
            // No clear selection intent; proceed to normal model handling
            throw new Error('skip-selection')
          }
          // 1) Numeric selection anywhere in the phrase (supports 1st/2nd/11th, etc.)
          let pickedIndex = -1
          const numRegex = /(\d{1,2})(?:st|nd|rd|th)?/gi
          let m
          while ((m = numRegex.exec(raw)) !== null) {
            const n = parseInt(m[1], 10)
            const idx = n - 1
            if (idx >= 0 && idx < items.length) { pickedIndex = idx; break }
          }
          // 2) No fuzzy matching here to avoid accidental stale picks; require numeric selection intent
          if (pickedIndex >= 0) {
            const chosen = items[pickedIndex]
            if (isProductCtx && chosen?.id) {
              // Build and send template card for the chosen product, then details text
              try {
                const phoneNumberId = contacts?.phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID2
                const toNumber = contacts?.wa_id ? `+${contacts.wa_id}` : ''
                const updatedAt = chosen.updatedAt ? `*(Price last updated: ${moment(chosen.updatedAt).fromNow()})*` : ''
                const productLink = (chosen.categorySlug && chosen.slug) 
                  ? `https://360gadgetsafrica.com/gadgets/${chosen.categorySlug}/${encodeURIComponent(chosen.slug)}`
                  : ''
                
                if (phoneNumberId && toNumber) {
                  const { sendTextMessage } = require('./whatsappTemplates')
                  // Format message as: "*Title*, \n\n*Price:* *₦364,000* *(Price last updated: 2 months ago)*  \n\n{productlink}"
                  const messageText = `*${chosen.title}*,\n\n*Price:* *${formatMoney(chosen.price)}*${updatedAt ? ` ${updatedAt}` : ''}\n\n${productLink}`
                  
                  await sendTextMessage(phoneNumberId, toNumber, messageText)
                  
                  // Save to session metadata
                  if (sessionId) {
                    try {
                      await waChatSessions.addMessage(String(sessionId), { 
                        role: 'assistant', 
                        content: messageText 
                      }, userId, contacts?.wa_id || null)
                    } catch (e) {
                      console.error('Failed to save product message to session:', e.message)
                    }
                  }
                }
              } catch { }
              const details = await executeTool('getProductDetails', { id: chosen.id }, { userId, contacts, sessionId })
              await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: details }, userId, waId)
              return details
            }
            if (isCategoryCtx && chosen?.id) {
              try {
                if (sessionId) {
                  await updateSessionMetadata(String(sessionId), {
                    'metadata.lastSelectedCategory': {
                      id: String(chosen.id),
                      title: chosen.title || '',
                      slug: chosen.slug || '',
                      selectedAt: nowIso()
                    }
                  }, userId, waId)
                }
              } catch (e) {
                console.error('Failed to persist category selection metadata:', e.message)
              }
              try {
                const result = await executeTool('searchProducts', { categoryId: chosen.id }, { userId, contacts, sessionId })
                if (typeof result === 'string' && result.trim()) {
                  await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: result }, userId, waId)
                }
                return typeof result === 'string' ? result : ''
              } catch (e) {
                console.error('Error handling category selection:', e.message)
                return `I had trouble loading that category. Please try again or choose a different category.`
              }
            }
            if (!isProductCtx && !isCategoryCtx && chosen) {
              // Immediately proceed to purchase flow using the chosen plan
              try {
                // Save pending purchase details to session and prompt for explicit confirmation
                if (sessionId) await waChatSessions.updateSession(String(sessionId), {
                  'metadata.pendingPurchase': {
                    planId: String(chosen.planId),
                    vendor: String(chosen.vendor),
                    network: String(chosen.network),
                    planType: String(chosen.planType),
                    amount: Number(chosen.amount),
                    planName: String(chosen.planName || ''),
                    phone: currentSession?.metadata?.get?.('pendingPhone') || currentSession?.metadata?.pendingPhone || null  // NEW: persist phone here too
                  }
                }, userId, waId)
                // CRITICAL: ALWAYS send WhatsApp confirmation template before returning
                  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID2 || process.env.WHATSAPP_PHONE_NUMBER_ID
                  const toNumber = contacts?.wa_id
                if (!phoneNumberId || !toNumber) {
                  console.error('❌ Missing WhatsApp credentials for confirmation template:', { phoneNumberId: !!phoneNumberId, toNumber: !!toNumber })
                  const supportInfo = getSupportContactInfo();
                  const fallback = `Unable to send confirmation. Please check your WhatsApp connection and try again. If the issue persists, ${supportInfo.message}`;
                  await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: fallback }, userId, waId)
                  return fallback
                }
                
                try {
                  const pendingPhone = currentSession?.metadata?.get?.('pendingPhone') || currentSession?.metadata?.pendingPhone || 'your phone'
                  const text = `buy *${String(chosen.network)} ${String(chosen.planType)} ${String(chosen.planName || '')}* for *${formatMoney(chosen.amount)}* to *${pendingPhone}*.`
                    await sendConfirmationTemplate(phoneNumberId, toNumber, { text })
                  // Save confirmation message to session so it can be detected later
                  try {
                    await waChatSessions.addMessage(String(sessionId), { 
                      role: 'assistant', 
                      content: `You are about to: ${text}\n\nPlease confirm if you'd like to proceed with this action.` 
                    }, userId, waId)
                  } catch (e) {
                    console.error('Failed to save confirmation message to session:', e.message)
                  }
                  console.log('✅ WhatsApp confirmation template sent successfully (data selection)')
                } catch (e) {
                  console.error('❌ CRITICAL: Failed to send WA confirmation template (data selection):', e?.message, e?.stack)
                  const supportInfo = getSupportContactInfo();
                  const fallback = `I couldn't send the confirmation message. Please try again. If the issue persists, ${supportInfo.message}`;
                  await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: fallback }, userId, waId)
                  return fallback
                }
                return ''
              } catch (e) {
                const supportInfo = getSupportContactInfo();
                const fallback = `I had trouble proceeding with that selection. Please confirm your network and the 11-digit phone number. If you need assistance, ${supportInfo.message}`;
                await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: fallback }, userId, waId)
                return fallback
              }
            }
          }
        }
      } catch { }
    }
    // Heuristic pre-router for data plan queries: parse prompt and directly call getDataPlans
    try {
      const rawText = String(prompt || '')
      const lower = rawText.toLowerCase()
      
      // CRITICAL: Check for confirmation FIRST before checking retry intent
      // This prevents "yes" from being interpreted as a retry request
      const isConfirm = /\b(confirm|yes|proceed|go ahead|ok|okay|sure|yeah|yep)\b/i.test(lower)
      const isRetryIntent = /\b(retry|buy again|purchase again|repeat|redo)\b/i.test(lower)
      const isNewPurchaseIntent = /\b(buy|topup|top\s*up|purchase|buy\s*airtime|buy\s*data|airtime|data)\b/i.test(lower)
      
      // If it's a new purchase (not retry, not confirm), clear retry metadata immediately
      if (isNewPurchaseIntent && !isRetryIntent && !isConfirm && sessionId) {
        try {
          await waChatSessions.updateSession(String(sessionId), {
            'metadata.retryTransaction': null
          }, userId, waId)
          console.log('🧹 Cleared retry metadata for new purchase request')
        } catch (e) {
          console.error('Error clearing retry metadata at pre-router:', e.message)
        }
      }
      
      // Handle confirm FIRST - prioritize NEW purchases over retry transactions
      // This must come before retry intent check to prevent "yes" from triggering retry again
      if (isConfirm) {
        try {
          const currentSession = await waChatSessions.getSession(String(sessionId), userId, waId)
          
          // CRITICAL: Check conversation history to see if last message was actually asking for confirmation
          // Only process confirmations if the last assistant message was a confirmation request
          const messages = Array.isArray(currentSession?.messages) ? currentSession.messages : []
          const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop()
          const lastMessageContent = String(lastAssistantMessage?.content || '').toLowerCase()
          
          // Check if last message was asking for confirmation (contains confirmation keywords)
          // Also check for the template pattern: "You are about to:" which is added when saving confirmation messages
          const lastMessageIsConfirmation = lastMessageContent.includes('you are about to') ||
                                           lastMessageContent.includes('confirm') || 
                                           (lastMessageContent.includes('reply') && lastMessageContent.includes('yes')) ||
                                           lastMessageContent.includes('proceed') ||
                                           (lastMessageContent.includes('buy') && (lastMessageContent.includes('reply') || lastMessageContent.includes('confirm'))) ||
                                           lastMessageContent.includes('retry last') && lastMessageContent.includes('purchase')
          
          // If last message wasn't asking for confirmation, don't process as purchase confirmation
          if (!lastMessageIsConfirmation) {
            console.log('⚠️ User said "yes" but last message was not a confirmation request. Ignoring confirmation handler.')
            // Let the AI model handle it naturally instead - don't process as purchase confirmation
            // Continue to normal AI processing below
          } else {
            // Last message WAS asking for confirmation, so process it
            // FIRST: Check for NEW pending purchases (these take priority over retry)
            // Also check if pending purchase has expired
            const pendingAirtime = currentSession?.metadata?.get?.('pendingAirtime') || currentSession?.metadata?.pendingAirtime
            if (pendingAirtime && pendingAirtime.amount) {
              // Check if expired
              if (hasPendingPurchaseExpired(pendingAirtime)) {
                console.log('⚠️ Pending airtime purchase has expired. Clearing metadata.')
                try { await waChatSessions.updateSession(String(sessionId), { 'metadata.pendingAirtime': null }, userId, waId) } catch { }
              } else {
                // Ensure phone number is properly sanitized before confirming
                const pendingPhone = String(pendingAirtime.phone || '')
                const sanitizedPhone = isValidNigerianPhone(pendingPhone) ? sanitizePhone(pendingPhone) : pendingPhone
                
                if (!sanitizedPhone || !isValidNigerianPhone(sanitizedPhone)) {
                  const supportInfo = getSupportContactInfo();
                  const errorMsg = `Invalid phone number in pending purchase. Please start a new purchase. If you need assistance, ${supportInfo.message}`;
                  await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: errorMsg }, userId, waId)
                  try { await waChatSessions.updateSession(String(sessionId), { 'metadata.pendingAirtime': null }, userId, waId) } catch { }
                  return errorMsg
                }
                
                const result = await executeTool('buyAirtime', {
                  amount: Number(pendingAirtime.amount),
                  phone: sanitizedPhone, // Use sanitized phone
                  confirm: true
                }, { userId, contacts, sessionId })
                await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: String(result) }, userId, waId)
                // Clear pending airtime
                try { await waChatSessions.updateSession(String(sessionId), { 'metadata.pendingAirtime': null }, userId, waId) } catch { }
                return String(result)
              }
            }
          
            // SECOND: Check for NEW pending data purchase
            // Also check if pending purchase has expired
          const pending = currentSession?.metadata?.get?.('pendingPurchase') || currentSession?.metadata?.pendingPurchase
          const pendingPhone = currentSession?.metadata?.get?.('pendingPhone') || currentSession?.metadata?.pendingPhone
          const pendingNetwork = currentSession?.metadata?.get?.('pendingNetwork') || currentSession?.metadata?.pendingNetwork
          if (pending && pending.planId && pending.vendor) {
              // Check if expired
              if (hasPendingPurchaseExpired(pending)) {
                console.log('⚠️ Pending data purchase has expired. Clearing metadata.')
                try { 
                  await waChatSessions.updateSession(String(sessionId), { 
                    'metadata.pendingPurchase': null, 
                    'metadata.pendingPhone': null, 
                    'metadata.pendingNetwork': null 
                  }, userId, waId) 
                } catch { }
              } else {
            const result = await executeTool('purchaseData', {
              planId: String(pending.planId),
              vendor: String(pending.vendor),
              network: String(pending.network || pendingNetwork || ''),
              planType: String(pending.planType || ''),
              amount: Number(pending.amount),
                  phone: pending.phone || (pendingPhone ? String(pendingPhone) : undefined),
              confirm: true
            }, { userId, contacts, sessionId })
            await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: String(result) }, userId, waId)
            // Clear pending
            try { await waChatSessions.updateSession(String(sessionId), { 'metadata.pendingPurchase': null, 'metadata.pendingPhone': null, 'metadata.pendingNetwork': null }, userId, waId) } catch { }
            return String(result)
          }
            }
          
            // LAST: Only check retry transaction if no new purchases are pending
            // If retryTransaction exists in metadata and user is confirming, proceed with retry
            const retryTx = currentSession?.metadata?.get?.('retryTransaction') || currentSession?.metadata?.retryTransaction
            if (retryTx && retryTx.transactionId) {
              // Check if retry transaction is stale (older than timeout)
              if (hasPendingPurchaseExpired(retryTx)) {
                console.log('⚠️ Retry transaction has expired. Clearing metadata.')
                try { await waChatSessions.updateSession(String(sessionId), { 'metadata.retryTransaction': null }, userId, waId) } catch { }
              } else {
                // Check if user's current message is just a confirmation (yes, confirm, etc.)
                const promptIsJustConfirm = /^(yes|confirm|proceed|go ahead|ok|okay|sure|yeah|yep)$/i.test(String(prompt || '').trim())
                
                // Check if prompt contains new purchase keywords (but not retry keywords)
                const promptHasNewPurchase = /\b(buy|topup|top\s*up|purchase)\b/i.test(String(prompt || '')) && !/\b(retry|again|repeat|redo)\b/i.test(String(prompt || ''))
                
                // SIMPLIFIED LOGIC: If retryTransaction metadata exists and user says "yes" (without new purchase keywords),
                // it's almost certainly a retry confirmation. Proceed with retry.
                const shouldProceedWithRetry = promptIsJustConfirm && !promptHasNewPurchase
                
                console.log('🔍 Retry confirmation check:', {
                  hasRetryTx: !!retryTx,
                  retryTxType: retryTx?.type,
                  promptIsJustConfirm,
                  promptHasNewPurchase,
                  shouldProceedWithRetry,
                  currentPrompt: String(prompt || '').substring(0, 50)
                })
                
                if (shouldProceedWithRetry) {
                  console.log('✅ Processing retry transaction confirmation', {
                    retryTxType: retryTx.type,
                    transactionId: retryTx.transactionId,
                    amount: retryTx.amount,
                    phone: retryTx.phone
                  })
                  if (retryTx.type === 'data') {
                    // For data retry, we need planId. If missing, try to look it up
                    let planId = retryTx.planId
                    if (!planId && retryTx.planName && retryTx.network && retryTx.vendor) {
                      try {
                        const plans = require('../dataplan.json')
                        const matchingPlan = Array.isArray(plans) ? plans.find(p => 
                          String(p.planName).toLowerCase() === String(retryTx.planName).toLowerCase() &&
                          String(p.network).toUpperCase() === String(retryTx.network).toUpperCase() &&
                          String(p.vendor).toLowerCase() === String(retryTx.vendor).toLowerCase() &&
                          (retryTx.planType ? String(p.planType).toUpperCase() === String(retryTx.planType).toUpperCase() : true)
                        ) : null
                        if (matchingPlan) {
                          planId = String(matchingPlan.planId)
                        }
                      } catch (e) {
                        console.error('Error looking up planId for retry:', e.message)
                      }
                    }
                    
                    if (!planId) {
                      const supportInfo = getSupportContactInfo();
                      const errorMsg = `Cannot retry: Plan ID not found. Please select a new plan. If you need assistance, ${supportInfo.message}`;
                      await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: errorMsg }, userId, waId)
                      try { await waChatSessions.updateSession(String(sessionId), { 'metadata.retryTransaction': null }, userId, waId) } catch { }
                      return errorMsg
                    }
                    
                    // Retry data purchase
                    // Clear retry transaction BEFORE executing to prevent issues
                    try { 
                      await waChatSessions.updateSession(String(sessionId), { 'metadata.retryTransaction': null }, userId, waId)
                      console.log('🧹 Cleared retryTransaction metadata before executing retry data purchase')
                    } catch (e) {
                      console.error('Error clearing retry metadata before purchase:', e.message)
                    }
                    
                    const result = await executeTool('purchaseData', {
                      planId: String(planId),
                      vendor: String(retryTx.vendor || 'quickvtu'),
                      network: String(retryTx.network || ''),
                      planType: String(retryTx.planType || ''),
                      amount: Number(retryTx.amount),
                      phone: String(retryTx.phone || ''),
                      confirm: true
                    }, { userId, contacts, sessionId })
                    
                    // Save result to session if not empty
                    if (result) {
                      await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: String(result) }, userId, waId)
                    }
                    return String(result || '')
                  } else if (retryTx.type === 'airtime') {
                    // Retry airtime purchase
                    // Clear retry transaction BEFORE executing to prevent issues
                    try { 
                      await waChatSessions.updateSession(String(sessionId), { 'metadata.retryTransaction': null }, userId, waId)
                      console.log('🧹 Cleared retryTransaction metadata before executing retry airtime purchase')
                    } catch (e) {
                      console.error('Error clearing retry metadata before purchase:', e.message)
                    }
                    
                    const result = await executeTool('buyAirtime', {
                      amount: Number(retryTx.amount),
                      phone: String(retryTx.phone || ''),
                      confirm: true
                    }, { userId, contacts, sessionId })
                    
                    // Save result to session if not empty
                    if (result) {
                      await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: String(result) }, userId, waId)
                    }
                    return String(result || '')
                  }
                } else {
                  // Retry transaction exists but user's message suggests a new purchase
                  // Don't proceed with retry, but also don't clear metadata yet
                  console.log('⚠️ Retry transaction found but user message suggests new purchase - not proceeding with retry', {
                    shouldProceedWithRetry: false,
                    promptIsJustConfirm,
                    promptHasNewPurchase,
                    currentPrompt: String(prompt || '').substring(0, 50)
                  })
                  // Don't clear retry metadata here - it will be cleared when new purchase is initiated
                }
              }
            }
          }
        } catch (e) {
          console.error('Error in confirmation handler:', e.message, e.stack)
        }
      }
      
      // Continue with retry intent handling if not a confirmation
      if (isRetryIntent && !isConfirm) {
        // Handle retry/buy again intent ONLY if it's not a confirmation
        // BUT: Don't call retryLastTransaction if retryTransaction metadata already exists
        // (This prevents re-triggering when user says "yes" after retry confirmation)
        try {
          // Check if retry transaction metadata already exists
          const currentSession = await waChatSessions.getSession(String(sessionId), userId, waId)
          const existingRetryTx = currentSession?.metadata?.get?.('retryTransaction') || currentSession?.metadata?.retryTransaction
          
          // If retry metadata exists, check if it's stale (older than 5 minutes)
          // If stale, clear it and allow new retry. Otherwise, ask user to confirm first.
          if (existingRetryTx && existingRetryTx.transactionId) {
            const retryCreatedAt = existingRetryTx.createdAt ? new Date(existingRetryTx.createdAt).getTime() : null
            const isStale = retryCreatedAt && (Date.now() - retryCreatedAt) > PENDING_PURCHASE_TIMEOUT_MS
            
            if (isStale) {
              // Retry metadata is stale, clear it and allow new retry
              console.log('🧹 Retry metadata is stale, clearing it and allowing new retry')
              try {
                await waChatSessions.updateSession(String(sessionId), {
                  'metadata.retryTransaction': null
                }, userId, waId)
              } catch (e) {
                console.error('Error clearing stale retry metadata:', e.message)
              }
              // Continue to fetch new retry transaction
            } else {
              // Retry metadata is still fresh, ask user to confirm first
              console.log('⚠️ Retry metadata already exists - user should confirm the retry first. Skipping retryLastTransaction call.')
              return 'You already have a retry confirmation pending. Please reply "Yes" to confirm and proceed with the retry.'
            }
          }
          
          // No existing retry metadata (or it was stale and cleared), proceed with fetching last transaction
          const result = await executeTool('retryLastTransaction', {}, { userId, contacts, sessionId })
          if (result) {
            await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: String(result) }, userId, waId)
            return String(result)
          }
          // If empty result, template was sent, return empty
          return ''
        } catch (e) {
          console.error('Error handling retry intent:', e.message)
        }
      }
      // 0) Handle "last number/phone" intent for data purchases
      const wantsLastNumber = /(last|previous)\s+(number|phone)/i.test(lower) && /(data|buy\s*data|purchase\s*data)/i.test(lower)
      if (wantsLastNumber) {
        try {
          const currentSession = await waChatSessions.getSession(String(sessionId), userId, waId)
          const lastPhone = currentSession?.metadata?.get?.('lastDataPhone') || currentSession?.metadata?.lastDataPhone
          const lastNet = currentSession?.metadata?.get?.('lastDataNetwork') || currentSession?.metadata?.lastDataNetwork
          if (lastPhone) {
            const netLabel = lastNet ? ` on ${lastNet}` : ''
            const reply = `The last number you used for a data purchase was ${lastPhone}${netLabel}. Should I use it again?`
            await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: reply }, userId, waId)
            return reply
          }
        } catch { }
        const ask = 'I don\'t yet have a previous data number for you. Please send the 11-digit phone number to use.'
        await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: ask }, userId, waId)
        return ask
      }
      // 1) Exclude obvious product/device queries from data routing
      const deviceKeywords = /(iphone|samsung|tecno|infinix|laptop|macbook|ipad|airpods|watch|accessor(y|ies))/i
      if (deviceKeywords.test(lower)) {
        // Let the model/tools handle product flow
      } else {
        // 2) Data routing with stricter conditions
        const mentionsData = /(data\s*plan|dataplan|buy\s*data|top\s*up\s*data|purchase\s*data)\b/i.test(rawText)
        const sizeMatch = rawText.match(/\b(\d+(?:\.[0-9]+)?)\s*(tb|gb|mb)\b/i)
        const networkMatch = rawText.match(/\b(mtn|glo|airtel|9\s*mobile|9mobile)\b/i)
        const hasPricePhrase = /(under|below|not\s*above|less\s*than|at\s*least|from|more\s*than|between|to|and|₦|ngn|\d{3,})/i.test(rawText)
        const mentionsPlanOrData = /(data|plan|mb|gb|tb)/i.test(lower)  // Changed: substring test, added mb/gb/tb
        // Try to extract a phone number from the prompt (Nigerian format). Normalize to 11-digit starting with 0
        let extractedPhone = null
        try {
          const phoneCandidate = rawText.match(/(\+?234|0)[\s-]*\d{3}[\s-]*\d{3}[\s-]*\d{4}/)  // Added [\s-]* for dashes/spaces
          if (phoneCandidate) {
            const digits = phoneCandidate[0].replace(/\D/g, '')
            if (digits.startsWith('234') && digits.length === 13) extractedPhone = '0' + digits.slice(3)
            else if (digits.length === 11 && digits.startsWith('0')) extractedPhone = digits
          }
        } catch { }
        if ((mentionsData || (mentionsPlanOrData && (sizeMatch || networkMatch || hasPricePhrase)))) {
          const args = {}
          // Prefer network inferred from provided phone over text/WA
          if (extractedPhone) {
            const inferred = detectNetwork(extractedPhone)
            if (inferred && inferred !== 'Unknown') args.network = inferred
          }
          // Network from text if not inferred by phone
          if (!args.network && networkMatch) {
            const n = networkMatch[1].toUpperCase().replace(/\s+/g, '')
            args.network = n === '9MOBILE' ? '9MOBILE' : n
          }
          // Size only when explicit
          if (sizeMatch) {
            const val = sizeMatch[1]
            const unit = sizeMatch[2].toUpperCase()
            args.planName = `${val}${unit}`
          }
          // Plan type
          if (/\bsme\b/i.test(rawText)) args.planType = 'SME'
          else if (/gift|gifting/i.test(rawText)) args.planType = 'GIFTING'
          else if (/coop|corporate|cooperate/i.test(rawText)) args.planType = 'COOPERATE GIFTING'
          // Amounts
          const num = (s) => Number(String(s).replace(/[^0-9.]/g, ''))
          let m
          if ((m = rawText.match(/(?:under|below|not\s*above|less\s*than|<=)\s*₦?\s*([\d,]+)/i))) args.maxAmount = num(m[1])
          if ((m = rawText.match(/(?:at\s*least|from|more\s*than|>=|above)\s*₦?\s*([\d,]+)/i))) args.minAmount = num(m[1])
          if ((m = rawText.match(/between\s*₦?\s*([\d,]+)\s*(?:and|to)\s*₦?\s*([\d,]+)/i))) { args.minAmount = num(m[1]); args.maxAmount = num(m[2]) }
          console.log('🛣️ PRE-ROUTED getDataPlans with:', args)
          // Persist pending phone/network for later purchase
          try {
            if (sessionId) await waChatSessions.updateSession(String(sessionId), {
              'metadata.pendingPhone': extractedPhone || null,
              'metadata.pendingNetwork': args.network || null
            }, userId, waId)
          } catch { }
          const out = await executeTool('getDataPlans', args, { userId, contacts, sessionId })
          await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: String(out) }, userId, waId)
          return String(out)
        }
      }
    } catch { }
    const result = await chat.sendMessage(prompt)
    const calls = extractFunctionCalls(result)

    console.log('🤖 AI FUNCTION CALLS:', {
      prompt: prompt,
      calls: calls,
      userId: userId,
      timestamp: new Date().toISOString()
    })

    if (calls.length > 0) {
      const outputs = []
      let hasGetTechnician = false
      for (const c of calls) {
        const { name, args } = c
        try {
          const out = await executeTool(name, args, { userId, contacts, sessionId })
          if (name === 'getTechnician' && out === '') {
            // getTechnician sent technicians via WhatsApp, mark it so we can continue conversation
            hasGetTechnician = true
          } else {
            outputs.push(typeof out === 'string' ? out : (out?.error ? `⚠️ ${out.error}` : String(out)))
          }
        } catch (e) {
          console.log('❌ TOOL EXECUTION ERROR:', {
            toolName: name,
            args: args,
            error: e.message,
            stack: e.stack,
            userId: userId,
            timestamp: new Date().toISOString()
          })
          outputs.push(`⚠️ ${e.message}`)
        }
      }
      // If getTechnician was called and sent technicians, continue conversation naturally
      if (hasGetTechnician) {
        // Continue the conversation using the existing chat instance
        // The AI will generate a personalized response based on the user's query
        try {
          const followUpResult = await chat.sendMessage('The technicians have been sent to the user individually via WhatsApp. Continue the conversation naturally and personally, relating to their specific query about repairs or diagnostics. Be friendly and helpful.')
          text = String(followUpResult?.response?.text?.() || await followUpResult?.response?.text() || '') || 'I\'ve sent you our repair & diagnostics partners. You can reach out to any of them directly and they\'ll be happy to help you with your needs. Is there anything else I can help you with?'
        } catch (e) {
          console.error('Error generating follow-up response for technicians:', e.message)
          text = 'I\'ve sent you our repair & diagnostics partners. You can reach out to any of them directly and they\'ll be happy to help you with your needs. Is there anything else I can help you with?'
        }
      } else {
        text = outputs.length === 1 ? outputs[0] : outputs.map((o, i) => `(${i + 1}) ${o}`).join('\n')
      }
    } else {
      text = String(result?.response?.text?.() || await result?.response?.text() || '') || 'I had trouble processing your request.'
    }
  } catch (e) {
    console.log('❌ AI CHAT ERROR:', {
      error: e.message,
      stack: e.stack,
      userId: userId,
      prompt: prompt,
      timestamp: new Date().toISOString()
    })
    text = 'I had trouble processing your request.'
  }
  // Save assistant message
  await waChatSessions.addMessage(String(sessionId), { role: 'assistant', content: text }, userId, waId)
  return text
}
module.exports = { processAIChat }