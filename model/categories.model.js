const mongoose = require("mongoose"); 

const { Schema } = mongoose;

const categorySchema = new Schema(
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
      ref: "users",
      required: [true, 'creatorId is required']
    }
  },
  { timestamps: true }
);
 

const Categories = mongoose.model("categories", categorySchema);

module.exports = Categories;
