const Vendors = require("../model/vendors.model")

exports.getVendors = async (filters = {}) => {
    const data = await Vendors.paginate(filters, {})
    return data
}

exports.getVendors = async (filter) => {
    const data = await Vendors.findOne(filter)
    return data
}

exports.createVendors = async (param) => {
    const data = await Vendors.create(param)
    return data
}

exports.updateVendors = async (param, obj) => {
    const data = await Vendors.findOneAndUpdate(param, obj,{ new: true} )
    return data
}
 