var express = require('express');
const { wishlistsController } = require('../controller');
const { checkAuth } = require('../utils/auth');
const { addToWishlistValidator } = require('../utils/validator');
var router = express.Router();

router.post('/', checkAuth, addToWishlistValidator, wishlistsController.addToWishlists);
router.delete('/:wishId', checkAuth, wishlistsController.removeFromWishlists);
router.get('/', checkAuth, wishlistsController.getWishlists);

module.exports = router;