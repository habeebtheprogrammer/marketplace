const express = require('express');
const router = express.Router();
const { sendBulkEmail } = require('../controller/email.controller');
const { checkAuth, adminAccessOnly } = require('../utils/authMiddleware');

/**
 * @route   POST /api/send-email
 * @desc    Send email to multiple recipients
 * @access  Private (Add authentication middleware if needed)
 */
router.post('/send', 
    checkAuth,
    adminAccessOnly,
    sendBulkEmail
);

module.exports = router;
