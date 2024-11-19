var express = require('express');
const { walletsController } = require('../controller');
const { checkAuth } = require('../utils/authMiddleware');
const { vendorsCreationValidator } = require('../utils/validator');
var router = express.Router();

router.get('/balance/:accountNumber', checkAuth, walletsController.balance);
router.get('/history/:accountNumber', checkAuth, walletsController.history);
router.post('/setup', checkAuth, walletsController.create);
router.patch('/fund', checkAuth, walletsController.fund);
router.get('/debit', checkAuth, walletsController.debit);

module.exports = router;