const { usersService } = require("../service") 
const { successResponse, errorResponse } = require("../utils/responder")
const constant = require('../utils/constant') 
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")


exports.signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) throw Error(constant.loginCredReqErr)
        const user = await usersService.getUser({ email})
        if(!user) throw Error(constant.mismatchCredErr)
        const verify = await bcrypt.compare(password, user.password)
        if(!verify) throw Error(constant.mismatchCredErr)
        var token = jwt.sign(JSON.stringify(user), process.env.secretKey)
        successResponse(res, {user, token})
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.createUser = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body
        if(!password) throw Error(constant.requiredErr)
        const hash = await bcrypt.hash(password, 10)
        const data = await usersService.createUser({ firstName, lastName,  email, userName: email?.split("@")[0], password: hash })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.updateUser = async (req, res, next) => {
    try {
        const { firstName, lastName } = req.body
        var params = { firstName, lastName }
        var updateObj = {}
        Object.keys(params).forEach(key => {
            if (params[key]) {
                updateObj[key] = params[key];
            }
        })
        const data = await usersService.updateUser({ _id: req.userId }, updateObj)
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.getUser = async (req, res, next) => {
    try {
        const { _id } = req.body
        const data = await usersService.getUser({ _id })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.getUsers = async (req, res, next) => {
    try {
        const users = await usersService.getUsers()
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}
 