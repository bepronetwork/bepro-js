import { ierc20 } from '../../interfaces';
import Numbers from '../../utils/Numbers';
import IContract from '../IContract';

/**
 * @typedef {Object} ERC20Contract~Options
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection] created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 */

/**
 * @class ERC20Contract
 * @param {ERC20Contract~Options} options
 */
class ERC20Contract extends IContract {
  constructor(params = {}) {
    super({ abi: ierc20, ...params });
  }

  /**
   * Use a {@link ierc20} contract with the current address
   * @return {Promise<void>}
   */
  __assert = async () => {
    this.params.contract.use(ierc20, this.getAddress());
    this.params.decimals = await this.getDecimalsAsync();
  };

  /**
   * Get Token Address
   * @returns {Address} address
   */
  getAddress() {
    return this.params.contractAddress;
  }

  /**
   * Transfer Tokens
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.toAddress To Address
   * @param {Integer} params.tokenAmount Amount of Tokens
   * @param {IContract~TxOptions} options
   * @returns {Promise<Transaction>} Transaction
   */
  async transferTokenAmount({ toAddress, tokenAmount }, options) {
    // const amountWithDecimals = Numbers.toSmartContractDecimals(
    const amountWithDecimals = Numbers.fromBNToDecimals(
      tokenAmount,
      this.getDecimals(),
    );
    return await this.__sendTx(
      this.getWeb3Contract().methods.transfer(toAddress, amountWithDecimals),
      options,
    );
  }

  /**
   * Transfer Tokens
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.to To Address
   * @param {Integer} params.amount Amount of Tokens
   * @param {IContract~TxOptions} options
   * @returns {Promise<Transaction>} Transaction
   */
  async transfer({ to, amount }, options) {
    const amountWithDecimals = Numbers.fromBNToDecimals(
      amount,
      this.getDecimals(),
    );
    return await this.__sendTx(
      this.getWeb3Contract().methods.transfer(to, amountWithDecimals),
      options,
    );
  }

  /**
   * Transfer Tokens from one address to another.
   * NOTE: Prior transfer approval is needed first for the sender/caller.
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.from From Address
   * @param {Address} params.to To Address
   * @param {Integer} params.amount Amount of Tokens
   * @param {IContract~TxOptions} options
   * @returns {Promise<Transaction>} Transaction
   */
  async transferFrom({ from, to, amount }, options) {
    const amountWithDecimals = Numbers.fromBNToDecimals(
      amount,
      this.getDecimals(),
    );
    return await this.__sendTx(
      this.getWeb3Contract().methods.transferFrom(from, to, amountWithDecimals),
      options,
    );
  }

  /**
   * Get Amount of Tokens User Holds
   * @function
   * @param {Address} address User Address
   * @returns {Promise<Transaction>} Transaction
   */
  async getTokenAmount(address) {
    return Numbers.fromDecimals(
      await this.getWeb3Contract().methods.balanceOf(address).call(),
      this.getDecimals(),
    );
  }

  async balanceOf(address) {
    const b1 = await this.getWeb3Contract().methods.balanceOf(address).call();
    const ret1 = Numbers.fromDecimalsToBN(
      b1,
      this.getDecimals(),
    );
    return ret1;
  }

  /**
   * Convert given tokens amount as tokens with decimals for smart contract.
   * @function
   * @param {number} amount Tokens amount to convert
   * @returns {Promise<number>} tokensAmount
   */
  toTokens(amount) {
    const tokensAmount = Numbers.fromBNToDecimals(
      amount,
      this.getDecimals(),
    );
    console.log('ERC20Contract.toTokens:', tokensAmount);
    return tokensAmount;
  }

  /**
   * Convert given tokens amount integer to float number with decimals for UI.
   * @function
   * @param {number} amount Tokens amount to convert
   * @returns {Promise<number>} tokensAmount
   */
  fromDecimalsToBN(amount) {
    const tokensAmount = Numbers.fromDecimalsToBN(
      amount,
      this.getDecimals(),
    );
    // console.log('ERC20Contract.fromDecimals:', tokensAmount);
    return tokensAmount;
  }

  /**
   * Get Total Supply of Token
   * @function
   * @returns {Promise<number>} Total supply
   */
  async totalSupply() {
    return Numbers.fromDecimalsToBN(
      await this.getWeb3Contract().methods.totalSupply().call(),
      this.getDecimals(),
    );
  }

  /**
   *
   * @return {Contract}
   */
  getABI() {
    return this.params.contract;
  }

  /**
   * Get Decimals of Token
   * @function
   * @returns {number} Total supply
   */
  getDecimals() {
    return this.params.decimals;
  }

  /**
   *
   * @return {Promise<number>}
   */
  async getDecimalsAsync() {
    return await this.getWeb3Contract().methods.decimals().call();
  }

  /**
   * Verify if Spender is Approved to use tokens
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.address Sender Address
   * @param {number} params.amount Amount of Tokens
   * @param {Address} params.spenderAddress Spender Address
   * @returns {Promise<boolean>} isApproved
   */
  async isApproved({ address, amount, spenderAddress }) {
    const approvedAmount = Numbers.fromDecimals(
      await this.getWeb3Contract().methods.allowance(address, spenderAddress).call(),
      this.getDecimals(),
    );
    const amountWithDecimal = Numbers.fromDecimals(
      amount,
      this.getDecimals(),
    );
    return approvedAmount >= amountWithDecimal;
  }

  /**
   * Check allowance for given spender address
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.address Sender Address
   * @param {Address} params.spenderAddress Spender Address
   * @returns {Promise<number>} allowance amount
   */
  async allowance({ address, spenderAddress }) {
    const approvedAmount = Numbers.fromDecimalsToBN(
      await this.getWeb3Contract().methods.allowance(address, spenderAddress).call(),
      this.getDecimals(),
    );
    return approvedAmount;
  }

  /**
   * Approve tokens to be used by another address/contract
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.address Spender Address/Contract
   * @param {number} params.amount Amount of Tokens
   * @param {function():void} params.callback callback for the Tx
   * @param {IContract~TxOptions} options
   * @returns {Promise<Transaction>} Transaction
   */
  async approve({ address, amount, callback }, options) {
    const amountWithDecimals = Numbers.fromBNToDecimals(
      amount,
      this.getDecimals(),
    );
    return await this.__sendTx(
      this.getWeb3Contract().methods.approve(address, amountWithDecimals),
      { callback, ...options },
    );
  }

  /**
   * Deploy ERC20 Token
   * @function
   * @param {Object} params Parameters
   * @param {string} params.name Name of token
   * @param {string} params.symbol Symbol of token
   * @param {number} params.cap Max supply of Token (ex : 100M)
   * @param {Address} params.distributionAddress Where tokens should be sent to initially
   * @param {IContract~TxOptions} options
   * @returns {Promise<Transaction>} Transaction
   */
  deploy = async (
    {
      name, symbol, cap, distributionAddress,
    },
    options,
  ) => {
    if (!distributionAddress) {
      throw new Error('Please provide an Distribution address for distro');
    }

    if (!name) {
      throw new Error('Please provide a name');
    }

    if (!symbol) {
      throw new Error('Please provide a symbol');
    }

    if (!cap) {
      throw new Error('Please provide a cap');
    }
    const params = [name, symbol, cap, distributionAddress];
    const res = await this.__deploy(params, options);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };
}

export default ERC20Contract;
