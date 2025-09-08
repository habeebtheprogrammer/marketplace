const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;

const usersSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, 'Email is required'],
      index: true
    },
    oneSignalId: String,
    banned: {
      type: Boolean,
      default: false
    },
    phoneNumber: [{
      type: String,
      // Remove unique constraint from schema level, we'll handle it in application logic
      default: []
    }],
    userType: {
      type: String,
      default: "user",
      enum: { values: ['user', 'vendor', 'superuser'], message: '{VALUE} is not supported for userType field.' }
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      index: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required']
    },
    avatar: {
      type: String,
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    archive: {
      type: Boolean,
      default: false
    },
    vendorId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "vendors",
    },
    referredBy: { type: mongoose.SchemaTypes.ObjectId, ref: "users" },
    referralCode: { type: String, unique: true },
    referrals: { type: Number, default: 0 }, 
    verificationCode: String,
    deviceid: String,
    resetToken: String,
    resetTokenExpiry: Date,
    location: {
      latitude: String,
      longitude: String,
      city: String,
      platform: String,
      buildnumber: String,
      buildversion: String,
      model: String, 
      deviceid: String, 
      lastseen: Date,
    },
  },
  { timestamps: true }
);

// exports.usersSchema = usersSchema;

usersSchema.plugin(mongoosePaginate);

const Users = mongoose.model("users", usersSchema);

module.exports = Users;
