var express = require('express');
const { categoriesController } = require('../controller');
const { checkAuth, vendorsAccessOnly } = require('../utils/auth');
const { categoryCreationValidator, updateValidator } = require('../utils/validator');
var router = express.Router();

router.get('/', categoriesController.getCategories);
router.post('/', checkAuth, vendorsAccessOnly, categoryCreationValidator, categoriesController.createCategories);
router.patch('/', checkAuth, vendorsAccessOnly, updateValidator, categoriesController.updateCategories);

module.exports = router;