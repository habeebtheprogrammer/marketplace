const Users = require("../model/users.model")

exports.getUsers = async (filters = {}) => {
    const data = await Users.paginate(filters)
    return data
}

exports.createUser = async (param) => {
    const data = await (await Users.create(param)).toObject()
    return data
}

exports.updateUsers = async (param, obj) => {
    const data = await Users.findOneAndUpdate(param, obj,{ new: true} )
    return data
}
 