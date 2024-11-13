const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;

const requestSchema = new Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "users",
      required: [true, 'UserId is required']
    },
    vendorId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "vendors",
      required: [true, 'VendorId is required']
    },
    productId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "products",
      required: [true, 'ProductId is required']
    },
    confirmation: {
      type: Boolean,
      default: false,
      enum: { values: [true, false], message: '{VALUE} is not supported for available field.' }
    },
    archive: {
      type: Boolean,
      default: false,
      enum: { values: [true, false], message: '{VALUE} is not supported for available field.' }
    },
    variant:  String,
  },
  { timestamps: true }
);

requestSchema.plugin(mongoosePaginate);

const RequestsModel = mongoose.model("requests", requestSchema);

module.exports = RequestsModel;
