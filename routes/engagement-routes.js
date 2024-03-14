const express = require("express");
const router = express.Router();
const Message = require("../model/ChatRoom");
const {
  getMessageBuddies,
  sendMessage,
} = require("../controller/engagement/message-controller");
const { isUserAuthenticated } = require("../controller/common-controller");
const User = require("../model/User");
const MessageConnection = require("../model/ChatRoom");

router.get("/message/buddies", isUserAuthenticated, getMessageBuddies);
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

router.post("/message/send-message", isUserAuthenticated, sendMessage);
module.exports = router;
