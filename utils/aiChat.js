const { GoogleGenerativeAI } = require('@google/generative-ai')
const mongoose = require('mongoose')
const fetch = require('node-fetch')
const { createToken } = require('./helpers')
const { detectNetwork } = require('./vtu')
const chatSessions = require('../service/chatSessions.service')
const services = require('../service')
const moment = require('moment')
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

  return `You are an advanced AI assistant designed to act as a smart customer support & operations chatbot for 360 Gadgets Africa.
Your purpose is to help users manage their accounts, perform wallet & VTU transactions, and make product inquiries intelligently.
Company website: https://www.360gadgetsafrica.com. You may learn business information dynamically from this website and its sitemap and use it to improve answers (product types, services, pricing, etc.).
${contextInfo}
Core Functional Areas
1) User Profile Management
- Get user profile details (name, email, wallet balance, activity).
- Update user details (e.g., name, email, phone number).
- Check and display referral code or bonus.

2) Data & Airtime Top-up
- Help user select network (MTN, GLO, Airtel, 9mobile).
- Show paginated data or airtime plan lists dynamically from backend datalists.
- Guide the purchase flow: Select network → Select plan → Enter phone → Confirm purchase → Execute.
- Handle failed transactions gracefully with recovery steps.
- AUTO-DETECT: When user wants airtime/data for themselves, use their phone and network automatically.
- CRITICAL: When user asks for a data plan (e.g., "MTN 3.2GB under 2000"), you MUST call getDataPlans with planName set to the size mentioned (e.g., planName: "3.2GB"). NEVER say a plan doesn't exist without calling the tool first.

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

Smart Behavior
- Respond conversationally in short, readable WhatsApp-friendly text (not JSON).
- Personalize using user profile data when available.
- Handle errors gracefully and propose next steps.
- Be proactive: if user says "buy airtime" or "buy data" without specifying phone, assume they mean their own phone.
- IMPORTANT: When user says "yes", "confirm", "ok", "proceed", etc., look at the conversation history to understand what they're confirming.
- If the last assistant message was asking for confirmation of a purchase, interpret "yes" as confirmation with confirm: true.
- Always maintain context from previous messages in the conversation.
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
          required: ['planId','vendor','planType','amount']
        }
      },
      {
        name: 'buyAirtime',
        description: 'Buy airtime for a phone number. If no phone specified, use user\'s own phone. Always confirm before executing.',
        parameters: {
          type: 'object',
          properties: {
            amount: { type: 'number' },
            phone: { type: 'string', description: 'Phone number. If not provided, will use user\'s own phone' },
            confirm: { type: 'boolean', description: 'Must be true to execute the purchase' }
          },
          required: ['amount']
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
        }))

        const base = process.env.API_BASE_URL || 'http://localhost:8080'
        const resp = await fetch(`${base}/wallets`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        })
        const data = await resp.json().catch(() => ({}))
        if (!resp.ok) {
          const msg = data?.errors?.[0] || data?.error || resp.statusText
          return `⚠️ Could not fetch account: ${msg}`
        }
        const bal = formatMoney(Number(data?.balance || 0))
        const accounts = Array.isArray(data?.accounts) ? data.accounts : []
        if (accounts.length === 0) return `Your wallet balance is ${bal}. Funding account is not yet available. Please try again shortly.`
        const lines = accounts.map((a, i) => `${i+1}. ${a.bankName}\n   ${a.accountName}\n   ${a.accountNumber}`)
        return `*Funding Account Details*\nBalance: ${bal}\n\n${lines.join('\n\n')}`
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
          } catch {}
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
          limit: args?.limit || 10,
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
          if (sessionId) await chatSessions.updateSession(String(sessionId), {
            'metadata.selectionContext': 'products',
            'metadata.lastProductList': { items: compact, savedAt: new Date().toISOString(), page: options.page, limit: options.limit, totalPages: resp.totalPages },
            'metadata.lastProductQuery': {
              title: rawKeyword || null,
              categoryId: effectiveCategoryId || null,
              vendorId: args?.vendorId || null,
              trending: args?.trending === true ? true : null,
              minPrice: args?.minPrice ?? null,
              maxPrice: args?.maxPrice ?? null
            }
          }, userId, null)
        } catch {}

        // Send top 4 results as WhatsApp template messages
        try {
          const phoneNumberId =   process.env.WHATSAPP_PHONE_NUMBER_ID2
          const toNumber = contacts?.wa_id ? `+${contacts.wa_id}` : ''
          if (phoneNumberId && toNumber) {
            const { sendProductTemplate } = require('./whatsappTemplates')
            const top = resp.docs.slice(0, 4)
            for (const p of top) {
              const price = p.discounted_price || p.original_price || 0
              const was = p.discounted_price && p.original_price > p.discounted_price ? p.original_price : null
              const priceLine = was ? `*${formatMoney(price)}*` : `*${formatMoney(price)}*`
              const updatedAt = p.priceUpdatedAt || p.updatedAt || p.createdAt
              const updated = updatedAt ? `\n*(Price last updated: ${moment(updatedAt).fromNow()})*` : ''
              const link = (p?.categoryId?.slug && p.slug) ? `/${p.categoryId.slug}/${encodeURIComponent(p.slug)}` : ''
              const imageUrl = Array.isArray(p.images) && p.images[0] ? p.images[0] : undefined
              const descriptionRaw = String(p.description || '').slice(0, 897) + '...'
              const description = descriptionRaw && descriptionRaw.trim().length > 0 ? descriptionRaw : p.title
              console.log('🧩 Sending product template', { phoneNumberId, toNumber, title: p.title, url: link })
              await sendProductTemplate(phoneNumberId, toNumber, {
                title: p.title,
                description,
                priceLine: `${priceLine}${updated}`,
                imageUrl,
                productUrl: link
              })
            }
          }
        } catch {}

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
          } catch {}
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
                const sizeLabel = exactMB >= 1024 ? `${(exactMB/1024).toFixed(1)}GB` : `${exactMB}MB`
                titleHint = ` (closest to ${sizeLabel})`
              }
            }

            alt = alt.sort((a,b)=>{
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
            alt = alt.sort((a,b)=>{
              const sa = toMegabytes(a.planName), sb = toMegabytes(b.planName)
              if (sa !== sb) return sa - sb
              return Number(a.amount) - Number(b.amount)
            })
            pageItems = alt
          } catch {}
        }
        const lines = pageItems.map((p, i) => `${start + i + 1}. *${p.planName}* - ${formatMoney(p.amount)} (${p.duration}) `)

        // Persist last data list for numeric selection and set context
        try {
          const compact = pageItems.map(p => ({ planId: String(p.planId), vendor: String(p.vendor), network: String(p.network), planType: String(p.planType), amount: Number(p.amount), planName: p.planName }))
          if (sessionId) await chatSessions.updateSession(String(sessionId), {
            'metadata.selectionContext': 'data',
            'metadata.lastDataList': { items: compact, savedAt: new Date().toISOString(), page, limit }
          }, userId, null)
        } catch {}

        const networkLabel = effectiveNetwork ? ` (${effectiveNetwork})` : ''
        return `*Data Plans${titleHint}${networkLabel}* (Page ${page}/${Math.ceil(list.length / limit)}, ${list.length} total)\n\n${lines.join('\n')}\n\nReply with the number to select a plan.`
      } catch (e) {
        return `⚠️ Error loading plans: ${e.message}`
      }
    }
    case 'purchaseData': {
      if (!userId) return '⚠️ Please sign in to purchase data.'
      
      console.log('🔄 PROCESSING DATA PURCHASE REQUEST:', {
        userId: userId,
        args: args,
        timestamp: new Date().toISOString()
      })
      
      // Get user's phone number and network if not provided
      let phoneNumber = args?.phone || (contacts?.wa_id ? `0${String(contacts.wa_id).replace(/^234/, '').replace(/^\+234/, '')}` : undefined)
      let network = args?.network
      
      if (!phoneNumber || !network) {
        try {
          const user = await services.usersService.getUserById(userId)
          if (!phoneNumber && user && user.phoneNumber && user.phoneNumber.length > 0) phoneNumber = user.phoneNumber[0]
          if (!network && phoneNumber) network = detectNetwork(phoneNumber)
        } catch (e) {
          console.error('Error fetching user phone/network:', e.message)
        }
      }

      // Do not create wallets here; rely on /wallets endpoint to provision via Monnify
      
      const missing = []
      if (!args?.planId) missing.push('planId')
      if (!args?.vendor) missing.push('vendor')
      if (!network) missing.push('network (or add phone to your profile)')
      if (!args?.planType) missing.push('planType')
      if (args?.amount == null) missing.push('amount')
      if (!phoneNumber) missing.push('phone (or add phone to your profile)')
      if (missing.length) {
        // If plan details not provided, try to extract from lastDataList by index
        if (sessionId && /^\d{1,2}$/.test(String(args?.selection || ''))) {
          try {
            const currentSession = await chatSessions.getSession(String(sessionId), userId, null)
            const dataList = currentSession?.metadata?.get?.('lastDataList') || currentSession?.metadata?.lastDataList
            const idx = parseInt(String(args.selection), 10) - 1
            const chosen = (dataList && Array.isArray(dataList.items)) ? dataList.items[idx] : null
            if (chosen) {
              args.planId = chosen.planId
              args.vendor = chosen.vendor
              args.planType = chosen.planType
              args.amount = chosen.amount
              network = chosen.network
            }
          } catch {}
        }
        return `To buy data, I need: ${missing.join(', ')}.
