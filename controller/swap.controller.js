const { swapService } = require("../service")
const { successResponse, errorResponse } = require("../utils/responder")

exports.createSwapDetails = async (req, res, next) => {
    try {
        const data = await swapService.createSwap({...req.body, userId: req.userId})
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}
