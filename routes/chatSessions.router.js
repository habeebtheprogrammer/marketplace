const express = require('express');
const { chatSessionsController } = require('../controller');
const chatAuth = require('../middleware/chatAuth');

const router = express.Router();

// Create a new chat session
router.post('/', chatAuth, chatSessionsController.createSession);

// Get a specific chat session
router.get('/:sessionId', chatAuth, chatSessionsController.getSession);

// Get all sessions for the current user/device
router.get('/', chatAuth, chatSessionsController.getUserSessions);

// Add a message to a chat session
router.post('/:sessionId/messages', chatAuth, chatSessionsController.addMessage);

// Update session metadata or title
router.patch('/:sessionId', chatAuth, chatSessionsController.updateSession);

module.exports = router;
