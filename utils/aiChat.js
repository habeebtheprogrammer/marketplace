const { GoogleGenerativeAI } = require('@google/generative-ai')
const mongoose = require('mongoose')
const fetch = require('node-fetch')
const { createToken } = require('./helpers')
const { detectNetwork } = require('./vtu')
const chatSessions = require('../service/chatSessions.service')
const services = require('../service')

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

3) Wallet Management
- Show current wallet balance; provide funding guidance.
- Show transaction history.
- Deduct wallet balance after successful purchases.

4) Product Enquiry
- Let users ask about available gadgets (e.g., iPhones, laptops, accessories).
- Fetch product details (price, availability, specs, promotions) using backend product services.
- Support filtering by price range, category, availability. Recommend similar products if unavailable.

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
        description: 'Get data plans from local dataplan.json with optional filters',
        parameters: {
          type: 'object',
          properties: {
            network: { type: 'string' },
            vendor: { type: 'string' },
            planType: { type: 'string' },
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

async function executeTool(name, args, { userId, contacts } = {}) {
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
        
        // getProducts expects { query: {}, options: {} }, returns paginated result
        if (args?.title) {
          // Use text search for keyword matching (requires text index on title & description)
          query.$text = { $search: args.title }
        }
        if (args?.categoryId) {
          try { query.categoryId = new mongoose.Types.ObjectId(String(args.categoryId)) } catch {}
        }
        if (args?.vendorId) {
          try { query.vendorId = new mongoose.Types.ObjectId(String(args.vendorId)) } catch {}
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
          const rating = (p.rating && typeof p.rating === 'object' && p.rating._bsontype === 'Decimal128')
            ? Number(p.rating.toString())
            : (typeof p.rating === 'number' ? p.rating : 'N/A')
          return `${i + 1}. *${p.title}*\n   ${formatMoney(price)}${wasPrice} ${inStock}\n   Rating: ${rating} ⭐ (${p.reviews || 0} reviews)`
        })
        
        return `*Search Results* (Page ${resp.page}/${resp.totalPages}, ${resp.totalDocs} total):\n\n${items.join('\n\n')}`
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
        const rating = (p.rating && typeof p.rating === 'object' && p.rating._bsontype === 'Decimal128')
          ? Number(p.rating.toString())
          : (typeof p.rating === 'number' ? p.rating : 'N/A')
        const cat = p.categoryId?.title ? `\nCategory: ${p.categoryId.title}` : ''
        const vendor = p.vendorId?.title ? `\nVendor: ${p.vendorId.title}` : ''
        return `*${p.title}*\n${formatMoney(price)}${wasPrice}\n${inStock}\nRating: ${rating} ⭐ (${p.reviews || 0} reviews)${cat}${vendor}`
      } catch (e) {
        return `⚠️ Error fetching product: ${e.message}`
      }
    }
    case 'getDataPlans': {
      try {
        const plans = require('../dataplan.json')
        let list = Array.isArray(plans) ? plans : []
        if (args?.network) list = list.filter(p => String(p.network).toUpperCase() === String(args.network).toUpperCase())
        if (args?.vendor) list = list.filter(p => String(p.vendor).toLowerCase() === String(args.vendor).toLowerCase())
        if (args?.planType) list = list.filter(p => String(p.planType).toUpperCase() === String(args.planType).toUpperCase())
        const page = args?.page || 1
        const limit = args?.limit || 10
        const start = (page - 1) * limit
        const pageItems = list.slice(start, start + limit)
        if (pageItems.length === 0) return 'No plans found for your filters.'
        const lines = pageItems.map((p, i) => `${start + i + 1}. ${p.planName} • ${p.network} • ${p.planType}\n   ${formatMoney(p.amount)} • Plan ID: ${p.planId} • Vendor: ${p.vendor}`)
        return `*Data Plans* (Page ${page}/${Math.ceil(list.length / limit)}, ${list.length} total)\n\n${lines.join('\n\n')}`
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
        return `To buy data, I need: ${missing.join(', ')}.
Example: purchaseData { planId: '123', vendor: 'quickvtu', network: 'MTN', planType: 'SME', amount: 520, phone: '08031234567' }`
      }
      
      if (!args?.confirm) {
        const isOwnPhone = !args?.phone // If no phone was provided, it's their own phone
        const phoneLabel = isOwnPhone ? 'your phone' : phoneNumber
        return `You are about to buy ${network} ${args.planType} (Plan ID ${args.planId}) for ${formatMoney(args.amount)} to ${phoneLabel} (${phoneNumber}) via ${args.vendor}.
Reply: confirm purchaseData to proceed.`
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

        const requestData = {
          plan: {
            planId: String(args.planId),
            vendor: String(args.vendor),
            network: String(network).toUpperCase(),
            planType: String(args.planType).toUpperCase(),
            amount: Number(args.amount)
          },
          phone: String(phoneNumber)
        }

        console.log('📱 DATA PURCHASE REQUEST:', {
          userId: userId,
          userPhone: phoneNumber,
          userNetwork: network,
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
          const msg = data?.errors?.[0] || data?.error || resp.statusText
          console.log('❌ DATA PURCHASE FAILED:', msg)
          return `❌ Purchase failed: ${msg}`
        }
        
        console.log('✅ DATA PURCHASE SUCCESS:', {
          reference: data?.reference,
          userId: userId,
          timestamp: new Date().toISOString()
        })
        
        return `✅ Data purchase initialized. We are processing your request.
Ref: ${data?.reference || '—'}
You will get a notification shortly.`
      } catch (e) {
        console.log('❌ DATA PURCHASE ERROR:', {
          error: e.message,
          stack: e.stack,
          userId: userId,
          timestamp: new Date().toISOString()
        })
        return `⚠️ Error purchasing data: ${e.message}`
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
          const out = await executeTool(name, args, { userId, contacts })
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
