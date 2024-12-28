const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, unique: true },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'NGN' },
},
{ timestamps: true }
);
walletSchema.plugin(mongoosePaginate);

const Wallets = mongoose.model('wallets', walletSchema);

module.exports = Wallets;