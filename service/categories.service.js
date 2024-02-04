const Categories = require("../model/categories.model")

exports.getCategories = async (filters = {}) => {
    const data = await Categories.find(filters, {})
    return data
}

exports.getCategory = async (filter) => {
    const data = await Categories.findOne(filter)
    return data
}

exports.createCategory = async (param) => {
    const data = await Categories.create(param)
    return data
}

exports.updateCategories = async (param, obj) => {
    const data = await Categories.findOneAndUpdate(param, obj,{ new: true} )
    return data
}
 