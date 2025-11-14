const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin.controller');

router.get('/dashboard', adminController.getDashboardSummary);
router.get('/users', adminController.getUsers);
router.get('/orders', adminController.getOrders);
router.get('/products', adminController.getProducts);
router.get('/wallet', adminController.getWalletActivity);
router.get('/marketing', adminController.getMarketingInsights);
router.get('/alerts', adminController.getAlerts);
router.get('/conversations', adminController.getConversations);

module.exports = router;
