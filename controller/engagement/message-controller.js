// common controller
const { sendErrorResponse } = require("../../utils/common-utils");
// model
const ChatRoom = require("../../model/ChatRoom");
const Message = require("../../model/Message");
const User = require("../../model/User");
// socket
const Socket = require("../../socket");
const SocketController = require("../../socket/SocketController");

module.exports.getChatRooms = async (req, res) => {
  const { page, pageSize } = req.body;
  const response = await ChatRoom.find({ members: { $in: req.userId } })
    .sort({ updated_ts: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .populate([
      {
        path: "members",
        model: "User",
        select: "username imageUrl",
      },
    ])
    .lean();
  const rooms = response.map((chatRoom) => {
    const existingMembers = [...chatRoom.members];
    return {
      ...chatRoom,
      members: existingMembers.filter(
        (member) => member._id.toString() !== req.userId.toString()
      ),
    };
  });
  res.status(200).json({
    page: Number(page),
    pageSize: Number(pageSize),
    count: rooms.length,
    isLastPage: rooms.length < pageSize,
    rooms,
  });
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
const updateChatRoom = async (roomId, { timestamp, message }) => {
  const updatedChatRoom = await ChatRoom.findByIdAndUpdate(roomId, {
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
    const { roomId, sender, receiver, message } = req.body;
    const enteredMessage = {
      sender,
      receiver,
      message,
      timestamp: Date.now(),
    };

    let chatRoomId;
    if (!roomId) {
      chatRoomId = await createNewChatRoom(enteredMessage);
    } else {
      chatRoomId = roomId;
      await updateChatRoom(chatRoomId, enteredMessage);
    }

    const createdMessage = await new Message({
      roomId: chatRoomId,
      ...enteredMessage,
    }).save();

    if (!createdMessage) {
      throw new Error("Error creating Message");
    }

    const receiverRoom = createdMessage.receiver.toString();
    SocketController.sendMessage(
      Socket.getIo().in(receiverRoom),
      "/user/engagement/chatMessage",
      "add-message",
      createdMessage
    );

    res.status(200).json(createdMessage);
  } catch (err) {
    sendErrorResponse(res)(err);
  }
};
const fetchRoomMemberDetails = async (roomId) => {
  return await ChatRoom.findById(roomId)
    .select("members -_id")
    .populate("members", "imageUrl username")
    .lean();
};
module.exports.getMessages = async (req, res) => {
  try {
    const { roomId, page, pageSize } = req.body;
    let roomDetails;
    try {
      if (page == 1) {
        const memberDetails = await fetchRoomMemberDetails(roomId);
        const members = memberDetails?.members?.filter(
          (member) => member._id.toString() !== req.userId.toString()
        );
        roomDetails = {
          members,
        };
      }
    } catch (err) {
      throw new Error(err.message);
    }
    const messages = await Message.find({ roomId })
      .sort({ timestamp: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();
    if (!messages) {
      throw new Error("Message Not found!");
    }
    res.json({
      page: Number(page),
      pageSize: Number(pageSize),
      count: messages.length,
      isLastPage: messages.length < pageSize,
      messages,
      roomDetails,
    });
  } catch (err) {
    sendErrorResponse(res)(err);
  }
};
