var express = require('express');
const { ordersController } = require('../controller');
const { checkAuth } = require('../utils/authMiddleware');
const { createOrdersValidator, updateOrdersValidator } = require('../utils/validator');
var router = express.Router();

router.get('/', checkAuth, ordersController.getOrders);
router.post('/', checkAuth, ordersController.addOrders);
router.patch('/', checkAuth, updateOrdersValidator, ordersController.updateOrders);

module.exports = router;