const { productsService } = require("../service")
const { generateRandomNumber } = require("../utils/helpers")
const { successResponse, errorResponse } = require("../utils/responder")

exports.createProducts = async (req, res, next) => {
    try {
        const data = await productsService.createProducts({ 
            ...req.body, slug: req.body.title?.replace(/[" "]/gi, "-") + '-' + generateRandomNumber(5)})
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
} 
 
exports.updateProducts = async (req, res, next) => {
    try {
        var updateObj = {}
        Object.keys(req.body).forEach(key => {
            if (req.body[key]) {
                updateObj[key] = req.body[key];
            }
        })
        const data = await productsService.updateProducts({ _id : updateObj._id }, updateObj)
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}


exports.getProducts = async (req, res, next) => {
    var filter = {}
    const { slug } = req.params
    if(slug) filter.slug = slug
    
    try {
        const data = await productsService.getProducts(filter)
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}
