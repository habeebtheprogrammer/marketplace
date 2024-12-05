var express = require('express');
const { walletsController } = require('../controller');
const { checkAuth } = require('../utils/authMiddleware');
const { vendorsCreationValidator } = require('../utils/validator');
var router = express.Router();

router.get('/', checkAuth, walletsController.fetch);
router.get('/fetchDataPlan', walletsController.fetchDataPlan);
router.post('/buyDataPlan', checkAuth, walletsController.buyDataPlan);
router.post('/setup', checkAuth, walletsController.create);
router.get('/fetchBanks', checkAuth, walletsController.fetchBanks);
router.post('/verifyBank', checkAuth, walletsController.verifyBank);
router.post('/payout', checkAuth, walletsController.payout);
// router.get('/balance/:accountNumber', checkAuth, walletsController.balance);
// router.get('/history/:accountNumber', checkAuth, walletsController.history);
// router.patch('/fund', checkAuth, walletsController.fund);
// router.get('/debit', checkAuth, walletsController.debit);

module.exports = router;