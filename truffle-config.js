require('dotenv').config()
var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = process.env.TRUFFLE_MNEMONIC;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    moonriver: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rpc.moonriver.moonbeam.network");
      },
      network_id: 1285
    },
    moonalpha: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rpc.testnet.moonbeam.network");
      },
      network_id: 1287
    },
    kovan: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://kovan.infura.io/v3/37ec248f2a244e3ab9c265d0919a6cbc");
      },
      network_id: 42
    }
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.6.2",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
      settings: {
        optimizer: {
          enabled: true,
          runs: 1
        }
      }
    }
  },
  plugins: [
    'truffle-contract-size'
  ]
};
