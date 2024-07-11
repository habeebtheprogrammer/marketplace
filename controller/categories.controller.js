const { categoriesService } = require("../service")
const { generateRandomNumber } = require("../utils/helpers")
const { successResponse, errorResponse } = require("../utils/responder")

exports.createCategories = async (req, res, next) => {
    try {
        const {image, title  } = req.body
        const data = await categoriesService.createCategories({ title, image, vendorId: req.userId, slug: title?.replace(/[" "]/gi, "-") + '-' + generateRandomNumber(5) })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.updateCategories = async (req, res, next) => {
    try {
        const { title, slug } = req.body
        const data = await categoriesService.updateCategories({ slug }, { title })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}
 
exports.getCategories = async (req, res, next) => {
    try {
        const data = await categoriesService.getCategories({})
        console.log(data)
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
} 