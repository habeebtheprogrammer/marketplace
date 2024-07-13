var express = require('express');
const { productsController } = require('../controller');
const { checkAuth, vendorsAccessOnly } = require('../utils/auth');
const { productCreationValidator } = require('../utils/validator');
var router = express.Router();

router.post('/', checkAuth, vendorsAccessOnly, productCreationValidator, productsController.createProducts);
router.patch('/', checkAuth,vendorsAccessOnly, productsController.updateProducts);
router.get('/', checkAuth, productsController.getProducts); 

module.exports = router;