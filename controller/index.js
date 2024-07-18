
const usersController = require("./users.controller")
const vendorsController = require("./vendors.controller")
const productsController = require("./products.controller")
const categoriesController = require("./categories.controller")
const cartsController = require("./carts.controller")
const wishlistsController = require("./wishlists.controller")
const addressController = require("./address.controller")

module.exports  = {
    usersController,
    vendorsController,
    productsController,
    categoriesController,
    cartsController,
    wishlistsController,
    addressController
}