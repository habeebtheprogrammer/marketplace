const WhatsAppChatSession = require('../model/whatsappChatSessions.model');

// Build a WA-scoped query. Prefer waId scoping to avoid cross-channel bleed.
const buildWAQuery = (userId = null, waId = null) => {
  if (waId) {
    const q = { waId }
    if (userId) q.userId = userId
    return q
  }
  if (userId) return { userId }
  return { _id: null }
}

exports.createSession = async (sessionData) => {
  const { sessionId, userId = null, waId = null, phoneNumberId = null, ...rest } = sessionData
  const query = { sessionId, ...(waId ? { waId } : {}), ...(userId ? { userId } : {}) }
  return await WhatsAppChatSession.findOneAndUpdate(
    query,
    { $setOnInsert: { sessionId, userId, waId, phoneNumberId, ...rest }, $set: { isActive: true, updatedAt: new Date() } },
    { new: true, upsert: true }
  )
}

exports.getSession = async (sessionId, userId = null, waId = null) => {
  return await WhatsAppChatSession.findOne({ sessionId, ...buildWAQuery(userId, waId) })
}

exports.getUserSessions = async (userId = null, waId = null, { page = 1, limit = 10 } = {}) => {
  const options = { page: +page || 1, limit: +limit || 10, sort: { updatedAt: -1 } }
  const query = { isActive: true, ...buildWAQuery(userId, waId) }
  return await WhatsAppChatSession.paginate(query, options)
}

exports.addMessage = async (sessionId, message, userId = null, waId = null) => {
  try {
    console.log('📝 [addMessage] Adding message:', { sessionId, userId, waId, message: message?.content?.substring(0, 50) });
    
    // First, ensure the session exists
    const session = await WhatsAppChatSession.findOneAndUpdate(
      { sessionId, ...buildWAQuery(userId, waId) },
      { 
        $setOnInsert: { 
          sessionId, 
          userId, 
          waId, 
          isActive: true, 
          messages: [] 
        },
        $set: { updatedAt: new Date() } 
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Then push the message to the messages array
    const updated = await WhatsAppChatSession.findOneAndUpdate(
      { _id: session._id },
      { 
        $push: { messages: message },
        $set: { updatedAt: new Date() } 
      },
      { new: true }
    );

    console.log('✅ [addMessage] Message added successfully:', { 
      messageCount: updated?.messages?.length,
      messageId: updated?._id 
    });
    
    return updated;
  } catch (error) {
    console.error('❌ [addMessage] Error:', error.message);
    console.error(error.stack);
    throw error;
  }
}

exports.updateSession = async (sessionId, updates, userId = null, waId = null) => {
  return await WhatsAppChatSession.findOneAndUpdate(
    { sessionId, ...buildWAQuery(userId, waId) },
    { $setOnInsert: { sessionId, userId, waId, isActive: true }, $set: { ...updates, updatedAt: new Date() } },
    { new: true, upsert: true }
  )
}

// Dedupe helpers
exports.setLastInboundId = async (sessionId, messageId, userId = null, waId = null) => {
  if (!messageId) return null
  return await WhatsAppChatSession.findOneAndUpdate(
    { sessionId, ...buildWAQuery(userId, waId) },
    { $set: { lastInboundMessageId: messageId, updatedAt: new Date() } },
    { new: true }
  )
}

exports.checkAndStampConfirm = async (sessionId, hash, windowMs = 10000, userId = null, waId = null) => {
  const doc = await WhatsAppChatSession.findOne({ sessionId, ...buildWAQuery(userId, waId) }).select('lastConfirmHash lastConfirmAt')
  const now = Date.now()
  if (doc && doc.lastConfirmHash === hash && doc.lastConfirmAt && (now - new Date(doc.lastConfirmAt).getTime()) < windowMs) {
    return { duplicate: true }
  }
  await WhatsAppChatSession.findOneAndUpdate(
    { sessionId, ...buildWAQuery(userId, waId) },
    { $set: { lastConfirmHash: hash, lastConfirmAt: new Date(), updatedAt: new Date() } },
    { upsert: false }
  )
  return { duplicate: false }
}
