const express = require("express");
const {
  checkAuthExistence,
  createAuthentication,
  loginAuthentication,
  verifyAuthenticationOtp,
  resendAuthenticationOtp,
} = require("../controller/auth-controller");
const { isAuth } = require("../controller/common-controller");

const router = express.Router();

router.post("/check-auth-exist", checkAuthExistence);
router.post("/create-authentication", createAuthentication);
router.post("/login", loginAuthentication);

router.post("/verify-auth-otp", isAuth, verifyAuthenticationOtp);
router.get("/resend-auth-otp", isAuth, resendAuthenticationOtp);

module.exports = router;
