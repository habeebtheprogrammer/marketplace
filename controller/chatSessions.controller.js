const { chatSessionsService } = require("../service");
const { successResponse, errorResponse } = require("../utils/responder");
const { v4: uuidv4 } = require('uuid');

// Helper to get user ID (supports both guest and authenticated users)
const getUserId = (req) => {
  return req.userId;
};

// Helper to get device ID from headers or middleware
const getDeviceId = (req) => {
  return req.headers['x-device-id'] || req.headers['device-id'] || req.deviceId;
};

// Helper to get a client-provided sessionId header
const getHeaderSessionId = (req) => req.headers['x-session-id'];

/**
 * Create a new chat session
 */
exports.createSession = async (req, res, next) => {
  try {
    const { title = 'New Chat', metadata = {} } = req.body;
    const userId = getUserId(req);
    const deviceId = getDeviceId(req);
    const headerSessionId = getHeaderSessionId(req);

    // If x-session-id provided, reuse or create with it
    if (headerSessionId) {
      const existing = await chatSessionsService.getSession(headerSessionId, userId, deviceId);
      if (existing) {
        return successResponse(res, { ...existing.toObject?.() || existing});
      }
    }

    const sessionData = {
      sessionId: headerSessionId || uuidv4(),
      userId,
      deviceId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      title,
      metadata,
      isActive: true
    };

    const session = await chatSessionsService.createSession(sessionData);
    successResponse(res, { ...session.toObject?.() || session});
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
    const deviceId = getDeviceId(req);
    const headerSessionId = getHeaderSessionId(req);

    let session = await chatSessionsService.getSession(sessionId, userId, deviceId);
    if (!session && headerSessionId && headerSessionId === sessionId) {
      // Create on-demand if header session matches
      session = await chatSessionsService.createSession({
        sessionId,
        userId,
        deviceId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        title: 'New Chat',
        metadata: {},
        isActive: true,
      });
    }

    if (!session) {
      return errorResponse(res, { message: 'Session not found' }, 404);
    }

    successResponse(res, { ...session.toObject?.() || session});
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
    const deviceId = getDeviceId(req);
    const sessions = await chatSessionsService.getUserSessions(userId, deviceId, { page, limit });
    successResponse(res, { ...sessions});
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
    const userId = getUserId(req);
    const deviceId = getDeviceId(req);
    const headerSessionId = getHeaderSessionId(req);
    console.log(headerSessionId,'headerSessionId', sessionId)
    if (!['user', 'assistant', 'system'].includes(role)) {
      return errorResponse(res, { message: 'Invalid message role' }, 400);
    }
    
    const message = {
      role,
      content,
      metadata
    };
    
    // Ensure session exists; if not and x-session-id matches, create first
    let updatedSession = await chatSessionsService.addMessage(sessionId, message, userId, deviceId);
    if (!updatedSession && headerSessionId && headerSessionId === sessionId) {
      await chatSessionsService.createSession({
        sessionId,
        userId,
        deviceId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        title: 'New Chat',
        metadata: {},
        isActive: true,
      });
      updatedSession = await chatSessionsService.addMessage(sessionId, message, userId, deviceId);
    }
    if (!updatedSession) {
      return errorResponse(res, { message: 'Session not found' }, 404);
    }
    
    successResponse(res, { message: 'Message added successfully'});
  } catch (error) {console.log(error)
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
    const userId = getUserId(req);
    const deviceId = req.headers['device-id'] || req.deviceId;
    
    const updates = {};
    if (title) updates.title = title;
    if (metadata) updates.metadata = metadata;
    
    const updatedSession = await chatSessionsService.updateSession(sessionId, updates, userId, deviceId);
    
    if (!updatedSession) {
      return errorResponse(res, { message: 'Session not found' }, 404);
    }
    
    successResponse(res, updatedSession);
  } catch (error) {
    errorResponse(res, error);
  }
};
