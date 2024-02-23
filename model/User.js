const { Schema, model } = require("mongoose");
const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    require: true,
  },
  personal: {
    name: {
      firstName: String,
      middleName: String,
      lastName: String,
    },
  },
  contact: {
    primary: {
      code: String,
      value: String,
    },
    secondary: {
      code: String,
      value: String,
    },
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Authentication",
  },
});

module.exports = model("User", UserSchema);
