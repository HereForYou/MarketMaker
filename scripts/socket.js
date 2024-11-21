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
      socket.emit("connected", { msg: "connected" });
      sockets[socket.id] = socket;

      socket.on("disconnect", () => {});
    });
  },
  socketIo: socketIo,
  socketEmit: (socketId, data) => {
    sockets[socketId].emit("log", { log: data });
  },
  getSocketById,
};
