const { default: axios } = require("axios");
const { ordersService, cartsService, productsService, addressService, walletsService } = require("../service")
const { getUsers } = require("../service/users.service")
const { generateRandomNumber, sendOrdersEmail, sendOrderConfirmationEmail } = require("../utils/helpers")
const { successResponse, errorResponse } = require("../utils/responder")
const crypto = require("crypto");
const { sendNotification } = require("../utils/onesignal");



exports.getOrders = async (req, res, next) => {
    try {
        const data = await ordersService.getOrders({ userId: req.userId })
        successResponse(res, data)
    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}

exports.getAdminOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const data = await ordersService.getAllOrders(page, limit);
        successResponse(res, data);
    } catch (error) {
        console.log(error);
        errorResponse(res, error);
    }
}

exports.addOrders = async (req, res, next) => {
    try {
        const { amountPaid, flutterwave, orderedProducts, deliveryAddress } = req.body

        var wallet = await walletsService.getWallets({ userId: req.userId })
        if(wallet.docs[0].balance < parseInt(amountPaid) || wallet.totalDocs == 0 ) throw new Error("Insufficient balance. please fund your wallet");
        
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
            status:  'new order'
         })
        const emptyCarts = await cartsService.clearCarts({ userId: req.userId })
        orderedProducts?.map(async (p) => {
            const updateProd = await productsService.updateProducts({ "_id":  p.productId._id }, { $inc: { is_stock: -p.qty } })
        })
        successResponse(res, data)
        //send emails
        var user = await getUsers({_id: req.userId})
        var addr = deliveryAddress
        sendOrderConfirmationEmail({email: user.docs[0]?.email, order: orderedProducts, address: addr, pickup: flutterwave.tx_ref == flutterwave.transaction_id})
        sendOrdersEmail({ order: orderedProducts,  pickup: flutterwave.tx_ref == flutterwave.transaction_id, address: addr})
        await walletsService.updateWallet({ userId: req.userId }, {$inc: {balance:  -parseInt(amountPaid)}})
        const wallData = {
          "amount": amountPaid,
          "userId": user.docs[0]._id,
          "reference": 'gadgets-'+ generateRandomNumber(11),
          "narration": "Gadget/Accessories purchase",
          "currency": "NGN",
          "type": 'debit',
          "status": "successful"
        }
        await walletsService.saveTransactions(wallData)
        sendNotification({
            headings: { "en": `Payment successful` },
            contents: { "en": `Congratulations ${req.firstName}! Your purchase was successful. Refer a friend to try 360gadgetsafrica to earn with us.` },
            include_subscription_ids: [req.oneSignalId],
            url: 'gadgetsafrica://transactions',
          })
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
          // Don't do anything, the request is not from us.
        }
    } catch (error) {
        console.log(error)
        errorResponse(res, error)
    }
}
