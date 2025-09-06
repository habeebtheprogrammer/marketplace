const usersService = require("./users.service")
const productsService = require("./products.service")
const categoriesService = require("./categories.service")
const vendorsService = require("./vendors.service")
const cartsService = require("./carts.service")
const wishlistsService = require("./wishlists.service")
const addressService = require("./address.service")
const ordersService = require("./orders.service")
const swapService = require("./swap.service")
const promoService = require("./promo.service")
const walletsService = require("./wallets.service")
const blogpostsService = require("./blogposts.service")
const journeyService = require("./journey.service")
const chatSessionsService = require("./chatSessions.service")
module.exports = {
    usersService,
    productsService,
    vendorsService,
    categoriesService,
    cartsService,
    wishlistsService,
    addressService,
    ordersService,
    swapService,
    promoService,
    walletsService,
    blogpostsService,
    journeyService,
    chatSessionsService
}