var express = require('express');
const { cartsController } = require('../controller');
const { checkAuth } = require('../utils/auth');
const { addToCartValidator, updateCartValidator } = require('../utils/validator');
var router = express.Router();

router.get('/', checkAuth, cartsController.getCarts);
router.patch('/', checkAuth, updateCartValidator, cartsController.updateCarts);
router.post('/', checkAuth, addToCartValidator, cartsController.addToCarts);
router.delete('/:cartId', checkAuth, cartsController.removeFromCarts);

module.exports = router;