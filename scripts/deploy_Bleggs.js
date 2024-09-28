const { Web3 } = require('web3');
const fs = require('fs');
const solc = require('solc');

const web3 = new Web3('http://localhost:8545');

const sourceCode = fs.readFileSync('../contracts/Bleggs.sol').toString();

const input = {
  language: 'Solidity',
  sources: {
    'Bleggs.sol': {
      content: sourceCode,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

const ABI = output.contracts['Bleggs.sol']['InvisibleEggs'].abi;
const bytecode = output.contracts['Bleggs.sol']['InvisibleEggs'].evm.bytecode.object;
const contract = new web3.eth.Contract(ABI);

(async () => {
  const accounts = await web3.eth.getAccounts();
  const contractAddress = await contract.deploy({ data: bytecode }).send({ from: accounts[0] });
  console.log('Contract deployed at address:', contractAddress.options.address);
})();


