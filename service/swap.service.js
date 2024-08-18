const Swap = require("../model/Swap")

exports.createSwap = async (param) => {
    const data = await Swap.create(param)
    return data
}

 