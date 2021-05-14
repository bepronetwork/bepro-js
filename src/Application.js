/* global window */
/* eslint-disable max-len */
import Web3 from 'web3';
import {
  ExchangeContract,
  ERC20Contract,
  StakingContract,
  BEPRONetwork,
  ERC20TokenLock,
  ERC721Collectibles,
  OpenerRealFvr,
} from './models/index';
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
 * Application Object
 * @class Application
 * @param {Object} params Parameters
 * @param {boolean} [params.test=false] Automated Tests
 * @param {boolean} [params.localtest=false] Ganache Local Blockchain
 * @param {Object} [params.opt] Optional Chain Connection Object (Default ETH)
 * @param {string} params.opt.web3Connection Web3 Connection String (Ex : https://data-seed-prebsc-1-s1.binance.org:8545)
 * @param {string} params.opt.privateKey Private key (0x....) used for server side use
 */
class Application {
  constructor({
    test = false, // Automated tests
    localtest = false, // ganache local blockchain
    opt = {
      web3Connection: ETH_URL_TESTNET,
      privateKey: TEST_PRIVATE_KEY,
    },
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
      // /this.account = new Account(this.web3, this.web3.eth.accounts.privateKeyToAccount(LOCAL_TEST_PRIVATE_KEY));
    }
  }

  /**
   * Connect to Web3 injected in the constructor
   * @function
   * @throws {Error} Please Use an Ethereum Enabled Browser like Metamask or Coinbase Wallet
   * @void
   */
  start = () => {
    if (this.localtest) {
      this.web3 = new Web3(
        new Web3.providers.HttpProvider(ETH_URL_LOCAL_TEST),
        // NOTE: depending on your web3 version, you may need to set a number of confirmation blocks
        null,
        { transactionConfirmationBlocks: 1 },
      );
    } else {
      this.web3 = new Web3(new Web3.providers.HttpProvider(this.opt.web3Connection));
    }


    if (typeof window !== 'undefined') {
      window.web3 = this.web3;
    } else if (!this.test) {
      throw new Error(
        'Please Use an Ethereum Enabled Browser like Metamask or Coinbase Wallet',
      );
    }
  };

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

  /**
   * Create a Exchange Contract
   * @function
   * @param {Object} params
   * @param {Address} [params.contractAddress=null]
   * @throws {Error}
   * @return {ExchangeContract} ExchangeContract
   */
  getExchangeContract = ({ contractAddress = null } = {}) => {
    try {
      return new ExchangeContract({
        web3: this.web3,
        contractAddress,
        acc: this.test && !this.localtest ? this.account : null,
      });
    } catch (err) {
      throw err;
    }
  };

  /**
   * Create a OpenerRealFvr Object
   * @function
   * @param {Object} params
   * @param {Address} [params.contractAddress=null]
   * @param {Address} [params.tokenAddress=null]
   * @return {OpenerRealFvr} OpenerRealFvr
   */
  getOpenRealFvrContract = ({
    contractAddress = null,
    tokenAddress = null,
  } = {}) => {
    try {
      return new OpenerRealFvr({
        web3: this.web3,
        contractAddress,
        tokenAddress,
        acc: this.test && !this.localtest ? this.account : null,
      });
    } catch (err) {
      throw err;
    }
  };

  /**
   * Create a StakingContract Object
   * @function
   * @param {Object} params
   * @param {Address} [params.contractAddress=null] (Opt) If it is deployed
   * @param {Address} [params.tokenAddress=null] (Opt) If it is deployed
   * @return {StakingContract} StakingContract
   */
  getStakingContract = ({
    contractAddress = null,
    tokenAddress = null,
  } = {}) => {
    try {
      return new StakingContract({
        web3: this.web3,
        contractAddress,
        tokenAddress,
        acc: this.test && !this.localtest ? this.account : null,
      });
    } catch (err) {
      throw err;
    }
  };

  /**
   * Create a ERC20TokenLock Object
   * @function
   * @param {Object} params
   * @param {Address} [params.contractAddress=null] (Opt) If it is deployed
   * @param {Address} [params.tokenAddress=null] (Opt) If it is deployed
   * @return {ERC20TokenLock} ERC20TokenLock
   */
  getERC20TokenLock = ({
    contractAddress = null,
    tokenAddress = null,
  } = {}) => {
    try {
      return new ERC20TokenLock({
        web3: this.web3,
        contractAddress,
        tokenAddress,
        acc: this.test && !this.localtest ? this.account : null,
      });
    } catch (err) {
      throw err;
    }
  };

  /**
   * @function
   * @description Create a BEPRONetwork Object
   * @param {Object} params
   * @param {Address} params.contractAddress (Opt) If it is deployed
   * @return {BEPRONetwork} BEPRONetwork
   */
  getBEPRONetwork = ({
    contractAddress = null,
    tokenAddress = null,
  } = {}) => {
    try {
      return new BEPRONetwork({
        web3: this.web3,
        contractAddress,
        tokenAddress,
        acc: this.test && !this.localtest ? this.account : null,
      });
    } catch (err) {
      throw err;
    }
  };

  /**
   * Create a ERC721Collectibles Object
   * @function
   * @param {Object} [params={}]
   * @param {Address} [params.contractAddress=null] (Opt) If it is deployed
   * @return {ERC721Collectibles} ERC721Collectibles
   */
  getERC721Collectibles = ({ contractAddress = null } = {}) => {
    try {
      return new ERC721Collectibles({
        web3: this.web3,
        contractAddress,
        acc: this.test && !this.localtest ? this.account : null,
      });
    } catch (err) {
      throw err;
    }
  };

  /**
   * Create a ERC20Contract Object
   * @function
   * @param {Object} params
   * @param {Address} [params.contractAddress=null] (Opt) If it is deployed
   * @return {ERC20Contract} ERC20Contract
   */
  getERC20Contract = ({ contractAddress = null }) => {
    try {
      return new ERC20Contract({
        web3: this.web3,
        contractAddress,
        acc: this.test && !this.localtest ? this.account : null,
      });
    } catch (err) {
      throw err;
    }
  };

  /**
   * Get ETH Network
   * @function
   * @return {Promise<string>} Network Name (Ex : Kovan)
   */
  getETHNetwork = async () => {
    const netId = await this.web3.eth.net.getId();
    // eslint-disable-next-line no-prototype-builtins
    const networkName = networksEnum.hasOwnProperty(netId)
      ? networksEnum[netId]
      : 'Unknown';
    return networkName;
  };

  /**
   * Get Address connected via login()
   * @function
   * @return {Promise<string>} Address in Use
   */
  getAddress = async () => {
    const accounts = await this.web3.eth.getAccounts();
    return accounts[0];
  };


  /**
   * Get ETH Balance of Address connected via login()
   * @function
   * @return {Promise<string>} ETH Balance
   */
  getETHBalance = async () => {
    const wei = await this.web3.eth.getBalance(await this.getAddress());
    return this.web3.utils.fromWei(wei, 'ether');
  };
}

export default Application;
