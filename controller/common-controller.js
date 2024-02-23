const { sendErrorResponse, fetchBearerToken, verifyToken } = require("../utils/common-utils");

module.exports.allowCrossDomain = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
  res.header(`Access-Control-Allow-Headers`, `Content-Type`);
  res.header(`Access-Control-Allow-Headers`, `Authorization`);
  next();
};

module.exports.isAuth = (req, res, next) => {
  let decodedToken;
  try {
    const userAccessToken = fetchBearerToken(req);
    decodedToken = verifyToken(
      userAccessToken,
      process.env.AUTH_TOKEN_SECRET_KEY
    );
  } catch (err) {
    throw err;
  }
  if (!decodedToken) {
    throw new Error("Not Authenticated");
  }
  req.userId = decodedToken.id;
  next();
};
