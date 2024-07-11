var express = require('express');
const { cartsController } = require('../controller');
const { checkToken } = require('../utils/auth');
var router = express.Router();

router.post('/', checkToken, cartsController.addToCarts);
router.delete('/:id', checkToken, cartsController.removeFromCarts);
router.get('/', checkToken, cartsController.getCarts);

module.exports = router;