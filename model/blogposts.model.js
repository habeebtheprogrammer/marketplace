const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;

const PostSchema = new  Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: [true, 'Slug is required']
  },

  excerpt: {
    type: String,
    required: [true, 'Excerpt is required']
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  tags: [String],
  views: {
    type: Number,
    default: 0
  },
  coverImage: String,
  archive: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });
// exports.productsSchema = productsSchema;
PostSchema.index({ title: 'text' }); 
PostSchema.plugin(mongoosePaginate);

const Posts = mongoose.model("blogposts", PostSchema);

module.exports = Posts;
