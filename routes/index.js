var express = require('express');
var router = express.Router();
const usersRouter = require("./users.router")
const vendorsRouter = require("./vendors.router")
const productsRouter = require("./products.router")
const categoriesRouter = require("./categories.router")
const cartsRouter = require("./carts.router")
const wishlistsRouter = require("./wishlists.router")
const addressRouter = require("./address.router");
const ordersRouter = require('./orders.router');
const swapRouter = require('./swap.router');
const promoRouter = require('./promo.router');
const walletsRouter = require('./wallets.router');
const blogpostsRouter = require('./blogposts.router');

router.use("/users", usersRouter)
router.use("/vendors", vendorsRouter)
router.use("/products", productsRouter)
router.use("/categories", categoriesRouter)
router.use("/carts", cartsRouter)
router.use("/wishlists", wishlistsRouter)
router.use("/address", addressRouter)
router.use("/orders", ordersRouter)
router.use("/swap", swapRouter)
router.use("/promo", promoRouter)
router.use("/wallets", walletsRouter)
router.use("/blog", blogpostsRouter)

module.exports = router