const ChatSession = require("../model/chatSessions.model");

// Helper to build user query
const buildUserQuery = (userId, deviceId = null) => {
  if (!userId) return {};
  
  // For guest users, match either by userId (guest_*) or deviceId
  if (typeof userId === 'string' && userId.startsWith('guest_')) {
    return {
      $or: [
        { userId },
        { deviceId: deviceId || userId },
        { userId: null, deviceId: deviceId || userId }
      ]
    };
  }
  
  // For authenticated users, match by userId
  return { userId };
};

exports.createSession = async (sessionData) => {
  const session = new ChatSession(sessionData);
  return await session.save();
};

exports.getSession = async (sessionId, userId = null, deviceId = null) => {
  const query = { sessionId };
  if (userId) {
    Object.assign(query, buildUserQuery(userId, deviceId));
  }
  console.log(query,'query',userId,sessionId, deviceId)
  return await ChatSession.findOne(query);
};

exports.getUserSessions = async (userId, { page = 1, limit = 10 } = {}) => {
  const options = { 
    page: +page || 1, 
    limit: +limit || 10, 
    sort: { updatedAt: -1 }, 
    select: '-messages' 
  };
  
  const query = { isActive: true };
  if (userId) {
    Object.assign(query, buildUserQuery(userId));
  }
  
  return await ChatSession.paginate(query, options);
};

exports.addMessage = async (sessionId, message) => {
  return await ChatSession.findOneAndUpdate(
    { sessionId },
    { $push: { messages: message },
      $set: { updatedAt: new Date() }
    },
    { new: true }
  );
};

exports.updateSession = async (sessionId, updates) => {
  return await ChatSession.findOneAndUpdate(
    { sessionId },
    { $set: { ...updates, updatedAt: new Date() } },
    { new: true }
  );
};
