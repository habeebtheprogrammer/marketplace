const { vendorsService, usersService } = require("../service")
const { successResponse, errorResponse } = require("../utils/responder")
const constant = require('../utils/constant')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const helpers = require("../utils/helpers")
const { HttpStatusCode } = require("axios")

exports.createVendor = async (req, res, next) => {
    try {
        const { title, avatar, address, email, password } = req.body
        if (!password) throw Error(constant.requiredErr)
        const hash = await bcrypt.hash(password, 10)
        const data = await vendorsService.createVendor({ title, avatar, address, loc: { coordinates: [address.longitude, address.latitude] }, email, password: hash, slug: title?.replace(/[" "]/gi, "-") + '-' + helpers.generateRandomNumber(5)})
        const token = jwt.sign(JSON.stringify(data), process.env.secretKey)
        successResponse(res, {data,token})
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.updateVendor = async (req, res, next) => {
    try {
        const { title, avatar, address } = req.body
        var params = { title, avatar, address }
        var updateObj = {}
        Object.keys(params).forEach(key => {
            if (params[key]) {
                updateObj[key] = params[key];
            }
        })
        const data = await vendorsService.updateVendor({ _id : req.userId}, updateObj)
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.getVendor = async (req, res, next) => {
    try {
        console.log(req.params)
        const { slug } = req.params
        const data = await vendorsService.getVendor({slug}) 
        if(!data) throw Error()
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error, "Item does not exist", HttpStatusCode.NotFound)
    }
}

exports.getVendors = async (req, res, next) => {
    try {
        const data = await vendorsService.getVendors()
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}
