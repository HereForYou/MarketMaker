const { Web3 } = require("web3");
const axios = require("axios");
// const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545'); // bnb testnet
const web3 = new Web3("https://base-sepolia-rpc.publicnode.com"); // base sepolia testnet
const {
  routerAddress,
  bleggsAddress,
  pairAddress,
  myAddress,
  myPrivateKey,
  // mainTokenAddress,
} = require("./constant.js");

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
  const bleggsPrice = (Number(tokens[0]) * Number(await getEthPrice())) / Number(tokens[1]);
  return bleggsPrice;
};

// const asyncFunction = async () => {
//   console.log("getEthPrice", await getEthPrice());
//   console.log("getBleggsPrice", await getBleggsPrice());
// };

// asyncFunction();

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
const balanceOf = async () => {
  const balance = await bleggsContract.methods.balanceOf(myAddress).call();
  console.log("Bleggs contract balanceOf() => ", balance);
};

//--------------------------------------------------------------------------------------------------------------------------------------------
//-                                    approve Bleggs to router               Successfully tested                                            -
//--------------------------------------------------------------------------------------------------------------------------------------------
const approveBleggsToRouter = async (bleggsAmount, callerAddress) => {
  console.log(`🟡 Appoving BLEGGS token from ${callerAddress} to router is started `, bleggsAmount);
  const receipt = await bleggsContract.methods.approve(routerAddress, bleggsAmount).send({
    from: callerAddress,
  });
  console.log(`🔵 approving BLEGGS token from ${callerAddress} to router is success `, receipt?.transactionHash);
};

//---------------------------------------------------------------------------------------------------------------------------------------------
//-                                    transfer Bleggs                        Successfully tested                                             -
//---------------------------------------------------------------------------------------------------------------------------------------------
const transferBleggs = async (recepiantAddress, bleggsAmount) => {
  console.log(`🟡 Bleggs transferring started from ${myAccount.address} to ${recepiantAddress}`, bleggsAmount);
  const receipt = await bleggsContract.methods
    .transfer(recepiantAddress, bleggsAmount)
    .send({ from: myAccount.address });
  console.log(
    `🔵 Bleggs are transferred successfully from ${myAccount.address} to ${recepiantAddress}`,
    receipt?.transactionHash
  );
};

//---------------------------------------------------------------------------------------------------------------------------------------------
//-                                    transfer Bnb main token                Successfully tested                                             -
//---------------------------------------------------------------------------------------------------------------------------------------------
const transferBnb = async (recepiantAddress, bnbAmount) => {
  console.log(`🟡 BNB transferring started from ${myAccount.address} to ${recepiantAddress}`);
  const receipt = await web3.eth.sendTransaction({
    from: myAccount.address,
    to: recepiantAddress,
    value: bnbAmount, // amount in wei
  });
  console.log(
    `🔵 BNB is transferred successfully from ${myAccount.address} to ${recepiantAddress}`,
    receipt?.transactionHash
  );
};

//---------------------------------------------------------------------------------------------------------------------------------------------
//-                                    swapExactETHForTokens                  Successfully tested                                             -
//---------------------------------------------------------------------------------------------------------------------------------------------
const swapExactETHForTokens = async (amountInETH, amountOutMin, addresses, toAddress, deadline, callerAddress) => {
  console.log("🟡 swaping exact ETH for tokens is started");
  //   let gasEstimate = await routerContract.methods
  //     .swapExactETHForTokens(amountOutMin, addresses, toAddress, deadline)
  //     .estimateGas({ from: callerAddress, value: amountInETH });

  //   console.log("gasestimate", gasEstimate);
  //   const gasLimit = Math.ceil(gasEstimate * BigInt(1.2)); // Increase by 20%
  const receipt = await routerContract.methods
    .swapExactETHForTokens(amountOutMin, addresses, toAddress, deadline)
    .send({
      from: callerAddress,
      //   gas: gasEstimate,
      //   gasPrice: "427500000000000000",
      value: amountInETH,
    });
  console.log("🔵 swaping exact eth for token is success.", receipt?.transactionHash);
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
  // try {
  console.log(
    `🟡 swapExactTokensForETHSupportingFeeOnTransferTokens started by ${callerAddress} amount is ${amountIn}`
  );

  const allowance = await bleggsContract.methods.allowance(callerAddress, routerAddress).call();
  console.log("allowance", allowance);
  if (BigInt(allowance) < BigInt(amountIn)) {
    console.log("Insufficient allowance. Approving tokens...");
    await bleggsContract.methods.approve(routerAddress, amountIn).send({ from: callerAddress });
  }

  const gasEstimate = await routerContract.methods
    .swapExactTokensForETHSupportingFeeOnTransferTokens(amountIn, amountOutMin, addresses, toAddress, deadline)
    .estimateGas({ from: callerAddress });

  // console.log("gasEstimate", gasEstimate);

  const gasPrice = await web3.eth.getGasPrice();
  // console.log("gasPrice", gasPrice);

  const receipt = await routerContract.methods
    .swapExactTokensForETHSupportingFeeOnTransferTokens(amountIn, amountOutMin, addresses, toAddress, deadline)
    .send({
      from: callerAddress,
      gas: gasEstimate.toString(),
      gasPrice: gasPrice.toString(),
      nonce: await web3.eth.getTransactionCount(callerAddress),
    });
  console.log(`🔵 swaping exact ${amountIn} tokens for eth is success.`, receipt?.transactionHash);
  // } catch (err) {
  // console.log("ERROR: ", err);
  // }
};

// const tprivateKeyToAccount = (privateKey) => {
//   web3.eth.accounts.wallet.add(privateKey);
//   const account = web3.eth.accounts.privateKeyToAccount(privateKey);
//   return account;
// };
// const acc = tprivateKeyToAccount("0x2461ca1e6b5f2ab9516b6ffc976a4bb54c5a8ad42264ea82c7af0bea5dc203e9");
// console.log(acc.address);

// swapExactTokensForETHSupportingFeeOnTransferTokens(
//   100000000000000000000000,
//   0,
//   [bleggsAddress, mainTokenAddress],
//   acc.address,
//   100000000000,
//   acc.address
// );

module.exports = {
  balanceOf,
  approveBleggsToRouter,
  transferBleggs,
  transferBnb,
  swapExactETHForTokens,
  swapExactTokensForETHSupportingFeeOnTransferTokens,
  privateKeyToAccount,
  getEthPrice,
  getBNBPrice,
  getBleggsPrice,
};
