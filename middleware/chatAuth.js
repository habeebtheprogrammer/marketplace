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
  const headerDeviceId = req.headers['x-device-id'] || req.headers['device-id'];
    if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded._id;
      if (headerDeviceId) req.deviceId = headerDeviceId;
      return next();
    } catch (error) {
      // If token is invalid, continue as guest
    }
  }
  
  // For unauthenticated users, require device-id header
  const deviceId = headerDeviceId;
  if (!deviceId) {
    return errorResponse(res, { 
      message: 'Authentication required. Please provide a valid token or device ID.' 
    }, 'Authentication required.', 401)
  }
  
  // For guest users, use deviceId as userId
//   req.userId = `guest_${deviceId}`;
  req.deviceId = deviceId;
  req.isGuest = true;
  next();
};

module.exports = chatAuth;
