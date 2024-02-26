const { sendErrorResponse } = require("../utils/common-utils");
// model
const Message = require("../model/Message");
const { getIo } = require("../socket");
module.exports.sendMessage = async (req, res) => { 
  const { message, username } = req.body;
  const createdMessage = await new Message({
    userId: req.userId,
    message,
    username,
  }).save();

  if (!createdMessage) {
    throw new Error("Error creating new message!");
  } 
  getIo().emit("message", {
    action: "send",
    data: createdMessage,
  });
  res.status(200).json(createdMessage);
};
module.exports.getMessage = async (req, res) => {
  try {
    const messages = await Message.find().exec();
    if (!messages) {
      throw new Error("No Message Found!");
    }
    res.status(200).json(messages);
  } catch (err) {
    sendErrorResponse(res)(err);
  }
};
