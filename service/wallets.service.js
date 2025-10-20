const Transactions = require("../model/transactions.model");
const Wallets = require("../model/wallets.model");

exports.getWallets = async (filters = {}) => {
    const wallet = await Wallets.paginate(filters, {
        populate: ['userId']
    })
    return wallet
}

exports.createWallet = async (data) => {
    const wallet = await Wallets.create(data);
    return wallet
}

exports.updateWallet = async (filter, data) => {
    const wallet = await Wallets.findOneAndUpdate(filter, data);
    return wallet
}

exports.fetchTransactions = async (filter,options={sort:{ "_id": -1}}) => {
    console.log(filter,options, 'trrasssss')
    const transactions = await Transactions.paginate(filter, options);
    return transactions
}

exports.saveTransactions = async (data) => {
    const transactions = await Transactions.create(data);
    return transactions
}
exports.updateTransactions = async (filter,data) => {
    const transactions = await Transactions.findOneAndUpdate(filter,data);
    return transactions
}