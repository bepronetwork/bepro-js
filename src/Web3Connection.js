import Web3 from 'web3';
import Account from './utils/Account';

const ETH_URL_TESTNET = 'https://rinkeby.infura.io/v3/811fe4fa5c4b41cb9b92f9656aaeaa3b';
// you can find this in "./truffle-config.js" file and should match ganache/ganache-cli local server settings too
const ETH_URL_LOCAL_TEST = 'http://localhost:8545';
const TEST_PRIVATE_KEY = '0x7f76de05082c4d578219ca35a905f8debe922f1f00b99315ebf0706afc97f132';
// const LOCAL_TEST_PRIVATE_KEY = '4f4f26f4a82351b1f9a98623f901ad5fb2f3e38ac92ff39955ee8e124c718fa7';

const networksEnum = Object.freeze({
  1: 'Ethereum Main',
  2: 'Morden',
  3: 'Ropsten',
  4: 'Rinkeby',
  56: 'BSC Main',
  97: 'BSC Test',
  42: 'Kovan',
});

/**
 * @typedef {Object} Web3Connection~Optional
 * @property {string} web3Connection Web3 Connection String (Ex : https://data-seed-prebsc-1-s1.binance.org:8545)
 * @property {string} privateKey Private key (0x....) used for server side use
 */

/**
 * @typedef {Object} Web3Connection~Options
 * @property {boolean} [test=false] Automated Tests
 * @property {boolean} [localtest=false] Ganache Local Blockchain
 * @property {Web3Connection~Optional} [opt] Optional Chain Connection Object (Default ETH)
 */

/**
 * Web3Connection Object
 * @class Web3Connection
 * @param {Web3Connection~Options} options
 */
class Web3Connection {
  constructor({
    test = false, // Automated tests
    localtest = false, // ganache local blockchain
    opt = { web3Connection: ETH_URL_TESTNET, privateKey: TEST_PRIVATE_KEY },
  }) {
    this.test = test;
    this.localtest = localtest;
    this.opt = opt;
    if (this.test) {
      this.start();
      this.login();
      if (!this.localtest) {
        this.account = new Account(
          this.web3,
          this.web3.eth.accounts.privateKeyToAccount(opt.privateKey),
        );
        console.log(`My address: ${this.account.getAddress()}`);
      }
    }
  }

  /** **** */
  /** * CORE */
  /** **** */

  /**
   * Connect to Web3 injected in the constructor
   * @function
   * @throws {Error} Please Use an Ethereum Enabled Browser like Metamask or Coinbase Wallet
   * @void
   */
  start() {
    if (this.localtest) {
      this.web3 = new Web3(
        new Web3.providers.HttpProvider(ETH_URL_LOCAL_TEST),
        // NOTE: depending on your web3 version, you may need to set a number of confirmation blocks
        null,
        { transactionConfirmationBlocks: 1 },
      );
    } else if (this.opt.web3Connection.toLowerCase().includes('http')) {
      this.web3 = new Web3(new Web3.providers.HttpProvider(this.opt.web3Connection));
    } else {
      this.web3 = new Web3(new Web3.providers.WebsocketProvider(this.opt.web3Connection));
    }

    if (!this.localtest && this.test) {
      this.account = new Account(
        this.web3,
        this.web3.eth.accounts.privateKeyToAccount(this.opt.privateKey),
      );
      console.log(`My address: ${this.account.getAddress()}`);
    }

    if (typeof window !== 'undefined') {
      window.web3 = this.web3;
    } else if (!this.test) {
      throw new Error(
        'Please Use an Ethereum Enabled Browser like Metamask or Coinbase Wallet',
      );
    }
  }

  /**
   * Login with Metamask/Web3 Wallet - substitutes start()
   * @function
   * @return {Promise<boolean>}
   */
  login = async () => {
    try {
      if (typeof window === 'undefined') {
        return false;
      }
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        this.web3 = window.web3;
        await window.ethereum.enable();
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  };

  /** ***** */
  /** UTILS */
  /** ***** */

  /**
   * Get ETH Network
   * @function
   * @return {Promise<string>} Network Name (Ex : Kovan)
   */
  async getETHNetwork() {
    const netId = await this.web3.eth.net.getId();
    // eslint-disable-next-line no-prototype-builtins
    const networkName = networksEnum.hasOwnProperty(netId)
      ? networksEnum[netId]
      : await this.web3.currentProvider.host; // 'Unknown';
    return networkName;
  }

  /**
   * Get Address connected via login()
   * @function
   * @return {Promise<string>} Address in Use
   */
  async getAddress() {
    if (this.account) return this.account.getAddress();

    const accounts = await this.web3.eth.getAccounts();
    return accounts[0];
  }

  /**
   * Get ETH Balance of Address connected via login()
   * @function
   * @return {Promise<string>} ETH Balance
   */
  async getETHBalance() {
    const wei = await this.web3.eth.getBalance(await this.getAddress());
    return this.web3.utils.fromWei(wei, 'ether');
  }
}

export default Web3Connection;
