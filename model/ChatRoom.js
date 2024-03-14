const { Schema, model } = require("mongoose");
const User = require("./User");

const ChatRoomSchema = new Schema({
  members: {
    type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
  latestMessage: String,
  updated_ts: {
    type: Date,
    default: Date.now,
  },
});
ChatRoomSchema.index({ updated_ts: -1 });
ChatRoomSchema.pre("save", async function (next) {
  
  try {
    const [sender, receiver] = this.members; 

    const savedSender = await User.findByIdAndUpdate(sender, {
      $push: {
        chatBuddies: {
          buddy: receiver,
          chatRoom: this._id,
        },
      },
    });
    const savedReceiver = await User.findByIdAndUpdate(receiver, {
      $push: {
        chatBuddies: { buddy: sender, chatRoom: this._id },
      },
    });
    next();
  } catch (error) {
    // Pass error to the next middleware
    next(error);
  }
});
module.exports = model("ChatRoom", ChatRoomSchema);
