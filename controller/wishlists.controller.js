const { wishlistsService } = require("../service")
const { successResponse, errorResponse } = require("../utils/responder")

exports.addToWishlists = async (req, res, next) => {
    try {
        const { productId } = req.body
        const data = await wishlistsService.addToWishlists({ productId, userId: req.userId })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.removeFromWishlists = async (req, res, next) => {
    try {
        const { productId } = req.body
        const data = await wishlistsService.removeFromWishlists(productId)
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.getWishlists = async (req, res, next) => {
    try {
        const data = await wishlistsService.getWishlists({})
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
} 