const mongoose = require("mongoose");

const { Schema } = mongoose;

const promoSchema = new Schema(
  {
    priceDrop: {
      type: Boolean,
      default: false
    },
  },
);


const Promo = mongoose.model("promos", promoSchema);

module.exports = Promo
