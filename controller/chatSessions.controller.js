const { chatSessionsService } = require("../service");
const { successResponse, errorResponse } = require("../utils/responder");
const { v4: uuidv4 } = require('uuid');

// Helper to get user ID (supports both guest and authenticated users)
const getUserId = (req) => {
  return req.userId  
};

/**
 * Create a new chat session
 */
exports.createSession = async (req, res, next) => {
  try {
    const { title = 'New Chat', metadata = {} } = req.body;
    const userId = getUserId(req);
    const deviceId = req.headers['device-id'];
    
    const sessionData = {
      sessionId: uuidv4(),
      userId,
      deviceId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      title,
      metadata,
      isActive: true
    };
    
    const session = await chatSessionsService.createSession(sessionData);
    successResponse(res, session);
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Get a specific chat session with messages
 */
exports.getSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = getUserId(req);
    
    const session = await chatSessionsService.getSession(sessionId, userId);
    console.log(session,'ss')
    if (!session) {
      return errorResponse(res, { message: 'Session not found' }, 404);
    }
    
    successResponse(res, session);
  } catch (error) {console.log(error)
    errorResponse(res, error);
  }
};

/**
 * Get all sessions for the current user/device
 */
exports.getUserSessions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = getUserId(req);
    console.log(userId,'user')
    const sessions = await chatSessionsService.getUserSessions(userId, { page, limit });
    successResponse(res, sessions);
  } catch (error) {console.log(error,'error')
    errorResponse(res, error);
  }
};

/**
 * Add a message to a chat session
 */
exports.addMessage = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { role, content, metadata = {} } = req.body;
    if (!['user', 'assistant', 'system'].includes(role)) {
      return errorResponse(res, { message: 'Invalid message role' }, 400);
    }
    
    const message = {
      role,
      content,
      metadata
    };
    
    const updatedSession = await chatSessionsService.addMessage(sessionId, message);
    
    if (!updatedSession) {
      return errorResponse(res, { message: 'Session not found' }, 404);
    }
    
    successResponse(res, { message: 'Message added successfully' });
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Update session metadata or title
 */
exports.updateSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { title, metadata } = req.body;
    
    const updates = {};
    if (title) updates.title = title;
    if (metadata) updates.metadata = metadata;
    
    const updatedSession = await chatSessionsService.updateSession(sessionId, updates);
    
    if (!updatedSession) {
      return errorResponse(res, { message: 'Session not found' }, 404);
    }
    
    successResponse(res, updatedSession);
  } catch (error) {
    errorResponse(res, error);
  }
};
