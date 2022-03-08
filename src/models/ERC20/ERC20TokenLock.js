import moment from 'moment';
import { tokenlock } from '../../interfaces';
import ERC20Contract from './ERC20Contract';
import IContract from '../IContract';
import Numbers from '../../utils/Numbers';

const assert = require('assert');

/**
 * @typedef {Object} ERC20TokenLock~Options
 * @property {string} tokenAddress
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection] created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 */

/**
 * ERC20 Token Lock Contract Object
 * @class ERC20TokenLock
 * @param {ERC20TokenLock~Options} options
 */
class ERC20TokenLock extends IContract {
  constructor(params = {}) {
    super({ ...params, abi: tokenlock });
    if (params.tokenAddress) {
      this.params.ERC20Contract = new ERC20Contract({
        web3Connection: this.web3Connection,
        contractAddress: params.tokenAddress,
      });
    }
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
   * Get All Tokens staked/locked at that specific moment
   * @returns {Integer} Token Amount
   */
  async totalAmountStaked() {
    const res = await this.getWeb3Contract().methods.totalAmountStaked().call();
    return Numbers.fromDecimals(res, this.getERC20Contract().getDecimals());
  }

  /**
   * Get minimum amount of tokens to lock per user
   * @returns {Promise<number>} Minimum Amount
   */
  async minAmountToLock() {
    const res = await this.getWeb3Contract().methods.minAmountToLock().call();
    return Numbers.fromDecimals(res, this.getERC20Contract().getDecimals());
  }

  /**
   * Get maximum amount of tokens to lock per user
   * @returns {Promise<number>} Maximum Amount
   */
  async maxAmountToLock() {
    const res = await this.getWeb3Contract().methods.maxAmountToLock().call();
    return Numbers.fromDecimals(res, this.getERC20Contract().getDecimals());
  }

  /**
   * Check if locked tokens release date has come and user can withdraw them
   * @function
   * @param {Object} params
   * @param {Address} params.address
   * @param {IContract~TxOptions} options
   * @returns {Promise<boolean>} canRelease
   */
  async canRelease({ address }) {
    return await this.getWeb3Contract().methods.canRelease(address).call();
  }

  /**
   * Get locked tokens amount for a given address
   * @function
   * @param {Object} params
   * @param {Address} params.address
   * @param {IContract~TxOptions} options
   * @returns {Promise<number>} amount Locked token amount
   */
  async getLockedTokens({ address }) {
    const res = await this.getWeb3Contract().methods.getLockedTokens(address).call();
    return Numbers.fromDecimals(res, this.getERC20Contract().getDecimals());
  }

  /**
   * Get locked tokens info for a given address
   * @function
   * @param {Object} params
   * @param {Address} params.address
   * @returns {Date} startDate
   * @returns {Date} endDate
   * @param {IContract~TxOptions} options
   * @returns {Promise<number>} amount Token amount
   */
  async getLockedTokensInfo({ address }) {
    const res = await this.getWeb3Contract().methods.getLockedTokensInfo(address).call();

    return {
      startDate: Numbers.fromSmartContractTimeToMinutes(res[0]),
      endDate: Numbers.fromSmartContractTimeToMinutes(res[1]),
      amount: Numbers.fromDecimals(
        res[2],
        this.getERC20Contract().getDecimals(),
      ),
    };
  }

  /**
   * (Admin only) sets maximum amount of tokens to lock per user
   * @function
   * @param {Object} params
   * @param {Address} params.tokenAmount Amount of Tokens
   * @param {IContract~TxOptions} options
   * @returns {Promise<boolean>} Success True if operation was successful
   */
  async setMaxAmountToLock({ tokenAmount }, options) {
    this.onlyOwner(); // verify that user is admin

    /* Get Decimals of Amount */
    const amountWithDecimals = Numbers.toSmartContractDecimals(
      tokenAmount,
      this.getERC20Contract().getDecimals(),
    );

    return await this.__sendTx(
      this.getWeb3Contract().methods.setMaxAmountToLock(amountWithDecimals),
      options,
    );
  }

  /**
   * (Admin only) sets minimum amount of tokens to lock per user
   * @function
   * @param {Object} params
   * @param {number} params.tokenAmount Minimum tokens amount
   * @param {IContract~TxOptions} options
   * @returns {Promise<boolean>} Success True if operation was successful
   */
  async setMinAmountToLock({ tokenAmount }, options) {
    this.onlyOwner(); // verify that user is admin

    /* Get Decimals of Amount */
    const amountWithDecimals = Numbers.toSmartContractDecimals(
      tokenAmount,
      this.getERC20Contract().getDecimals(),
    );

    return await this.__sendTx(
      this.getWeb3Contract().methods.setMinAmountToLock(amountWithDecimals),
      options,
    );
  }

  /**
   * User locks his tokens until specified end date.
   * REQUIREMENTS:
   *  user must have approved this contract to spend the tokens "amount" he wants to lock before calling this function.
   * @function
   * @param {Object} params
   * @param {Address} params.address User Address
   * @param {number} params.amount Tokens amount to be locked
   * @param {Date} params.endDate Lock tokens until this end date
   * @param {IContract~TxOptions} options
   * @returns {Promise<boolean>} Success True if operation was successful
   */
  async lock({ address, amount, endDate }, options) {
    // / 'address' is current user address

    this.whenNotPaused(); // verify that contract is not paused

    assert(
      amount > 0
      && amount >= (await this.minAmountToLock())
      && amount <= (await this.maxAmountToLock()),
      'Invalid token amount',
    );
    assert(endDate > moment(), 'Invalid end date');

    // check if user can lock tokens
    const lockedAmount = await this.getLockedTokens({ address });
    assert(lockedAmount == 0, 'User already has locked tokens'); // otherwise user already locked tokens

    /* Verify if transfer is approved for this amount */
    const isApproved = await this.getERC20Contract().isApproved({
      address,
      amount,
      spenderAddress: this.getAddress(),
    });
    if (!isApproved) {
      throw new Error(
        "Has to Approve Token Transfer First, use the 'approve' Call",
      );
    }
    return await this.__sendTx(
      this.getWeb3Contract().methods.lock(
        Numbers.toSmartContractDecimals(
          amount,
          this.getERC20Contract().getDecimals(),
        ),
        Numbers.timeToSmartContractTime(endDate),
      ),
      options,
    );
  }

  /**
   * User withdraws his locked tokens after specified end date
   * @function
   * @param {Object} params
   * @param {Address} params.address User Address
   * @param {IContract~TxOptions} options
   * @return {Promise<boolean>} Success True if operation was successful
   */
  async release({ address }, options) {
    // / 'address' is current user address

    // check if user has locked tokens and if he can unlock and withdraw them
    const { endDate, amount } = await this.getLockedTokensInfo({ address });
    const lockedAmount = amount;

    assert(lockedAmount > 0, 'ERC20TokenLock.user has no locked tokens');
    assert(moment() >= endDate, 'ERC20TokenLock.tokens release date not reached');

    return await this.__sendTx(
      this.getWeb3Contract().methods.release(),
      options,
    );
  }

  /**
   * Approve this contract to transfer tokens of the ERC20 token contract on behalf of user
   * @function
   * @param {IContract~TxOptions} options
   * @return {Promise<boolean>} Success True if operation was successful
   */
  async approveERC20Transfer(options) {
    // let totalMaxAmount = await this.getERC20Contract().getTokenAmount(await this.getUserAddress());
    const totalMaxAmount = await this.getERC20Contract().totalSupply();
    return await this.getERC20Contract().approve({
      address: this.getAddress(),
      amount: Numbers.toSmartContractDecimals(
        totalMaxAmount,
        this.getERC20Contract().getDecimals(),
      ),
    }, options);
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
    this.params.contract.use(tokenlock, this.getAddress());

    /* Set Token Address Contract for easy access */
    if (!this.params.ERC20Contract) {
      this.params.ERC20Contract = new ERC20Contract({
        web3Connection: this.web3Connection,
        contractAddress: await this.erc20(),
      });
    }
    /* Assert Token Contract */
    await this.params.ERC20Contract.login();
    await this.params.ERC20Contract.__assert();
  };

  /**
   * Deploy the ERC20 Token Lock Contract
   * @function
   * @param {IContract~TxOptions} options
   * @return {Promise<*|undefined>}
   * @throws {Error} No Token Address Provided
   */
  deploy = async (options) => {
    if (!this.getERC20Contract()) {
      throw new Error('No Token Address Provided');
    }
    const params = [this.getERC20Contract().getAddress()];

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

export default ERC20TokenLock;
