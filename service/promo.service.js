const Promo = require("../model/promo.model")

exports.getPromo = async () => {
    const data = await Promo.findOne({})
    return data
}