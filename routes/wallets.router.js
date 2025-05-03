var express = require('express');
const { walletsController } = require('../controller');
const { checkAuth, adminAccessOnly } = require('../utils/authMiddleware');
const { vendorsCreationValidator } = require('../utils/validator');
var router = express.Router();

router.get('/', checkAuth, walletsController.fetch);
router.get('/fetchDataPlan', walletsController.fetchDataPlan);
router.post('/buyDataPlan', checkAuth, walletsController.buyDataPlan);
router.post('/buyAirtime', checkAuth, walletsController.buyAirtime);
// router.post('/setup', checkAuth, walletsController.create);
router.get('/fetchBanks', checkAuth, walletsController.fetchBanks);
router.post('/verifyBank', checkAuth, walletsController.verifyBank);
router.get('/transactions', checkAuth, walletsController.fetchTransactions);
router.get('/:userId/transactions', walletsController.fetchUserTransactions);
router.post('/withdraw', checkAuth, walletsController.withdraw);
router.post('/monnify-hoook', walletsController.webhook);
router.post('/f-hoook', walletsController.flwhook);

// Admin routes
router.post('/admin/manual-refund', checkAuth, adminAccessOnly, walletsController.manualRefund);
router.post('/admin/retry-transaction', checkAuth, adminAccessOnly, walletsController.retryTransaction);
router.get('/admin/transactions', checkAuth, adminAccessOnly, walletsController.adminFetchTransactions);
router.get('/admin/wallets', checkAuth, adminAccessOnly, walletsController.adminFetchWallets);
router.post('/admin/update-transaction', checkAuth, adminAccessOnly, walletsController.adminUpdateTransaction);
router.get('/admin/dashboard', checkAuth, adminAccessOnly, walletsController.getDashboardData);

module.exports = router;