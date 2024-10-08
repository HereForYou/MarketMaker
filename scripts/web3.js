require("dotenv").config({ path: "../.env" });
const { Web3 } = require("web3");
const axios = require("axios");

const myPrivateKey = process.env.PRIVATE_KEY;
const { routerAddress, bleggsAddress, pairAddress, rpcUrl } = require("./constant.js");

const web3 = new Web3(rpcUrl); // base sepolia testnet

//--------------------------------------------------------------------------------------------------------------------------------------------
//-                                                                abis                                                                      -
//--------------------------------------------------------------------------------------------------------------------------------------------
const routerAbi = require("../abi/routerAbi.json");
const bleggsAbi = require("../abi/bleggsAbi.json");
const pairAbi = require("../abi/pairAbi.json");

//--------------------------------------------------------------------------------------------------------------------------------------------
//-                                                              contracts                                                                   -
//--------------------------------------------------------------------------------------------------------------------------------------------
const routerContract = new web3.eth.Contract(routerAbi, routerAddress);
routerContract.handleRevert = true;

const bleggsContract = new web3.eth.Contract(bleggsAbi, bleggsAddress);
bleggsContract.handleRevert = true;

const pairContract = new web3.eth.Contract(pairAbi, pairAddress);
pairContract.handleRevert = true;

//--------------------------------------------------------------------------------------------------------------------------------------------
//-                                                get ETH price in USD                                                                      -
//--------------------------------------------------------------------------------------------------------------------------------------------
const getEthPrice = async () => {
  try {
    const headers = {
      "x-api-key": "2eDS3r6N5KZTEdOGuKRfqVzTyuQ",
      accept: "application/json",
    };
    const { data } = await axios.get("https://api.coinbase.com/v2/prices/ETH-USD/buy", { headers });
    return data.data.amount;
  } catch (err) {
    return err;
  }
};

//--------------------------------------------------------------------------------------------------------------------------------------------
//-                                                get BNB price in USD                                                                      -
//--------------------------------------------------------------------------------------------------------------------------------------------
const getBNBPrice = async () => {
  try {
    const headers = {
      "x-api-key": "2eDS3r6N5KZTEdOGuKRfqVzTyuQ",
      accept: "application/json",
    };
    const { data } = await axios.get("https://api.coinbase.com/v2/prices/BNB-USD/buy", { headers });
    return data.data.amount;
  } catch (err) {
    return err;
  }
};

//--------------------------------------------------------------------------------------------------------------------------------------------
//-                                                get BLEGGS price in USD                                                                   -
//--------------------------------------------------------------------------------------------------------------------------------------------
const getBleggsPrice = async () => {
  const tokens = await pairContract.methods.getReserves().call();
  const bleggsPrice = (Number(tokens[1]) * Number(await getEthPrice())) / Number(tokens[0]);
  return bleggsPrice;
};

//--------------------------------------------------------------------------------------------------------------------------------------------
//-                                                get account from private key                                                              -
//--------------------------------------------------------------------------------------------------------------------------------------------
const privateKeyToAccount = (privateKey) => {
  web3.eth.accounts.wallet.add(privateKey);
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  return account;
};

//--------------------------------------------------------------------------------------------------------------------------------------------
//-                                                get my account from my private key                                                        -
//--------------------------------------------------------------------------------------------------------------------------------------------
const myAccount = privateKeyToAccount(myPrivateKey);

//--------------------------------------------------------------------------------------------------------------------------------------------
//-                                                get BLEGGS balance of address                                                             -
//--------------------------------------------------------------------------------------------------------------------------------------------
const balanceOf = async (ownerAddress) => {
  const balance = await bleggsContract.methods.balanceOf(ownerAddress).call();
  return balance;
};

//--------------------------------------------------------------------------------------------------------------------------------------------
//-                                    approve Bleggs to router               Successfully tested                                            -
//--------------------------------------------------------------------------------------------------------------------------------------------
const approveBleggsToRouter = async (bleggsAmount, callerAddress) => {
  console.log(`🟡 Approving BLEGGS token from one wallet to router is started `);
  const receipt = await bleggsContract.methods.approve(routerAddress, bleggsAmount).send({
    from: callerAddress,
  });
  console.log(`🔵 Approving BLEGGS token from one wallet to router is success `);
};

