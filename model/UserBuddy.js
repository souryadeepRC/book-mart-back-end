const { Schema, model } = require("mongoose");

const UserBuddySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  buddyList: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
      name: {
        type: String,
        required: true,
      },
      imageUrl: String,
    },
  ],
  buddyMessages: [
    {
      buddyId: {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
      messages: [
        {
          userId: {
            type: Schema.Types.ObjectId,
            ref: "user",
          },
          message: String,
        },
      ],
    },
  ],
});
module.exports = model("UserBuddy", UserBuddySchema);
