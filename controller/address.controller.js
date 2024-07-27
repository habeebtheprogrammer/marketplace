const { addressService } = require("../service")
const { successResponse, errorResponse } = require("../utils/responder")

exports.addAddress = async (req, res, next) => {
    try { 
        const data = await addressService.addAddress({...req.body, userId: req.userId})
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.removeAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params
        const data = await addressService.removeAddress(addressId)
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.getAddress = async (req, res, next) => {
    try {
        const data = await addressService.getAddress({userId: req.userId})
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
} 