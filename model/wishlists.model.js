const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

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


wishlistsSchema.plugin(mongoosePaginate);


const Wishlists = mongoose.model("wishlists", wishlistsSchema);

module.exports = Wishlists
