const { productsService } = require("../service")
const { generateRandomNumber } = require("../utils/helpers")
const { successResponse, errorResponse } = require("../utils/responder")

exports.createProducts = async (req, res, next) => {
    try {
        const { title, original_price, discounted_price, description, images, categoryId, vendorId} = req.body
        const data = await productsService.createProducts({ 
            title, original_price, discounted_price, description, 
            vendorId ,  categoryId, images, 
            slug: title?.replace(/[" "]/gi, "-") + '-' + generateRandomNumber(5)})
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
} 
 
exports.updateProducts = async (req, res, next) => {
    try {
        const {title, original_price, discounted_price, description, images, categoryId, _id } = req.body
        var params = {title, original_price, discounted_price, description, images, categoryId, }
        var updateObj = {}
        Object.keys(params).forEach(key => {
            if (params[key]) {
                updateObj[key] = params[key];
            }
        })
        const data = await productsService.updateProducts({ _id }, updateObj)
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
