var express = require('express');
var router = express.Router();
const usersRouter = require("./users.router")
const vendorsRouter = require("./vendors.router")
const productsRouter = require("./products.router")
const categoriesController = require("./categories.router")
const cartsController = require("./carts.router")
const wishlistsController = require("./wishlists.router")
const addressController = require("./address.router")

router.use("/users", usersRouter)
router.use("/vendors", vendorsRouter)
router.use("/products", productsRouter)
router.use("/categories", categoriesController)
router.use("/carts", cartsController)
router.use("/wishlists", wishlistsController)
router.use("/address", addressController)

module.exports = router