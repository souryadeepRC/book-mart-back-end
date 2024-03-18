let io;
module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer, {
      /* pingTimeout: 60 * 1000, */
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error("Socket connection not established");
    }
    return io;
  },
};
