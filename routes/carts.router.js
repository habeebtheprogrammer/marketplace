var express = require('express');
const { cartsController } = require('../controller');
const { checkAuth } = require('../utils/auth');
var router = express.Router();

router.post('/', checkAuth, cartsController.addToCarts);
router.delete('/:id', checkAuth, cartsController.removeFromCarts);
router.get('/', checkAuth, cartsController.getCarts);

module.exports = router;