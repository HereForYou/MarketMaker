const { Web3 } = require("web3");
const fs = require("fs");

const { bleggsAddress, BNBPERTEST, DECIMAL, mainTokenAddress } = require("./constant");

let MIN_SELL;
let MIN_BUY;
let MAX_SELL;
let MAX_BUY;

const {
  approveBleggsToRouter,
  transferBleggs,
  transferBnb,
  swapExactETHForTokens,
  privateKeyToAccount,
  setMyAccount,
  createWallet,
  getBNBPrice,
  getBleggsPrice,
  swapExactTokensForETHSupportingFeeOnTransferTokens,
} = require("./web3");

const { socketEmit } = require("./socket");
const wallets = [];
let totalBalanceOfBnb = 0;
let totalBalanceOfBleggs = 0;

const initializeVariables = (minS, maxS, minB, maxB) => {
  MIN_BUY = minB;
  MAX_BUY = maxB;
  MIN_SELL = minS;
  MAX_SELL = maxS;
  console.log(MIN_BUY, MAX_BUY, MIN_SELL, MAX_SELL);
};

//-----------------------------------------------------------------------------------------------------
//-               save wallets to ../db/wallets.txt file             Successfully tested              -
//-----------------------------------------------------------------------------------------------------
const writeWalletsToTxtFile = async (data) => {
  try {
    fs.appendFileSync("./db/wallets.txt", "\n" + data);
  } catch (err) {
    console.log("Err: ", err);
  }
};

// const writeWalletsToJsonFile = async () => {
//   const jsonWallet = JSON.stringify(wallets);
//   fs.writeFileSync("/db/wallets.json", jsonWallet);
// };

//-----------------------------------------------------------------------------------------------------
//-               generate random amount of BNB in specific range    Successfully tested              -
//-----------------------------------------------------------------------------------------------------
const generateRandomBnb = async () => {
  let price = await getBNBPrice();
  return ((Math.random() * (MAX_BUY - MIN_BUY) + MIN_BUY) / price) * DECIMAL;
};

//-----------------------------------------------------------------------------------------------------
//-               generate random amount of BLEGGS in specific range    Successfully tested           -
//-----------------------------------------------------------------------------------------------------
const generateRandomBleggs = async () => {
  let price = await getBleggsPrice();
  return ((Math.random() * (MAX_SELL - MIN_SELL) + MIN_SELL) / price) * DECIMAL;
};

//-----------------------------------------------------------------------------------------------------
//-               delay the execution of function for nationality of markeet    Successfully tested   -
//-----------------------------------------------------------------------------------------------------
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//-----------------------------------------------------------------------------------------------------
//-               get the maximum number less than specific float number        Successfully tested   -
//-----------------------------------------------------------------------------------------------------
function floor(num) {
  return Math.floor(num);
}

//-----------------------------------------------------------------------------------------------------
//-               main function                                      Successfully tested              -
//-----------------------------------------------------------------------------------------------------
const exploreBuyOrSellIndividually = async (bnbAmount, bleggsAmount, numOfUsers, buyRate, privateKey, socketId) => {
  //total bnb and bleggs you inputed for marketing
  console.log("😀 Main function is started!!!");
  socketEmit(socketId, "😀 Main function is started!!!");
  totalBalanceOfBnb = bnbAmount * DECIMAL;
  totalBalanceOfBleggs = bleggsAmount * DECIMAL;
  let test = { buy: 0, sell: 0 };
  setMyAccount(privateKey);

  //looping from on to events that you inputed
  for (let i = 0; i < numOfUsers; i++) {
    // generate random number for determining whether buy or sell
    const random = Math.round(Math.random() * 100);
    const wallet = await createWallet();
    let bleggsPrice = await getBleggsPrice();
    let bnbPrice = await getBNBPrice();
    console.log(`🟣 ${i + 1}th user`, wallet.address, wallet.privateKey);
    socketEmit(socketId, `🟣 ${i + 1}th user ` + wallet.privateKey);
    if (random <= buyRate) {
      await writeWalletsToTxtFile("Buy wallet " + wallet.address + ", " + wallet.privateKey);
      // generate random amount of BNB to sell in range you want ($15 ~ $55 for test)
      test.buy += 1;
      const randomBnb = await generateRandomBnb();
      // true: bnb amount for but is less than the total bnb amount, otherwise: false
      if (randomBnb < totalBalanceOfBnb) {
        //================================================================== transferring bnb to wallet that buy the bleggs using randomBnb ===================
        await transferBnb(wallet.address, floor(randomBnb + BNBPERTEST) * DECIMAL, socketId);
        //================================================================== swap random amount of BNB for Bleggs token =======================================
        //================================================================== the addr is generated buy Bleggs token, then transferred the Bleggs to this addr =
        await swapExactETHForTokens(
          floor(randomBnb),
          0,
          [mainTokenAddress, bleggsAddress],
          wallet.address,
          100000000000000,
          wallet.address,
          socketId
        );
        totalBalanceOfBnb -= randomBnb + BNBPERTEST * DECIMAL;
        console.log("✅ BNB", randomBnb, "($", (randomBnb * bnbPrice) / DECIMAL, ")", "succesfully buyed.");
        socketEmit(
          socketId,
          "✅ BNB" + randomBnb + "($" + (randomBnb * bnbPrice) / DECIMAL + ")" + "succesfully buyed."
        );
      } else {
        //================================================================== log the warning message that total BNB amount is not enough for buy ==============
        console.log("🚫 Insufficient balance. BNB you set is not enough for purchasing");
        socketEmit(socketId, "🚫 Insufficient balance. BNB you set is not enough for purchasing");
      }
    } else {
      await writeWalletsToTxtFile("Sell wallet " + wallet.address + ", " + wallet.privateKey);
      const randomBleggs = await generateRandomBleggs();
      test.sell += 1;
      if (randomBleggs < totalBalanceOfBleggs) {
        //================================================================== transferring BLEGGS of randomBleggs amount to wallet that sell the BLEGGS ========
        await transferBleggs(wallet.address, floor(randomBleggs), socketId);
        await transferBnb(wallet.address, floor(BNBPERTEST * DECIMAL), socketId);
        await approveBleggsToRouter(floor(randomBleggs + 10 * DECIMAL), wallet.address, socketId);
        //================================================================== the wallet addr is generated sell Bleggs token, then transferred the BNB to this addr =========
        await swapExactTokensForETHSupportingFeeOnTransferTokens(
          floor(randomBleggs * 0.98),
          0,
          [bleggsAddress, mainTokenAddress],
          wallet.address,
          100000000000,
          wallet.address,
          socketId
        );
        totalBalanceOfBleggs -= randomBleggs;
        totalBalanceOfBnb -= BNBPERTEST * DECIMAL;
        console.log("✅ BLEGGS", randomBleggs, "($", (randomBleggs * bleggsPrice) / DECIMAL, ") succesfully sold.");
        socketEmit(
          socketId,
          "✅ BLEGGS" + randomBleggs + "($" + (randomBleggs * bleggsPrice) / DECIMAL + ") succesfully sold."
        );
      } else {
        console.log("🚫 Insufficient balance. BLEGGS you set is not enough for selling");
        socketEmit(socketId, "🚫 Insufficient balance. BLEGGS you set is not enough for selling");
      }
    }
  }
  console.log("🔵 Successfully finished!");
  socketEmit(socketId, "🔵 Successfully finished!");
};

module.exports = {
  exploreBuyOrSellIndividually,
  // writeWalletsToJsonFile,
  initializeVariables,
  writeWalletsToTxtFile,
};
