const Users = require("../model/users.model")
const Delivery = require("../model/delivery.model")

exports.getUsers = async (filters = {}) => {
    const { page = 1, limit = 10, ...otherFilters } = filters;
    const data = await Users.paginate(otherFilters, {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: [
            {
                path: "vendorId",
            },
            {
                path: "referredBy",
                select: ["firstName", 'oneSignalId',"_id"],
            }]
    })
    return data
}

exports.createUser = async (param) => {
    const data = await (await Users.create(param)).toObject()
    return data
}

exports.updateUsers = async (param, obj) => {
    const data = await Users.findOneAndUpdate(param, obj,{ new: true} )
    return data
}

exports.getUserDelivery = async () => {
    const data = await Delivery.find({})
    return data
}

exports.getUserById = async (userId) => {
    const user = await Users.findById(userId).populate([
        {
            path: "vendorId",
        },
        {
            path: "referredBy",
            select: ["firstName", 'oneSignalId',"_id"],
        }
    ]);
    return user;
}