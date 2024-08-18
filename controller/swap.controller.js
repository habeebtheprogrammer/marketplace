const { swapService } = require("../service")
const { sendSwapEmail } = require("../utils/helpers")
const { successResponse, errorResponse } = require("../utils/responder")

exports.createSwapDetails = async (req, res, next) => {
    try {
        const data = await swapService.createSwap({...req.body, userId: req.userId})
        successResponse(res, data)
        sendSwapEmail(req.body)
    } catch (error) {
        errorResponse(res, error)
    }
}
