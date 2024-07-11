const { cartsService } = require("../service")
const { successResponse, errorResponse } = require("../utils/responder")

exports.addToCarts = async (req, res, next) => {
    try {
        const { productId, qty } = req.body
        const data = await cartsService.addToCarts({ productId, qty })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.removeFromCarts = async (req, res, next) => {
    try {
        const { cartId } = req.body
        const data = await cartsService.removeFromCarts(cartId)
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.getCarts = async (req, res, next) => {
    try {
        const data = await cartsService.getCarts({})
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
} 