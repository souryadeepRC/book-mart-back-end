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
  imageUrl: {
    type: String,
    default:
      "https://wallpapers.com/images/hd/random-person-on-a-bridge-7np8sxqy5phik5cc.jpg",
  },
  personal: {
    name: {
      firstName: String,
      middleName: String,
      lastName: String,
    },
  },
  address: {
    pinCode: String,
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
  authId: {
    type: Schema.Types.ObjectId,
    ref: "Authentication",
  },
  buddyList: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    default: [],
  },
  chatBuddies: {
    type: [
      {
        buddy: {
          type: Schema.Types.ObjectId,
          ref: "User", 
        },
        chatRoom: {
          type: Schema.Types.ObjectId,
          ref: "ChatRoom", 
        },
      },
    ],
    default: [],
  },
});

module.exports = model("User", UserSchema);
