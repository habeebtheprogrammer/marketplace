const { GoogleGenerativeAI } = require('@google/generative-ai')
const mongoose = require('mongoose')
const chatSessions = require('../service/chatSessions.service')
const services = require('../service')

// Initialize Gemini once
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// System instruction tailored for WhatsApp bot
const SYSTEM_PROMPT = `You are 360AI, a smart customer support and operations assistant for 360GadgetsAfrica.

COMPANY CONTEXT
- Brand: 360GadgetsAfrica — a trusted Nigerian tech marketplace.
- Offerings: authentic gadgets (with warranty), repairs, wallet, airtime/data (VTU), and curated product discovery.
- Website: https://360gadgetsafrica.com
- You may learn business info dynamically from the website and sitemap to improve answers.

CORE CAPABILITIES
1) User Profile Management
- Get user profile: name, email, phones, wallet info.
- Update profile: name/email/phone/password (respect API constraints).
- Check referral code/bonus if present.

2) Data & Airtime (VTU)
- Help pick network (MTN, GLO, Airtel, 9mobile).
- Show data plans (paginated if many).
- Flow: Select network → Select plan → Enter phone → Confirm → Execute.
- Confirm intent before purchase. On failure, propose recovery steps.

3) Wallet Management
- Show current wallet balance and linked accounts (banks/virtual) where available.
- Provide funding guidance; show transaction history.

4) Product Enquiry
- Search gadgets (phones, laptops, accessories).
- Show price, availability, specs; recommend alternatives.
- Filter by category, price range, vendor, rating, stock.

INTERACTION STYLE
- Be concise, friendly, and action-oriented.
- Ask clarifying questions when required inputs are missing.
- Confirm before any transaction or irreversible operation.
- Handle errors gracefully; propose next steps.

AUTH RULES
- This WhatsApp bot operates for known users (identified by phone). Tools that require account context should use the provided userId. If not available, ask to register via onboarding.
` 

// Helpers for WhatsApp-friendly formatting
function formatMoney(amount, currency = 'NGN') {
  const n = Number(amount || 0)
  const sym = currency === 'NGN' ? '₦' : ''
  return `${sym}${n.toLocaleString('en-NG', { maximumFractionDigits: 2 })}`
}

function formatDate(dt) {
  try { return new Date(dt).toLocaleString('en-NG') } catch { return String(dt || '') }
}

function toolDeclarations() {
  return [{
    function_declarations: [
      {
        name: 'getUserAccount',
        description: 'Retrieve the user account summary including wallet balance',
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
        name: 'airtimeInfo',
        description: 'Provide information about airtime purchase limits and flow',
        parameters: { type: 'object', properties: {} }
      }
    ]
  }]
}

