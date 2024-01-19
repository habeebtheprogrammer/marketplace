const { usersService } = require("../service")
const { successResponse, errorResponse } = require("../utils/responder")

const createUser = async (req, res, next) => {
    try {
        const { firstName, lastName, email } = req.body
        const data = await usersService.createUser({ firstName, lastName, email })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

const updateUser = async (req, res, next) => {
    try {
        const { firstName, lastName, email, _id } = req.body
        var params = { firstName, lastName }
        var updateObj = {}
        Object.keys(params).forEach(key => {
            if (params[key]) {
                updateObj[key] = params[key];
            }
        })
        const data = await usersService.updateUser({ _id }, updateObj)
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

const getUser = async (req, res, next) => {
    try {
        const { _id } = req.body
        const data = await usersService.getUser({ _id })
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

const getUsers = async (req, res, next) => {
    try {
        const users = await usersService.getUsers()
        successResponse(res, data)
    } catch (error) {
        errorResponse(res, error)
    }
}

module.exports = {
    createUser,
    updateUser,
    getUser,
    getUsers
}