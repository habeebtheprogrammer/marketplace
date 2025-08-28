const Carts = require("../model/carts.model")
const { handleCartAbandonment } = require("./journey.service")
exports.getCarts = async (filters = {}) => {
    const data = await Carts.paginate(filters, {populate: [
        {
          path: "productId",
          populate: {
            path: "vendorId",
            select: "title"
          }
        }]})
    return data
}

exports.addToCarts = async (param) => {
    const data =  await Carts.create(param).populate( {
        path: "productId",
        populate: {
          path: "vendorId",
          select: "title"
        }
      })
      try {
        handleCartAbandonment(data?.userId, [{_id: data._id, productId: data.productId, qty: data.qty, size: data.size}])
      } catch (error) {
        console.log(error)
      }
    return data
     
}

exports.updateCarts = async (params, obj) => {
    const data = await Carts.findOneAndUpdate(params, obj,{ new: true} )
    return data
}

exports.removeFromCarts = async (param) => {
    const data = await Carts.findOneAndDelete(param)
    return data
}
 
exports.clearCarts = async (param) => {
  const data = await Carts.deleteMany(param)
  return data
}
