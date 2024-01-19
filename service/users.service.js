const Users = require("../model/user.model")

const getUsers = async (filters = {}) => {
    const data = await Users.paginate(filters, {})
    return data
}

const getUser = async (filter) => {
    const data = await Users.findOne(filter)
    return data
}
const createUser = async (param) => {
    const data = await Users.create(param)
    return data
}
const updateUser = async (param, obj) => {
    const data = await Users.findOneAndUpdate(param, obj,{ new: true} )
    return data
}

module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUser
} 