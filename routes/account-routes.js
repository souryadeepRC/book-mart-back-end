const express = require("express");
const { isAuth } = require("../controller/common-controller");
const { fetchUserDetails } = require("../controller/user-controller");

const router = express.Router();

router.get("/user/me",isAuth, fetchUserDetails);

module.exports = router;
