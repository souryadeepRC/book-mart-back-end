const { Schema, model } = require("mongoose");

const UserSessionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  accessToken: {
    type: String,
    required: true,
  }, 
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 10 * 60,
  },
});
module.exports = model("UserSession", UserSessionSchema);
