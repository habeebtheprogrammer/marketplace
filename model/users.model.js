const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;

const usersSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, 'Email is required']
    },
    oneSignalId: String,
    userType: {
      type: String,
      default: "user",
      enum: { values: ['user', 'vendor', 'superuser'], message: '{VALUE} is not supported for userType field.' }
    },
    firstName: {
      type: String,
      required: [true, 'First name is required']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required']
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    archive: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

// exports.usersSchema = usersSchema;

usersSchema.plugin(mongoosePaginate);

const Users = mongoose.model("users", usersSchema);

module.exports = Users;
