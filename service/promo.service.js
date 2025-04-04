const Promo = require("../model/promo.model")
const Transactions = require("../model/transactions.model")
const Users = require("../model/users.model")

exports.getPromo = async () => {
    const data = await Promo.findOne({}).populate("rewards.productId")
    return data
}

exports.updateRewards = async (params, obj) => {
    const data = await Promo.findOneAndUpdate(params, obj,{ new: true} )
    return data
}
 
exports.claimRewardsByTransactionVol = async (userId) => {
    const promo = await Promo.findOne({})
    var p = promo.toObject()
    const data = await Transactions.paginate({
        userId,
        createdAt: {
            $gte: new Date(),
            $lt: p?.rewards?.expires
        }
    });
    return data;
}

exports.claimRewardsByReferral = async (userId) => {
    const promo = await Promo.findOne({})
    var p = promo.toObject()
    const data = await Users.paginate({
        referredBy: userId,
        createdAt: {
            $gte: new Date(),
            $lt: p?.rewards?.expires
        }
    });
    return data;
}

