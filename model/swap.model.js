const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;

const swapSchema = new Schema(
  {
    deviceName: {
      type: String,
      required: [true, 'deviceName is required']
    },
    email: String,
    model:  {
      type: String,
      required: [true, 'model is required']
    },
    condition:  {
      type: String,
    },
    preferreDeviceName:  {
      type: String,
      required: [true, 'preferreDeviceName is required']
    },
    preferreDeviceModel:  {
      type: String,
      required: [true, 'preferreDeviceModel is required']
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "users",
      required: [true, 'UserId is required']
    }, 
  },
  { timestamps: true }
);


const Swap = mongoose.model("swap", swapSchema);

module.exports = Swap
