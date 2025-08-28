const Users = require("../model/users.model")
const Delivery = require("../model/delivery.model")
const { journeyService } = require('.');



exports.getUsers = async (filters = {}) => {
    const data = await Users.paginate(filters,  {
        sort: {_id: -1},
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
    const data = await Users.create(param)
    try {
        journeyService.handleUserSignup(data?._id)
    } catch (error) {
        console.log(error)
    }
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