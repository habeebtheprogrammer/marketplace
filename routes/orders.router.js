var express = require('express');
const { ordersController } = require('../controller');
const { checkAuth, adminAccessOnly } = require('../utils/authMiddleware');
const { createOrdersValidator, updateOrdersValidator } = require('../utils/validator');
var router = express.Router();

router.get('/', checkAuth, ordersController.getOrders);
router.get('/admin', checkAuth, adminAccessOnly, ordersController.getAdminOrders);
router.post('/', checkAuth, ordersController.addOrders);
router.patch('/', checkAuth, updateOrdersValidator, ordersController.updateOrders);
router.post('/webhook', ordersController.webhook);

module.exports = router;