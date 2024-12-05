const mongoose = require("../config/connection")

var referralSchema = mongoose.Schema({
  userId: { type: mongoose.SchemaTypes.ObjectId, ref: "users" },
  appliedIds: [{ type: mongoose.SchemaTypes.ObjectId, ref: "users" }],
  credited: {
    type: Number,
    default: 0
  }, 
  available: {
    type: Boolean,
    default: true
  },
  code: String,
  description: String, 
  dateCreated: {
    type: Date,
    default: Date.now
  },
})

var referral = mongoose.model('referral', referralSchema);
module.exports = referral;

