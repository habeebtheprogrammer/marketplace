const { wishlistsService } = require("../service")
const { successResponse, errorResponse } = require("../utils/responder")

exports.addToWishlists = async (req, res, next) => {
    try {
        const { productId } = req.body
        const data = await wishlistsService.addToWishlists({ productId })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.removeFromWishlists = async (req, res, next) => {
    try {
        const { wishId } = req.body
        const data = await wishlistsService.removeFromWishlists(wishId)
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