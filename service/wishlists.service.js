const Wishlists = require("../model/wishlists.model")

exports.getWishlists = async (filters = {}) => {
    const data = await Wishlists.paginate(filters, {populate: [
        {
          path: "productId",
          populate: {
            path: "vendorId",
            select: "title"
          }
        }]})
    return data
}

exports.addToWishlists = async (param) => {
    const data = (await Wishlists.create(param)).populate( {
        path: "productId",
        populate: {
          path: "vendorId",
          select: "title"
        }
      })
    return data
}

exports.removeFromWishlists = async (param) => {
    const data = await Wishlists.findOneAndDelete(param)
    return data
}
 