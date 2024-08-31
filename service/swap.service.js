const Swap = require("../model/swap.model")

exports.createSwap = async (param) => {
    const data = await Swap.create(param)
    return data
}

 