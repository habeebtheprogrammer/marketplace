const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

var transactionsSchema = mongoose.Schema({
  // Indexed fields for better query performance
  userId: {
    type: mongoose.SchemaTypes.ObjectId, ref: "users" ,
    required: [true, 'userId is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required']
  },
  reference:{
    type: String,
    unique: true,
    required: [true, 'Reference is required'],
    index: true
  },
  fee:{
    type: Number,
    default: 0
  },
  discountApplied:{
    type: Number,
    default: 0
  },
  couponUsed:{
    type: String,
    default: null
  },
  narration: {
    type: String,
    required: [true, 'Narration is required'],
    index: true
  },
  planType:{
    type: String,
  },
  network:{
    type: String,
  },
  dataAmount:{
    type: Number,
  },
  destinationBankCode:{
    type: String,
  },
  destinationBankName:{
    type: String,
  },
  destinationAccountNumber: {
    type: String,
  },
  sourceAccountName: {
    type: String,
  },
  status: {
    type: String,
    default: 'pending',
    required: [true, 'Status is required'],
    enum: { values: ["pending", "successful", "failed"], message: '{VALUE} is not supported for status field.' },
    index: true
  },
  type: {
    type: String,
    required: [true, 'type is required'],
    enum: { values: ["debit", "credit"], message: '{VALUE} is not supported for type field.' },
    index: true
  },
}, 
{ timestamps: true }
)
transactionsSchema.plugin(mongoosePaginate);

var Transactions = mongoose.model('transactions', transactionsSchema);
module.exports = Transactions;

