const { Schema, model } = require("mongoose");

const UserOtpSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Authentication",
  },
  otpToken: String,
});
module.exports = model("UserOtp", UserOtpSchema);
