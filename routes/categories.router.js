var express = require('express');
const { categoriesController } = require('../controller');
const { checkToken } = require('../utils/auth');
var router = express.Router();

router.post('/', checkToken, categoriesController.createCategory);
router.patch('/', checkToken, categoriesController.updateCategories);
router.get('/', checkToken, categoriesController.getCategories); 

module.exports = router;