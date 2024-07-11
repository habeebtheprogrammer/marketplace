const mongoose = require("mongoose");

const { Schema } = mongoose;

const wishlistsSchema = new Schema(
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
  },
  { timestamps: true }
);


const Wishlists = mongoose.model("wishlists", wishlistsSchema);

module.exports = Wishlists
