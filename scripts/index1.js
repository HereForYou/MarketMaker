const prompt = require("prompt-sync")();
const {
  createWallets,
  genNumOfWallets,
  allocationTokensToWallet,
  loadWallets,
} = require("./functions.js");
// const getBNBPrice = require("./getBNBPrice.js");
const bnbBalance = [];
const bleggsBalance = [];

//======================== input the BNB and BLEGGS token amount
const bnbAmount = prompt("Enter the amount of BNB token: ");
let bleggsAmount = 0;
while (bleggsAmount < 240000) {
  bleggsAmount = prompt("Enter the amount of Bleggs token: ");
}
const buyRate = prompt("Enter the rate of buy transactions: ");

const main = async () => {
  // const numOfWallets = await genNumOfWallets(bnbAmount);
  // console.log(numOfWallets);
  // await createWallets(numOfWallets);
  await loadWallets();
  await allocationTokensToWallet(bnbAmount, bleggsAmount);
};

main();
