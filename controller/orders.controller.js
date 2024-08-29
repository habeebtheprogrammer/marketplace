const { ordersService, cartsService, productsService } = require("../service")
const { getUsers } = require("../service/users.service")
const { generateRandomNumber, sendOrdersEmail, sendOrderConfirmationEmail } = require("../utils/helpers")
const { successResponse, errorResponse } = require("../utils/responder")



exports.getOrders = async (req, res, next) => {
    try {
        const data = await ordersService.getOrders({ userId: req.userId })
        successResponse(res, data)
    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}


exports.addOrders = async (req, res, next) => {
    try {
        const { amountPaid, flutterwave, orderedProducts, deliveryAddress } = req.body
        const trackingId = generateRandomNumber(10)
        var orders = []
        orderedProducts?.map(p => {
            var item = {
                size: p.size,
                qty: p.qty,
                productId: p.productId._id,
                trackingId: generateRandomNumber(10),
                price: p.productId.discounted_price || p.productId.original_price,
            }
            orders.push(item)
            // productIds.push(p.productId._id)
        })
        const data = await ordersService.addOrders({ userId: req.userId, trackingId, amountPaid, flutterwave, orderedProducts: orders, deliveryAddress })
        const emptyCarts = await cartsService.clearCarts({ userId: req.userId })
        orderedProducts?.map(async (p) => {
            const updateProd = await productsService.updateProducts({ "_id":  p.productId._id }, { $inc: { is_stock: -p.qty } })
        })
        successResponse(res, data)
        //send emails
        var user = await getUsers({_id: req.userId})
        sendOrdersEmail(orderedProducts)
        sendOrderConfirmationEmail({email: user.email, order: orderedProducts, address: deliveryAddress})
    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}
