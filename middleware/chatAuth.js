const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responder');

/**
 * Middleware to handle both authenticated and unauthenticated users
 * For authenticated users: verifies JWT and sets req.userId
 * For unauthenticated users: requires device-id header and sets req.deviceId
 */
const chatAuth = (req, res, next) => {
  // Check for JWT token
  const authHeader = req.headers.authorization;
    if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded._id;
      const deviceId = req.headers['device-id'];
      req.deviceId = deviceId;
      return next();
    } catch (error) {
      // If token is invalid, continue as guest
    }
  }
  
  // For unauthenticated users, require device-id header
  const deviceId = req.headers['device-id'];
  if (!deviceId) {
    return errorResponse(res, { 
      message: 'Authentication required. Please provide a valid token or device ID.' 
    }, 401);
  }
  
  // For guest users, use deviceId as userId
//   req.userId = `guest_${deviceId}`;
  req.isGuest = true;
  next();
};

module.exports = chatAuth;
