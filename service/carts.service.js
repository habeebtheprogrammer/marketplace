const Carts = require("../model/carts.model")

exports.getCarts = async (filters = {}) => {
    const data = await Carts.paginate(filters, {})
    return data
}

exports.addToCarts = async (param) => {
    const data = await Carts.create(param)
    return data
}

exports.removeFromCarts = async (param) => {
    const data = await Carts.findOneAndRemove(param)
    return data
}
 