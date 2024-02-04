var express = require('express');
const { categoriesController } = require('../controller');
const { checkToken } = require('../utils/auth');
var router = express.Router();

router.post('/create', checkToken, categoriesController.createCategory);
router.put('/update', checkToken, categoriesController.updateCategories);
router.get('/fetch', checkToken, categoriesController.getCategories);
router.get('/category/:id', checkToken,  categoriesController.getItems);

module.exports = router;