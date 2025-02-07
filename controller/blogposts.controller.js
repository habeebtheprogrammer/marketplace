const { blogpostsService, } = require("../service")
const { generateRandomNumber,  } = require("../utils/helpers");
const { successResponse, errorResponse } = require("../utils/responder")

exports.createBlogposts = async (req, res, next) => {
    try {
        const data = await blogpostsService.createBlogposts({
            ...req.body, slug: req.body.title?.replace(/[" "]/gi, "-") + '-' + generateRandomNumber(5)
        })
        
        successResponse(res, data)
    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}
exports.updateProducts = async (req, res, next) => {
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

        var pagination = { limit, page }

        var query = {}
        Object.keys(req.query).forEach(key => {
            if (req.query['slug']) query[key] = req.query[key];
        })

        const options = {
            ...pagination
        };

        const data = await productsService.getProducts({ query: { ...query, archive: false }, options })
        successResponse(res, data)
    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}

