let socketIo;
let sockets = [];

const getSocketById = (socketId) => {
  return sockets[socketId];
};

module.exports = {
  init: (http) => {
    socketIo = require("socket.io")(http, {
      cors: "*",
    });

    socketIo.on("connection", (socket) => {
      console.log(`⚡ ${socket.id} has connected.`);
      socket.emit("connected", { msg: "connected" });
      sockets[socket.id] = socket;

      socket.on("disconnect", () => {
        console.log(`🔥 ${socket.id} has disconnected!`);
      });
    });
  },
  socketIo: socketIo,
  socketEmit: (socketId, data) => {
    console.log("socket logging", data);
    sockets[socketId].emit("log", { log: data });
  },
  getSocketById,
};
