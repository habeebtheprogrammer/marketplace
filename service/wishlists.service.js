const Wishlists = require("../model/wishlists.model")

exports.getWishlists = async (filters = {}) => {
    const data = await Wishlists.paginate(filters, {})
    return data
}

exports.addToWishlists = async (param) => {
    const data = await Wishlists.create(param)
    return data
}

exports.removeFromWishlists = async (param) => {
    const data = await Wishlists.findOneAndRemove(param)
    return data
}
 