//---------------------------------------------------------------------------------------------------------------------------------------------
//-                                    transfer Bleggs                        Successfully tested                                             -
//---------------------------------------------------------------------------------------------------------------------------------------------
const transferBleggs = async (recepiantAddress, bleggsAmount) => {
  console.log(`🟡 Transferring Bleggs from one to another is started!`);
  const receipt = await bleggsContract.methods
    .transfer(recepiantAddress, bleggsAmount)
    .send({ from: myAccount.address });
  console.log(`🔵 Transferring Bleggs from one to another is success!`);
};

//---------------------------------------------------------------------------------------------------------------------------------------------
//-                                    transfer Bnb main token                Successfully tested                                             -
//---------------------------------------------------------------------------------------------------------------------------------------------
const transferBnb = async (recepiantAddress, bnbAmount) => {
  console.log(`🟡 Transferring BNB from one to another is started!`);
  const receipt = await web3.eth.sendTransaction({
    from: myAccount.address,
    to: recepiantAddress,
    value: bnbAmount, // amount in wei
  });
  console.log(`🔵 Transferring BNB from one to another is started!`);
};

const toHex = (value) => {
  return web3.utils.toHex(value);
};

//---------------------------------------------------------------------------------------------------------------------------------------------
//-                                    swapExactETHForTokens                  Successfully tested                                             -
//---------------------------------------------------------------------------------------------------------------------------------------------
const swapExactETHForTokens = async (amountInETH, amountOutMin, addresses, toAddress, deadline, callerAddress) => {
  console.log("🟡 Swaping exact ETH for tokens is started");

  const gasEstimate = await routerContract.methods
    .swapExactETHForTokens(amountOutMin, addresses, toAddress, deadline)
    .estimateGas({ from: callerAddress, value: toHex(amountInETH) });

  const gasPrice = await web3.eth.getGasPrice();

  const receipt = await routerContract.methods
    .swapExactETHForTokens(amountOutMin, addresses, toAddress, deadline)
    .send({
      from: callerAddress,
      gas: gasEstimate.toString(),
      gasPrice: gasPrice.toString(),
      value: toHex(amountInETH),
    });
  console.log("🔵 Swaping exact ETH for token is success.");
};

//---------------------------------------------------------------------------------------------------------------------------------------------
//-      swapExactTokensForETHSupportingFeeOnTransferTokens                   Successfully tested by account 10                               -
//---------------------------------------------------------------------------------------------------------------------------------------------
const swapExactTokensForETHSupportingFeeOnTransferTokens = async (
  amountIn,
  amountOutMin,
  addresses,
  toAddress,
  deadline,
  callerAddress
) => {
  console.log(`🟡 swapExactTokensForETHSupportingFeeOnTransferTokens is started`);

  const allowance = await bleggsContract.methods.allowance(callerAddress, routerAddress).call();
  if (BigInt(allowance) < BigInt(amountIn)) {
    console.log("⚠️ Insufficient allowance. 🟡 Approving tokens...");
    await bleggsContract.methods.approve(routerAddress, amountIn).send({ from: callerAddress });
    console.log("⚠️ Insufficient allowance. 🔵 Approving tokens is success");
  }

  const gasEstimate = await routerContract.methods
    .swapExactTokensForETHSupportingFeeOnTransferTokens(amountIn, amountOutMin, addresses, toAddress, deadline)
    .estimateGas({ from: callerAddress });

  const gasPrice = await web3.eth.getGasPrice();

  const receipt = await routerContract.methods
    .swapExactTokensForETHSupportingFeeOnTransferTokens(amountIn, amountOutMin, addresses, toAddress, deadline)
    .send({
      from: callerAddress,
      gas: gasEstimate.toString(),
      gasPrice: gasPrice.toString(),
      nonce: await web3.eth.getTransactionCount(callerAddress),
    });
  console.log(`🔵 swapExactTokensForETHSupportingFeeOnTransferTokens is success`);
};

module.exports = {
  balanceOf,
  approveBleggsToRouter,
  transferBleggs,
  transferBnb,
  swapExactETHForTokens,
  swapExactTokensForETHSupportingFeeOnTransferTokens,
  privateKeyToAccount,
  getBNBPrice,
  getBleggsPrice,
};
