const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;

const ambassadorSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    university: {
      type: String,
      required: [true, 'University is required']
    },
    department: {
      type: String,
      required: [true, 'Department is required']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    why: {
      type: String,
      required: [true, 'Reason for applying is required']
    },
    archive: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

ambassadorSchema.plugin(mongoosePaginate);
ambassadorSchema.index({ fullName: 'text', email: 'text', university: 'text', department: 'text', why: 'text' });

const Ambassador = mongoose.model("ambassadors", ambassadorSchema);

module.exports = Ambassador;
