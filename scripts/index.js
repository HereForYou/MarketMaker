const prompt = require("prompt-sync")();
const { DECIMAL, myAddress } = require("./constant.js");
const {
  // createWallets,
  // genNumOfWallets,
  // allocationTokensToWallet,
  // loadWallets,
  // distributeTokensToWallet,
  // exploreBuyOrSell,
  // initializeTokensToWallet,
  writeWalletsToJsonFile,
  exploreBuyOrSellIndividually,
} = require("./functions.js");
const {
  approveBleggsToRouter,
  // transferBleggs,
  // transferBnb,
} = require("./web3.js");
// const { testAddress, testAddress1 } = require("./constant.js");
// const getBNBPrice = require("./getBNBPrice.js");
// const bnbBalance = [];
// const bleggsBalance = [];
let wallets = [];

// const main = async () => {
//   // await approveBleggsToRouter(bleggsAmount);
//   // // const numOfWallets = await genNumOfWallets(bnbAmount);
//   // // console.log(numOfWallets);
//   // wallets = await createWallets(numOfWallets);
//   // console.log("this is wallets > ", wallets.length);
//   // await distributeTokensToWallet(bnbAmount, bleggsAmount, numOfWallets);
//   // await exploreBuyOrSell(buyRate);
//   // await transferBleggs("0x68Ce132964F58b9bAaC706AB98cB72cCB04fe107", bleggsAmount)
//   // await loadWallets();
//   // await allocationTokensToWallet(bnbAmount, bleggsAmount);
//   // await transferBnb(testAddress1, 0.001);
// };

// const mainFunction = async () => {
//   //======================== input the BNB and BLEGGS token amount
//   const bnbAmount = prompt("Enter the amount of BNB token: ");

//   let bleggsAmount = 0;
//   while (bleggsAmount < 240000) {
//     bleggsAmount = prompt("Enter the amount of Bleggs token: ");
//   }

//   //================================================= approve bleggs that you input to router =================================================
//   // await approveBleggsToRouter(bleggsAmount);

//   const numOfWallets = prompt("Enter the number of wallets: ");
//   const buyRate = prompt(
//     "Enter the rate of buy transactions(Must be between 1 and 100): "
//   );

//   //====================================== create number of wallets according to the number you input =========================================
//   wallets = await createWallets(numOfWallets);

//   //========================================== distribute BNB and Bleggs token through the wallets ============================================
//   await distributeTokensToWallet(bnbAmount, bleggsAmount, numOfWallets);
//   await initializeTokensToWallet();

//   await exploreBuyOrSell(buyRate);

//   // console.log("wallets", wallets);
// };

const mainFunctionUsingAlgorithm = async () => {
  console.log("start main function");
  //======================== input the BNB and BLEGGS token amount
  const bnbAmount = prompt("🖍️  Enter the amount of BNB token: ");

  // let bleggsAmount = 0;
  // while (bleggsAmount < 240000) {
  let bleggsAmount = prompt("🖍️  Enter the amount of Bleggs token: ");
  // }

  //================================================= approve bleggs that you input to router ========= tested successfully ========================================
  // console.log("=====> approving");
  // await approveBleggsToRouter(bleggsAmount * DECIMAL, myAddress);
  // console.log("=====> approving success");

  const numOfUsers = prompt("🖍️  Enter the number of wallets: ");

  const buyRate = prompt("🖍️  Enter the rate of buy transactions(Must be between 1 and 100): ");

  await exploreBuyOrSellIndividually(bnbAmount, bleggsAmount, buyRate, numOfUsers);

  await writeWalletsToJsonFile();

  console.log("wallets", wallets);
};

mainFunctionUsingAlgorithm();
// mainFunction();
