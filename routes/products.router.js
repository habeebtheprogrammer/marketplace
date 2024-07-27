var express = require('express');
const { productsController } = require('../controller');
const { checkAuth, vendorsAccessOnly } = require('../utils/authMiddleware');
const { productCreationValidator, updateValidator } = require('../utils/validator');
var router = express.Router();

router.get('/', productsController.getProducts);
router.post('/', checkAuth, vendorsAccessOnly, productCreationValidator, productsController.createProducts);
router.patch('/', checkAuth, vendorsAccessOnly, updateValidator, productsController.updateProducts);

module.exports = router;