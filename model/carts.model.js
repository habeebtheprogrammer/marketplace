const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;

const cartsSchema = new Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "users",
      required: [true, 'UserId is required']
    },
    productId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "products",
      required: [true, 'ProductId is required']
    },
    size: String,
    qty: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

cartsSchema.plugin(mongoosePaginate);

const Carts = mongoose.model("carts", cartsSchema);

module.exports = Carts;
