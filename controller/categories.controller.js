const { categoriesService } = require("../service")
const { generateRandomNumber } = require("../utils/helpers")
const { successResponse, errorResponse } = require("../utils/responder")
const constant = require('../utils/constant')

exports.createCategories = async (req, res, next) => {
    try {
        if (req.userType != 'vendor') throw Error(constant.unathorizeAccess)
        const data = await categoriesService.createCategories({ ...req.body, vendorId: req.userId, slug: title?.replace(/[" "]/gi, "-") + '-' + generateRandomNumber(5) })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.updateCategories = async (req, res, next) => {
    try {
        if (req.userType != 'vendor') throw Error(constant.unathorizeAccess)
        const data = await categoriesService.updateCategories({ slug: req.body.slug }, req.body)
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