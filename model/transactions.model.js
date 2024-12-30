const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

var transactionsSchema = mongoose.Schema({
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
    required: [true, 'Reference is required']
  },
  fee:{
    type: Number,
    default: 0
  },
  narration: {
    type: String,
    required: [true, 'Narration is required']
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
    enum: { values: ["pending", "successful", "failed"], message: '{VALUE} is not supported for status field.' }
  },
  type: {
    type: String,
    required: [true, 'type is required'],
    enum: { values: ["debit", "credit"], message: '{VALUE} is not supported for type field.' }
  },
}, 
{ timestamps: true }
)
transactionsSchema.plugin(mongoosePaginate);

var Transactions = mongoose.model('transactions', transactionsSchema);
module.exports = Transactions;

