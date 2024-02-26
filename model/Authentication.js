const { Schema, model } = require("mongoose");

const AuthenticationSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});
module.exports = model("Authentication", AuthenticationSchema);
