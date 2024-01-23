const Items = require("../model/items.model")

exports.getItems = async (filters = {}) => {
    const data = await Items.paginate(filters, {})
    return data
}

exports.getItem = async (filter) => {
    const data = await Items.findOne(filter)
    return data
}

exports.createItem = async (param) => {
    const data = await Items.create(param)
    return data
}

exports.updateItem = async (param, obj) => {
    const data = await Items.findOneAndUpdate(param, obj,{ new: true} )
    return data
}
 