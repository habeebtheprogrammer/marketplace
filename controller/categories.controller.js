const { categoriesService , itemsService} = require("../service")
const { generateRandomNumber } = require("../utils/helpers")
const { successResponse, errorResponse } = require("../utils/responder")

exports.createCategory = async (req, res, next) => {
    try {
        const {   title  } = req.body
        const data = await categoriesService.createCategory({ title, vendorId: req.userId, slug: title?.replace(/[" "]/gi, "-") + '-' + generateRandomNumber(5) })
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

exports.getCategory = async (req, res, next) => {
    try {
        const { slug } = req.params
        const data = await itemsService.getItem({ slug })
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

exports.getItems = async (req, res, next) => {
    try {
        const { id } = req.params
        const data = await itemsService.getItems({ categoryId: id })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}