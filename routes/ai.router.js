const express = require('express');
const axios = require('axios');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const MARKETPLACE_BASE_URL = 'https://api.360gadgetsafrica.com/api';

// Gemini tool-calling setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// Axios instance factory
function marketplaceClient(token) {
    const instance = axios.create({
        baseURL: MARKETPLACE_BASE_URL,
        timeout: 15000,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return instance;
}
// Stateless session helpers (no local storage)
function getSessionId(req) {
    return (
        req.header('x-session-id') ||
        (req.body && (req.body.sessionId || req.body.chatSessionId)) ||
        (req.query && (req.query.sessionId || req.query.chatSessionId)) ||
        null
    );
}

function getTokenForSession(req) {
    const auth = req.header('authorization') || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    return m ? m[1] : (auth || null);
}
// Read device ID from client header
function getClientDeviceId(req) {
    return req.header('x-device-id') || null;
}
// Get auth headers for marketplace API calls
function getAuthHeaders(req) {
    const headers = {};
    // Prefer bearer token if present
    const token = req.header('authorization') || (req.headers && req.headers['authorization']);
    if (token) {
        headers['Authorization'] = token;
    }
    const deviceId = getClientDeviceId(req);
    const sessionId = getSessionId(req);
    if (deviceId) headers['device-id'] = deviceId;
    if (sessionId) headers['x-session-id'] = sessionId;
    return headers;
}
// Lightweight Markdown → HTML renderer for common patterns (bold, italic, bullet lists)
function renderMarkdownLite(input) {
    try {
      if (!input) return '';
      // Escape HTML first
      let text = String(input)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
  
      // Bold: **text**
      text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // Italic: *text*
      text = text.replace(/(^|\s)\*([^*]+)\*(?=\s|$)/g, '$1<em>$2</em>');
  
      // Convert bullet lists (- item or * item) line-by-line
      const lines = text.split(/\r?\n/);
      const htmlLines = [];
      let inList = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const m = line.match(/^\s*[-*]\s+(.+)/);
        if (m) {
          if (!inList) { htmlLines.push('<ul style="margin:0 0 6px 16px;padding:0;">'); inList = true; }
          htmlLines.push(`<li style="margin:0 0 4px 0;">${m[1]}</li>`);
        } else {
          if (inList) { htmlLines.push('</ul>'); inList = false; }
          // Preserve blank lines as small breaks
          if (line.trim() === '') {
            htmlLines.push('<div style="height:6px;"></div>');
          } else {
            htmlLines.push(`<div>${line}</div>`);
          }
        }
      }
      if (inList) htmlLines.push('</ul>');
      return htmlLines.join('');
    } catch {
      return String(input || '');
    }
  }

function toolDeclarations() {
    return [{
        function_declarations: [
            {
                name: 'signin',
                description: 'Sign in to the 360gadgetsafrica with email and password',
                parameters: {
                    type: 'object',
                    properties: {
                        email: { type: 'string' },
                        password: { type: 'string' },
                    },
                    required: ['email', 'password']
                }
            },
            {
                name: 'getAccountBalance',
                description: 'Fetch the user\'s wallet info and current balance',
                parameters: { type: 'object', properties: {} }
            },
            {
                name: 'createUser',
                description: 'Create a new user account',
                parameters: {
                    type: 'object',
                    properties: {
                        email: { type: 'string' },
                        password: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        referralCode: { type: 'string' }
                    },
                    required: ['email', 'password']
                }
            },
            {
                name: 'searchProducts',
                description: 'Search 360gadgetsafrica products by title and optional filters',
                parameters: {
                    type: 'object',
                    properties: {
                        // Search
                        title: { type: 'string', description: 'Search text in product title' },
                        // Filters
                        categoryId: { type: 'string', description: 'Filter by category ID' },
                        vendorId: { type: 'string', description: 'Filter by vendor ID' },
                        trending: { type: 'boolean', description: 'Filter trending products' },
                        minPrice: { type: 'number', description: 'Minimum price' },
                        maxPrice: { type: 'number', description: 'Maximum price' },
                        minRating: { type: 'number', description: 'Minimum rating (1-5)' },
                        maxRating: { type: 'number', description: 'Maximum rating (1-5)' },
                        is_stock: { type: 'number', description: 'Stock status (0=out, 1=in stock)' },
                        size: { type: 'string', description: 'Filter by product size' },
                        // Sorting
                        sort: { type: 'string', description: 'latest | trending | rating | views | highToLow | lowToHigh' },
                        // Pagination
                        page: { type: 'number' },
                        limit: { type: 'number' }
                    },
                    // No required fields; all filters are optional per new API
                }
            },
            {
                name: 'getProductBySlug',
                description: 'Retrieve a single product by slug',
                parameters: {
                    type: 'object',
                    properties: { slug: { type: 'string' } },
                    required: ['slug']
                }
            },
            {
                name: 'getUserAccount',
                description: 'Retrieve the authenticated user\'s account details',
                parameters: { type: 'object', properties: {} }
            },
            {
                name: 'updateUserAccount',
                description: 'Update the authenticated user\'s account details',
                parameters: {
                    type: 'object',
                    properties: {
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        phoneNumber: { type: 'array', items: { type: 'string' } },
                        password: { type: 'string' }
                    }
                }
            },
            {
                name: 'requestPasswordReset',
                description: 'Send a password reset email to the user',
                parameters: {
                    type: 'object',
                    properties: { email: { type: 'string' } },
                    required: ['email']
                }
            },
            {
                name: 'getDataPlans',
                description: 'Fetch available data plans and optionally filter by network and/or price range',
                parameters: {
                    type: 'object',
                    properties: {
                        network: { type: 'string', description: 'MTN | AIRTEL | GLO | 9MOBILE' },
                        minAmount: { type: 'number' },
                        maxAmount: { type: 'number' },
                    }
                }
            },
            {
                name: 'getCategories',
                description: 'List all non-archived categories',
                parameters: { type: 'object', properties: {} }
            },
            {
                name: 'getCategoryById',
                description: 'Get a single category by ID',
                parameters: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] }
            },
            {
                name: 'getTransactions',
                description: 'Get wallet transactions with pagination and optional type filter',
                parameters: {
                    type: 'object',
                    properties: {
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        type: { type: 'string' }
                    }
                }
            },
            {
                name: 'buyDataPlan',
                description: 'Purchase a data plan for a phone number',
                parameters: {
                    type: 'object',
                    properties: {
                        plan: {
                            type: 'object',
                            properties: {
                                amount: { type: 'number' },
                                planId: { type: 'string' },
                                vendor: { type: 'string' },
                                network: { type: 'string' },
                                planType: { type: 'string' }
                            },
                            required: ['amount', 'planId', 'vendor', 'network', 'planType']
                        },
                        phone: { type: 'string' }
                    },
                    required: ['plan', 'phone']
                }
            },
            {
                name: 'buyAirtime',
                description: 'Purchase airtime for a phone number (max ₦500)',
                parameters: {
                    type: 'object',
                    properties: {
                        amount: { type: 'number' },
                        phone: { type: 'string' }
                    },
                    required: ['amount', 'phone']
                }
            },
            {
                name: 'airtimeInfo',
                description: 'Provide information about airtime purchase limits and how to buy',
                parameters: { type: 'object', properties: {} }
            }
        ]
    }];
}
// Build a simple, user-friendly text from tool results
function formatToolResponses(toolResponses) {
    try {
        if (!toolResponses?.length) return '';
        // If only one tool
        if (toolResponses.length === 1) {
            const { name, response } = toolResponses[0];
            switch (name) {
                case 'getAccountBalance': {
                    const bal = response?.balance;
                    return typeof bal !== 'undefined' ? `Your wallet balance is ₦${Number(bal).toLocaleString('en-NG')}.` : 'Here is your wallet information.';
                }
                case 'createUser': {
                    const u = response?.user || response;
                    if (!u) return 'Account created successfully.';
                    return `Account created for ${u.email}.`;
                }
                case 'getUserAccount': {
                    const u = response?.data || response || {};
                    const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ');
                    const phones = Array.isArray(u.phoneNumber) ? u.phoneNumber.join(', ') : (u.phoneNumber || 'N/A');
                    return `Here are your account details:\n• Name: ${fullName || 'N/A'}\n• Email: ${u.email || 'N/A'}\n• Phone: ${phones}\n• Referral: ${u.referralCode || 'N/A'}`;
                }
                case 'updateUserAccount': {
                    const u = response?.data || response || {};
                    const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ');
                    const phones = Array.isArray(u.phoneNumber) ? u.phoneNumber.join(', ') : (u.phoneNumber || 'N/A');
                    return `Your account has been updated:\n• Name: ${fullName || 'N/A'}\n• Phone: ${phones}`;
                }
                case 'requestPasswordReset': {
                    return 'If the email exists, a password reset email has been sent.';
                }
                case 'getDataPlans': {
                    const plans = Array.isArray(response) ? response : [];
                    if (!plans.length) return 'No data plans matched your filters.';
                    const sample = plans.slice(0, 10).map(p => `- ${p.network} ${p.planName} — ₦${p.amount}`);
                    return `Here are the matching data plans (${plans.length} found):\n${sample.join('\n')}`;
                }
                case 'searchProducts': {
                    // Handle error case for invalid category
                    if (response?.error) {
                        return `Error: ${response.error}. Please try a different category or search term.`;
                    }
                    const total = response?.totalDocs ?? response?.total ?? response?.docs?.length ?? 0;
                    const items = response?.docs || [];
                    if (!items.length) return 'No products found for your query.';
                    const escape = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    const rows = items.map(it => {
                        const slug = it.slug || it._id || '';
                        const href = `https://360gadgetsafrica.com/gadgets/${it.categoryId.slug}/${encodeURIComponent(slug)}`;
                        const img = Array.isArray(it.images) && it.images.length ? it.images[0] : '';
                        const title = it.title || it.name || 'Untitled Product';
                        const desc = it.description || '';
                        return `
    <a class="product-row" href="${href}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit;display:block;padding:6px 4px;border-bottom:1px solid #eee;margin:0;line-height:1;">
      <div style="display:flex;gap:6px;align-items:flex-start;margin:0;line-height:1;">
        <div style="flex:0 0 80px;height:80px;overflow:hidden;border-radius:6px;background:#f8f8f8;display:flex;align-items:flex-start;justify-content:center;margin:0;align-self:flex-start;">
          ${img ? `<img src="${escape(img)}" alt="${escape(title)}" style="width:80px;height:80px;object-fit:cover;display:block;vertical-align:top;"/>` : `<div style="width:80px;height:80px;background:#f0f0f0;display:block;"></div>`}
        </div>
        <div style="flex:1;min-width:0;margin:0;line-height:1;align-self:flex-start;">
          <div style="font-weight:600;margin:0 0 4px 0;line-height:1.1;">${escape(title)}</div>
          <div style="color:#555;font-size:13px;line-height:1.35;max-height:2.7em;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;margin:0 0 4px 0;">${escape(desc)}</div>
          <div style="font-weight:700;color:#2c3e50;font-size:14px;">₦${(it.discounted_price || it.original_price || it.price || 0).toLocaleString('en-NG')}</div>
        </div>
      </div>
    </a>`;
                    }).join('');
                    return `
  <div style="display:block;margin:0;line-height:1;">
    <div style="font-weight:600;margin:2px 0 4px 0;line-height:1.2;">Found ${total} product(s). Showing top ${items.length}.</div>
    <div class="product-list" style="display:block;margin:0;line-height:1;">${rows}
    </div>
    <div style="margin-top:4px;color:#666;font-size:12px;line-height:1.2;">Tap any item to view full details.</div>
  </div>`;
                }
                case 'getCategories': {
                    const cats = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
                    if (!cats.length) return 'No categories found.';
                    const sample = cats.slice(0, 10).map(c => `- ${c.title}`);
                    return `Available categories (${cats.length}):\n${sample.join('\n')}`;
                }
                case 'getCategoryById': {
                    const c = response?.data || response || {};
                    return `Category: ${c.title || 'N/A'}\nSlug: ${c.slug || 'N/A'}\nArchived: ${c.archive ? 'Yes' : 'No'}`;
                }
                case 'getProductBySlug': {
                    const p = response || {};
                    const price = (p.discounted_price ?? p.original_price ?? p.price);
                    return `Product: ${p.title || p.name}\nPrice: ₦${price}\nRating: ${p.rating ?? 'N/A'}\nIn stock: ${p.is_stock ? 'Yes' : 'No'}`;
                }
                case 'getTransactions': {
                    const docs = response?.docs || response || [];
                    const items = Array.isArray(docs) ? docs : [];
                    const sample = items.slice(0, 5).map(t => `- ${t.createdAt}: ${t.type} ₦${t.amount} — ${t.narration || t.reference}`);
                    return `Here are your recent transactions (${items.length} retrieved):\n${sample.join('\n')}`;
                }
                case 'buyDataPlan': {
                    return response?.message || 'Your data purchase is being processed.';
                }
                case 'buyAirtime': {
                    return 'Airtime purchase processed.';
                }
                case 'signin': {
                    return response?.token ? 'Signed in successfully.' : 'Signin completed.';
                }
                case 'airtimeInfo': {
                    return response?.info || 'You can buy airtime up to ₦500 via your wallet after signing in.';
                }
                default:
                    return 'Here are the results.';
            }
        }
        // Multiple tools called
        const lines = toolResponses.map(tr => `• ${tr.name}: ${typeof tr.response === 'object' ? JSON.stringify(tr.response) : String(tr.response)}`);
        return `Here are the results from the requested actions:\n${lines.join('\n')}`;
    } catch {
        return 'Here are your results.';
    }
}

