const mongoose = require("../config/connection")

var referralSchema = mongoose.Schema({
  referredBy: { type: mongoose.SchemaTypes.ObjectId, ref: "users" },
  referralCode: { type: String, unique: true },
  referrals: { type: Number, default: 0 }, // Counts successful referrals
}, 
{ timestamps: true }
)

var referral = mongoose.model('referral', referralSchema);
module.exports = referral;

