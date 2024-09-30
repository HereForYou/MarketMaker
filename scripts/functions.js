const { Web3 } = require("web3");
const fs = require("fs");

const web3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545");

const {
  MIN_BUY,
  MAX_BUY,
  BUY_RATE,
  DECIMAL,
  BNBPERTEST,
  MIN_SELL,
  MAX_SELL,
} = require("./constant");

const { transferBleggs, transferBnb } = require("./web3");

const { getBNBPrice, getBleggsPrice } = require("./getBNBPrice");
const walletsFromJson = require("../db/wallets.json");
let bnbPrice = 0;
let bleggsPrice = 0;
const wallets = [];
let balanceOfBNB = [];
let balanceOfBleggs = [];
const averageBuy = (MIN_BUY + MAX_BUY) / 2;
const averageSell = (MIN_SELL + MAX_SELL) / 2;
let bnbPerUsd = 0;
let bleggsPerUsd = 0;

async function createWallets(n) {
  bnbPrice = await getBNBPrice();
  bleggsPrice = await getBleggsPrice();
  bnbPerUsd = DECIMAL / bnbPrice;
  bleggsPerUsd = DECIMAL / bleggsPrice;
  console.log("bleggsPerUsd", bleggsPerUsd);
  for (i = 0; i < n; i++) {
    // console.log(`Wallet #${i + 1} generated`);
    // Create wallet
    const tempWallet = web3.eth.accounts.create();
    // console.log(`Address: ${tempWallet.address}\n`);

    const wallet = {
      id: i,
      address: tempWallet.address,
      privateKey: tempWallet.privateKey,
      bnb: 0,
      bleggs: 0,
    };

    wallets.push(wallet);
  }

  const jsonWallets = JSON.stringify(wallets);
  fs.writeFileSync("../db/wallets.json", jsonWallets);
  console.log(`${wallets.length} wallets are created succesfully!`);
  return wallets;
}

const genNumOfWallets = async (bnbAmount) => {
  bnbPrice = await getBNBPrice();
  bleggsPrice = await getBleggsPrice();
  console.log("average > ", averageBuy, bnbAmount, bnbPrice);
  const numOfWallets = Math.round(
    bnbAmount / (BNBPERTEST + (averageBuy * BUY_RATE) / bnbPrice)
  );
  console.log("number of Wallets created newly > ", numOfWallets);
  return numOfWallets;
};

const loadWallets = async () => {
  console.log("wallets from json length", walletsFromJson.length);
  bnbPrice = await getBNBPrice();
  bleggsPrice = await getBleggsPrice();
  for (let i = 0; i < walletsFromJson.length; i++) {
    wallets.push(walletsFromJson[i]);
  }
  console.log("wallets length", wallets.length);
};

const allocationTokensToWallet = (bnbAmount, bleggsAmount) => {
  const totalBnb = bnbAmount * bnbPrice;
  const totalBleggs = bleggsAmount * bleggsPrice;
  console.log("BNB", totalBnb, "Bleggs", totalBleggs);
  const amountBNBForTest = BNBPERTEST * wallets.length * DECIMAL;
  console.log("testing", amountBNBForTest);

  let test = {
    bnb: 0,
    bleggs: 0,
  };
  // let tempBnbAmount = amountBNBForTest;
  let tempBleggsAmount = 0;
  const avgBnbPerWallet =
    (bnbAmount * DECIMAL - amountBNBForTest) /
    Math.round(wallets.length * BUY_RATE);
  console.log("avgBnbPerWallet", avgBnbPerWallet);
  for (let i = 0; i < wallets.length; i++) {
    wallets[i].bnb += BNBPERTEST * DECIMAL;
    if (i < Math.round(wallets.length * BUY_RATE)) {
      if (i % 2 === 0 && i != Math.round(wallets.length * BUY_RATE) - 1) {
        const random = Math.random() * 40 + 15;
        const temp = (random / bnbPrice) * DECIMAL;
        wallets[i].bnb += temp;
        wallets[i + 1].bnb += avgBnbPerWallet * 2 - temp;
      }
      if (i % 2 === 0 && i === Math.round(wallets.length * BUY_RATE) - 1) {
        wallets[i].bnb += avgBnbPerWallet;
      }
      console.log(
        "This is buying wallet.",
        i,
        wallets[i].bnb,
        "Bleggs",
        wallets[i].bleggs
      );
    } else {
      const random = Math.random() * 5 + 5;
      const temp = (random / bleggsPrice) * DECIMAL;
      if (tempBleggsAmount + temp <= bleggsAmount * DECIMAL) {
        wallets[i].bleggs += temp;
        tempBleggsAmount += temp;
      } else if (tempBleggsAmount < bleggsAmount * DECIMAL) {
        wallets[i].bleggs = bleggsAmount * DECIMAL - tempBleggsAmount;
        tempBleggsAmount += temp;
      } else {
        wallets[i].bleggs = 0;
      }
      console.log(
        "This is selling wallet.",
        i,
        wallets[i].bnb,
        "Bleggs",
        wallets[i].bleggs
      );
    }
    test.bnb += wallets[i].bnb;
    test.bleggs += wallets[i].bleggs;
  }
  console.log("test", test);
};

