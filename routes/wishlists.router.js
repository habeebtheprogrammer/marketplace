var express = require('express');
const { wishlistsController } = require('../controller');
const { checkToken } = require('../utils/auth');
var router = express.Router();

router.post('/', checkToken, wishlistsController.addToWishlists);
router.delete('/:id', checkToken, wishlistsController.removeFromWishlists);
router.get('/', checkToken, wishlistsController.getWishlists);

module.exports = router;