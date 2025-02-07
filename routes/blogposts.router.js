var express = require('express');
const { blogpostsController } = require('../controller');
const { checkAuth } = require('../utils/authMiddleware');
var router = express.Router();

// router.get('/bulkUpdate', productsController.bulkUpdate);
router.get('/', blogpostsController.getBlogposts);
router.post('/',  blogpostsController.createBlogposts);
router.patch('/', checkAuth, blogpostsController.updateProducts);

module.exports = router;