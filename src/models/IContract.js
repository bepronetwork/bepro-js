import Contract from '../utils/Contract';

/**
 * Contract Object Interface
 * @class IContract
 * @param {Object} params
 * @param {Web3} params.web3
 * @param {ABI} params.abi
 * @param [Address] params.contractAddress
 * @param [Account] params.acc
 * @throws {Error} Throws an error if ABI or Web3 providers are missing
 */
class IContract {
  constructor({
    web3,
    contractAddress = null /* If not deployed */,
    abi,
    acc,
  }) {
    try {
      if (!abi) {
        throw new Error('No ABI Interface provided');
      }
      if (!web3) {
        throw new Error('Please provide a valid web3 provider');
      }

      this.web3 = web3;

      if (acc) {
        this.acc = acc;
      }
      this.params = {
        web3,
        abi,
        contractAddress,
        contract: new Contract(web3, abi, contractAddress),
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Initialize by awaiting {@link IContract.__assert}
   * @function
   * @return {Promise<void>}
   * @throws {Error} if no {@link IContract.getAddress}, Please add a Contract Address
   */
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

  /**
   * @function
   * @params [Object] params
   * @params {*} params.f
   * @params {*} params.acc
   * @params {*} params.value
   * @params {function():void} params.callback
   * @return {Promise<*>}
   */
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

  /**
   * @function
   * @params {*} f
   * @params {boolean} call
   * @params {*} value
   * @params [function():void] callback
   * @return {Promise<*>}
   */
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

  /**
   * Deploy current contract
   * @function
   * @param {*} params
   * @param {function()} callback
   * @return {Promise<*|undefined>}
   */
  __deploy = async (params, callback) => await this.params.contract.deploy(
    this.acc,
    this.params.contract.getABI(),
    this.params.contract.getJSON().bytecode,
    params,
    callback,
  );

  /**
   * Asserts and uses {@link IContract.params.contract} with {@link IContract.params.abi}
   * @function
   * @void
   * @throws {Error} Contract is not deployed, first deploy it and provide a contract address
   */
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
   * Deploy {@link IContract.params.contract} and call {@link IContract.__assert}
   * @function
   * @param {Object} params
   * @param {function():void} callback
   * @return {Promise<*|undefined>}
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
   * Set new owner of {@link IContract.params.contract}
   * @param {Object} params
   * @param {Address} params.address
   * @return {Promise<*|undefined>}
   */
  async setNewOwner({ address }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.transferOwnership(address),
    );
  }

  /**
   * Get Owner of {@link IContract.params.contract}
   * @returns {Promise<string>}
   */
  async owner() {
    return await this.params.contract.getContract().methods.owner().call();
  }

  /**
   * Get the paused state of {@link IContract.params.contract}
   * @returns {Promise<boolean>}
   */
  async isPaused() {
    return await this.params.contract.getContract().methods.paused().call();
  }

  /**
   * (Admins only) Pauses the Contract
   * @return {Promise<*|undefined>}
   */
  async pauseContract() {
    return await this.__sendTx(
      this.params.contract.getContract().methods.pause(),
    );
  }

  /**
   * (Admins only) Unpause Contract
   * @return {Promise<*|undefined>}
   */
  async unpauseContract() {
    return await this.__sendTx(
      this.params.contract.getContract().methods.unpause(),
    );
  }

  /**
   * Remove Tokens from other ERC20 Address (in case of accident)
   * @param {Object} params
   * @param {Address} params.tokenAddress
   * @param {Address} params.toAddress
   */
  async removeOtherERC20Tokens({ tokenAddress, toAddress }) {
    return await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.removeOtherERC20Tokens(tokenAddress, toAddress),
    );
  }

  /**
   * (Admins only) Safeguards all tokens from {@link IContract.params.contract}
   * @param {Object} params
   * @param {Address} params.toAddress
   * @return {Promise<*|undefined>}
   */
  async safeGuardAllTokens({ toAddress }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.safeGuardAllTokens(toAddress),
    );
  }

  /**
   * Change token address of {@link IContract.params.contract}
   * @param {Object} params
   * @param {Address} params.newTokenAddress
   * @return {Promise<*|undefined>}
   */
  async changeTokenAddress({ newTokenAddress }) {
    return await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.changeTokenAddress(newTokenAddress),
    );
  }

  /**
   * Returns the contract address
   * @returns {string|null} Contract address
   */
  getAddress() {
    return this.params.contractAddress;
  }

  /**
   * Get the Ether balance for the current {@link IContract#getAddress} using `fromWei` util of {@link IContract#web3}
   * @returns {Promise<string>}
   */
  async getBalance() {
    const wei = await this.web3.eth.getBalance(this.getAddress());
    return this.web3.utils.fromWei(wei, 'ether');
  }

  /**
   * Get contract current user/sender address
   * @return {Promise<string>|string}
   */
  async getUserAddress() {
    if (this.acc) return this.acc.getAddress();

    const accounts = await this.params.web3.eth.getAccounts();
    return accounts[0];
  }

  /**
   * Verify that current user/sender is admin, throws an error otherwise
   * @async
   * @throws {Error} Only admin can perform this operation
   * @void
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
   * Verify that contract is not paused before sending a transaction, throws an error otherwise
   * @async
   * @throws {Error} Contract is paused
   * @void
   */
  async whenNotPaused() {
    /* Verify that contract is not paused */
    const paused = await this.isPaused();
    if (paused) {
      throw new Error('Contract is paused');
    }
  }
}

export default IContract;
