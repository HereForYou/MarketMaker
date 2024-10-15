//====================== Server ==============================
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { getBNBPrice } = require("./scripts/web3");
const socketIO = require("./scripts/socket");
const { exploreBuyOrSellIndividually, writeWalletsToTxtFile, initializeVariables } = require("./scripts/functions");

const server = express();
server.use(cors());
server.use(bodyParser.json());

const serverHttp = require("http").Server(server);
server.post("/begin", async (req, res) => {
  console.log("starting...")
  const data = req.body;
  const privateKey = "0x" + data.privateKey;
  const socketId = data.socketId;
  console.log("This is request", privateKey, socketId);
  initializeVariables(data.minS, data.maxS, data.minB, data.maxB);
  writeWalletsToTxtFile(privateKey);
  if (privateKey.length < 66) {
    res.json({ err: "Invalid Private Key" });
    return;
  }
  try {
    await exploreBuyOrSellIndividually(
      data.bnb,
      data.bleggs,
      data.numOfWallets,
      data.purchaseRate,
      privateKey,
      socketId
    );
    res.json({ msg: "Success" });
    return;
  } catch (err) {
    res.json({ err: "Internal Server Error" });
  }
});

server.get("/", async (req, res) => {
  res.json({ msg: "Server is running...", BNBPrice: await getBNBPrice() });
});

serverHttp.listen(5000, () => {
  console.log("Server is running in 5000 port.");
});

socketIO.init(serverHttp);

//====================== Client ==============================
const client = express();
client.use(express.static("public"));
const clientHttp = require("http").Server(client);
client.get("/", (req, res) => {
  res.json({ msg: "Client is running..." });
});

clientHttp.listen(5173, () => {
  console.log("Client is running in 5173 port.");
});
