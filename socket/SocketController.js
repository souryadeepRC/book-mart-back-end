const connectSocketHandlers = (socket) => (userId) => {
  socket.join(userId);
  sendMessage(socket, "/user/engagement/join", "add-user", { id: socket.id });
};
const connectSocket = (socket) => {
  socket.on("setup", connectSocketHandlers(socket));

  socket.on("disconnect", (userId) => {
    socket.off("setup", connectSocketHandlers(socket));
    socket.leave(userId);
  });
};

const sendMessage = (socketConnection, topic, action, data) => {
  socketConnection.emit(topic, {
    action,
    data,
    timestamp: Date.now(),
  });
};

module.exports = { connectSocket, sendMessage };
