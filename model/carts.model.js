const mongoose = require("mongoose");

const { Schema } = mongoose;

const cartsSchema = new Schema(
  {
    productId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "products",
      required: [true, 'ProductId is required']
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "users",
      required: [true, 'UserId is required']
    },
    qty: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);


const Carts = mongoose.model("carts", cartsSchema);

module.exports = Carts;
