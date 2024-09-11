const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;

const addressSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required']
    },
    deliveryType: {
      type: String,
    },
    street: {
      type: String,
      required: [true, 'Street is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    country: {
      type: String,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required']
    }, 
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "users",
      required: [true, 'UserId is required']
    }, 
  },
  { timestamps: true }
);


const Address = mongoose.model("address", addressSchema);

module.exports = Address
