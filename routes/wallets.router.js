var express = require('express');
const { walletsController } = require('../controller');
const { checkAuth } = require('../utils/authMiddleware');
const { vendorsCreationValidator } = require('../utils/validator');
var router = express.Router();

router.get('/', checkAuth, walletsController.balance);
router.post('/', checkAuth, walletsController.create);
router.patch('/fund', checkAuth, walletsController.fund);
router.get('/debit', checkAuth, walletsController.debit);

module.exports = router;