import { swapRouter } from '../../interfaces';
import IContract from '../IContract';

/** @typedef {Object} SwapRouter~Options
* @property {address} _factory
* @property {address} _WETH9
* @property {Boolean} test
* @property {Boolean} localtest
* @property {Web3Connection} [web3Connection=Web3Connection]
* @property {address} [contractAddress]
*/

/**
 * SwapRouter Object
 * @class SwapRouter
 * @param {SwapRouter~Options} options
 */
export default class SwapRouter extends IContract {
  constructor(params = {}) {
    super({ abi: swapRouter, ...params });
    if (!params.factory) {
      throw new Error('Please provide a UniswapV3Factory contract address');
    }
    if (!params.weth9) {
      throw new Error('Please provide a WETH9 contract address');
    }
    this.params.factory = params.factory;
    this.params.weth9 = params.weth9;
  }

  /**
   * @returns {Promise<address>}
   */
  WETH9() {
    // return await this.getContract().methods.WETH9().call();
    return this.params.weth9;
  }

  /**
   * @param {Object} params
   * @param {tuple} params.tuple
   * @returns {Promise<uint256>} amountOut
   */
  exactInput({ tuple }, options) {
    return this.__sendTx(
      this.getContract().methods.exactInput(tuple),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {tuple} params.tuple
   * @returns {Promise<uint256>} amountOut
   */
  exactInputSingle({ tuple }, options) {
    return this.__sendTx(
      this.getContract().methods.exactInputSingle(tuple),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {tuple} params.tuple
   * @returns {Promise<uint256>} amountIn
   */
  exactOutput({ tuple }, options) {
    return this.__sendTx(
      this.getContract().methods.exactOutput(tuple),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {tuple} params.tuple
   * @returns {Promise<uint256>} amountIn
   */
  exactOutputSingle({ tuple }, options) {
    return this.__sendTx(
      this.getContract().methods.exactOutputSingle(tuple),
      options,
    );
  }

  /**
   * @returns {Promise<address>}
   */
  factory() {
    // return await this.getContract().methods.factory().call();
    return this.params.factory;
  }

  /**
   * @param {bytes[]} data
   * @returns {Promise<bytes[]>} results
   */
  multicall({ data }, options) {
    return this.__sendTx(
      this.getContract().methods.multicall(data),
      options,
    );
  }

  /**
   * @returns {Promise<void>}
   */
  refundETH(options) {
    return this.__sendTx(
      this.getContract().methods.refundETH(),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {address} params.token
   * @param {uint256} params.value
   * @param {uint256} params.deadline
   * @param {uint8} params.v
   * @param {bytes32} params.r
   * @param {bytes32} params.s
   * @returns {Promise<void>}
   */
  selfPermit({
    token, value, deadline, v, r, s,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.selfPermit(token, value, deadline, v, r, s),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {address} params.token
   * @param {uint256} params.nonce
   * @param {uint256} params.expiry
   * @param {uint8} params.v
   * @param {bytes32} params.r
   * @param {bytes32} params.s
   * @returns {Promise<void>}
   */
  selfPermitAllowed({
    token, nonce, expiry, v, r, s,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.selfPermitAllowed(token, nonce, expiry, v, r, s),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {address} params.token
   * @param {uint256} params.nonce
   * @param {uint256} params.expiry
   * @param {uint8} params.v
   * @param {bytes32} params.r
   * @param {bytes32} params.s
   * @returns {Promise<void>}
   */
  selfPermitAllowedIfNecessary({
    token, nonce, expiry, v, r, s,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.selfPermitAllowedIfNecessary(token, nonce, expiry, v, r, s),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {address} params.token
   * @param {uint256} params.value
   * @param {uint256} params.deadline
   * @param {uint8} params.v
   * @param {bytes32} params.r
   * @param {bytes32} params.s
   * @returns {Promise<void>}
   */
  selfPermitIfNecessary({
    token, value, deadline, v, r, s,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.selfPermitIfNecessary(token, value, deadline, v, r, s),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {address} params.token
   * @param {uint256} params.amountMinimum
   * @param {address} params.recipient
   * @returns {Promise<void>}
   */
  sweepToken({ token, amountMinimum, recipient }, options) {
    return this.__sendTx(
      this.getContract().methods.sweepToken(token, amountMinimum, recipient),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {address} params.token
   * @param {uint256} params.amountMinimum
   * @param {address} params.recipient
   * @param {uint256} params.feeBips
   * @param {address} params.feeRecipient
   * @returns {Promise<void>}
   */
  sweepTokenWithFee({
    token, amountMinimum, recipient, feeBips, feeRecipient,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.sweepTokenWithFee(token, amountMinimum, recipient, feeBips, feeRecipient),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {int256} params.amount0Delta
   * @param {int256} params.amount1Delta
   * @param {bytes} params._data
   * @returns {Promise<void>}
   */
  // uniswapV3SwapCallback({ amount0Delta, amount1Delta, _data }, options) {
  //  return this.__sendTx(
  //    this.getContract().methods.uniswapV3SwapCallback(amount0Delta, amount1Delta, _data),
  //    options,
  //  );
  // };

  /**
   * @param {Object} params
   * @param {uint256} params.amountMinimum
   * @param {address} params.recipient
   * @returns {Promise<void>}
   */
  unwrapWETH9({ amountMinimum, recipient }, options) {
    return this.__sendTx(
      this.getContract().methods.unwrapWETH9(amountMinimum, recipient),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {uint256} params.amountMinimum
   * @param {address} params.recipient
   * @param {uint256} params.feeBips
   * @param {address} params.feeRecipient
   * @returns {Promise<void>}
   */
  unwrapWETH9WithFee({
    amountMinimum, recipient, feeBips, feeRecipient,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.unwrapWETH9WithFee(amountMinimum, recipient, feeBips, feeRecipient),
      options,
    );
  }

  /**
   * Deploy the SwapRouter Contract
   * @function
   * @param {Object} params Parameters
   * @param {function():void} params.callback
   * @return {Promise<*|undefined>}
   */
  deploy = async ({ callback } = {}) => {
    const params = [ this.params.factory, this.params.weth9 ];

    const res = await this.__deploy(params, callback);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };
}
