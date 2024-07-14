const Users = require("../model/users.model")

exports.getUsers = async (filters = {}) => {
    const data = await Users.paginate(filters)
    return data
}

exports.createUsers = async (param) => {
    const data = await Users.create(param)
    return data
}

exports.updateUsers = async (param, obj) => {
    const data = await Users.findOneAndUpdate(param, obj,{ new: true} )
    return data
}
 