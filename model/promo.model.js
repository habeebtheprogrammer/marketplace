const mongoose = require("mongoose");

const { Schema } = mongoose;

const promoSchema = new Schema(
  {
    priceDrop: { type: Boolean, default: false },
    expires: { type: Date },
    text: { type: String },
    imgUrl: { type: String },
    adsDescription: { type: String },
    adsHeader: { type: String },
    adsImgUrl: { type: String },
    welcomeDescription: { type: String },
    welcomeHeader: { type: String },
    welcomeImgUrl: { type: String },
    availabilityDescription: { type: String },
    availabilityHeader: { type: String },
    availabilityImgUrl: { type: String },
    referralText: { type: String },
    withdrawalFee: { type: String }, // Consider changing to Number if needed
    consultationFee: { type: String }, // Consider changing to Number if needed
    rewards: {
      title: { type: String },
      description: { type: String },
      planId: { type: String },
      available: { type: Boolean, default: false },
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
      applied: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
      expires: { type: Date },
    },
  },
);


const Promo = mongoose.model("promos", promoSchema);

module.exports = Promo
