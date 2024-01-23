var express = require('express');
const { itemsController } = require('../controller');
const { checkToken } = require('../utils/auth');
var router = express.Router();

router.post('/create', itemsController.createItem);
router.put('/update', checkToken, itemsController.updateItem);
router.get('/fetch', checkToken, itemsController.getItems);
router.get('/item/:slug', checkToken,  itemsController.getItem);

module.exports = router;