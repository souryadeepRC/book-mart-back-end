const bcryptjs = require("bcryptjs");
// utils
const {
  sendErrorResponse,
  generateOtp,
  verifyToken,
  createAuthToken,
} = require("../utils/common-utils");
// model
const Authentication = require("../model/Authentication");
const User = require("../model/User");
const UserOtp = require("../model/UserOtp");
const UserSession = require("../model/UserSession");
const UserBuddy = require("../model/UserBuddy");

// =============================== handler functions

// =============================== controller functions
// POST || CHECK USER EXISTENCE BEFORE  SIGN UP USER
module.exports.checkAuthExistence = async (req, res) => {
  try {
    const email = req.body.email;
    const auth = await Authentication.findOne({ email });

    if (auth) {
      throw new Error(`User with email ${email} already exist`);
    }
    res
      .status(200)
      .json({ isUserExist: false, message: "User does not exist" });
  } catch (err) {
    sendErrorResponse(res)(err);
  }
};
// POST ||  LOGIN USER
module.exports.loginAuthentication = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (req.headers.authorization) {
      throw new Error("Please complete the login open in other tab");
    }
    // --- VERIFY CREDENTIALS
    const auth = await Authentication.findOne({ email });
    if (!auth) {
      throw new Error("We cannot find an account with that email address");
    }
    const isAuthenticated = await bcryptjs.compare(password, auth.password);
    if (!isAuthenticated) {
      throw new Error(`Dear ${auth.email} please enter correct password`);
    }

    // --- GENERATE OTP
    const { otp, otpToken } = generateOtp(auth._id);
    // create a record for user otp and store otp-token (user id + otp value)
    /*  const userOtp = await UserOtp.findOne({ userId: auth._id });
    if (userOtp) {
      throw new Error("Already logged in in another device");
    } */
    // create user authentication token
    const { token: authToken, expiryDate } = createAuthToken(
      process.env.AUTH_TOKEN_SECRET_KEY,
      { id: auth._id },
      10 * 60
    );
    const savedUserOtp = await new UserOtp({
      authId: auth._id,
      otpToken,
      authToken,
    }).save();
    if (!savedUserOtp) {
      throw new Error("ERROR in OTP generation");
    }

    // sending authentication SUCCESS response
    res.status(200).json({
      otp,
      expiryDate: expiryDate,
      authToken,
    });
  } catch (error) {
    sendErrorResponse(res)(error); // sending general ERROR response
  }
};
// POST || RESEND AUTH OTP
module.exports.resendAuthenticationOtp = async (req, res) => {
  try {
    const userOtp = await UserOtp.findOne({
      authId: req.authId,
      authToken: req.authToken,
    });

    // --- GENERATE OTP
    const { otp, otpToken } = generateOtp(req.authId);
    let savedUserOtp;
    if (userOtp) {
      userOtp.otpToken = otpToken;
      savedUserOtp = userOtp;
    } else {
      // OTP Expired
      savedUserOtp = await new UserOtp({
        authId: req.authId,
        otpToken,
        authToken: req.authToken,
      });
    }
    savedUserOtp
      .save()
      .then((response) => res.status(200).json({ otp }))
      .catch(sendErrorResponse(res));
  } catch (err) {
    sendErrorResponse(res)(err);
  }
};

// POST ||  VERIFY AUTH OTP
module.exports.verifyAuthenticationOtp = async (req, res) => {
  const { otp: enteredOtp } = req.body;

  try {
    const userOtp = await UserOtp.findOne({
      authId: req.authId,
      authToken: req.authToken,
    });
    if (!userOtp) {
      throw new Error("OTP expired");
    }

    // verify OTP token fetched from user-otp database
    const { otp, id: authId } = verifyToken(
      userOtp.otpToken,
      process.env.AUTH_TOKEN_SECRET_KEY
    );

    if (otp !== enteredOtp || userOtp.authId.toString() !== authId.toString()) {
      throw new Error("Invalid OTP");
    }
    //  user id and OTP is matched -- Send a new user token() and remove user-otp db record
    const { acknowledged, deletedCount } = await UserOtp.deleteOne({
      authId: userOtp.authId,
      otpToken: userOtp.otpToken,
    });
    if (!acknowledged || deletedCount === 0) {
      throw new Error("Not able to remove User OTP");
    }

    const savedUser = await User.findOne({ authId: userOtp.authId });
    const { token, expiryDate } = createAuthToken(
      process.env.USER_TOKEN_SECRET_KEY,
      { id: savedUser._id },
      24 * 60 * 60 * 60
    );
    const existingSession = await UserSession.findOne({
      userId: savedUser._id,
    });
    let userSession;
    if (existingSession) {
      existingSession.accessToken = token;
      userSession = await existingSession.save();
    } else {
      userSession = await new UserSession({
        userId: savedUser._id,
        accessToken: token,
      }).save();
    }
    if (userSession) {
      res.status(200).json({ accessToken: token, expiryDate });
    }
  } catch (err) {
    sendErrorResponse(res)(err);
  }
};

// POST || CHECK USER AUTH
module.exports.checkUserAuth = (req, res) => {
  try {
    if (!req.userId) {
      throw new Error("User not authenticated");
    }
    res.status(200).json({ isUserAuthenticated: true });
  } catch (err) {
    sendErrorResponse(res)(err);
  }
};

module.exports.logoutAuthentication = (req, res) => {
  UserSession.deleteOne({ userId: req.userId })
    .then(({ acknowledged, deletedCount }) => {
      if (!acknowledged || deletedCount === 0) {
        throw new Error("User Logged out already or Session expired");
      }
      res.status(200).json({ isLoggedOut: true });
    })
    .catch(sendErrorResponse(res));
};

//  POST || CREATE USER
module.exports.createAuthentication = async (req, res) => {
  const { email, username } = req.body.account;
  const { password } = req.body.password;
  try {
    const encryptedPassword = await bcryptjs.hash(password, 12);
    if (!encryptedPassword) {
      throw new Error("Error while encrypting password");
    }
    const savedAuth = await new Authentication({
      email,
      password: encryptedPassword,
      username,
    }).save();

    if (!savedAuth) {
      throw new Error("User Exist");
    }
    const savedUser = await new User({
      authId: savedAuth._id,
      email,
      username,
      personal: req.body.personal,
      address: req.body.address,
      contact: req.body.contact,
    }).save();

    if (!savedUser) {
      throw new Error("Error creating user");
    }
    const { token, expiryDate } = createAuthToken(
      process.env.USER_TOKEN_SECRET_KEY,
      { id: savedUser._id },
      10 * 60 * 60
    );
    const userSession = await new UserSession({
      userId: savedUser._id,
      accessToken: token,
    }).save();

    if (userSession) {
      res.status(200).json({ accessToken: token, expiryDate });
    }
  } catch (err) {
    sendErrorResponse(res)(err);
  }
};
