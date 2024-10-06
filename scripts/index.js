const prompt = require("prompt-sync")();
const { DECIMAL, myAddress } = require("./constant.js");
const { writeWalletsToJsonFile, exploreBuyOrSellIndividually } = require("./functions.js");

const mainFunctionUsingAlgorithm = async () => {
  //================================================================================== input the BNB and BLEGGS token amount
  const bnbAmount = prompt("🖍️  Enter the amount of BNB token: ");

  const bleggsAmount = prompt("🖍️  Enter the amount of Bleggs token: ");

  //================================================================================== input number of wallets that used for buy and sell
  const numOfUsers = prompt("🖍️  Enter the number of wallets: ");

  //================================================================================== input the rate of buy wallets
  const buyRate = prompt("🖍️  Enter the rate of buy transactions(Must be between 1 and 100): ");

  //================================================================================== main function perform buy and sell events
  await exploreBuyOrSellIndividually(bnbAmount, bleggsAmount, buyRate, numOfUsers);

  // await writeWalletsToJsonFile();
};

mainFunctionUsingAlgorithm();
