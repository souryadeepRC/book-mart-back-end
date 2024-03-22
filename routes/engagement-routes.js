const express = require("express");
const router = express.Router(); 
const {
  getChatRooms,
  getMessages,
  sendMessage, 
} = require("../controller/engagement/message-controller");
const { 
  sendBulkMessage,setupBulkChatRoom
} = require("../controller/unit-test-controller");
const { isUserAuthenticated } = require("../controller/common-controller");
const User = require("../model/User"); 


router.post("/message/chat-rooms", isUserAuthenticated, getChatRooms);
router.post("/message/get-messages", isUserAuthenticated, getMessages);
router.post("/message/send-message", isUserAuthenticated, sendMessage);

/* FOR UNIT TEST PURPOSE */
router.post("/message/send-bulk-messages", isUserAuthenticated, sendBulkMessage);
router.post("/message/set-bulk-chatroom", isUserAuthenticated, setupBulkChatRoom);
router.post("/message/add-buddy", isUserAuthenticated, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.userId },
    { $set: { buddyList: req.body.buddies } }
  )
    .then((response) => res.status(200).json(response))
    .catch((err) => res.status(400).json(err.message));
});
router.post("/message/add-message-buddy", isUserAuthenticated, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.userId },
    { $set: { messageBuddyList: req.body.buddies } }
  )
    .then((response) => res.status(200).json(response))
    .catch((err) => res.status(400).json(err.message));
});
/* FOR UNIT TEST PURPOSE */
module.exports = router;
