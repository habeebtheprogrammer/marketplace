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
    size: [
      {
        title: {
          type: String,
          required: [true, 'Title is required']
        },
        is_stock: {
          type: Number,
          default: 1,
        },
      }
    ],
    is_stock: {
      type: Number,
      default: 1,
    },
    rating: {
      type: mongoose.Schema.Types.Decimal128,
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
      default: false,
    },
    images: [{
      type: String, required: [true, 'An image is required']
    }],
    views: {
      type: Number,
      default: 0
    },
    vendorId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "vendors",
      required: [true, 'vendor is required']
    },
    categoryId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "categories",
      required: [true, 'categoryId field is required']
    },
    archive: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// exports.productsSchema = productsSchema;
productsSchema.index({ title: 'text' }); 
productsSchema.plugin(mongoosePaginate);

const Products = mongoose.model("products", productsSchema);

module.exports = Products;
