var express = require('express');
const { blogpostsController } = require('../controller');
const { checkAuth } = require('../utils/authMiddleware');
var router = express.Router();

// router.get('/bulkUpdate', productsController.bulkUpdate);
router.get('/', blogpostsController.getBlogposts);
router.get('/search', blogpostsController.searchBlogposts);
router.get('/:slug', blogpostsController.getBlogPostBySlug);
router.post('/', checkAuth, blogpostsController.createBlogposts);
router.patch('/', checkAuth, blogpostsController.updateBlogposts);
router.delete('/', checkAuth, blogpostsController.deleteBlogposts);

module.exports = router;