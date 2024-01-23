const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;

const usersSchema = new Schema(
  {
    email: {
        type: String, 
        unique: true,
        required: [true, 'email is required']
    },
    userName: {
      type: String,
      required: [true, 'username is required']
  },
  userType: {
    type: String,
    default: "user",
    required: [true, 'usertype is required'],
    enum: { values: ['user', 'vendor'], message: '{VALUE} is not supported for userType field.' }
  },
    firstName: {
        type: String,
        required: [true, 'first name is required']
    },
    lastName: {
        type: String, 
        required: [true, 'last name is required']
    },
    password: {
        type: String, 
        required: [true, 'password is required']
    },
  },
  { timestamps: true }
);

// exports.usersSchema = usersSchema;

usersSchema.plugin(mongoosePaginate);

const Users = mongoose.model("users", usersSchema);

module.exports = Users;
