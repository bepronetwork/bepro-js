import moment from 'moment';
import { erc20distribution } from '../../interfaces';
import ERC20Contract from './ERC20Contract';
import IContract from '../IContract';
import Numbers from '../../utils/Numbers';

/**
 * @typedef {Object} ERC20Distribution~Options
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection] created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 */

/**
 * ERC20 Token Distribution Contract Object
 * @class ERC20Distribution
 * @param {ERC20Distribution~Options} options
 */
class ERC20Distribution extends IContract {
  constructor(params = {}) {
    super({ ...params, abi: erc20distribution });
  }

  /**
   * Get ERC20 Address of the Token Contract managed
   * @returns {Promise<Address>}
   */
  async erc20() {
    return await this.getWeb3Contract().methods.erc20().call();
  }

  /**
   * Get Token Amount of ERC20 Address
   * @function
   * @param {Object} params
   * @param {Address} params.address
   * @returns {Promise<number>} Token Amount
   */
  async getTokenAmount({ address }) {
    return await this.getERC20Contract().getTokenAmount(address);
  }

  /**
   * (Admin only) Set Token address
   * @function
   * @param {Object} params
   * @param {Address} params.address ERC20 Address
   * @param {IContract~TxOptions} options
   * @returns {Promise<boolean>} Success True if operation was successful
   */
  setTokenAddress({ address }, options) {
    return this.__sendTx(
      this.getWeb3Contract().methods.setTokenAddress(address),
      options,
    );
  }

  /**
   * (Admin only) Get All tokens from the Distribution Contract
   * @function
   * @param {Object} params
   * @param {Address} params.address Address to transfer the ERC20 tokens to
   * @param {IContract~TxOptions} options
   * @returns {Promise<boolean>} Success True if operation was successful
   */
  safeGuardAllTokens({ address }, options) {
    return this.__sendTx(
      this.getWeb3Contract().methods.safeGuardAllTokens(address),
      options,
    );
  }

  /**
   * (Admin only) Set the Token Generation Event
   * @function
   * @param {Object} params
   * @param {Integer} params.time Time to set the TGE to (Token Generation Event)
   * @param {IContract~TxOptions} options
   * @returns {Promise<boolean>} Success True if operation was successful
   */
  setTGEDate({ time }, options) {
    return this.__sendTx(
      this.getWeb3Contract().methods.setTGEDate(Numbers.timeToSmartContractTime(time)),
      options,
    );
  }

  /**
   * (Admin only) Set Initial Distribution (Call the amount of times necessary)
   * @function
   * @param {Object} params
   * @param {Address} params.address Address of the recipient
   * @param {Integer} params.tokenAmount Token amount for this tranche
   * @param {Integer} params.unlockTime Time to when this tokens unlock
   * @param {IContract~TxOptions} options
   * @returns {Promise<boolean>} Success True if operation was successful
   */
  async setInitialDistribution({ address, tokenAmount, unlockTime }, options) {
    const tokenAmountWithDecimals = Numbers.toSmartContractDecimals(
      tokenAmount,
      this.getERC20Contract().getDecimals(),
    );
    return await this.__sendTx(
      this.getWeb3Contract().methods.setInitialDistribution(
        address,
        tokenAmountWithDecimals,
        Numbers.timeToSmartContractTime(unlockTime),
      ),
      options,
    );
  }

  /**
   * Trigger Token - should be called every month
   * @function
   * @param {IContract~TxOptions} options
   * @returns {Promise<boolean>} Success True if operation was successful
   */
  triggerTokenSend(options) {
    return this.__sendTx(
      this.getWeb3Contract().methods.triggerTokenSend(),
      options,
    );
  }

  /**
   *
   * @return {Promise<void>}
   * @throws {Error} Contract is not deployed, first deploy it and provide a contract address
   */
  __assert = async () => {
    if (!this.getAddress()) {
      throw new Error(
        'Contract is not deployed, first deploy it and provide a contract address',
      );
    }

    /* Use ABI */
    this.params.contract.use(erc20distribution, this.getAddress());

    /* Set Token Address Contract for easy access */
    if (!this.params.ERC20Contract) {
      this.params.ERC20Contract = new ERC20Contract({
        web3Connection: this.web3Connection,
        contractAddress: await this.erc20(),
      });
    }
    /* Assert Token Contract */
    await this.params.ERC20Contract.__assert();
  };

  /**
   * Deploy the Contract
   * @function
   * @param {IContract~TxOptions} options
   * @return {Promise<*|undefined>}
   * @throws {Error} No Token Address Provided
   */
  deploy = async (options) => {
    const params = [];
    const res = await this.__deploy(params, options);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };

  /**
   * @function
   * @return ERC20Contract|undefined
   */
  getERC20Contract() {
    return this.params.ERC20Contract;
  }
}

export default ERC20Distribution;
