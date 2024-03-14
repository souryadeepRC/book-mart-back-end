const { Schema, model } = require("mongoose");

const MessageSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Authentication",
  },
  message: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  created_ts: {
    type: Date,
    default: Date.now,
  },
  updated_ts: {
    type: Date,
    default: null,
  },
});

module.exports = model("Message", MessageSchema);