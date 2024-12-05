const { default: axios } = require("axios");
const { ordersService, cartsService, productsService, addressService } = require("../service")
const { getUsers } = require("../service/users.service")
const { generateRandomNumber, sendOrdersEmail, sendOrderConfirmationEmail } = require("../utils/helpers")
const { successResponse, errorResponse } = require("../utils/responder")
const crypto = require("crypto");



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
        const data = await ordersService.addOrders({ userId: req.userId, trackingId, amountPaid, flutterwave, orderedProducts: orders, deliveryAddress, 
            status: flutterwave.tx_ref == flutterwave.transaction_id ? 'awaiting payment' : 'new order'
         })
        const emptyCarts = await cartsService.clearCarts({ userId: req.userId })
        orderedProducts?.map(async (p) => {
            const updateProd = await productsService.updateProducts({ "_id":  p.productId._id }, { $inc: { is_stock: -p.qty } })
        })
        successResponse(res, data)
        //send emails
        var user = await getUsers({_id: req.userId})
        var addr
        if(flutterwave.tx_ref == flutterwave.transaction_id){
            addr = { 
                name: "His Grace Plaza",
                street: "14 Francis Oremeji St, Ikeja",
                state: "Lagos",
                phone: "+2347069568209"
            }
        } else addr = deliveryAddress
        sendOrderConfirmationEmail({email: user.docs[0]?.email, order: orderedProducts, address: addr, pickup: flutterwave.tx_ref == flutterwave.transaction_id})
        sendOrdersEmail({ order: orderedProducts,  pickup: flutterwave.tx_ref == flutterwave.transaction_id, address: addr})

    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}

exports.updateOrders = async (req, res, next) => {
    try {
        console.log(req.body)
        var updateObj = {}
        Object.keys(req.body).forEach(key => {
            updateObj[key] = req.body[key];
        })
        const data = await ordersService.updateOrders({ _id: updateObj._id }, updateObj)
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}


exports.webhook = async (req, res, next) => {
    try {
        const hash = crypto.createHmac('sha256', process.env.KORRA_SECRET_KEY).update(JSON.stringify(req.body.data)).digest('hex');

        if (hash === req.headers['x-korapay-signature']) {
            const resp = await axios(`https://api.korapay.com/merchant/api/v1/charges/${req.body.data.reference}`, {
                headers: {
                    Authorization: `Bearer ${process.env.KORRA_SECRET_KEY}`
                }
            })
            console.log(resp?.data?.data.metadata)
            var {email} =resp?.data?.data?.metadata
            var user = await getUsers({email})
            const userId = user?.docs[0]._id

            const cartItems = await cartsService.getCarts({userId})
            var orders = []
            cartItems?.docs?.map(p => {
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
        const addr = await addressService.getAddress({_id: resp?.data?.data.metadata?.addressId})
        console.log(addr, orders)
        const data = await ordersService.addOrders({ userId, trackingId: generateRandomNumber(10), amountPaid: req.body.data.amount, flutterwave: {
            tx_ref: req.body.data.reference,
            transaction_id: generateRandomNumber(10)
        }, orderedProducts: orders, deliveryAddress: addr[0], 
            status: 'new order'
         })
        const emptyCarts = await cartsService.clearCarts({ userId })
        res.sendStatus(200)
          // Continue with the request functionality
        } else {
          // Don’t do anything, the request is not from us.
        }
    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}