const distributeTokensToWallet = async (
  bnbAmount,
  bleggsAmount,
  numOfWallets
) => {
  const maxBuyBnbAmount = MAX_BUY * bnbPerUsd;
  const avgBnbAmount = (bnbAmount * DECIMAL) / numOfWallets;
  const bnbAvgUsd = Math.round((bnbAmount / numOfWallets) * bnbPrice);

  const maxSellBleggsAmount = MAX_SELL * bleggsPerUsd;
  const avgBleggsAmount = (bleggsAmount * DECIMAL) / numOfWallets;
  const bleggsAvgUsd = Math.round((bleggsAmount / numOfWallets) * bleggsPrice);

  console.log(maxBuyBnbAmount, avgBnbAmount, bnbAvgUsd);
  console.log(maxSellBleggsAmount, avgBleggsAmount, bleggsAvgUsd);

  let test = {
    bnb: 0,
    bleggs: 0,
  };

  let tempBnb = 0;
  let tempBleggs = 0;

  for (let i = 0; i < numOfWallets; i++) {
    if (bnbAvgUsd > averageBuy) {
      if (i % 2 === 0 && i != numOfWallets - 1) {
        const random = Math.random() * (bnbAvgUsd - 15) + 15;
        const temp = (random / bnbPrice) * DECIMAL;
        wallets[i].bnb += temp;
        wallets[i + 1].bnb += avgBnbAmount * 2 - temp;
      }
      if (i % 2 === 0 && i === numOfWallets - 1) {
        wallets[i].bnb += avgBnbAmount;
      }
    } else {
      const random = Math.random() * 40 + 15;
      const temp = (random / bnbPrice) * DECIMAL;
      if (tempBnb + temp <= bnbAmount * DECIMAL) {
        wallets[i].bnb += temp;
        tempBnb += temp;
      } else if (tempBnb < bnbAmount * DECIMAL) {
        wallets[i].bnb += bnbAmount * DECIMAL - tempBnb;
        tempBnb += temp;
      } else {
        wallets[i].bnb += 0;
      }
    }
    if (bleggsAvgUsd > averageSell) {
      if (i % 2 === 0 && i != numOfWallets - 1) {
        const randomBleggs = Math.random() * (bleggsAvgUsd - 5) + 5;
        const tempBleggs = (randomBleggs / bleggsPrice) * DECIMAL;
        wallets[i].bleggs += tempBleggs;
        wallets[i + 1].bleggs += avgBleggsAmount * 2 - tempBleggs;
      }
      if (i % 2 === 0 && i === numOfWallets - 1) {
        wallets[i].bleggs += avgBleggsAmount;
      }
    } else {
      const random = Math.random() * 5 + 5;
      const temp = (random / bleggsPrice) * DECIMAL;
      if (tempBleggs + temp <= bleggsAmount * DECIMAL) {
        wallets[i].bleggs += temp;
        tempBleggs += temp;
      } else if (tempBleggs < bleggsAmount * DECIMAL) {
        wallets[i].bleggs += bleggsAmount * DECIMAL - tempBleggs;
        tempBleggs += temp;
      } else {
        wallets[i].bleggs += 0;
      }
    }
    console.log(
      "This is buying wallet.",
      i,
      wallets[i].bnb,
      "Bleggs",
      wallets[i].bleggs
    );
    test.bnb += wallets[i].bnb;
    test.bleggs += wallets[i].bleggs;
  }
  console.log("test", test);
};

const initializeTokensToWallet = async () => {
  for (let i = 0; i < wallets.length; i++) {
    if (wallets[i].bnb > 0) {
      transferBnb(wallets[i].address, wallets[i].bnb);
    }
    if (wallets[i].bleggs > 0) {
      transferBleggs(wallets[i].address, wallets[i].bleggs);
    }
  }
};

const exploreBuyOrSell = async (buyRate) => {
  let test = { buy: 0, sell: 0 };
  for (let i = 0; i < 50; i++) {
    // for (let i = 0; i < wallets.length; i++) {
    const random = Math.round(Math.random() * 100);
    if (random <= buyRate * 100) {
      test.buy += 1;
      console.log("Buy event: ");
    } else {
      test.sell += 1;
      console.log("Sell event: ");
    }
  }
  console.log(test, test.buy / (test.buy + test.sell));
};

module.exports = {
  createWallets,
  genNumOfWallets,
  allocationTokensToWallet,
  loadWallets,
  distributeTokensToWallet,
  exploreBuyOrSell,
};
