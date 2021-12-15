
require('dotenv').config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      // network_id: '*', // Match any network id
    },
    ropsten: {
      provider: new HDWalletProvider(process.env.WALLET_PRIVATE_KEY, process.env.WEB3_HOST_PROVIDER),
      network_id: 3,
      //gas: 500000,
      networkCheckTimeout: 100000,
    }
  },
  // config custom test folder for smart contracts
  test_directory: './tests/contracts',
  // Configure your compilers
  compilers: {
    solc: {
      version: '0.7.6', // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200
        }
      //evmVersion: "byzantium"
      }
    },
  },
};
