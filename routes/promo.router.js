var express = require('express');
const {  promoController } = require('../controller');
const { checkAuth } = require('../utils/authMiddleware');
var router = express.Router();

router.get('/', promoController.getPromo);
router.get('/claim', checkAuth , promoController.claimRewards);

module.exports = router;