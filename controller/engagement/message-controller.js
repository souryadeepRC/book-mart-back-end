const ChatRoom = require("../../model/ChatRoom");
const Message = require("../../model/Message");
const User = require("../../model/User");
const { sendErrorResponse } = require("../../utils/common-utils");

module.exports.getMessageBuddies = async (req, res) => {
  const response = await User.findById(req.userId)
    .select("chatBuddies -_id")
    .populate([
      {
        path: "chatBuddies.buddy",
        model: "User",
        select: "username imageUrl",
      },
      {
        path: "chatBuddies.chatRoom",
        model: "ChatRoom",
        select: "latestMessage updated_ts",
      },
    ])
    .lean();

  const chatBuddies = response.chatBuddies;
  chatBuddies.sort((a, b) => b.chatRoom.updated_ts - a.chatRoom.updated_ts);
  res.status(200).json(chatBuddies);
};

const createNewChatRoom = async ({ sender, receiver, message, timestamp }) => {
  const createdChatRoom = await ChatRoom.create({
    members: [sender, receiver],
    latestMessage: message,
    updated_ts: timestamp,
  });
  if (!createdChatRoom) {
    throw new Error("Error while creating Chat room");
  }
  return createdChatRoom._id;
};
const updateChatRoom = async (chatRoomId, { timestamp, message }) => {
  const updatedChatRoom = await ChatRoom.findByIdAndUpdate(chatRoomId, {
    $set: {
      updated_ts: timestamp,
      latestMessage: message,
    },
  });
  if (!updatedChatRoom) {
    throw new Error("Error while updating Chat room");
  }
};
module.exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;
    const enteredMessage = {
      sender,
      receiver,
      message,
      timestamp: Date.now(),
    };
    let existingChatRoom = await ChatRoom.findOne({
      members: { $all: [sender, receiver] },
    });
    let chatRoomId;
    if (!existingChatRoom) {
      chatRoomId = await createNewChatRoom(enteredMessage);
    } else {
      chatRoomId = existingChatRoom._id;
      await updateChatRoom(chatRoomId, enteredMessage);
    }
 
    const createdMessage = await new Message({
      chatRoomId,
      ...enteredMessage,
    }).save();

    if (!createdMessage) {
      throw new Error("Error creating Message");
    }
    res.status(200).json(createdMessage);
  } catch (err) {
    sendErrorResponse(res)(err);
  }
};
