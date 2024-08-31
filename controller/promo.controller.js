const { promoService } = require("../service")
const { successResponse, errorResponse } = require("../utils/responder")

exports.getPromo = async (req, res, next) => {
    try {
        const data = await promoService.getPromo()
        console.log(data,'asd')
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
} 