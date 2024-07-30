const Products = require("../model/products.model")

exports.getProducts = async ({query = {}, options = {}}) => {
    const data = await Products.paginate(query, {populate: [
        {
          path: "categoryId",
          select: "title",
        }], ...options}, )
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
 