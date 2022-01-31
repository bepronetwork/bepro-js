require('dotenv').config()
const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = process.env.TRUFFLE_MNEMONIC;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    live: {
      provider: new HDWalletProvider(mnemonic, "https://mainnet.infura.io/v3/37ec248f2a244e3ab9c265d0919a6cbc"),
      network_id: 1,
      gasPrice: 100000000000,
      websockets: true
    },
    moonriver: {
      provider: new HDWalletProvider(mnemonic, "https://rpc.moonriver.moonbeam.network"),
      network_id: 1285
    },
    moonbeam: {
      provider: new HDWalletProvider(mnemonic, "https://rpc.api.moonbeam.network"),
      network_id: 1284
    },
    kovan: {
      provider: new HDWalletProvider(mnemonic, "https://kovan.infura.io/v3/37ec248f2a244e3ab9c265d0919a6cbc"),
      network_id: 42
    },
    rinkeby: {
      provider: new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/37ec248f2a244e3ab9c265d0919a6cbc"),
      network_id: 4,
      gas: 5000000
    },
    leprichain: {
      provider: new HDWalletProvider(mnemonic, "https://node.leprichain.blockwell.ai"),
      network_id: 49777,
      gasPrice: 0
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
    'truffle-contract-size',
    'truffle-plugin-verify'
  ],
  api_keys: {
    etherscan: ETHERSCAN_API_KEY
  }
};
