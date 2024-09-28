const { Web3 } = require("web3");
const web3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545");

const fs = require("fs");

// const low = require('lowdb');
// const FileSync = require('lowdb/adapters/FileSync');
// const adapter = new FileSync('keysDB.json');
// const db = low(adapter);
// db.defaults({keys: [], count: 0}).write()

function createWallets(n) {
  const wallets = [];

  for (i = 0; i < n; i++) {
    console.log(`Wallet #${i + 1} generated`);
    // Create wallet
    const tempWallet = web3.eth.accounts.create();
    console.log(`Address: ${tempWallet.address}\n`);

    const wallet = {
      id: i + 1,
      address: tempWallet.address,
      privateKey: tempWallet.privateKey,
    };

    wallets.push(wallet);
    // Add keys to JSON
    // db.get('keys').push({id:db.get('count').value()+1,address:tempWallet.address, privKey:tempWallet.privateKey}).write()
    // db.update('count', n => n + 1).write()
    // fs.appendFileSync('../db/wallets.txt',`Address: ${tempWallet.address}\nPrivate Key: ${tempWallet.privateKey}\n\n`)
  }

  const jsonWallets = JSON.stringify(wallets);
  fs.writeFileSync("../db/wallets.json", jsonWallets);
}

module.exports = createWallets;
