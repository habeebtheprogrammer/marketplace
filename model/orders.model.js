const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;

const ordersSchema = new Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "users",
      required: [true, 'userId is required']
    },
    trackingId:  {
      type: String,
      required: [true, 'trackingId is required']
    },
    flutterwave: {
      tx_ref: String,
      transaction_id: String,
    },
    amountPaid: {
      type: Number,
      required: [true, 'amountPaid is required']
    },
    orderedProducts: [
      {
        productId: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "products",
          required: [true, 'productId is required']
        },
        size: String,
        price:  {
          type: Number,
          required: [true, 'price is required']
        },
        trackingId:  {
          type: String,
          required: [true, 'trackingId is required']
        },
        qty: {
          type: Number,
          required: [true, 'orderedProducts.qty is required']
        },
      }
    ],
    deliveryAddress: {
      name: String,
      street: String,
      city: String,
      state: String,
      country: String,
      phone: {
        type: String,
        required: [true, 'deliveryAddress.phone is required']
      },
    }, 

  },
  { timestamps: true }
);

ordersSchema.plugin(mongoosePaginate);

const Orders = mongoose.model("orders", ordersSchema);

module.exports = Orders;
