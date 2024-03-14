const { Schema, model } = require("mongoose");
const User = require("./User");

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

// Define pre middleware to execute before removing a document from MainSchema
AuthenticationSchema.pre("findOneAndDelete", async function (next) {
  try {
    const authId = this.getFilter()._id;
    await User.deleteOne({ authId });
    // Proceed to the next middleware
    next();
  } catch (error) {
    // Pass error to the next middleware
    next(error);
  }
});

module.exports = model("Authentication", AuthenticationSchema);
