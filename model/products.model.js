const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;

const productsSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    priceUpdatedAt: {
      type: Date,
      default: Date.now
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
    warranty: {
      type: String,
    },
    videoUrl: {
      type: String,
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
    },
    comments: [
      {
        title: String,
        description: String,
        images: [String],
        rating: Number,
        creatorId: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "users"
        }
      }
    ],
  },
  { timestamps: true }
);

// Create text index on both title and description for better search
productsSchema.index({ 
  title: 'text',
  description: 'text' 
}, {
  weights: {
    title: 3,      // Higher weight for title matches
    description: 1  // Lower weight for description matches
  }
});

productsSchema.plugin(mongoosePaginate);

const Products = mongoose.model("products", productsSchema);

module.exports = Products;
