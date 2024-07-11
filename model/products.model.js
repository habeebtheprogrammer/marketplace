const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;

const productsSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required']
    },
    original_price: {
      type: Number,
      required: [true, 'Price is required']
    },
    discounted_price: {
      type: Number,
      default: 0,
    },
    // is_stock: {
    //   type: Boolean,
    //   default: true
    // },
    available: {
      type: Boolean,
      default: true,
      enum: { values: [true, false], message: '{VALUE} is not supported' }
    },
    rating: {
      type: Number,
      default: 0
    },
    reviews: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    trending: {
      type: Boolean,
      default: true,
    },
    images: [{
      type: String, required: [true, 'An image is required']
    }],
    vendorId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "vendors",
      required: [true, 'vendor is required']
    },
    categoryId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "category",
      required: [true, 'category field is required']
    },
    views: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// exports.productsSchema = productsSchema;

productsSchema.plugin(mongoosePaginate);

const Products = mongoose.model("products", productsSchema);

module.exports = Products;
