var express = require('express');
const {  promoController } = require('../controller');
var router = express.Router();

router.get('/', promoController.getPromo);

module.exports = router;