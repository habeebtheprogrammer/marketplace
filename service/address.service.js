const Address = require("../model/address.model")

exports.getAddress = async (filters = {}) => {
    const data = await Address.find(filters)
    return data
}

exports.addAddress = async (param) => {
    const data = (await Address.create(param))
    return data
}

exports.removeAddress = async (param) => {
    const data = await Address.findOneAndDelete(param)
    return data
}
 