const mongoose = require("mongoose");

const { Schema } = mongoose;

const deliverySchema = new Schema(
  { 
    deliveryType: {
      type: String,
      amount: [true, 'deliveryType is required']
    },
    description: {
      type: String,
      required: [true, 'description is required']
    }, 
    amount: {
      type: String,
      amount: [true, 'Amount is required']
    }, 
  },
  { timestamps: true }
);


const Delivery = mongoose.model("deliverymethods", deliverySchema);

module.exports = Delivery
