const express = require("express");
const { isUserAuthenticated } = require("../controller/common-controller");
const { fetchUserDetails } = require("../controller/user-controller");

const router = express.Router();

router.get("/user/me",isUserAuthenticated, fetchUserDetails);

module.exports = router;
