const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;
const vendorsSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'title is required']
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'email is required']
    },
    slug: {
      type: String,
      required: [true, 'slug is required']
    },
    password: {
      type: String,
      required: [true, 'password is required']
    },
    avatar: { type: String, required: [true, 'avatar field is required'] },
    available: {
      type: Boolean,
      default: true,
      enum: { values: [true, false], message: '{VALUE} is not supported for available field.' }
    },
    views: {
      type: Number,
      default: 0
    },
    openingDays: {
      type: Array,
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    loc: {
      type: { type: String, default: "Point" },
      coordinates: [Number],
    },
    address: {
      longitude: {
        type: Number,
        required: [true, 'address longitude is required']
      },
      latitude: {
        type: Number,
        required: [true, 'address latitude is required']
      },
      city: {
        type: String,
        required: [true, 'address city is required']
      },
    },
  },
  { timestamps: true }
);

// exports.itemsSchema =vendorsSchema;

vendorsSchema.plugin(mongoosePaginate);
vendorsSchema.index( { "loc" : "2dsphere" , title: 'text'} ) 

const Vendors = mongoose.model("vendors", vendorsSchema);

module.exports = Vendors;
