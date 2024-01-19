const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const { Schema } = mongoose;

const usersSchema = new Schema(
  {
    firstName: {
        type: String,
        required: [true, 'first name is required']
    },
    lastName: {
        type: String, 
        required: [true, 'last name is required']
    },
    email: {
        type: String, 
        required: [true, 'email is required']
    },
  },
  { timestamps: true }
);

// exports.usersSchema = usersSchema;

usersSchema.plugin(mongoosePaginate);

const Users = mongoose.model("users", usersSchema);

module.exports = Users;
