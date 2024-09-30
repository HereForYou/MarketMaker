const { Web3 } = require("web3");
// const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545'); // bnb testnet
const web3 = new Web3("https://base-sepolia-rpc.publicnode.com"); // base sepolia testnet
const {
  routerAddress,
  bleggsAddress,
  myAddress,
  myPrivateKey,
} = require("./constant.js");

const DECIMAL = 1000000000000000000;

// console.log("toWei", web3.utils.toWei(1, "ether"));
//--------------------------------------------------------------------------------------------------------------------------------------------
//-                                                               abi                                                                        -
//--------------------------------------------------------------------------------------------------------------------------------------------
const routerAbi = require("../abi/routerAbi.json");
const bleggsAbi = require("../abi/bleggsAbi.json");

//--------------------------------------------------------------------------------------------------------------------------------------------
//-                                                               contracts                                                                  -
//--------------------------------------------------------------------------------------------------------------------------------------------
const routerContract = new web3.eth.Contract(routerAbi, routerAddress);
routerContract.handleRevert = true;

const bleggsContract = new web3.eth.Contract(bleggsAbi, bleggsAddress);
bleggsContract.handleRevert = true;

//--------------------------------------------------------------------------------------------------------------------------------------------
//-                                                get account from private key                                                              -
//--------------------------------------------------------------------------------------------------------------------------------------------
web3.eth.accounts.wallet.add(myPrivateKey);
const myAccount = web3.eth.accounts.privateKeyToAccount(myPrivateKey);
console.log("account", myAccount.address);

//--------------------------------------------------------------------------------------------------------------------------------------------
//-                                                         function definition                                                              -
//--------------------------------------------------------------------------------------------------------------------------------------------
const balanceOf = async () => {
  const balance = await bleggsContract.methods.balanceOf(myAddress).call();
  console.log("Bleggs contract balanceOf() => ", balance);
};

//-----------------------------------------------------------------------------------------------------
//-                                      approve Bleggs          Successfully tested                  -
//-----------------------------------------------------------------------------------------------------

const approveBleggsToRouter = async (bleggsAmount) => {
  const receipt = await bleggsContract.methods
    .approve(routerAddress, bleggsAmount * DECIMAL)
    .send({
      from: myAccount.address,
    });
  console.log("Bleggs contract approve() => ", receipt);
};

//-----------------------------------------------------------------------------------------------------
//-                                      transfer Bleggs          Successfully tested                 -
//-----------------------------------------------------------------------------------------------------

const transferBleggs = async (recepiantAddress, bleggsAmount) => {
  const receipt = await bleggsContract.methods
    .transfer(recepiantAddress, bleggsAmount)
    .send({ from: myAccount.address });
  console.log("Bleggs are transferred successfully", receipt);
};

//-----------------------------------------------------------------------------------------------------
//-                              transfer Bnb main token          Successfully tested                 -
//-----------------------------------------------------------------------------------------------------
const transferBnb = async (recepiantAddress, bnbAmount) => {
  const receipt = await web3.eth.sendTransaction({
    from: myAccount.address,
    to: recepiantAddress,
    value: bnbAmount, // amount in wei
  });
  console.log("Transffering bnb is success.", receipt);
};

const getAmountIn = async () => {
  const amout = await routerContract.methods.factory.call();
  console.log("factory", amout);
};

// getAmountIn();
// balanceOf();
// approveBleggsToRouter();

// console.log(
//   routerContract.methods
//     .swapExactETHForTokens(
//       1000000000000000000,
//       [],
//       routerAddress,
//       1689625897328027936
//     )
//     .send({ from: "0x1689E7B1F10000AE47eBfE339a4f69dECd19F602" })
//     .then(console.log)
// );

module.exports = {
  balanceOf,
  approveBleggsToRouter,
  transferBleggs,
  transferBnb,
};
