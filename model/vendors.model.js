const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;
const vendorsSchema = new Schema(
  {
    creatorId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "users",
      required: [true, 'CreatorId is required']
    },
    title: {
      type: String,
      required: [true, 'Title is required']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required']
    }, 
    image: { type: String, required: [true, 'Image field is required'] },
    available: {
      type: Boolean,
      default: true,
      enum: { values: [true, false], message: '{VALUE} is not supported for available field.' }
    },
    views: {
      type: Number,
      default: 0
    },

    phone: {
      type: String,
    },
    videos: [String],
    // openingDays: {
    //   type: Array,
    //   default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    // },
    loc: {
      type: { type: String, default: "Point" },
      coordinates: [Number],
    },
    address: {
      longitude: {
        type: Number,
        required: [true, 'Address longitude is required']
      },
      latitude: {
        type: Number,
        required: [true, 'Address latitude is required']
      },
      city: {
        type: String,
        required: [true, 'Address city is required']
      },
      state: {
        type: String,
        required: [true, 'Address state is required']
      },
      address: {
        type: String,
        required: [true, 'Full Address is required']
      },
    },
    archive: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);
 
vendorsSchema.plugin(mongoosePaginate);
vendorsSchema.index( { "loc" : "2dsphere" , title: 'text'} ) 

const Vendors = mongoose.model("vendors", vendorsSchema);

module.exports = Vendors;
