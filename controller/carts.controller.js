const { cartsService, productsService } = require("../service")
const { excessQty } = require("../utils/constant")
const { successResponse, errorResponse } = require("../utils/responder")



exports.getCarts = async (req, res, next) => {
    try {
        const data = await cartsService.getCarts({ userId: req.userId })
        successResponse(res, data)
    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}


exports.addToCarts = async (req, res, next) => {
    try {
        const { productId, size } = req.body
        console.log(req.body)
        const data = await cartsService.addToCarts({ productId, userId: req.userId, size })
        successResponse(res, data)
    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}


exports.updateCarts = async (req, res, next) => {
    try {
        const { cartId, qty, productId, size } = req.body
        const cartItem = await cartsService.getCarts( { _id: cartId })
        const product = cartItem.docs[0]?.productId
        const stock = size ? product?.size?.filter(s => s.title == size)[0]?.is_stock : product?.is_stock
        console.log(stock, cartItem.docs[0].qty)
        if((qty > 0) && ((cartItem.docs[0].qty + qty) > (stock))){
            throw Error(excessQty)
        }

        const data = await cartsService.updateCarts({ _id: cartId }, { "$inc": { qty } })
        successResponse(res, data)
    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}

exports.removeFromCarts = async (req, res, next) => {
    try {
        const { cartId } = req.params
        const data = await cartsService.removeFromCarts({ _id: cartId, userId: req.userId })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}