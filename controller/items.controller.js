const { itemsService } = require("../service")
const { generateRandomNumber } = require("../utils/helpers")
const { successResponse, errorResponse } = require("../utils/responder")

exports.createItem = async (req, res, next) => {
    try {
        const {creatorId, title, vendorId , categoryId, images} = req.body
        const data = await itemsService.createItem({ title, creatorId, vendorId , categoryId, images, slug: title?.replace(/[" "]/gi, "-") + '-' + generateRandomNumber(5)})
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.updateItem = async (req, res, next) => {
    try {
        const {  title , categoryId, images, _id } = req.body
        var params = { title , categoryId, images }
        var updateObj = {}
        Object.keys(params).forEach(key => {
            if (params[key]) {
                updateObj[key] = params[key];
            }
        })
        const data = await itemsService.updateItem({ _id }, updateObj)
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.getItem = async (req, res, next) => {
    try {
        const { _id } = req.body
        const data = await itemsService.getItem({ _id })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.getItems = async (req, res, next) => {
    try {
        const data = await itemsService.getItems()
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}
