var express = require('express');
const { wishlistsController } = require('../controller');
const { checkAuth } = require('../utils/auth');
var router = express.Router();

router.post('/', checkAuth, wishlistsController.addToWishlists);
router.delete('/:id', checkAuth, wishlistsController.removeFromWishlists);
router.get('/', checkAuth, wishlistsController.getWishlists);

module.exports = router;