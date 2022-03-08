import { sablier } from '../../interfaces';
import IContract from '../IContract';
import Numbers from '../../utils/Numbers';

const assert = require('assert');

/**
 * Sablier Object for decentralized escrow payments
 * @class Sablier
 * @param {Sablier~Options} options
 */
export default class Sablier extends IContract {
  constructor(params) {
    super({ abi: sablier, ...params });
  }


  /**
   * Add pauser role to given address.
   * @param {Object} params
   * @param {address} params.account Address to assign pauser role to.
   * @param {IContract~TxOptions} options
   * @returns {Promise<void>}
   */
  async addPauser({ account }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.addPauser(account),
      options,
    );
  }


  /**
   * Pause contract.
   * @param {IContract~TxOptions} options
   * @returns {Promise<void>}
   */
  async pause(options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.pause(),
      options,
    );
  }


  /**
   * Unpause/resume contract.
   * @param {IContract~TxOptions} options
   * @returns {Promise<void>}
   */
  async unpause(options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.unpause(),
      options,
    );
  }


  /**
   * Check if the given address has pauser role.
   * @param {Object} params
   * @param {address} params.account Address to check.
   * @returns {Promise<bool>}
   */
  async isPauser({ account }) {
    return await this.getWeb3Contract().methods.isPauser(account).call();
  }


  /**
   * Counter for new stream ids.
   * @returns {Promise<uint256>}
   */
  async nextStreamId() {
    return await this.getWeb3Contract().methods.nextStreamId().call();
  }


  /**
   * The percentage fee charged by the contract on the accrued interest. For example 75
   * @returns {Promise<uint256>} mantissa
   */
  async fee() {
    const res = await this.getWeb3Contract().methods.fee().call();
    // 1e16 is 1% of 1e18, fee is stored with 16 decimals as one hundred percent.
    return Numbers.fromDecimalsToBN(res, 16);
  }


  /**
   * Updates the Sablier fee.
   *  Throws if the caller is not the owner of the contract.
   * @param {Object} params
   * @param {uint256} params.feePercentage The new fee as a percentage, for example 75 means 75%.
   * @param {IContract~TxOptions} options
   * @returns {Promise<void>}
   */
  async updateFee({ feePercentage }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.updateFee(feePercentage),
      options,
    );
  }


  /**
   * Withdraws the earnings for the given token address.
   * Throws if `amount` exceeds the available balance.
   * @param {Object} params
   * @param {address} params.tokenAddress The address of the token to withdraw earnings for.
   * @param {uint256} params.amount The amount of tokens to withdraw.
   * @param {IContract~TxOptions} options
   * @returns {Promise<void>}
   */
  async takeEarnings({ tokenAddress, amount }, options) {
    const decimals = await this.getWeb3Contract().methods.getTokenDecimals(tokenAddress).call();
    const amountWithDecimals = Numbers.fromBNToDecimals(
      amount,
      decimals,
    );
    return await this.__sendTx(
      this.getWeb3Contract().methods.takeEarnings(tokenAddress, amountWithDecimals),
      options,
    );
  }


  /**
   * @typedef {Object} Sablier~getStreamType
   * @property {address} sender
   * @property {address} recipient
   * @property {uint256} deposit
   * @property {address} tokenAddress
   * @property {uint256} startTime
   * @property {uint256} stopTime
   * @property {uint256} remainingBalance
   * @property {uint256} ratePerSecond
   */

  /**
   * Returns the compounding stream with all its properties.
   *  Throws if the id does not point to a valid stream.
   * @param {Object} params
   * @param {uint256} params.streamId The id of the stream to query.
   * @returns {Promise<Sablier~getStream>} The stream object.
   */
  async getStream({ streamId }) {
    const res = await this.getWeb3Contract().methods.getStream(streamId).call();

    const tokenAddress = res[3];
    const decimals = await this.getWeb3Contract().methods.getTokenDecimals(tokenAddress).call();
    return {
      sender: res[0],
      recipient: res[1],
      deposit: Numbers.fromDecimalsToBN(res[2], decimals),
      tokenAddress, // res[3]
      startTime: res[4], // Numbers.fromSmartContractTimeToMinutes(res[4]),
      stopTime: res[5], // Numbers.fromSmartContractTimeToMinutes(res[5]),
      remainingBalance: Numbers.fromDecimalsToBN(res[6], decimals),
      ratePerSecond: Numbers.fromDecimalsToBN(res[7], decimals),
    };
  }


  /**
   * Returns either the delta in seconds between `block.timestamp` and `startTime` or
   *  between `stopTime` and `startTime, whichever is smaller. If `block.timestamp` is before
   *  `startTime`, it returns 0.
   *  Throws if the id does not point to a valid stream.
   * @param {Object} params
   * @param {uint256} params.streamId The id of the stream for which to query the delta.
   * @returns {Promise<uint256>} delta The time delta in seconds.
   */
  async deltaOf({ streamId }) {
    return await this.getWeb3Contract().methods.deltaOf(streamId).call();
  }


  /**
   * Returns the available funds for the given stream id and address.
   *  Throws if the id does not point to a valid stream.
   * @param {Object} params
   * @param {uint256} params.streamId The id of the stream for which to query the balance.
   * @param {address} params.who The address for which to query the balance.
   * @returns {Promise<uint256>} balance The total funds allocated to `who` as uint256.
   */
  async balanceOf({ streamId, who }) {
    const decimals = await this.getWeb3Contract().methods.getTokenDecimalsFromStream(streamId).call();
    const balance = await this.getWeb3Contract().methods.balanceOf(streamId, who).call();
    const ret = Numbers.fromDecimalsToBN(balance, decimals);
    console.log('---Sablier.balanceOf.RAW: decimals ', decimals, ' | balance: ', balance);
    return ret;
  }


  /**
   * Checks if the provided id points to a valid compounding stream.
   * @param {Object} params
   * @param {uint256} params.streamId The id of the compounding stream to check.
   * @returns {Promise<bool>} True if it is a compounding stream, otherwise false.
   */
  async isCompoundingStream({ streamId }) {
    return await this.getWeb3Contract().methods.isCompoundingStream(streamId).call();
  }


  /**
   * @typedef {Object} Sablier~getCompoundingStreamType
   * @property {address} sender
   * @property {address} recipient
   * @property {uint256} deposit
   * @property {address} tokenAddress
   * @property {uint256} startTime
   * @property {uint256} stopTime
   * @property {uint256} remainingBalance
   * @property {uint256} ratePerSecond
   * @property {uint256} exchangeRateInitial
   * @property {uint256} senderSharePercentage
   * @property {uint256} recipientSharePercentage
   */

  /**
   * Returns the compounding stream object with all its properties.
   *  Throws if the id does not point to a valid compounding stream.
   * @param {Object} params
   * @param {uint256} params.streamId The id of the compounding stream to query.
   * @returns {Promise<Sablier~getCompoundingStream>} The compounding stream object.
   */
  async getCompoundingStream({ streamId }) {
    const res = await this.getWeb3Contract().methods.getCompoundingStream(streamId).call();

    const tokenAddress = res[3];
    const decimals = await this.getWeb3Contract().methods.getTokenDecimals(tokenAddress).call();
    return {
      sender: res[0],
      recipient: res[1],
      deposit: Numbers.fromDecimalsToBN(res[2], decimals),
      tokenAddress, // res[3]
      startTime: res[4], // Numbers.fromSmartContractTimeToMinutes(res[4]),
      stopTime: res[5], // Numbers.fromSmartContractTimeToMinutes(res[5]),
      remainingBalance: Numbers.fromDecimalsToBN(res[6], decimals),
      ratePerSecond: Numbers.fromDecimalsToBN(res[7], decimals),
      exchangeRateInitial: Numbers.fromDecimalsToBN(res[8], decimals), // uint256, TODO ??? any conversion needed
      senderSharePercentage: Numbers.fromDecimalsToBN(res[9], 16), // comes scaled up to 1e16, for example 75*1e16 is 75%
      recipientSharePercentage: Numbers.fromDecimalsToBN(res[10], 16),
    };
  }


  /** @typedef {Object} Sablier~interestOfType
   * @property {uint256} senderInterest
   * @property {uint256} recipientInterest
   * @property {uint256} sablierInterest
   */

  /**
   * Computes the interest accrued while the money has been streamed. Returns (0, 0, 0) if
   *  the stream is either not a compounding stream or it does not exist.
   *  Throws if there is a math error. We do not assert the calculations which involve the current
   *  exchange rate, because we can't know what value we'll get back from the cToken contract.
   * @param {Object} params
   * @param {uint256} params.streamId The id of the compounding stream for which to calculate the interest.
   * @param {uint256} params.amount The amount of money with respect to which to calculate the interest.
   * @returns {Promise<Sablier~interestOf>} The interest accrued by the sender, the recipient and sablier, respectively, as uint256s.
   */
  async interestOf({ streamId, amount }) {
    const decimals = await this.getWeb3Contract().methods.getTokenDecimalsFromStream(streamId).call();
    const amountWithDecimals = Numbers.fromBNToDecimals(amount, decimals);
    const res = await this.getWeb3Contract().methods.interestOf(streamId, amountWithDecimals).call();
    return {
      senderInterest: Numbers.fromDecimalsToBN(res[0], decimals),
      recipientInterest: Numbers.fromDecimalsToBN(res[1], decimals),
      sablierInterest: Numbers.fromDecimalsToBN(res[2], decimals),
    };
  }


  /**
   * Returns the amount of interest that has been accrued for the given token address.
   * @param {Object} params
   * @param {address} params.tokenAddress The address of the token to get the earnings for.
   * @returns {Promise<uint256>} The amount of interest as uint256.
   */
  async getEarnings({ tokenAddress }) {
    const earnings = await this.getWeb3Contract().methods.getEarnings(tokenAddress).call();
    const decimals = await this.getWeb3Contract().methods.getTokenDecimals(tokenAddress).call();
    const ret1 = Numbers.fromDecimalsToBN(earnings, decimals);
    return ret1;
  }


  /**
   * Creates a new stream funded by `msg.sender` and paid towards `recipient`.
   *  Throws if paused.
   *  Throws if the recipient is the zero address, the contract itself or the caller.
   *  Throws if the deposit is 0.
   *  Throws if the start time is before `block.timestamp`.
   *  Throws if the stop time is before the start time.
   *  Throws if the duration calculation has a math error.
   *  Throws if the deposit is smaller than the duration.
   *  Throws if the deposit is not a multiple of the duration.
   *  Throws if the rate calculation has a math error.
   *  Throws if the next stream id calculation has a math error.
   *  Throws if the contract is not allowed to transfer enough tokens.
   *  Throws if there is a token transfer failure.
   * @param {Object} params
   * @param {address} params.recipient The address towards which the money is streamed.
   * @param {uint256} params.deposit The amount of money to be streamed.
   * @param {address} params.tokenAddress The ERC20 token to use as streaming currency.
   * @param {uint256} params.startTime The unix timestamp for when the stream starts.
   * @param {uint256} params.stopTime The unix timestamp for when the stream stops.
   * @param {IContract~TxOptions} options
   * @returns {Promise<uint256>} The uint256 id of the newly created stream.
   */
  async createStream({
    recipient, deposit, tokenAddress, startTime, stopTime,
  }, options) {
    const decimals = await this.getWeb3Contract().methods.getTokenDecimals(tokenAddress).call();
    const depositWithDecimals = Numbers.fromBNToDecimals(deposit, decimals);
    return await this.__sendTx(
      this.getWeb3Contract().methods.createStream(
        recipient, depositWithDecimals, tokenAddress, startTime, stopTime,
      ),
      options,
    );
  }


  /**
   * Creates a new compounding stream funded by `msg.sender` and paid towards `recipient`.
   * Inherits all security checks from `createStream`.
   *  Throws if the cToken is not whitelisted.
   *  Throws if the sender share percentage and the recipient share percentage do not sum up to 100.
   *  Throws if the the sender share mantissa calculation has a math error.
   *  Throws if the the recipient share mantissa calculation has a math error.
   * @param {Object} params
   * @param {address} params.recipient The address towards which the money is streamed.
   * @param {uint256} params.deposit The amount of money to be streamed.
   * @param {address} params.tokenAddress The ERC20 token to use as streaming currency.
   * @param {uint256} params.startTime The unix timestamp for when the stream starts.
   * @param {uint256} params.stopTime The unix timestamp for when the stream stops.
   * @param {uint256} params.senderSharePercentage The sender's share of the interest, as a percentage.
   * @param {uint256} params.recipientSharePercentage The recipient's share of the interest, as a percentage.
   * @param {IContract~TxOptions} options
   * @returns {Promise<uint256>} The uint256 id of the newly created compounding stream.
   */
  async createCompoundingStream({
    recipient, deposit, tokenAddress, startTime, stopTime, senderSharePercentage, recipientSharePercentage,
  }, options) {
    const decimals = await this.getWeb3Contract().methods.getTokenDecimals(tokenAddress).call();
    const depositWithDecimals = Numbers.fromBNToDecimals(deposit, decimals);
    return await this.__sendTx(
      this.getWeb3Contract().methods.createCompoundingStream(
        recipient, depositWithDecimals, tokenAddress, startTime, stopTime,
        senderSharePercentage, recipientSharePercentage,
      ),
      options,
    );
  }


  /**
   * Withdraws from the contract to the recipient's account.
   *  Throws if the id does not point to a valid stream.
   *  Throws if the caller is not the sender or the recipient of the stream.
   *  Throws if the amount exceeds the available balance.
   *  Throws if there is a token transfer failure.
   * @param {Object} params
   * @param {uint256} params.streamId The id of the stream to withdraw tokens from.
   * @param {uint256} params.amount The amount of tokens to withdraw.
   * @param {IContract~TxOptions} options
   * @returns {Promise<bool>} True if success, otherwise false.
   */
  async withdrawFromStream({ streamId, amount }, options) {
    const decimals = await this.getWeb3Contract().methods.getTokenDecimalsFromStream(streamId).call();
    const amountWithDecimals = Numbers.fromBNToDecimals(amount, decimals);
    return await this.__sendTx(
      this.getWeb3Contract().methods.withdrawFromStream(streamId, amountWithDecimals),
      options,
    );
  }


  /**
   * Cancels the stream and transfers the tokens back on a pro rata basis.
   *  Throws if the id does not point to a valid stream.
   *  Throws if the caller is not the sender or the recipient of the stream.
   *  Throws if there is a token transfer failure.
   * @param {Object} params
   * @param {uint256} params.streamId The id of the stream to cancel.
   * @param {IContract~TxOptions} options
   * @returns {Promise<bool>} True if success, otherwise false.
   */
  async cancelStream({ streamId }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.cancelStream(streamId),
      options,
    );
  }

  /**
   * Get token decimals given a stream id.
   * This is an utility function for DApp layer when converting to float numbers.
   * @param streamId The id of the stream.
   */
  async getTokenDecimalsFromStream({ streamId }) {
    return await this.getWeb3Contract().methods.getTokenDecimalsFromStream(streamId).call();
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
    this.params.contract.use(sablier, this.getAddress());
  };

  /**
   * Deploy the Sablier Contract
   * @function
   * @param {Object} params
   * @param {IContract~TxOptions} options
   * @return {Promise<*|undefined>}
   */
  deploy = async (options) => {
    const params = [];

    const res = await this.__deploy(params, options);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };
}