async function executeTool(name, args, { userId } = {}) {
  switch (name) {
    case 'getUserAccount': {
      if (!userId) return '⚠️ Please sign in to view your account.'
      try {
        // getUserById expects ObjectId or string, returns single user doc
        const user = await services.usersService.getUserById(userId)
        if (!user) return '⚠️ User account not found.'
        
        // getWallets returns paginated { docs: [...], totalDocs, ... }
        const walletList = await services.walletsService.getWallets({ userId: user._id })
        const walletDoc = walletList?.docs?.[0]
        const balance = walletDoc?.balance || 0
        const currency = walletDoc?.currency || 'NGN'
        const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
        const phones = Array.isArray(user.phoneNumber) && user.phoneNumber.length > 0 ? user.phoneNumber.join(', ') : '—'
        const fmtBal = formatMoney(balance, currency)
        
        let msg = `*Account Summary*\n`
        msg += `👤 Name: ${name || '—'}\n`
        msg += `📧 Email: ${user.email || '—'}\n`
        msg += `📱 Phones: ${phones}\n`
        msg += `💰 Wallet: ${fmtBal}`
        if (user.referralCode) msg += `\n🎁 Referral Code: ${user.referralCode}`
        if (user.referrals) msg += `\n👥 Referrals: ${user.referrals}`
        return msg
      } catch (e) {
        return `⚠️ Error fetching account: ${e.message}`
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
          return `${status} ${sign}${formatMoney(t.amount)} | ${t.narration}\n   ${formatDate(t.createdAt)}`
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
        return `*Product Categories* (${cats.totalDocs} total):\n\n${items.join('\n')}`
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
        
        // getProducts expects { query: {}, options: {} }, returns paginated result
        if (args?.title) {
          // Use text search for keyword matching (requires text index on title & description)
          query.$text = { $search: args.title }
        }
        if (args?.categoryId) {
          query.categoryId = new mongoose.Types.ObjectId(String(args.categoryId))
        }
        if (args?.vendorId) {
          query.vendorId = new mongoose.Types.ObjectId(String(args.vendorId))
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
          limit: args?.limit || 10,
          sort: query.$text ? { score: { $meta: 'textScore' } } : { createdAt: -1 },
          projection: query.$text ? { score: { $meta: 'textScore' } } : undefined,
        }
        
        const resp = await services.productsService.getProducts({ query, options })
        
        if (!resp?.docs || resp.docs.length === 0) {
          return 'No products found matching your criteria. Try different filters or keywords.'
        }
        
        const items = resp.docs.map((p, i) => {
          const price = p.discounted_price || p.original_price || 0
          const wasPrice = p.discounted_price && p.original_price > p.discounted_price 
            ? ` ~${formatMoney(p.original_price)}~` 
            : ''
          const inStock = (p.is_stock ?? 0) > 0 ? '✅' : '❌'
          return `${i + 1}. *${p.title}*\n   ${formatMoney(price)}${wasPrice} ${inStock}\n   Rating: ${p.rating || 'N/A'} ⭐ (${p.reviews || 0} reviews)`
        })
        
        return `*Search Results* (Page ${resp.page}/${resp.totalPages}, ${resp.totalDocs} total):\n\n${items.join('\n\n')}`
      } catch (e) {
        return `⚠️ Error searching products: ${e.message}`
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

async function ensureSession(sessionId, userId = null, deviceId = null) {
  let session = await chatSessions.getSession(sessionId, userId, deviceId)
  if (!session) {
    try {
      session = await chatSessions.createSession({
        sessionId,
        ...(userId ? { userId } : {}),
        ...(deviceId ? { deviceId } : {}),
        isActive: true,
        messages: [],
      })
    } catch (e) {
      // Another process may have created it; try fetch again
      session = await chatSessions.getSession(sessionId, userId, deviceId)
    }
  }
  return session
}

async function processAIChat(prompt, sessionId, userId = null, deviceId = null) {
  if (!prompt) return 'Please provide a question.'
  const session = await ensureSession(String(sessionId), userId, deviceId)

  // Save user message in this session
  await chatSessions.addMessage(String(sessionId), { role: 'user', content: String(prompt) }, userId, deviceId)

  // Build history from ALL active sessions for this user/device to maintain memory
  let allMessages = []
  try {
    const pageSize = 50
    const list = await chatSessions.getUserSessions(userId, deviceId, { page: 1, limit: pageSize })
    const sessions = Array.isArray(list?.docs) ? list.docs : []
    // Oldest to newest by updatedAt, then concatenate messages
    const ordered = sessions.sort((a,b) => new Date(a.updatedAt) - new Date(b.updatedAt))
    for (const s of ordered) {
      if (Array.isArray(s.messages)) {
        allMessages = allMessages.concat(s.messages)
      }
    }
  } catch (e) {
    // fallback to current session only
    allMessages = Array.isArray(session?.messages) ? session.messages : []
  }
  const history = toGeminiHistory(allMessages)

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    tools: toolDeclarations(),
    systemInstruction: SYSTEM_PROMPT,
  })

  // Start chat with history and send message
  const chat = model.startChat({ history })
  let text = 'I had trouble processing your request.'
  try {
    const result = await chat.sendMessage(prompt)
    const calls = result?.response?.functionCalls?.() || []
    if (calls.length > 0) {
      const outputs = []
      for (const c of calls) {
        const { name, args } = c
        try {
          const out = await executeTool(name, args, { userId })
          outputs.push(typeof out === 'string' ? out : (out?.error ? `⚠️ ${out.error}` : String(out)))
        } catch (e) {
          outputs.push(`⚠️ ${e.message}`)
        }
      }
      text = outputs.length === 1 ? outputs[0] : outputs.map((o, i) => `(${i+1}) ${o}`).join('\n')
    } else {
      text = String(result?.response?.text?.() || await result?.response?.text() || '') || 'I had trouble processing your request.'
    }
  } catch (e) {
    text = 'I had trouble processing your request.'
  }

  // Save assistant message
  await chatSessions.addMessage(String(sessionId), { role: 'assistant', content: text }, userId, deviceId)

  return text
}

module.exports = { processAIChat }
