var express = require('express');
const { categoriesController } = require('../controller');
const { checkAuth, vendorsAccessOnly } = require('../utils/authMiddleware');
const { categoryCreationValidator, updateValidator } = require('../utils/validator');
var router = express.Router();

router.get('/', categoriesController.getCategories);
router.post('/', checkAuth, vendorsAccessOnly, categoryCreationValidator, categoriesController.createCategories);
router.patch('/', checkAuth, vendorsAccessOnly, updateValidator, categoriesController.updateCategories);
router.delete('/:id', checkAuth, vendorsAccessOnly, categoriesController.deleteCategory);

module.exports = router;