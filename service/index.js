const usersService = require("./users.service")
const productsService = require("./products.service")
const categoriesService = require("./categories.service")
const vendorsService = require("./vendors.service")
const cartsService = require("./carts.service")
const wishlistsService = require("./wishlists.service")
const addressService = require("./address.service")

module.exports = {
    usersService,
    productsService,
    vendorsService,
    categoriesService,
    cartsService,
    wishlistsService,
    addressService
}