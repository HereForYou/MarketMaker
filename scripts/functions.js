const { Web3 } = require("web3");
const fs = require("fs");

const web3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545");

const {
  bleggsAddress,
  BNBPERTEST,
  DECIMAL,
  MAX_BUY,
  MAX_SELL,
  mainTokenAddress,
  MIN_BUY,
  MIN_SELL,
} = require("./constant");

const {
  approveBleggsToRouter,
  transferBleggs,
  transferBnb,
  swapExactETHForTokens,
  privateKeyToAccount,
  getBNBPrice,
  getBleggsPrice,
  swapExactTokensForETHSupportingFeeOnTransferTokens,
} = require("./web3");
const wallets = [];
let totalBalanceOfBnb = 0;
let totalBalanceOfBleggs = 0;

//-----------------------------------------------------------------------------------------------------
//-               create one wallet and add it to accounts          Successfully tested               -
//-----------------------------------------------------------------------------------------------------
async function createWallet() {
  const tempWallet = web3.eth.accounts.create();

  await web3.eth.accounts.wallet.add(tempWallet.privateKey);
  const account = await privateKeyToAccount(tempWallet.privateKey);
  wallets.push({
    id: wallets.length,
    address: account.address,
    privateKey: account.privateKey,
    bnb: 0,
    bleggs: 0,
  });

  const jsonWallet = JSON.stringify(wallets);
  fs.writeFileSync("../db/wallets.json", jsonWallet);
  return account;
}

//-----------------------------------------------------------------------------------------------------
//-               save wallets to ../db/wallets.json file            Successfully tested              -
//-----------------------------------------------------------------------------------------------------
const writeWalletsToJsonFile = async () => {
  const jsonWallet = JSON.stringify(wallets);
  fs.writeFileSync("../db/wallets.json", jsonWallet);
};

//-----------------------------------------------------------------------------------------------------
//-               generate random amount of BNB in specific range    Successfully tested              -
//-----------------------------------------------------------------------------------------------------
const generateRandomBnb = async () => {
  let price = await getBNBPrice();
  // let price = await getBNBPrice();
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
//-               main function                                      Successfully tested              -
//-----------------------------------------------------------------------------------------------------
const exploreBuyOrSellIndividually = async (bnbAmount, bleggsAmount, buyRate, numOfUsers) => {
  //======================================================================== total bnb and bleggs you inputed for marketing ===================================
  console.log("😀 Main function is started!!!");
  totalBalanceOfBnb = bnbAmount * DECIMAL;
  totalBalanceOfBleggs = bleggsAmount * DECIMAL;
  let test = { buy: 0, sell: 0 };

  //======================================================================== looping from on to events that you inputed =======================================
  for (let i = 0; i < numOfUsers; i++) {
    //====================================================================== generate random number for determining whether buy or sell =======================
    const random = Math.round(Math.random() * 100);
    const wallet = await createWallet();
    let bleggsPrice = await getBleggsPrice();
    let bnbPrice = await getBNBPrice();
    console.log(`🔶 ${i}th user`);
    if (random <= buyRate) {
      //==================================================================== generate random amount of BNB to sell in range you want ($15 ~ $55 for test) =====
      test.buy += 1;
      const randomBnb = await generateRandomBnb();
      //==================================================================== true: bnb amount for but is less than the total bnb amount, otherwise: false =====
      if (randomBnb < totalBalanceOfBnb) {
        //================================================================== transferring bnb to wallet that buy the bleggs using randomBnb ===================
        await transferBnb(wallet.address, randomBnb + BNBPERTEST * DECIMAL);
        //================================================================== swap random amount of BNB for Bleggs token =======================================
        //================================================================== the addr is generated buy Bleggs token, then transferred the Bleggs to this addr =
        await swapExactETHForTokens(
          randomBnb,
          0,
          [mainTokenAddress, bleggsAddress],
          wallet.address,
          100000000000000,
          wallet.address
        );
        totalBalanceOfBnb -= randomBnb + BNBPERTEST * DECIMAL;
        console.log("✅ BNB", randomBnb, "(", (randomBnb * bnbPrice) / DECIMAL, ")", "succesfully buyed.");
      } else {
        //================================================================== log the warning message that total BNB amount is not enough for buy ==============
        console.log("⚠️ Insufficient balance. BNB is not enough for purchasing");
      }
    } else {
      const randomBleggs = await generateRandomBleggs();
      test.sell += 1;
      if (randomBleggs < totalBalanceOfBleggs) {
        //================================================================== transferring BLEGGS of randomBleggs amount to wallet that sell the BLEGGS ========
        await transferBleggs(wallet.address, randomBleggs);
        await transferBnb(wallet.address, BNBPERTEST * DECIMAL);
        await approveBleggsToRouter(randomBleggs + 10 * DECIMAL, wallet.address);
        await delay(2000);
        //================================================================== the wallet addr is generated sell Bleggs token, then transferred the BNB to this addr =========
        await swapExactTokensForETHSupportingFeeOnTransferTokens(
          randomBleggs * 0.98,
          0,
          [bleggsAddress, mainTokenAddress],
          wallet.address,
          100000000000,
          wallet.address
        );
        totalBalanceOfBleggs -= randomBleggs;
        totalBalanceOfBnb -= BNBPERTEST * DECIMAL;
        console.log("✅ BLEGGS", randomBleggs, "(", (randomBleggs * bleggsPrice) / DECIMAL, ") succesfully sold.");
      } else {
        console.log("⚠️", "Insufficient balance. BLEGGS is not enough for selling");
      }
    }
    await delay(Math.round(Math.random() * 10) * 1000);
  }
};

module.exports = {
  exploreBuyOrSellIndividually,
  writeWalletsToJsonFile,
};
