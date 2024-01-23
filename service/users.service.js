const Users = require("../model/users.model")

exports.getUsers = async (filters = {}) => {
    const data = await Users.paginate(filters, {})
    return data
}

exports.getUser = async (filter) => {
    const data = await Users.findOne(filter)
    return data
}

exports.createUser = async (param) => {
    const data = await Users.create(param)
    return data
}

exports.updateUser = async (param, obj) => {
    const data = await Users.findOneAndUpdate(param, obj,{ new: true} )
    return data
}
 