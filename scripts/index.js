const prompt = require("prompt-sync")();

const createWallets = require("./generateWallets.js");
const getBNBPrice = require("./getBNBPrice.js");

const countWallets = prompt("Enter the number of wallets to generate: ");
console.log(`Generating ${countWallets} wallets...`);
createWallets(countWallets);

const bnb = prompt("Enter the amount of BNB token: ");
const bnbPrice = getBNBPrice();
console.log(`1 BNB = ${bnbPrice} USDT`);
const bleggs = prompt("Enter the amount of Bleggs token: ");

