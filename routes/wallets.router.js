var express = require('express');
const { walletsController } = require('../controller');
const { checkAuth } = require('../utils/authMiddleware');
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
router.post('/withdraw', checkAuth, walletsController.withdraw);
router.post('/monnify-hoook', walletsController.webhook);
router.post('/f-hoook', walletsController.flwhook);

module.exports = router;