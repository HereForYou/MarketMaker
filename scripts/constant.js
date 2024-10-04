const MIN_BUY = 1;
const MAX_BUY = 5;
const MIN_SELL = 1;
const MAX_SELL = 5;
const DECIMAL = 1000000000000000000;
const BNBPERTEST = 0.001;

const bleggsAddress = "0x3B7B142c198E0575110BC81BBAdDEB6AB0a6046c";
const routerAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const pairAddress = "0x8bd422Ca2fb7441C5cA35fed053fA2fE28B7E6fE";
const mainTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

const rpcUrl = "https://bsc-rpc.publicnode.com"; //BSC mainnet
// const rpcUrl = "https://data-seed-prebsc-1-s1.binance.org:8545"; //BSC test net
// const rpcUrl = "https://base-sepolia-rpc.publicnode.com"; //Base Sepolia testnet

// Sepolia testnet data
// const routerAddress = "0x1689E7B1F10000AE47eBfE339a4f69dECd19F602";
// const bleggsAddress = "0x9eDB69198c882649ae704B71717A80eBdD28EB76";
// const pairAddress = "0x828E445bbb9f946e77A241E71A8e4Cb15c99e9a5";
// const mainTokenAddress = "0x4200000000000000000000000000000000000006";

module.exports = {
  MIN_BUY,
  MAX_BUY,
  MIN_SELL,
  MAX_SELL,
  DECIMAL,
  BNBPERTEST,
  rpcUrl,
  mainTokenAddress,
  routerAddress,
  bleggsAddress,
  pairAddress,
};
