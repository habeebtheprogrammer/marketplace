const { vendorsService } = require("../service")
const { successResponse, errorResponse } = require("../utils/responder")
const helpers = require("../utils/helpers")

exports.createVendors = async (req, res, next) => {
    try {
        const { title, avatar, address, email } = req.body
        const data = await vendorsService.createVendors({ title, avatar, address, loc: { coordinates: [address.longitude, address.latitude] }, email,  slug: title?.replace(/[" "]/gi, "-") + '-' + helpers.generateRandomNumber(5)})
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}
 

exports.updateVendors = async (req, res, next) => {
    try {
        const { title, avatar, address } = req.body
        var params = { title, avatar, address }
        var updateObj = {}
        Object.keys(params).forEach(key => {
            if (params[key]) {
                updateObj[key] = params[key];
            }
        })
        const data = await vendorsService.updateVendors({ _id : req.userId}, updateObj)
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.getVendors = async (req, res, next) => {
    try {
        const data = await vendorsService.getVendors()
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}
