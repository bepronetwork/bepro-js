import _ from 'lodash';
import Contract from '../utils/Contract';
import Web3Connection from '../Web3Connection';

/**
 * Contract Object Interface
 * @class IContract
 * @param {boolean} params.test
 * @param {boolean} params.localtest, ganache local blockchain
 * @param {Web3Connection} web3Connection ? (opt), created from above params
 * @param {Address} contractAddress ? (opt)
 * @param {ABI} abi
 * @param {Address} tokenAddress ? (opt)
 */

class IContract {
  constructor({
    web3Connection = null, // Web3Connection if exists, otherwise create one from the rest of params
    contractAddress = null, // If not deployed
    abi,
    tokenAddress,
    ...params
  }) {
    try {
      if (!abi) {
        throw new Error('No ABI Interface provided');
      }

      this.web3Connection = !web3Connection
        ? new Web3Connection(params)
        : web3Connection;

      this.params = {
        web3Connection: this.web3Connection,
        abi,
        contractAddress,
        tokenAddress,
      };

      if (this.web3Connection.test) this._loadDataFromWeb3Connection();
    } catch (err) {
      throw err;
    }
  }

  __init__ = async () => {
    try {
      if (!this.getAddress()) {
        throw new Error('Please add a Contract Address');
      }

      await this.__assert();
    } catch (err) {
      throw err;
    }
  };

  __metamaskCall = async ({
    f, acc, value, callback = () => {},
  }) => new Promise((resolve, reject) => {
    f.send({
      from: acc,
      value,
      gasPrice: 20000000000, // temp test
      gas: 5913388, // 6721975 //temp test
    })
      .on('confirmation', (confirmationNumber, receipt) => {
        callback(confirmationNumber);
        if (confirmationNumber > 0) {
          resolve(receipt);
        }
      })
      .on('error', (err) => {
        reject(err);
      });
  });

  __sendTx = async (f, call = false, value, callback = () => {}) => {
    try {
      let res;
      if (!this.acc && !call) {
        const accounts = await this.params.web3.eth.getAccounts();
        console.log('---__sendTx.bp0');
        res = await this.__metamaskCall({
          f,
          acc: accounts[0],
          value,
          callback,
        });
      } else if (this.acc && !call) {
        const data = f.encodeABI();
        res = await this.params.contract
          .send(this.acc.getAccount(), data, value)
          .catch((err) => {
            throw err;
          });
      } else if (this.acc && call) {
        res = await f.call({ from: this.acc.getAddress() }).catch((err) => {
          throw err;
        });
      } else {
        res = await f.call().catch((err) => {
          throw err;
        });
      }
      return res;
    } catch (err) {
      throw err;
    }
  };

  __deploy = async (params, callback) => await this.params.contract.deploy(
    this.acc,
    this.params.contract.getABI(),
    this.params.contract.getJSON().bytecode,
    params,
    callback,
  );

  __assert = async () => {
    if (!this.getAddress()) {
      throw new Error(
        'Contract is not deployed, first deploy it and provide a contract address',
      );
    }
    /* Use ABI */
    this.params.contract.use(this.params.abi, this.getAddress());
  };

  /**
   * @function
   * @description Deploy the Contract
   */
  deploy = async ({ callback }) => {
    const params = [];
    const res = await this.__deploy(params, callback);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };

  /**
   * @function
   * @description Get Web3 Contract to interact directly with the web3 library functions like events (https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html?highlight=events#contract-events)
   */
  getWeb3Contract() {
    return this.params.contract.getContract();
  }

