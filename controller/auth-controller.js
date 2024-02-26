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
// POST ||  SIGN UP USER
module.exports.createAuthentication = async (req, res) => {
  const { email, password, username, ...userDetails } = req.body;
  try {
    const auth = await Authentication.findOne({ email });

    if (auth) {
      // check already exist authentication
      throw new Error(`User with email ${email} already exist`);
    }
    // encrypt the password
    const encryptedPassword = await bcryptjs.hash(password, 12);

    // create authentication record
    const createdAuth = await new Authentication({
      email,
      password: encryptedPassword,
      username,
    }).save(); // storing authentication record

    // create user record based on authentication
    new User({
      ...userDetails,
      email,
      username,
      userId: createdAuth._id,
    })
      .save() // storing user record based on authentication
      .then((createdUser) => res.status(200).json(createdUser)) // sending user SUCCESS response
      .catch(sendErrorResponse(res)); // sending user record ERROR response
  } catch (error) {
    sendErrorResponse(res)(err); // sending general ERROR response
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
      userId: auth._id,
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
      userId: req.userId,
      authToken: req.authToken,
    });

    // --- GENERATE OTP
    const { otp, otpToken } = generateOtp(req.userId);
    let savedUserOtp;
    if (userOtp) {
      userOtp.otpToken = otpToken;
      savedUserOtp = userOtp;
    } else {
      // OTP Expired
      savedUserOtp = await new UserOtp({
        userId: req.userId,
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
      userId: req.userId,
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

    if (otp !== enteredOtp || userOtp.userId.toString() !== authId.toString()) {
      throw new Error("Invalid OTP");
    }
    //  user id and OTP is matched -- Send a new user token() and remove user-otp db record
    const { acknowledged, deletedCount } = await UserOtp.deleteOne({
      userId: userOtp.userId,
      otpToken: userOtp.otpToken,
    });
    if (!acknowledged || deletedCount === 0) {
      throw new Error("Not able to reset User OTP");
    }

    const { token, expiryDate } = createAuthToken(
      process.env.USER_TOKEN_SECRET_KEY,
      { id: userOtp.userId },
      10 * 60 * 60
    );

    res.status(200).json({ accessToken: token, expiryDate });
  } catch (err) {
    sendErrorResponse(res)(err);
  }
};
