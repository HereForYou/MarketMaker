const axios = require("axios");
const API_KEY = "JW2Q3WJXP18TZMWRN9ANJZYQ224WRQDQC3";

const getBNBPrice = async () => {
  let res = await axios.get(`https://api.poloniex.com/markets/bnb_usdt/price`);
  let bnb_price = res.data.price;
  return bnb_price;
};

module.exports = getBNBPrice;