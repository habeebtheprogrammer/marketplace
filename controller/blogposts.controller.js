const { blogpostsService, } = require("../service")
const { generateRandomNumber, slugify,  } = require("../utils/helpers");
const { successResponse, errorResponse } = require("../utils/responder")

exports.createBlogposts = async (req, res, next) => {
    try {
        const data = await blogpostsService.createBlogposts({
            ...req.body, slug: slugify(req.body.title ) + '-' + generateRandomNumber(5)
        })
        
        successResponse(res, data)
    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}
exports.updateBlogposts = async (req, res, next) => {
    try {
        var updateObj = {}
        Object.keys(req.body).forEach(key => {
            updateObj[key] = req.body[key];
        })
        updateObj.priceUpdatedAt = new Date()
        const data = await blogpostsService.updateBlogposts({ _id: updateObj._id }, updateObj)
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}


exports.getBlogposts = async (req, res, next) => {

    try {
        var filter = {}
        var { sort, limit = 9, page = 1 , title} = req.query

        var opt = { limit, page }

        var query = {}
        Object.keys(req.query).forEach(key => {
            if (req.query['slug']) query[key] = req.query[key];
            if(sort) opt.sort = {[req.query[key]]: -1}
        })

        const options = {
            sort: {_id: -1},
            ...opt
        };
        
        const data = await blogpostsService.getBlogPosts({ query: { ...query, archive: false }, options })
        successResponse(res, data)
    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}

exports.deleteBlogposts = async (req, res, next) => {
    try {
        const { id } = req.body;
        if (!id) {
            return errorResponse(res, { message: 'Blog post ID is required' }, 400);
        }

        const data = await blogpostsService.deleteBlogposts(id);
        successResponse(res, data);
    } catch (error) {
        console.error('Error deleting blog post:', error);
        errorResponse(res, error);
    }
}