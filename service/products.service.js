const Products = require("../model/products.model")

exports.getProducts = async (filters = {}) => {
    const data = await Products.paginate(filters, {})
    return data
}

exports.createProducts = async (param) => {
    const data = await Products.create(param)
    return data
}

exports.updateProducts = async (param, obj) => {
    const data = await Products.findOneAndUpdate(param, obj,{ new: true} )
    return data
}
 