import { uniswapCallee } from '../../interfaces';
import IContract from '../IContract';

/**
 * TestUniswapV3Callee Object
 * @class TestUniswapV3Callee
 * @param {TestUniswapV3Callee~Options} options
 */
export default class TestUniswapV3Callee extends IContract {
  constructor(params) {
    super({ abi: uniswapCallee, ...params });
  }

  /**
   * @param {Object} params
   * @param {address} params.pool
   * @param {uint256} params.amount0In
   * @param {address} params.recipient
   * @param {uint160} params.sqrtPriceLimitX96
   * @returns {Promise<void>}
   */
  swapExact0For1({
    pool, amount0In, recipient, sqrtPriceLimitX96,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.swapExact0For1(pool, amount0In, recipient, sqrtPriceLimitX96),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {address} params.pool
   * @param {uint256} params.amount1Out
   * @param {address} params.recipient
   * @param {uint160} params.sqrtPriceLimitX96
   * @returns {Promise<void>}
   */
  swap0ForExact1({
    pool, amount1Out, recipient, sqrtPriceLimitX96,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.swap0ForExact1(pool, amount1Out, recipient, sqrtPriceLimitX96),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {address} params.pool
   * @param {uint256} params.amount1In
   * @param {address} params.recipient
   * @param {uint160} params.sqrtPriceLimitX96
   * @returns {Promise<void>}
   */
  swapExact1For0({
    pool, amount1In, recipient, sqrtPriceLimitX96,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.swapExact1For0(pool, amount1In, recipient, sqrtPriceLimitX96),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {address} params.pool
   * @param {uint256} params.amount0Out
   * @param {address} params.recipient
   * @param {uint160} params.sqrtPriceLimitX96
   * @returns {Promise<void>}
   */
  swap1ForExact0({
    pool, amount0Out, recipient, sqrtPriceLimitX96,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.swap1ForExact0(pool, amount0Out, recipient, sqrtPriceLimitX96),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {address} params.pool
   * @param {uint160} params.sqrtPriceX96
   * @param {address} params.recipient
   * @returns {Promise<void>}
   */
  swapToLowerSqrtPrice({ pool, sqrtPriceX96, recipient }, options) {
    return this.__sendTx(
      this.getContract().methods.swapToLowerSqrtPrice(pool, sqrtPriceX96, recipient),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {address} params.pool
   * @param {uint160} params.sqrtPriceX96
   * @param {address} params.recipient
   * @returns {Promise<void>}
   */
  swapToHigherSqrtPrice({ pool, sqrtPriceX96, recipient }, options) {
    return this.__sendTx(
      this.getContract().methods.swapToHigherSqrtPrice(pool, sqrtPriceX96, recipient),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {int256} params.amount0Delta
   * @param {int256} params.amount1Delta
   * @param {bytes} params.data
   * @returns {Promise<void>}
   */
  // uniswapV3SwapCallback({ amount0Delta, amount1Delta, data }, options) {
  //   return this.__sendTx(
  //     this.getContract().methods.uniswapV3SwapCallback(amount0Delta, amount1Delta, data),
  //     options,
  //   );
  // }

  /**
   * @param {Object} params
   * @param {address} params.pool
   * @param {address} params.recipient
   * @param {int24} params.tickLower
   * @param {int24} params.tickUpper
   * @param {uint128} params.amount
   * @returns {Promise<void>}
   */
  mint({
    pool, recipient, tickLower, tickUpper, amount,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.mint(pool, recipient, tickLower, tickUpper, amount),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {uint256} params.amount0Owed
   * @param {uint256} params.amount1Owed
   * @param {bytes} params.data
   * @returns {Promise<void>}
   */
  // uniswapV3MintCallback({ amount0Owed, amount1Owed, data }, options) {
  //   return this.__sendTx(
  //     this.getContract().methods.uniswapV3MintCallback(amount0Owed, amount1Owed, data),
  //     options,
  //   )
  // };

  /**
   * @param {Object} params
   * @param {address} params.pool
   * @param {address} params.recipient
   * @param {uint256} params.amount0
   * @param {uint256} params.amount1
   * @param {uint256} params.pay0
   * @param {uint256} params.pay1
   * @returns {Promise<void>}
   */
  flash({
    pool, recipient, amount0, amount1, pay0, pay1,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.flash(pool, recipient, amount0, amount1, pay0, pay1),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {uint256} params.fee0
   * @param {uint256} params.fee1
   * @param {bytes} params.data
   * @returns {Promise<void>}
   */
  // uniswapV3FlashCallback({ fee0, fee1, data }, options) {
  //   return this.__sendTx(
  //     this.getContract().methods.uniswapV3FlashCallback(fee0, fee1, data),
  //     options,
  //   )
  // };
}
