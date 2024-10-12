const Orders = require("../model/orders.model")

exports.getOrders = async (filters = {}) => {
    const data = await Orders.paginate(filters, {populate: [
        {
          path: "orderedProducts",
          populate: {
            path: "productId",
            select: ["title", 'images']
          },
        }],
        sort: {_id: -1}})
    return data
}

exports.addOrders = async (param) => {
  console.log(param)
    const data =  (await Orders.create(param)).populate( {
        path: "orderedProducts",
        populate: {
          path: "productId",
            select: ["title", 'images']
        }
      })
    return data
}

exports.updateOrders = async (params, obj) => {
    const data = await Orders.findOneAndUpdate(params, obj,{ new: true} )
    return data
}
 