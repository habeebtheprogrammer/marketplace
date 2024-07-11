var express = require('express');
const { productsController } = require('../controller');
const { checkToken } = require('../utils/auth');
var router = express.Router();

router.post('/', checkToken, productsController.createProducts);
router.patch('/', checkToken, productsController.updateProducts);
router.get('/', checkToken, productsController.getProducts); 

module.exports = router;