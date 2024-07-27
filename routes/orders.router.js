var express = require('express');
const { ordersController } = require('../controller');
const { checkAuth } = require('../utils/authMiddleware');
const { createOrdersValidator } = require('../utils/validator');
var router = express.Router();

router.get('/', checkAuth, ordersController.getOrders);
router.post('/', checkAuth, createOrdersValidator, ordersController.addOrders);

module.exports = router;