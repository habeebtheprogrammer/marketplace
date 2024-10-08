const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required']
    },
    image: {
      type: String,
      required: [true, 'An image is required']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required']
    },
    vendorId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "users",
      required: [true, 'creatorId is required']
    } , 
    archive: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

categorySchema.plugin(mongoosePaginate);

const Categories = mongoose.model("categories", categorySchema);

module.exports = Categories;