Example: purchaseData { planId: '123', vendor: 'quickvtu', network: 'MTN', planType: 'SME', amount: 520, phone: '08031234567' }`
      }
      
      if (!args?.confirm) {
        const isOwnPhone = !args?.phone // If no phone was provided, it's their own phone
        const phoneLabel = isOwnPhone ? 'your phone' : phoneNumber
        return `You are about to buy ${network} ${args.planType} (Plan ID ${args.planId}) for ${formatMoney(args.amount)} to ${phoneLabel} (${phoneNumber}).\nReply: confirm purchaseData to proceed.`
      }
      try {
        // Create minimal JWT from user to satisfy checkAuth middleware
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

        // Validate network and phone before calling backend
        const allowedNetworks = ['MTN','GLO','AIRTEL','9MOBILE']
        const normalizedNetwork = String(network || '').toUpperCase()
        if (!allowedNetworks.includes(normalizedNetwork)) {
          return 'Please tell me your network to proceed (MTN, GLO, Airtel, 9mobile).'
        }
        const cleanPhone = String(phoneNumber || '').replace(/\D/g, '')
        const normalizedPhone = (cleanPhone.startsWith('0') && cleanPhone.length === 11) ? cleanPhone : null
        if (!normalizedPhone) {
          return 'Please send the 11-digit phone number to receive the data (e.g., 08031234567).'
        }

        const requestData = {
          plan: {
            planId: String(args.planId),
            vendor: String(args.vendor),
            network: normalizedNetwork,
            planType: String(args.planType).toUpperCase(),
            amount: Number(args.amount)
          },
          phone: String(normalizedPhone)
        }

        console.log('📱 DATA PURCHASE REQUEST:', {
          userId: userId,
          userPhone: normalizedPhone,
          userNetwork: normalizedNetwork,
          requestData: requestData,
          timestamp: new Date().toISOString()
        })

        const resp = await fetch(`${process.env.API_BASE_URL || 'http://localhost:8080'}/wallets/buyDataPlan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(requestData)
        })
        const data = await resp.json().catch(() => ({}))
        
        console.log('📱 DATA PURCHASE RESPONSE:', {
          status: resp.status,
          statusText: resp.statusText,
          responseData: data,
          timestamp: new Date().toISOString()
        })
        
        if (!resp.ok) {
          const rawMsg = data?.errors?.[0] || data?.error || resp.statusText || ''
          let friendly = 'I could not complete the purchase.'
          const msgStr = String(rawMsg || '').toLowerCase()
          if (msgStr.includes('insufficient')) friendly = 'You have an insufficient wallet balance to complete this transaction.'
          else if (msgStr.includes('network')) friendly = 'I still need your network to proceed (MTN, GLO, Airtel, 9mobile).'
          else if (resp.status >= 500) friendly = 'The service had an issue processing the request just now.'
          else if (msgStr.includes('phone')) friendly = 'That phone number looks invalid. Please send an 11-digit number that starts with 0.'
          return `${friendly}`
        }
        
        console.log('✅ DATA PURCHASE SUCCESS:', {
          reference: data?.reference,
          userId: userId,
          timestamp: new Date().toISOString()
        })
        
        try {
          if (sessionId) await chatSessions.updateSession(String(sessionId), {
            'metadata.lastDataPhone': String(normalizedPhone),
            'metadata.lastDataNetwork': String(normalizedNetwork)
          }, userId, null)
        } catch {}
        
        return `✅ Data purchase initialized. We are processing your request.\nRef: ${data?.reference || '—'}\nYou will get a notification shortly.`
      } catch (e) {
        console.log('❌ DATA PURCHASE ERROR:', {
          error: e.message,
          stack: e.stack,
          userId: userId,
          timestamp: new Date().toISOString()
        })
        // Never surface coding errors; guide user to provide missing info
        if ((e.message || '').toLowerCase().includes('network')) {
          return 'Please tell me your network to proceed (MTN, GLO, Airtel, 9mobile).'
        }
        return 'I had trouble completing that. Please confirm your network (MTN, GLO, Airtel, 9mobile) and the 11-digit phone number to receive the data.'
      }
    }
    case 'buyAirtime': {
      if (!userId) return '⚠️ Please sign in to buy airtime.'
      
      console.log('🔄 PROCESSING AIRTIME PURCHASE REQUEST:', {
        userId: userId,
        args: args,
        timestamp: new Date().toISOString()
      })
      
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
        const isOwnPhone = !args?.phone // If no phone was provided, it's their own phone
        const phoneLabel = isOwnPhone ? 'your phone' : phoneNumber
        return `You are about to buy airtime of ${formatMoney(args.amount)} for ${phoneLabel} (${phoneNumber}).
Reply: confirm buyAirtime to proceed.`
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
          phone: String(phoneNumber)
        }

        console.log('📞 AIRTIME PURCHASE REQUEST:', {
          userId: userId,
          userPhone: phoneNumber,
          userNetwork: detectNetwork(phoneNumber),
          requestData: requestData,
          timestamp: new Date().toISOString()
        })

        const resp = await fetch(`${process.env.API_BASE_URL || 'http://localhost:8080'}/wallets/buyAirtime`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(requestData)
        })
        const data = await resp.json().catch(() => ({}))
        if (!resp.ok) {
          const msg = data?.errors?.[0] || data?.error || resp.statusText
          console.log('❌ AIRTIME PURCHASE FAILED:', msg)
          return `❌ Airtime purchase failed: ${msg}`
        }
        return `✅ Airtime purchase successful.
Ref: ${data?.reference || data?.data?.reference || '—'}`
      } catch (e) {
        return `⚠️ Error buying airtime: ${e.message}`
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

// Extract function calls in a robust way across SDK versions
function extractFunctionCalls(result) {
  try {
    const maybeFn = result?.response?.functionCalls
    if (typeof maybeFn === 'function') {
      return maybeFn() || []
    }
  } catch {}
  try {
    const parts = result?.response?.candidates?.[0]?.content?.parts || []
    const calls = []
    for (const p of parts) {
      if (p?.functionCall?.name) {
        let args = p.functionCall.args
        if (typeof args === 'string') {
          try { args = JSON.parse(args) } catch {}
        }
        calls.push({ name: p.functionCall.name, args: args || {} })
      }
    }
    return calls
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

async function processAIChat(prompt, sessionId, userId = null, contacts) {
  if (!prompt) return 'Please provide a question.'
  const deviceId = null
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
        const currentSession = await chatSessions.getSession(String(sessionId), userId, deviceId)
        const ctx = currentSession?.metadata?.get?.('selectionContext') || currentSession?.metadata?.selectionContext
        const isProductCtx = ctx === 'products'
        const productList = currentSession?.metadata?.get?.('lastProductList') || currentSession?.metadata?.lastProductList
        const dataList = currentSession?.metadata?.get?.('lastDataList') || currentSession?.metadata?.lastDataList
        const items = isProductCtx
          ? ((productList && Array.isArray(productList.items)) ? productList.items : [])
          : ((dataList && Array.isArray(dataList.items)) ? dataList.items : [])
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
                const priceLine = chosen.wasPrice ? `${formatMoney(chosen.price)} ~${formatMoney(chosen.wasPrice)}~` : `${formatMoney(chosen.price)}`
                const updatedAt = chosen.updatedAt ? ` (updated ${new Date(chosen.updatedAt).toLocaleDateString('en-NG')})` : ''
                const productUrl = (chosen.categorySlug && chosen.slug) ? `https://360gadgetsafrica.com/gadgets/${chosen.categorySlug}/${encodeURIComponent(chosen.slug)}` : ''
                const desc = ''
                if (phoneNumberId && toNumber) {
                  const { sendProductTemplate } = require('./whatsappTemplates')
                  await sendProductTemplate(phoneNumberId, toNumber, {
                    title: chosen.title,
                    description: desc,
                    priceLine: `${priceLine}${updatedAt}`,
                    imageUrl: chosen.image,
                    productUrl
                  })
                }
              } catch {}

              const details = await executeTool('getProductDetails', { id: chosen.id }, { userId, contacts, sessionId })
              await chatSessions.addMessage(String(sessionId), { role: 'assistant', content: details }, userId, deviceId)
              return details
            }
            if (!isProductCtx && chosen) {
              // Immediately proceed to purchase flow using the chosen plan
              try {
                // Save pending purchase details to session and prompt for explicit confirmation
                if (sessionId) await chatSessions.updateSession(String(sessionId), {
                  'metadata.pendingPurchase': {
                    planId: String(chosen.planId),
                    vendor: String(chosen.vendor),
                    network: String(chosen.network),
                    planType: String(chosen.planType),
                    amount: Number(chosen.amount),
                    planName: String(chosen.planName || '')
                  }
                }, userId, deviceId)

                const summary = `You're about to buy ${String(chosen.network)} ${String(chosen.planType)} ${String(chosen.planName || '')} for ${formatMoney(chosen.amount)}. Is this correct? Reply 'yes' to proceed..`
                await chatSessions.addMessage(String(sessionId), { role: 'assistant', content: summary }, userId, deviceId)
                return summary
              } catch (e) {
                const fallback = 'I had trouble proceeding with that selection. Please confirm your network and the 11-digit phone number.'
                await chatSessions.addMessage(String(sessionId), { role: 'assistant', content: fallback }, userId, deviceId)
                return fallback
              }
            }
          }
        }
      } catch {}
    }

    // Heuristic pre-router for data plan queries: parse prompt and directly call getDataPlans
    try {
      const rawText = String(prompt || '')
      const lower = rawText.toLowerCase()

      // Handle confirm for pending data purchase
      const isConfirm = /\b(confirm|yes|proceed|go ahead|ok)\b/i.test(lower)
      if (isConfirm) {
        try {
          const currentSession = await chatSessions.getSession(String(sessionId), userId, deviceId)
          const pending = currentSession?.metadata?.get?.('pendingPurchase') || currentSession?.metadata?.pendingPurchase
          const pendingPhone = currentSession?.metadata?.get?.('pendingPhone') || currentSession?.metadata?.pendingPhone
          const pendingNetwork = currentSession?.metadata?.get?.('pendingNetwork') || currentSession?.metadata?.pendingNetwork
          if (pending && pending.planId && pending.vendor) {
            const result = await executeTool('purchaseData', {
              planId: String(pending.planId),
              vendor: String(pending.vendor),
              network: String(pending.network || pendingNetwork || ''),
              planType: String(pending.planType || ''),
              amount: Number(pending.amount),
              phone: pendingPhone ? String(pendingPhone) : undefined,
              confirm: true
            }, { userId, contacts, sessionId })
            await chatSessions.addMessage(String(sessionId), { role: 'assistant', content: String(result) }, userId, deviceId)
            // Clear pending
            try { await chatSessions.updateSession(String(sessionId), { 'metadata.pendingPurchase': null, 'metadata.pendingPhone': null, 'metadata.pendingNetwork': null }, userId, deviceId) } catch {}
            return String(result)
          }
        } catch {}
      }

      // 0) Handle "last number/phone" intent for data purchases
      const wantsLastNumber = /(last|previous)\s+(number|phone)/i.test(lower) && /(data|buy\s*data|purchase\s*data)/i.test(lower)
      if (wantsLastNumber) {
        try {
          const currentSession = await chatSessions.getSession(String(sessionId), userId, deviceId)
          const lastPhone = currentSession?.metadata?.get?.('lastDataPhone') || currentSession?.metadata?.lastDataPhone
          const lastNet = currentSession?.metadata?.get?.('lastDataNetwork') || currentSession?.metadata?.lastDataNetwork
          if (lastPhone) {
            const netLabel = lastNet ? ` on ${lastNet}` : ''
            const reply = `The last number you used for a data purchase was ${lastPhone}${netLabel}. Should I use it again?`
            await chatSessions.addMessage(String(sessionId), { role: 'assistant', content: reply }, userId, deviceId)
            return reply
          }
        } catch {}
        const ask = 'I don\'t yet have a previous data number for you. Please send the 11-digit phone number to use.'
        await chatSessions.addMessage(String(sessionId), { role: 'assistant', content: ask }, userId, deviceId)
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
        const mentionsPlanOrData = /(\bdata\b|\bplan\b)/i.test(lower)

        // Try to extract a phone number from the prompt (Nigerian format). Normalize to 11-digit starting with 0
        let extractedPhone = null
        try {
          const phoneCandidate = rawText.match(/(\+?234|0)\s?\d{3}\s?\d{3}\s?\d{4}/)
          if (phoneCandidate) {
            const digits = phoneCandidate[0].replace(/\D/g, '')
            if (digits.startsWith('234') && digits.length === 13) extractedPhone = '0' + digits.slice(3)
            else if (digits.length === 11 && digits.startsWith('0')) extractedPhone = digits
          }
        } catch {}

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
            if (sessionId) await chatSessions.updateSession(String(sessionId), {
              'metadata.pendingPhone': extractedPhone || null,
              'metadata.pendingNetwork': args.network || null
            }, userId, deviceId)
          } catch {}

          const out = await executeTool('getDataPlans', args, { userId, contacts, sessionId })
          await chatSessions.addMessage(String(sessionId), { role: 'assistant', content: String(out) }, userId, deviceId)
          return String(out)
        }
      }
    } catch {}

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
      for (const c of calls) {
        const { name, args } = c
        try {
          const out = await executeTool(name, args, { userId, contacts, sessionId })
          outputs.push(typeof out === 'string' ? out : (out?.error ? `⚠️ ${out.error}` : String(out)))
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
      text = outputs.length === 1 ? outputs[0] : outputs.map((o, i) => `(${i+1}) ${o}`).join('\n')
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
  await chatSessions.addMessage(String(sessionId), { role: 'assistant', content: text }, userId, deviceId)

  return text
}

module.exports = { processAIChat }
