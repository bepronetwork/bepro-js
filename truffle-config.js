
module.exports = {
  plugins: ['truffle-contract-size'],
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
    }
  },

  test_directory: './tests/contracts',

  compilers: {
    solc: {
      version: '0.7.6',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      //evmVersion: "byzantium"
      }
    },
  },
};
