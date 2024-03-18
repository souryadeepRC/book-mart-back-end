const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const { allowCrossDomain } = require("./controller/common-controller");
// local
const apiRoutes = require("./routes/api-routes");
// socket
const Socket = require("./socket");
const SocketController = require("./socket/SocketController");
const DATABASE_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER_URL}/${process.env.DATABASE_NAME}`;

const app = express();

app.use(allowCrossDomain);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/book-mart", apiRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Wrong API" });
});
mongoose
  .connect(DATABASE_URL)
  .then((response) => {
    console.log("Database connected!");
    const server = app.listen(process.env.PORT || 8000);
    const io = Socket.init(server);
    io.on("connection", SocketController.connectSocket);
  })
  .catch((error) => {
    console.log(error);
  });
