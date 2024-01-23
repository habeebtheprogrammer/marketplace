const Vendors = require("../model/vendors.model")

exports.getVendors = async (filters = {}) => {
    const data = await Vendors.paginate(filters, {})
    return data
}

exports.getVendor = async (filter) => {
    const data = await Vendors.findOne(filter)
    return data
}

exports.createVendor = async (param) => {
    const data = await Vendors.create(param)
    return data
}

exports.updateVendor = async (param, obj) => {
    const data = await Vendors.findOneAndUpdate(param, obj,{ new: true} )
    return data
}
 