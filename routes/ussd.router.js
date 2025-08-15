const express = require('express');
const { handleUssd } = require('../controller/ussd.controller');
const router = express.Router();

// USSD Endpoint for Africa's Talking
router.post('/', handleUssd);

module.exports = router;
