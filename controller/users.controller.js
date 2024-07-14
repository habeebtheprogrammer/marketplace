const { usersService } = require("../service")
const { successResponse, errorResponse } = require("../utils/responder")
const constant = require('../utils/constant')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { createToken } = require("../utils/helpers")


exports.signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await usersService.getUsers({ email })
        if (!user?.totalDocs) throw Error(constant.mismatchCredErr)
        const verify = await bcrypt.compare(password, user.docs[0].password)
        if (!verify) throw Error(constant.mismatchCredErr)
        var token = createToken(JSON.stringify(user.docs[0]))
        successResponse(res, { user: user.docs[0], token })
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.createUser = async (req, res, next) => {
    try {
        const hash = await bcrypt.hash(req.body.password, 10)
        const data = await usersService.createUsers({ ...req.body, password: hash })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.updateUser = async (req, res, next) => {
    try {
        var updateObj = {}
        Object.keys(req.body).forEach(key => {
            if (req.body[key]) {
                updateObj[key] = req.body[key];
            }
        })
        if (updateObj.password) {
            const hash = await bcrypt.hash(password, 10)
            updateObj.password = hash
        }
        const data = await usersService.updateUsers({ _id: req.userId }, updateObj)
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.getUserAccount = async (req, res, next) => {
    try {
        const data = await usersService.getUsers({ _id: req.userId })
        successResponse(res, data?.docs[0])
    } catch (error) {
        errorResponse(res, error)
    }
}

exports.getUsers = async (req, res, next) => {
    try { 
        const data = await usersService.getUsers({ "archive": false, ...req.query })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}


exports.deleteUsers = async (req, res, next) => {
    try { 
        const { _id } = req.params
        const data = await usersService.updateUsers({ _id }, { "archive": true })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

