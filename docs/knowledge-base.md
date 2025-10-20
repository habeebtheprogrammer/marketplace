# Marketplace Codebase Knowledge Base (v2)

This document summarizes the project structure, key endpoints, controllers, services, models, and utilities to help you quickly navigate and understand the codebase.

Last updated: 2025-10-20

## Project Structure

- `routes/` Express route definitions per domain
- `controller/` Request handlers (business/application logic)
- `service/` Data and external API services (DB access, integrations)
- `model/` Mongoose schemas and models
- `utils/` Utilities, helpers, middleware, third-party integrations
- `docs/` Documentation

## Environment Variables (observed)
- `PORT`
- `GEMINI_API_KEY`
- `API_BASE_URL`
- `GADGETS_API_KEY`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_PHONE_NUMBER_ID2`
- `WHATSAPP_VERIFY_TOKEN`
- `PRIVATE_KEY` / `PRIVATE_KEY_PATH` / `PRIVATE_KEY_PASSPHRASE`
- `SELF_BASE_URL`

## Utilities

### `utils/whatsapp.js`
- `decryptRequest(body, privatePem, passphrase)` Decrypts WhatsApp Flows payload (RSA-OAEP + AES-128-GCM)
- `encryptResponse(response, aesKeyBuffer, initialVectorBuffer)` Encrypts response for Flows
- `resolvePrivateKey()` Locates/reads private key (env or file)
- `getWhatsAppMediaUrl(mediaId)` Fetch media URL from Graph API
- `downloadWhatsAppMedia(mediaUrl)` Download media bytes from Graph API
- `uploadImageToExternalServer(imageBuffer, contentType, imageId)` Uploads to API `/products/pushimgs`
- `sendWhatsAppMessage(phoneNumberId, message)` Send message via Graph API
- `runAsyncImmediate(fn)` Wrapper around `setImmediate`
- `handleWebhookBackground(body)` Product ingestion on media/text message
  - Authorizes phone, maps to vendor, fetches & uploads media, calls `processProductMessage`
- `handleBotMessage(body)` AI chatbot for non-primary number
  - Matches user by phone (array match with `$in`)
  - If user found: sends prompt to local AI service, returns answer via WhatsApp
  - Else: sends onboarding template with Flow button payload

### `utils/aiChat.js`
- `processAIChat(prompt, sessionId, userId = null, deviceId = null)`
  - Ensures session via `chatSessions.service`
  - Saves user message into session
  - Aggregates history from ALL active sessions for user/device (`getUserSessions`) and builds Gemini history
  - Generates answer with Gemini and saves assistant message

### Other utils
- `utils/helpers.js` common helpers (e.g., `createToken`, `generateRandomNumber`, `sendOtpCode`, `removeCountryCode`)
- `utils/lib/product-service.js` product-related utility functions
- `utils/lib/config.js` authorization and vendor mapping helpers (`isPhoneAuthorized`, `getVendorIdFromPhone`)
- `utils/responder.js` `successResponse` / `errorResponse`
- `utils/vtu.js` VTU/data plan utilities
- `utils/email.js`, `utils/onesignal.js`, `utils/fbEvents.js`, `utils/sitemap.js`, `utils/validator.js`, `utils/lib/*`

## WhatsApp Flow

- Route: `routes/whatsapp.router.js`
  - `GET /whatsapp/webhook` → `whatsapp.controller.getWhatsapp` (verification)
  - `POST /whatsapp/webhook` → `whatsapp.controller.webhook`
  - `POST /whatsapp/onboard` → `whatsapp.controller.onboardWhatsApp` (WhatsApp Flows onboarding)

- Controller: `controller/whatsapp.controller.js`
  - `getWhatsapp(req,res)` webhook verification using `WHATSAPP_VERIFY_TOKEN`
  - `onboardWhatsApp(req,res)` handles WhatsApp Flows onboarding (SIGN_UP, SIGN_IN, FORGOT_PASSWORD) with encrypted payloads
    - Uses `decryptRequest/encryptResponse`
    - On success, returns `SUCCESS` screen with `extension_message_response` params
  - `webhook(req,res)` fast 200 + delegates
    - If `phoneNumberId === WHATSAPP_PHONE_NUMBER_ID` → `runAsyncImmediate(() => handleWebhookBackground(body))`
    - Else → `handleBotMessage(body)`

## AI Chat Flow

- Route: `routes/ai.router.js`
  - `POST /ai/chat` → In-process Gemini tool calling, history retrieval, and deterministic fallbacks
  - Uses various tools: account, products, categories, wallet, airtime/data, etc.
  - Helpers:
    - `getSessionId(req)` retrieves provided session id
    - `getAuthHeaders(req)` builds headers for marketplace API
    - `executeTool(name,args,req)` executes business actions via internal APIs
    - `addChatMessage(chatSessionId, role, content, req, options)` persists chat messages remotely

- Local AI utility: `utils/aiChat.js` (no HTTP) uses `chatSessions.service`

## Chat Sessions

- Model: `model/chatSessions.model.js`
  - Fields: `userId`, `sessionId`, `deviceId`, `ipAddress`, `userAgent`, `title`, `messages[]`, `isActive`, `metadata`
  - `messages[]`: `{ role: 'user'|'assistant'|'system', content, timestamp, metadata }`
  - Pagination plugin enabled

- Service: `service/chatSessions.service.js`
  - `createSession(sessionData)`
  - `getSession(sessionId, userId = null, deviceId = null)`
  - `getUserSessions(userId = null, deviceId = null, { page, limit })`
  - `addMessage(sessionId, message, userId = null, deviceId = null)`
  - `updateSession(sessionId, updates, userId = null, deviceId = null)`
  - All queries are scoped by `buildUserQuery(userId, deviceId)`

- Controller: `controller/chatSessions.controller.js`
  - `createSession` respects `x-session-id` if provided; otherwise creates
  - `getSession` fetches by `:sessionId`; can create on-demand if header matches
  - `getUserSessions` returns paginated list for current user/device
  - `addMessage` validates role and appends; creates session on-demand if header matches
  - `updateSession` updates title/metadata

## Wallets

- Route: `routes/wallets.router.js` (multiple endpoints; see controller for logic)
- Controller: `controller/wallets.controller.js`
  - Balance and linked accounts retrieval; maps provider responses to `{ balance, accounts }`
  - Other wallet operations (purchase data/airtime, transactions) via `wallets.service.js`
- Model: `model/wallets.model.js`
- Service: `service/wallets.service.js`

## Users

- Route: `routes/users.router.js`
- Controller: `controller/users.controller.js`
  - User creation, signin, account retrieval/updates, password reset
- Model: `model/users.model.js`
- Service: `service/users.service.js`

## Products

- Route: `routes/products.router.js`
- Controller: `controller/products.controller.js`
  - CRUD, listing/search, image upload handling
- Model: `model/products.model.js`
- Service: `service/products.service.js`

## Orders

- Route: `routes/orders.router.js`
- Controller: `controller/orders.controller.js`
- Model: `model/orders.model.js`
- Service: `service/orders.service.js`

## Categories

- Route: `routes/categories.router.js`
- Controller: `controller/categories.controller.js`
- Model: `model/categories.model.js`
- Service: `service/categories.service.js`

## Vendors

- Route: `routes/vendors.router.js`
- Controller: `controller/vendors.controller.js`
- Model: `model/vendors.model.js`
- Service: `service/vendors.service.js`

## Carts

- Route: `routes/carts.router.js`
- Controller: `controller/carts.controller.js`
- Model: `model/carts.model.js`
- Service: `service/carts.service.js`

## Wishlists

- Route: `routes/wishlists.router.js`
- Controller: `controller/wishlists.controller.js`
- Model: `model/wishlists.model.js`
- Service: `service/wishlists.service.js`

## Coupons/Promo

- Routes: `routes/coupons.routes.js`, `routes/promo.router.js`
- Controllers: `controller/coupons.controller.js`, `controller/promo.controller.js`
- Models: `model/coupons.model.js`, `model/promo.model.js`, `model/appliedCoupons.model.js`
- Services: `service/promo.service.js`

## Blogposts

- Route: `routes/blogposts.router.js`
- Controller: `controller/blogposts.controller.js`
- Model: `model/blogposts.model.js`
- Service: `service/blogposts.service.js`

## Address

- Route: `routes/address.router.js`
- Controller: `controller/address.controller.js`
- Model: `model/address.model.js`
- Service: `service/address.service.js`

## Swap

- Route: `routes/swap.router.js`
- Controller: `controller/swap.controller.js`
- Model: `model/swap.model.js`
- Service: `service/swap.service.js`

## Ambassador

- Route: `routes/ambassador.router.js`
- Controller: `controller/ambassador.controller.js`
- Model: `model/ambassador.model.js`
- Service: `service/ambassador.service.js`

## USSD

- Route: `routes/ussd.router.js`
- Controller: `controller/ussd.controller.js`
- Model: `model/ussdTransaction.model.js`

## Journey

- Route: `routes/journey.router.js`
- Controller: `controller/journey.controller.js`
- Model: `model/journeyTemplate.model.js`, `model/userJourney.model.js`
- Service: `service/journey.service.js`

## Email

- Route: `routes/email.routes.js`
- Controller: `controller/email.controller.js`
- Utility: `utils/email.js`

## Promo

- Route: `routes/promo.router.js`
- Controller: `controller/promo.controller.js`
- Model: `model/promo.model.js`
- Service: `service/promo.service.js`

## Index aggregators

- `controller/index.js` exposes grouped services
- `service/index.js` aggregates individual services for import convenience

---

# Endpoint Index (by route)

Below are the Express routes mapped to controller methods. Descriptions are concise and inferred from controller/service names. See each controller for validations and exact response shapes.

## routes/whatsapp.router.js
- GET `/whatsapp/webhook` → `whatsapp.controller.getWhatsapp` — Verify webhook token.
- POST `/whatsapp/webhook` → `whatsapp.controller.webhook` — Fast 200, then delegate to utils.
- POST `/whatsapp/onboard` → `whatsapp.controller.onboardWhatsApp` — WhatsApp Flows onboarding (encrypted).

## routes/ai.router.js
- POST `/ai/chat` — Gemini chat with tool-calling and deterministic fallbacks.
- GET `/ai/chat` — List chat sessions (proxied to marketplace API via headers).
- GET `/ai/chat/:sessionId` — Get single chat session (proxied).

## routes/chatSessions.router.js
- POST `/chat` → `chatSessions.controller.createSession` (auth: `chatAuth`).
- GET `/chat/:sessionId` → `chatSessions.controller.getSession` (auth).
- GET `/chat` → `chatSessions.controller.getUserSessions` (auth).
- POST `/chat/:sessionId/messages` → `chatSessions.controller.addMessage` (auth).
- PATCH `/chat/:sessionId` → `chatSessions.controller.updateSession` (auth).

## routes/users.router.js
- GET `/users` → `users.controller.getUsers` (admin).
- GET `/users/account` → `users.controller.getUserAccount`.
- GET `/users/refreshToken` → `users.controller.refreshToken`.
- GET `/users/delivery` → `users.controller.getUserDelivery`.
- GET `/users/referred/:userId` → `users.controller.getReferredUsers` (admin).
- GET `/users/getRef` → `users.controller.getReferrals`.
- GET `/users/:userId` → `users.controller.getUserById` (admin).
- PATCH `/users/account` → `users.controller.updateUser`.
- PATCH `/users/account/:userId` → `users.controller.updateUserById` (admin).
- POST `/users/signin` → `users.controller.signin` (google/apple middlewares + validation).
- POST `/users/signup` → `users.controller.createUser` (validation).
- POST `/users/sendOtp` → `users.controller.sendOtpEmail`.
- POST `/users/verifyOtp` → `users.controller.verifyOtp`.
- POST `/users/request-password-reset` → `users.controller.requestPasswordReset`.
- POST `/users/reset-password` → `users.controller.resetPassword`.
- DELETE `/users/delete/:_id` → `users.controller.deleteUsers` (admin).
- POST `/users/unsubscribedUser` → `users.controller.unsubscribedUser`.

## routes/products.router.js
- GET `/products` → `products.controller.getProducts`.
- POST `/products` → `products.controller.createProducts` (validation).
- POST `/products/comments` → `products.controller.createComments` (auth + validation).
- PATCH `/products` → `products.controller.updateProducts` (auth + validation).
- POST `/products/pushimgs` → `products.controller.uploadImages`.
- POST `/products/availability-requests` → `products.controller.checkAvailability` (auth).
- GET `/products/availability-requests` → `products.controller.fetchAvailabilityRequests` (auth).
- PATCH `/products/availability-requests` → `products.controller.updateAvailability` (auth).
- GET `/products/:id` → `products.controller.getProductById` (auth).
- PATCH `/products/:id` → `products.controller.updateProduct` (auth).
- DELETE `/products/:id` → `products.controller.deleteProduct` (auth).

## routes/categories.router.js
- GET `/categories` → `categories.controller.getCategories`.
- POST `/categories` → `categories.controller.createCategories` (auth + admin/vendor + validation).
- PATCH `/categories` → `categories.controller.updateCategories` (auth + vendor + validation).
- DELETE `/categories/:id` → `categories.controller.deleteCategory` (auth + vendor).
- GET `/categories/:id` → `categories.controller.getCategoryById`.
- PATCH `/categories/:id` → `categories.controller.updateCategory` (auth + vendor + validation).

## routes/vendors.router.js
- GET `/vendors` → `vendors.controller.getVendors`.
- POST `/vendors` → `vendors.controller.createVendors` (auth + vendor + validation).
- PATCH `/vendors/account` → `vendors.controller.updateVendorAccount` (auth + vendor).
- GET `/vendors/account` → `vendors.controller.getVendorAccount` (auth + vendor).
- PATCH `/vendors/:id` → `vendors.controller.updateVendorById` (auth + admin/vendor).
- GET `/vendors/:slug` → `vendors.controller.getVendorBySlug` (auth + admin/vendor).

## routes/carts.router.js
- GET `/carts` → `carts.controller.getCarts` (auth).
- PATCH `/carts` → `carts.controller.updateCarts` (auth + validation).
- POST `/carts` → `carts.controller.addToCarts` (auth + validation).
- DELETE `/carts/:cartId` → `carts.controller.removeFromCarts` (auth).

## routes/wishlists.router.js
- GET `/wishlists` → `wishlists.controller.getWishlists`.
- POST `/wishlists` → `wishlists.controller.createWishlists`.
- DELETE `/wishlists/:id` → `wishlists.controller.deleteWishlists`.

## routes/wallets.router.js
- GET `/wallets` → `wallets.controller.fetch` (auth).
- GET `/wallets/fetchDataPlan` → `wallets.controller.fetchDataPlan`.
- POST `/wallets/buyDataPlan` → `wallets.controller.buyDataPlan` (auth).
- POST `/wallets/buyAirtime` → `wallets.controller.buyAirtime` (auth).
- GET `/wallets/fetchBanks` → `wallets.controller.fetchBanks` (auth).

## routes/coupons.routes.js
- GET `/coupons/active` → `coupons.controller.getActiveCoupon` (auth).
- GET `/coupons/history` → `coupons.controller.getCouponsHistory` (if implemented).
- DELETE `/coupons/remove` → `coupons.controller.removeActiveCoupon` (auth).
- Admin endpoints for coupon management present.

## routes/blogposts.router.js
- GET `/blogposts` → `blogposts.controller.getBlogposts`.
- POST `/blogposts` → `blogposts.controller.createBlogposts` (auth).
- PATCH `/blogposts` → `blogposts.controller.updateBlogposts` (auth).
- DELETE `/blogposts` → `blogposts.controller.deleteBlogposts` (auth).

## routes/address.router.js
- GET `/address` → `address.controller.getAddresses`.
- POST `/address` → `address.controller.createAddress`.
- PATCH `/address` → `address.controller.updateAddress`.
- DELETE `/address/:id` → `address.controller.deleteAddress`.

## routes/ambassador.router.js
- GET `/ambassador` → `ambassador.controller.getAmbassadors`.
- POST `/ambassador` → `ambassador.controller.createAmbassador` (validation).
- PATCH `/ambassador` → `ambassador.controller.updateAmbassador` (auth).
- DELETE `/ambassador` → `ambassador.controller.deleteAmbassador` (auth).

## routes/orders.router.js
- Standard order CRUD/list endpoints, protected by auth.

## routes/journey.router.js
- Journey/user-journey endpoints; triggers like `handleUserSignup`.

## routes/swap.router.js
- Swap device endpoints (list/create/update).

## routes/ussd.router.js
- USSD interactions endpoints.

## routes/promo.router.js
- Promo CRUD/list endpoints.

# Detailed WhatsApp + AI flows

- POST `/whatsapp/webhook`
  - Respond 200 immediately.
  - If `phoneNumberId === WHATSAPP_PHONE_NUMBER_ID`: `handleWebhookBackground(body)`
    - Auth check via `isPhoneAuthorized`; vendor mapping via `getVendorIdFromPhone`.
    - Image: fetch media URL, download, upload via `/products/pushimgs`, then `processProductMessage`.
    - Text: `processProductMessage` with text.
  - Else: `handleBotMessage(body)`
    - Find user by phone array using `{ phoneNumber: { $in: [fromNumber] } }`.
    - If found: `processAIChat(prompt, userId, userId, null)`; send result via `sendWhatsAppMessage`.
    - Else: send onboarding template with Flow button to `SIGN_UP`.

- POST `/whatsapp/onboard` (Flows)
  - Decrypt via `decryptRequest`.
  - Handle `SIGN_UP` / `SIGN_IN` / `FORGOT_PASSWORD` using `usersService`, `bcrypt`, and helpers.
  - Encrypt responses via `encryptResponse` (required schema).

- AI memory (`utils/aiChat.js`)
  - `ensureSession(sessionId, userId, deviceId)` creates/reads session with scope.
  - `addMessage(sessionId, message, userId, deviceId)` persists messages.
  - `getUserSessions(userId, deviceId, { page, limit })` aggregates ALL messages to build model history.
  - Gemini called with full history; assistant message saved back.
