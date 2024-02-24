const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongodbStore = require("connect-mongodb-session")(session);
require("dotenv").config();
const { allowCrossDomain } = require("./controller/common-controller");
// local
const apiRoutes = require("./routes/api-routes");
const otpGenerator = require("otp-generator");
const DATABASE_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER_URL}/${process.env.DATABASE_NAME}`;

const app = express();
const mongoSessionStore = new MongodbStore({
  uri: DATABASE_URL,
  collection: "book-mart-sessions",
});
app.use(allowCrossDomain);
app.use(
  session({
    resave: false,
    secret: "123456",
    saveUninitialized: false,
    store: mongoSessionStore,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/* app.use((req, res, next) => {
  const otp = otpGenerator.generate(6);
  res.setHeader('Set-Cookie',`otp = ${otp}`)
  next();
}); */
app.use("/api/book-mart", apiRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Wrong API" });
});
mongoose
  .connect(DATABASE_URL)
  .then((response) => {
    console.log("Database connected!");
    app.listen(process.env.PORT || 8000);
  })
  .catch((error) => {
    console.log(error);
  });
