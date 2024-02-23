const jwt = require("jsonwebtoken");
// utils
const { sendResponse, sendErrorResponse } = require("../utils/common-utils");
// model
const User = require("../model/User");

const fetchUserDetails = (req, res) => { 
  try {
    User.findOne({ userId: req.userId })
      .select("-_id -userId")
      .then((user) => sendResponse(res, user))
      .catch(sendErrorResponse(res));
  } catch (err) {
    sendErrorResponse(res)(err);
  }
};

module.exports = { fetchUserDetails };
