var express = require('express');
const { swapController } = require('../controller');
const { checkAuth } = require('../utils/authMiddleware');
var router = express.Router();

router.post('/', checkAuth, swapController.createSwapDetails);

module.exports = router;