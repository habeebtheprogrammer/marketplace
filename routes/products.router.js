var express = require('express');
const { productsController } = require('../controller');
const { checkAuth, vendorsAccessOnly } = require('../utils/authMiddleware');
const { productCreationValidator, updateValidator, commentsCreationValidator } = require('../utils/validator');
const { uploadImages } = require('../controller/products.controller');
var router = express.Router();

// router.get('/bulkUpdate', productsController.bulkUpdate);
router.get('/', productsController.getProducts);
router.post('/',  productCreationValidator, productsController.createProducts);
router.post('/comments',checkAuth,  commentsCreationValidator, productsController.createComments);
router.patch('/', checkAuth, vendorsAccessOnly, updateValidator, productsController.updateProducts);
router.post('/pushimgs',  productsController.uploadImages);

module.exports = router;