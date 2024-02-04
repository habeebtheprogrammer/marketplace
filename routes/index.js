var express = require('express');
var router = express.Router();
const usersRouter = require("./users.router")
const vendorsRouter = require("./vendors.router")
const itemsRouter = require("./items.router")
const categoriesController = require("./categories.router")

router.use("/users", usersRouter)
router.use("/vendors", vendorsRouter)
router.use("/items", itemsRouter)
router.use("/categories", categoriesController)

module.exports = router