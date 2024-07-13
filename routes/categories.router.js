var express = require('express');
const { categoriesController } = require('../controller');
const { checkAuth, vendorsAccessOnly } = require('../utils/auth');
const { categoryCreationValidator } = require('../utils/validator');
var router = express.Router();

router.post('/', checkAuth, vendorsAccessOnly, categoryCreationValidator, categoriesController.createCategories);
router.patch('/', checkAuth, vendorsAccessOnly, categoriesController.updateCategories);
router.get('/', checkAuth, categoriesController.getCategories); 

module.exports = router;