const UserSession = require("../model/UserSession");
const { verifyToken, sendErrorResponse } = require("../utils/common-utils");

module.exports.allowCrossDomain = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
  res.header(`Access-Control-Allow-Headers`, `Content-Type`);
  res.header(`Access-Control-Allow-Headers`, `Authorization`);
  next();
};

module.exports.isAuth = (req, res, next) => {
  let decodedToken;
  let userAccessToken;
  try {
    const bearerToken = req.headers.authorization;
    userAccessToken = bearerToken?.replace(/^Bearer\s+/, "");
    decodedToken = verifyToken(
      userAccessToken,
      process.env.AUTH_TOKEN_SECRET_KEY
    );
  } catch (err) {
    return sendErrorResponse(res, 401)(new Error("Suspicious login detected"));
  }
  if (!decodedToken) {
    return sendErrorResponse(res, 401)(new Error("User Not Authenticated"));
  }
  req.authId = decodedToken.id;
  req.authToken = userAccessToken;
  next();
};

module.exports.isUserAuthenticated = async (req, res, next) => {
  let decodedToken;
  let userAccessToken;
  try {
    const bearerToken = req.headers.authorization;
    userAccessToken = bearerToken?.replace(/^Bearer\s+/, "");
    decodedToken = verifyToken(
      userAccessToken,
      process.env.USER_TOKEN_SECRET_KEY
    );
  } catch (err) {
    return sendErrorResponse(res, 401)(new Error("Token Expired"));
  }
  if (!decodedToken) {
    return sendErrorResponse(res, 401)(new Error("Not Authenticated"));
  }
  const userSession = await UserSession.findOne({
    userId: decodedToken.id,
    accessToken: userAccessToken,
  });
  if (!userSession) {
    return sendErrorResponse(
      res,
      401
    )(new Error("User Logged out already or Session expired"));
  }

  req.userId = decodedToken.id;
  next();
};
