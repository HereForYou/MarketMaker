const axios = require("axios");
const API_KEY = "JW2Q3WJXP18TZMWRN9ANJZYQ224WRQDQC3";

const getBNBPrice = async () => {
  const res = await axios.get(
    `https://api.poloniex.com/markets/bnb_usdt/price`
  );
  const bnbPrice = res.data.price;
  // console.log(`1 BNB = ${bnbPrice} USDT`);
  // return bnbPrice;
  return 2647;
};

const getBleggsPrice = async () => {
  // const res = await axios.get(
  //   `https://api.poloniex.com/markets/bleggs_usdt/price`
  // );
  // const bnbPrice = res.data.price;
  // console.log(`1 BNB = ${bnbPrice} USDT`);
  return 0.0000239;
};

module.exports = { getBNBPrice, getBleggsPrice };
