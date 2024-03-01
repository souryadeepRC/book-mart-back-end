const express = require("express");
const {
  checkAuthExistence,
  createAuthentication,
  loginAuthentication,
  logoutAuthentication,
  verifyAuthenticationOtp,
  resendAuthenticationOtp,
  checkUserAuth,
} = require("../controller/auth-controller");
const {
  isAuth,
  isUserAuthenticated,
} = require("../controller/common-controller");

const router = express.Router();

router.post("/check-auth-exist", checkAuthExistence);
router.post("/create-authentication", createAuthentication);
router.post("/login", loginAuthentication);
router.get("/logout", isUserAuthenticated, logoutAuthentication);

router.post("/verify-auth-otp", isAuth, verifyAuthenticationOtp);
router.get("/resend-auth-otp", isAuth, resendAuthenticationOtp);

router.get("/check-auth", isUserAuthenticated, checkUserAuth);

module.exports = router;
