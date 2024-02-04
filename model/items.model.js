const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;

const itemsSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'title is required']
    },
    slug: {
      type: String,
      required: [true, 'slug is required']
    }, 
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
    images: [{ type: String, required: [true, 'An image is required'] }],
    available: {
      type: Boolean,
      default: true,
      enum: { values: [true, false], message: '{VALUE} is not supported' }
    },
    views: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// exports.itemsSchema = itemsSchema;

itemsSchema.plugin(mongoosePaginate);

const Items = mongoose.model("items", itemsSchema);

module.exports = Items;