  /**
   * @function
   * @description Set New Owner of the Contract
   * @param {string} address
   */
  async setNewOwner({ address }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.transferOwnership(address),
    );
  }

  /**
   * @function
   * @description Get Owner of the Contract
   * @returns {string} address
   */
  async owner() {
    return await this.params.contract.getContract().methods.owner().call();
  }

  /**
   * @function
   * @description Get Owner of the Contract
   * @returns {boolean}
   */
  async isPaused() {
    return await this.params.contract.getContract().methods.paused().call();
  }

  /**
   * @function
   * @type admin
   * @description Pause Contract
   */
  async pauseContract() {
    return await this.__sendTx(
      this.params.contract.getContract().methods.pause(),
    );
  }

  /**
   * @function
   * @type admin
   * @description Unpause Contract
   */
  async unpauseContract() {
    return await this.__sendTx(
      this.params.contract.getContract().methods.unpause(),
    );
  }

  /* Optional */

  /**
   * @function
   * @description Remove Tokens from other ERC20 Address (in case of accident)
   * @param {Address} tokenAddress
   * @param {Address} toAddress
   */
  async removeOtherERC20Tokens({ tokenAddress, toAddress }) {
    return await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.removeOtherERC20Tokens(tokenAddress, toAddress),
    );
  }

  /**
   * @function
   * @description Remove all tokens for the sake of bug or problem in the smart contract, contract has to be paused first, only Admin
   * @param {Address} toAddress
   */
  async safeGuardAllTokens({ toAddress }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.safeGuardAllTokens(toAddress),
    );
  }

  /**
   * @function
   * @description Change Token Address of Application
   * @param {Address} newTokenAddress
   */
  async changeTokenAddress({ newTokenAddress }) {
    return await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.changeTokenAddress(newTokenAddress),
    );
  }

  /**
   * @function
   * @description Get Balance of Contract
   * @param {Integer} Balance
   */
  getAddress() {
    return this.params.contractAddress;
  }

  /**
   * @function
   * @description Get Balance of Contract
   * @param {Integer} Balance
   */
  async getBalance() {
    const wei = await this.web3.eth.getBalance(this.getAddress());
    return this.web3.utils.fromWei(wei, 'ether');
  }

  /**
   * @function
   * @description Verify that current user/sender is admin, throws an error otherwise
   * @throws {Error}
   */
  async onlyOwner() {
    /* Verify that sender is admin */
    const adminAddress = await this.owner();
    const userAddress = await this.getUserAddress();
    const isAdmin = adminAddress === userAddress;
    if (!isAdmin) {
      throw new Error('Only admin can perform this operation');
    }
  }

  /**
   * @function
   * @description Verify that contract is not paused before sending a transaction, throws an error otherwise
   * @throws {Error}
   */
  async whenNotPaused() {
    /* Verify that contract is not paused */
    const paused = await this.isPaused();
    if (paused) {
      throw new Error('Contract is paused');
    }
  }

  /**
   * @function
   * @description Load data from Web3Connection object,
   * Called at start when testing or at login on MAINNET
   */
  _loadDataFromWeb3Connection() {
    this.web3 = this.web3Connection.web3;
    this.acc = this.web3Connection.account;

    // update some params properties with new values
    this.params = {
      ...this.params,
      web3: this.web3,
      contract: new Contract(
        this.web3,
        this.params.abi,
        this.params.contractAddress,
      ),
    };
  }

  /** ***** */
  /** Web3Connection functions */
  /** ***** */

  /**
   * @function
   * @description Start the Web3Connection
   */
  async start() {
    this.web3Connection.start();
    this._loadDataFromWeb3Connection();
  }

  /**
   * @function
   * @description Login with Metamask/Web3 Wallet - substitutes start()
   * @return {Boolean} True is login was successful
   */
  async login() {
    const loginOk = await this.web3Connection.login();
    if (loginOk) this._loadDataFromWeb3Connection();
    return loginOk;
  }

  /**
   * @function
   * @description Get ETH Network
   * @return {String} Network Name (Ex : Kovan)
   */
  async getETHNetwork() {
    return await this.web3Connection.getETHNetwork();
  }

  /**
   * @function
   * @description Get contract current user/sender address
   * @param {Address} User address
   */
  async getUserAddress() {
    return await this.web3Connection.getAddress();
  }

  /**
   * @function
   * @description Get user ETH Balance of Address connected via login()
   * @return {Integer} User ETH Balance
   */
  async getUserETHBalance() {
    return await this.web3Connection.getETHBalance();
  }
}

export default IContract;
