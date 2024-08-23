var express = require('express');
const { productsController } = require('../controller');
const { checkAuth, vendorsAccessOnly } = require('../utils/authMiddleware');
const { productCreationValidator, updateValidator } = require('../utils/validator');
const { uploadImages } = require('../controller/products.controller');
var router = express.Router();

router.get('/', productsController.getProducts);
router.post('/',  productCreationValidator, productsController.createProducts);
router.patch('/', checkAuth, vendorsAccessOnly, updateValidator, productsController.updateProducts);
router.get('/getSingleProduct', productsController.getProduct);
router.post('/pushimgs',  productsController.uploadImages);

module.exports = router;