const { Schema, model } = require("mongoose");

const UserOtpSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Authentication",
  },
  otpToken: {
    type: String,
    required: true,
  },
  authToken: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 5 * 60,
  },
});
module.exports = model("UserOtp", UserOtpSchema);
