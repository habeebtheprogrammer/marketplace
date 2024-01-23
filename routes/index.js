var express = require('express');
var router = express.Router();
const usersRouter = require("./users.router")
const vendorsRouter = require("./vendors.router")
const itemsRouter = require("./items.router")

router.use("/users", usersRouter)
router.use("/vendors", vendorsRouter)
router.use("/items", itemsRouter)

module.exports = router