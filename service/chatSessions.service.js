const ChatSession = require("../model/chatSessions.model");

// Helper to build user/device scoping query
// Ensures queries only return documents owned by either the authenticated user
// or (for guests) the specific deviceId. If neither is present, returns a query
// that matches nothing.
const buildUserQuery = (userId = null, deviceId = null) => {
  if (userId) {
    return { userId };
  }
  if (deviceId) {
    return {
      $or: [
        { deviceId },
        { userId: null, deviceId },
      ],
    };
  }
  // No identifier provided – match nothing
  return { _id: null };
};

exports.createSession = async (sessionData) => {
  const session = new ChatSession(sessionData);
  return await session.save();
};

exports.getSession = async (sessionId, userId = null, deviceId = null) => {
  const query = { sessionId, ...buildUserQuery(userId, deviceId) };
  return await ChatSession.findOne(query);
};

exports.getUserSessions = async (userId = null, deviceId = null, { page = 1, limit = 10 } = {}) => {
  const options = { 
    page: +page || 1, 
    limit: +limit || 10, 
    sort: { updatedAt: -1 }, 
    // select: '-messages' 
  };
  
  const query = { isActive: true, ...buildUserQuery(userId, deviceId) };
  
  return await ChatSession.paginate(query, options);
};

exports.addMessage = async (sessionId, message, userId = null, deviceId = null) => {
  return await ChatSession.findOneAndUpdate(
    { sessionId, ...buildUserQuery(userId, deviceId) },
    { 
      $push: { messages: message },
      $set: { updatedAt: new Date() }
    },
    { new: true }
  );
};

exports.updateSession = async (sessionId, updates, userId = null, deviceId = null) => {
  return await ChatSession.findOneAndUpdate(
    { sessionId, ...buildUserQuery(userId, deviceId) },
    { $set: { ...updates, updatedAt: new Date() } },
    { new: true }
  );
};
