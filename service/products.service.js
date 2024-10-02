const Products = require("../model/products.model")

exports.getProducts = async ({ query = {}, options = {} }) => {

    const data = await Products.paginate(query, {
        populate: [
            {
                path: "categoryId",
                select: "title",
            },
            {
                path: "comments.creatorId",
                select: ["firstName", 'lastName'],
            }], ...options
    },)

    if (data.totalDocs ==  1) {
        await Products.findOneAndUpdate(query, {"$inc": {"views": 1}})
    }
    return data
}

exports.createProducts = async (param) => {
    const data = await Products.create(param)
    return data
}

exports.createComments = async (comments) => {
    const data = await Products.findOneAndUpdate({ _id: comments.productId }, { $addToSet: { comments } })
    return data
}
exports.updateProducts = async (param, obj) => {
    const data = await Products.findOneAndUpdate(param, obj, { new: true })
    return data
}

exports.bulkUpdate = async (param, obj) => {
    const data = await Products.updateMany(param, obj)
    return data
}