const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
module.exports.sendResponse = (res, data) => {
  if (!data) {
    throw new Error("User Not Found!");
  }
  return res.status(200).json(data);
};
module.exports.sendErrorResponse =
  (res, statusCode = 404) =>
  (error) => {
    res
      .status(statusCode)
      .json({ error_description: error.message || "Error Occurred!" });
  };

module.exports.verifyToken = (token, secretKey) => {
  return jwt.verify(token, secretKey, (err, decodedToken) => {
    if (err) {
      throw new Error(err.message);
    }
    return decodedToken;
  });
};

module.exports.createAuthToken = (secretKey, tokenParams, expiryTime) => {
  const expiryParams = expiryTime ? { expiresIn: expiryTime } : {};
  const token = jwt.sign(tokenParams, secretKey, expiryParams);
  const expiryDate = expiryTime
    ? new Date(Date.now() + expiryTime * 1000)
    : null;
  return {
    token,
    expiryDate,
  };
};
module.exports.generateOtp = (userId, otpLength = 4) => {
  try {
    const otpExpiryMin = 5;
    const generatedOtp = otpGenerator.generate(otpLength, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
      digits: true,
    });
    const otpToken = this.createAuthToken(
      process.env.AUTH_TOKEN_SECRET_KEY,
      { id: userId, otp: generatedOtp },
      otpExpiryMin * 60
    ).token;
    return {
      otp: { value: generatedOtp, expiresIn: `${otpExpiryMin} mins` },
      otpToken,
    };
  } catch (err) {
    throw err;
  }
};