// Resolve chat session id from headers/body/query (no creation here)
function resolveChatSessionId(req) {
    const providedSessionId = (
        req.actualSessionId ||
        req.header('x-chat-session-id') ||
        req.header('x-session-id') ||
        (req.body && (req.body.sessionId || req.body.chatSessionId)) ||
        (req.query && (req.query.sessionId || req.query.chatSessionId))
    );
    return providedSessionId || null;
}

async function executeTool(name, args, req) {
    const token = getTokenForSession(req) || (req.header('authorization')?.split(' ')[1]);
    switch (name) {
        case 'signin': {
            const { email, password } = args || {};
            const resp = await marketplaceClient().post('/users/signin', { email, password });
            const data = resp.data?.data || resp.data;
            const tkn = data?.token;
            if (tkn) setTokenForSession(req, tkn);
            return { user: data?.user, token: tkn };
        }
        case 'getAccountBalance': {
            if (!token) throw new Error('Unauthorized: please sign in first');
            const resp = await marketplaceClient(token).get('/wallets');
            // wallets controller returns { data: { balance, accounts } }
            return resp.data?.data || resp.data;
        }
        case 'createUser': {
            const payload = {
                email: args?.email,
                password: args?.password,
                firstName: args?.firstName,
                lastName: args?.lastName,
                referralCode: args?.referralCode,
            };
            const resp = await marketplaceClient().post('/users', payload);
            return resp.data?.data || resp.data;
        }
        case 'searchProducts': {
            const params = {};
            // Search
            if (args?.title != null) params.title = args.title;
            // Filters
            if (args?.categoryId != null) {
                try {
                    // First verify the category exists
                    const categoryResp = await marketplaceClient(token).get(`/categories/${encodeURIComponent(args.categoryId)}`);
                    if (!categoryResp.data?.data?._id) {
                        return { error: `Category with ID ${args.categoryId} not found`, docs: [], total: 0 };
                    }
                    params.categoryId = args.categoryId;
                } catch (error) {
                    if (error.response?.status === 404) {
                        return { error: `Category with ID ${args.categoryId} not found`, docs: [], total: 0 };
                    }
                    throw error; // Re-throw other errors
                }
            }
            if (args?.vendorId != null) params.vendorId = args.vendorId;
            if (args?.trending != null) params.trending = args.trending;
            if (args?.minPrice != null) params.minPrice = args.minPrice;
            if (args?.maxPrice != null) params.maxPrice = args.maxPrice;
            if (args?.minRating != null) params.minRating = args.minRating;
            if (args?.maxRating != null) params.maxRating = args.maxRating;
            if (args?.is_stock != null) params.is_stock = args.is_stock;
            if (args?.size != null) params.size = args.size;
            // Sorting
            if (args?.sort != null) params.sort = args.sort;
            // Pagination
            if (args?.page != null) params.page = args.page;
            if (args?.limit != null) params.limit = args.limit;
            
            const resp = await marketplaceClient(token).get('/products', { params });
            return resp.data?.data || resp.data;
        }
        case 'getProductBySlug': {
            const slug = args?.slug;
            const resp = await marketplaceClient(token).get(`/products/${encodeURIComponent(slug)}`);
            return resp.data?.data || resp.data;
        }
        case 'getUserAccount': {
            if (!token) throw new Error('Unauthorized: Bearer token required');
            const resp = await marketplaceClient(token).get('/users/account');
            return resp.data?.data || resp.data;
        }
        case 'updateUserAccount': {
            if (!token) throw new Error('Unauthorized: Bearer token required');
            const payload = {};
            if (args?.firstName != null) payload.firstName = args.firstName;
            if (args?.lastName != null) payload.lastName = args.lastName;
            if (Array.isArray(args?.phoneNumber)) payload.phoneNumber = args.phoneNumber;
            if (args?.password != null) payload.password = args.password;
            const resp = await marketplaceClient(token).patch('/users/account', payload);
            return resp.data?.data || resp.data;
        }
        case 'requestPasswordReset': {
            const { email } = args || {};
            const resp = await marketplaceClient().post('/users/request-password-reset', { email });
            return resp.data?.data || resp.data;
        }
        case 'getDataPlans': {
            const resp = await marketplaceClient().get('/wallets/fetchDataPlan');
            const plans = resp.data?.dataplan || resp.data?.data || resp.data || [];
            const filtered = plans.filter(p => {
                let ok = true;
                if (args?.network) ok = ok && (p.network?.toUpperCase() === String(args.network).toUpperCase());
                if (args?.minAmount != null) ok = ok && (Number(p.amount) >= Number(args.minAmount));
                if (args?.maxAmount != null) ok = ok && (Number(p.amount) <= Number(args.maxAmount));
                return ok;
            });
            return filtered;
        }
        case 'getCategories': {
            const resp = await marketplaceClient().get('/categories');
            return resp.data?.data || resp.data;
        }
        case 'getCategoryById': {
            const id = args?.id;
            const resp = await marketplaceClient().get(`/categories/${encodeURIComponent(id)}`);
            return resp.data?.data || resp.data;
        }
        case 'getTransactions': {
            if (!token) throw new Error('Unauthorized: Bearer token required');
            const params = {};
            if (args?.page != null) params.page = args.page;
            if (args?.limit != null) params.limit = args.limit;
            if (args?.type != null) params.type = args.type;
            const resp = await marketplaceClient(token).get('/wallets/transactions', { params });
            return resp.data?.data || resp.data;
        }
        case 'buyDataPlan': {
            const payload = { plan: args?.plan, phone: args?.phone };
            const cli = token ? marketplaceClient(token) : marketplaceClient();
            const resp = await cli.post('/wallets/buyDataPlan', payload);
            return resp.data?.data || resp.data;
        }
        case 'buyAirtime': {
            const payload = { amount: args?.amount, phone: args?.phone };
            const cli = token ? marketplaceClient(token) : marketplaceClient();
            const resp = await cli.post('/wallets/buyAirtime', payload);
            return resp.data?.data || resp.data;
        }
        case 'airtimeInfo': {
            // Based on wallets.controller buyAirtime limit and flow
            return {
                info: 'You can buy airtime up to ₦500 via your wallet. To purchase, provide amount (<= 500) and phone number after signing in.',
                limit: 500
            };
        }
        default:
            throw new Error(`Unknown function: ${name}`);
    }
}
async function addChatMessage(chatSessionId, role, content, req, options = {}) {
    try {
        if (!chatSessionId) {
            console.error('No chatSessionId provided to addChatMessage');
            return;
        }

        const headers = getAuthHeaders(req);
        headers['Content-Type'] = 'application/json';

        await axios.post(
            `${MARKETPLACE_BASE_URL}/chat/${chatSessionId}/messages`,
            {
                role,
                content: String(content || ''),
                metadata: {
                    source: 'ai-assistant',
                    timestamp: new Date().toISOString()
                    ,
                    ...(options?.html ? { rendered_html: String(options.html) } : {}),
                    ...(options?.format ? { format: options.format } : (options?.html ? { format: 'html' } : {}))
                }
            },
            {
                headers,
                timeout: 5000 // 5 second timeout
            }
        );
    } catch (error) {
        console.error('Error adding chat message:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        // Don't fail the request if message saving fails
    }
}
// Chat endpoint using Gemini tool calling with chat session support
router.post('/chat', async (req, res) => {
    try {
        const { prompt } = req.body || {};
        if (!prompt) return res.status(400).json({ error: 'prompt is required' });

        // Resolve chat session id (no creation here; upstream handles creation on first message)
        const chatSessionId = resolveChatSessionId(req);
        if (!chatSessionId) return res.status(400).json({ error: 'sessionId is required' });
        // Headers are already echoed by the global middleware

        // Get chat history
        let history = [];
        try {
            const response = await axios.get(
                `${MARKETPLACE_BASE_URL}/chat/${chatSessionId}`,
                { headers: getAuthHeaders(req) }
            );
            history = response.data?.data?.messages || [];
        } catch (historyError) {
            console.error('Error fetching chat history:', historyError);
            // Continue with empty history if we can't fetch it
        }

        // Save user message to chat history
        await addChatMessage(chatSessionId, 'user', prompt, req, { format: 'text' });

        // Initialize Gemini with tools and history
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            tools: toolDeclarations(),
            systemInstruction: `You are 360AI, a smart assistant for 360GadgetsAfrica.\n\nABOUT 360GadgetsAfrica:\n- A trusted, all-in-one Nigerian tech marketplace.\n- Buy authentic gadgets at fair prices, access certified repairs, and instantly top up airtime/data.\n- We solve counterfeit gadgets, overpriced devices, poor warranty support, and untrained technicians by providing a secure, single platform.\n- Target: young professionals, students, small business owners who need affordable, authentic gadgets with warranty and convenient connectivity.\n\nYOU MUST use the provided tools to fulfill user requests.\nSupported operations include (but are not limited to):\n- User account → createUser, signin, getUserAccount, updateUserAccount, requestPasswordReset\n- Product search & details → searchProducts, getProductBySlug\n- Category browsing → getCategories, getCategoryById\n- Wallet & payments → getAccountBalance, getTransactions, buyAirtime, buyDataPlan\n- Chat sessions → listChatSessions, getChatSession (GET /chat/:sessionId), sendChatMessage (POST /chat/:sessionId/messages)\n\nAUTHENTICATION RULES:\n- If an operation requires authentication, ONLY proceed when an 'Authorization: Bearer <token>' header is provided.\n- If no token is present, reply clearly: "This action requires you to be logged in."\n- For public endpoints (like requestPasswordReset, categories, product browsing), proceed with no sensitive data.\n\nRESPONSE STYLE:\n- Prefer concise, direct answers.\n- Present results clearly (lists with prices, availability).\n- When multiple options exist (products, data plans), present top matches and ask a follow-up to refine.\n- If an action succeeds, confirm with a ✅ and relevant details. If it fails, explain and suggest next steps.\n\nGADGET Q&A MAPPING:\n- For any question about gadgets (e.g., "which iPhone is available", "show laptops", "budget earbuds"), map the query to categories and/or searchProducts (title/filters).\n- Use getCategories to detect relevant category keywords in the query when needed, else default to searchProducts(title=keyword).\n- Always try to return real inventory results from the tools instead of generic text.\n`
        });

        // Convert history to Gemini's format
        const chatHistory = (history || [])
            .filter(msg => msg && msg.role && msg.content)
            .map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: String(msg.content) }],
            }));

        let responseText = "I'm sorry, I encountered an error processing your request.";
        let toolResponses = [];

        try {
            // Start chat with history
            const chat = model.startChat({
                history: chatHistory,
            });

            // Send message to Gemini
            const result = await chat.sendMessage(prompt);
            const calls = result.response.functionCalls?.() || [];

            if (calls.length > 0) {
                // Execute each tool call
                for (const c of calls) {
                    const { name, args } = c;
                    let toolResult;
                    try {
                        toolResult = await executeTool(name, args, req);
                    } catch (toolErr) {
                        console.error(`Tool ${name} error:`, toolErr);
                        toolResult = { error: toolErr.message };
                    }
                    toolResponses.push({ name, response: toolResult });
                }
                responseText = formatToolResponses(toolResponses);
            } else {
                // No tool calls. Try deterministic fallbacks for common intents
                const q = String(prompt).toLowerCase();
                const hasAuth = !!req.header('authorization');
                let handled = false;
                try {
                    // 1) Password reset (no token required)
                    if (/password/.test(q) && /reset|forgot/.test(q)) {
                        const emailMatch = String(prompt).match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
                        if (emailMatch) {
                            const resp = await executeTool('requestPasswordReset', { email: emailMatch[0] }, req);
                            toolResponses.push({ name: 'requestPasswordReset', response: resp });
                            responseText = formatToolResponses(toolResponses);
                            handled = true;
                        }
                    }
                    // 2) Profile (requires auth)
                    if (!handled && hasAuth && /(my account|account details|profile)/i.test(q)) {
                        const resp = await executeTool('getUserAccount', {}, req);
                        toolResponses.push({ name: 'getUserAccount', response: resp });
                        responseText = formatToolResponses(toolResponses);
                        handled = true;
                    }
                    // 3) Product by slug
                    if (!handled) {
                        const slugMatch = String(prompt).match(/\bslug[:\s]+([a-z0-9-]+)/i);
                        if (slugMatch) {
                            const resp = await executeTool('getProductBySlug', { slug: slugMatch[1] }, req);
                            toolResponses.push({ name: 'getProductBySlug', response: resp });
                            responseText = formatToolResponses(toolResponses);
                            handled = true;
                        }
                    }
                    // 4) Product search (e.g., "which iphone is available")
                    if (!handled) {
                        const keywordMap = ['iphone', 'ipad', 'macbook', 'samsung', 'tecno', 'infinix', 'xiaomi', 'laptop', 'phone', 'smartphone', 'earbuds', 'airpods', 'smartwatch', 'charger', 'power bank', 'tablet'];
                        const found = keywordMap.find(k => q.includes(k));
                        if (found) {
                            const resp = await executeTool('searchProducts', { title: found, page: 1, limit: 10 }, req);
                            toolResponses.push({ name: 'searchProducts', response: resp });
                            responseText = formatToolResponses(toolResponses);
                            handled = true;
                        } else {
                            // Try categories mapping if no obvious keyword
                            try {
                                const cats = await executeTool('getCategories', {}, req);
                                const list = Array.isArray(cats?.data) ? cats.data : (Array.isArray(cats) ? cats : []);
                                const match = list.find(c => q.includes(String(c.title || '').toLowerCase()));
                                if (match && match._id) {
                                    const resp = await executeTool('searchProducts', { categoryId: match._id, page: 1, limit: 10 }, req);
                                    toolResponses.push({ name: 'searchProducts', response: resp });
                                    responseText = formatToolResponses(toolResponses);
                                    handled = true;
                                }
                            } catch { }
                        }
                    }
                    // 5) Wallet balance (requires auth)
                    if (!handled && hasAuth && /wallet|balance/.test(q)) {
                        const resp = await executeTool('getAccountBalance', {}, req);
                        toolResponses.push({ name: 'getAccountBalance', response: resp });
                        responseText = formatToolResponses(toolResponses);
                        handled = true;
                    }
                } catch (fbErr) {
                    console.error('Fallback handling error:', fbErr);
                }
                if (!handled) {
                    // Default to model's text if we couldn't infer a tool
                    responseText = await result.response.text();
                }
            }
        } catch (genaiError) {
            console.error('GenAI error:', genaiError);
            responseText = "I'm having trouble processing your request right now. Please try again later.";
        }

        // Decide if responseText is already HTML (e.g., searchProducts formatter returns HTML)
        const invokedTools = toolResponses.map(t => t.name);
        const isPrebuiltHtml = invokedTools.includes('searchProducts') || /^\s*</.test(responseText);
        const htmlRendered = isPrebuiltHtml ? responseText : renderMarkdownLite(responseText);

        // Save assistant's response to chat history (persist HTML rendering for reloads)
        await addChatMessage(chatSessionId, 'assistant', responseText, req, { html: htmlRendered });

        // Return response with session info (include simple HTML rendering for markdown-style text)
        return res.json({
            text: responseText,
            html: htmlRendered,
            sessionId: chatSessionId,
            deviceId: req.header('x-device-id') || undefined,
            ...(toolResponses.length > 0 && {
                toolCalled: toolResponses.map(t => t.name),
                results: toolResponses
            })
        });

    } catch (err) {
        console.error('Chat endpoint error:', err);
        const status = err.response?.status || 500;
        res.status(status).json({
            error: 'An unexpected error occurred',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
})
// List chat sessions from marketplace (supports both authenticated and guest via device-id)
router.get('/chat', async (req, res) => {
    try {
        const headers = getAuthHeaders(req);
        const params = {
            page: req.query.page || 1,
            limit: req.query.limit || 10,
        };
        const resp = await axios.get(
            `${MARKETPLACE_BASE_URL}/chat`,
            { headers, params }
        );
        // Surface device id back to the client for guest flows
        // if (headers['device-id']) {
        //     res.set('x-device-id', headers['device-id']);
        //     res.set('Access-Control-Expose-Headers', 'x-device-id');
        // }
        res.json(resp.data?.data || resp.data);
    } catch (err) {
        console.log(err)
        const status = err.response?.status || 500;
        res.status(status).json({ error: err.response?.data || err.message });
    }
});
// Get a single chat session (with messages) from marketplace
router.get('/chat/:sessionId', async (req, res) => {
    try {
        const headers = getAuthHeaders(req);
        const { sessionId } = req.params;
        if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });
        const resp = await axios.get(
            `${MARKETPLACE_BASE_URL}/chat/${encodeURIComponent(sessionId)}`,
            { headers }
        );

        // if (headers['device-id']) {
        //     res.set('x-device-id', headers['device-id']);
        //     res.set('Access-Control-Expose-Headers', 'x-device-id');
        // }

        // Augment messages with an 'html' field for better persistence on reload
        let data = resp.data?.data || resp.data;
        if (data && Array.isArray(data.messages)) {
            data = {
                ...data,
                messages: data.messages.map(m => ({
                    ...m,
                    // If server stored a rendered_html, trust it and pass it through.
                    // Otherwise, render markdown-lite from content.
                    html: (m?.metadata?.rendered_html != null)
                        ? String(m.metadata.rendered_html)
                        : renderMarkdownLite(m.content || '')
                }))
            };
        }

        res.json(data);
    } catch (err) {console.log(err,'asdf')
        const status = err.response?.status || 500;
        res.status(status).json({ error: err.response?.data || err.message });
    }
});

module.exports = router;
