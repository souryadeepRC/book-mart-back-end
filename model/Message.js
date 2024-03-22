const { Schema, model } = require("mongoose");
const MessageSchema = new Schema({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: "ChatRoom",
  },
  sender: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  receiver: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});
MessageSchema.index({ sender: 1, receiver: 1, timestamp: 1 });
module.exports = model("Message", MessageSchema);
