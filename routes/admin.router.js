const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin.controller');

// Dashboard & Reports
router.get('/dashboard', adminController.getDashboardSummary);
router.get('/reports/comprehensive', adminController.getComprehensiveReports);
router.get('/marketing', adminController.getMarketingInsights);
router.get('/alerts', adminController.getAlerts);

// Advanced Analytics & Anomaly Detection
router.get('/analytics/anomalies', adminController.getAnomalyDetection);
router.get('/analytics/users/advanced', adminController.getAdvancedUserAnalytics);
router.get('/analytics/source-attribution', adminController.getSourceAttribution);
router.get('/analytics/vendor-performance', adminController.getVendorPerformance);
router.get('/analytics/inventory-intelligence', adminController.getInventoryIntelligence);
router.get('/analytics/ai-chat-performance', adminController.getAiChatPerformance);
router.get('/analytics/financial-reconciliation', adminController.getFinancialReconciliation);

// Request Management
router.get('/requests', adminController.getRequests);
router.put('/requests/:id', adminController.updateRequest);
router.delete('/requests/:id', adminController.deleteRequest);

// Ambassador Management
router.get('/ambassadors', adminController.getAmbassadors);
router.put('/ambassadors/:id', adminController.updateAmbassador);
router.delete('/ambassadors/:id', adminController.deleteAmbassador);

// Delivery Management
router.get('/delivery-methods', adminController.getDeliveryMethods);
router.post('/delivery-methods', adminController.createDeliveryMethod);
router.put('/delivery-methods/:id', adminController.updateDeliveryMethod);
router.delete('/delivery-methods/:id', adminController.deleteDeliveryMethod);

// Swap/Trade-in Management
router.get('/swaps', adminController.getSwaps);
router.put('/swaps/:id', adminController.updateSwap);
router.delete('/swaps/:id', adminController.deleteSwap);

// View/List Endpoints
router.get('/users', adminController.getUsers);
router.get('/orders', adminController.getOrders);
router.get('/products', adminController.getProducts);
router.get('/wallet', adminController.getWalletActivity);
router.get('/conversations', adminController.getConversations);
router.get('/categories', adminController.getCategories);
router.get('/vendors', adminController.getVendors);
router.get('/coupons', adminController.getCoupons);
router.get('/blogposts', adminController.getBlogPosts);

// Management Endpoints
// Categories
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Vendors
router.post('/vendors', adminController.createVendor);
router.put('/vendors/:id', adminController.updateVendor);
router.delete('/vendors/:id', adminController.deleteVendor);

// Coupons
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

// Blog Posts
router.put('/blogposts/:id', adminController.updateBlogPost);
router.delete('/blogposts/:id', adminController.deleteBlogPost);

// Orders
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.post('/orders/:id/refund', adminController.refundOrder);
router.delete('/orders/:id', adminController.cancelOrder);

// Products
router.put('/products/:id', adminController.updateProduct);
router.put('/products/bulk', adminController.bulkUpdateProducts);

// Users
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/toggle-block', adminController.toggleUserBlock);

module.exports = router;
