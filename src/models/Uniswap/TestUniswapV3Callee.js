import { uniswapCallee } from '../../interfaces';
import Numbers from '../../utils/Numbers';
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
   * @param {address} pool
   * @param {uint256} amount0In
   * @param {address} recipient
   * @param {uint160} sqrtPriceLimitX96
   * @returns {Promise<void>}
   */
  async swapExact0For1(pool, amount0In, recipient, sqrtPriceLimitX96) {
    return await this.__sendTx(this.getWeb3Contract().methods.swapExact0For1(pool, amount0In, recipient, sqrtPriceLimitX96));
  }

  /**
   * @param {address} pool
   * @param {uint256} amount1Out
   * @param {address} recipient
   * @param {uint160} sqrtPriceLimitX96
   * @returns {Promise<void>}
   */
  async swap0ForExact1(pool, amount1Out, recipient, sqrtPriceLimitX96) {
    return await this.__sendTx(this.getWeb3Contract().methods.swap0ForExact1(pool, amount1Out, recipient, sqrtPriceLimitX96));
  }

  /**
   * @param {address} pool
   * @param {uint256} amount1In
   * @param {address} recipient
   * @param {uint160} sqrtPriceLimitX96
   * @returns {Promise<void>}
   */
  async swapExact1For0(pool, amount1In, recipient, sqrtPriceLimitX96) {
    return await this.__sendTx(this.getWeb3Contract().methods.swapExact1For0(pool, amount1In, recipient, sqrtPriceLimitX96));
  }

  /**
   * @param {address} pool
   * @param {uint256} amount0Out
   * @param {address} recipient
   * @param {uint160} sqrtPriceLimitX96
   * @returns {Promise<void>}
   */
  async swap1ForExact0(pool, amount0Out, recipient, sqrtPriceLimitX96) {
    return await this.__sendTx(this.getWeb3Contract().methods.swap1ForExact0(pool, amount0Out, recipient, sqrtPriceLimitX96));
  }

  /**
   * @param {address} pool
   * @param {uint160} sqrtPriceX96
   * @param {address} recipient
   * @returns {Promise<void>}
   */
  async swapToLowerSqrtPrice(pool, sqrtPriceX96, recipient) {
    return await this.__sendTx(this.getWeb3Contract().methods.swapToLowerSqrtPrice(pool, sqrtPriceX96, recipient));
  }

  /**
   * @param {address} pool
   * @param {uint160} sqrtPriceX96
   * @param {address} recipient
   * @returns {Promise<void>}
   */
  async swapToHigherSqrtPrice(pool, sqrtPriceX96, recipient) {
    return await this.__sendTx(this.getWeb3Contract().methods.swapToHigherSqrtPrice(pool, sqrtPriceX96, recipient));
  }

  /**
   * @param {int256} amount0Delta
   * @param {int256} amount1Delta
   * @param {bytes} data
   * @returns {Promise<void>}
   */
  /* async uniswapV3SwapCallback(amount0Delta, amount1Delta, data) {
      return await this.__sendTx(this.getWeb3Contract().methods.uniswapV3SwapCallback(amount0Delta, amount1Delta, data));
    }; */

  /**
   * @param {address} pool
   * @param {address} recipient
   * @param {int24} tickLower
   * @param {int24} tickUpper
   * @param {uint128} amount
   * @returns {Promise<void>}
   */
  async mint(pool, recipient, tickLower, tickUpper, amount) {
    return await this.__sendTx(this.getWeb3Contract().methods.mint(pool, recipient, tickLower, tickUpper, amount));
  }

  /**
   * @param {uint256} amount0Owed
   * @param {uint256} amount1Owed
   * @param {bytes} data
   * @returns {Promise<void>}
   */
  /* async uniswapV3MintCallback(amount0Owed, amount1Owed, data) {
      return await this.__sendTx(this.getWeb3Contract().methods.uniswapV3MintCallback(amount0Owed, amount1Owed, data))
    }; */

  /**
   * @param {address} pool
   * @param {address} recipient
   * @param {uint256} amount0
   * @param {uint256} amount1
   * @param {uint256} pay0
   * @param {uint256} pay1
   * @returns {Promise<void>}
   */
  async flash(pool, recipient, amount0, amount1, pay0, pay1) {
    return await this.__sendTx(this.getWeb3Contract().methods.flash(pool, recipient, amount0, amount1, pay0, pay1));
  }

  /**
   * @param {uint256} fee0
   * @param {uint256} fee1
   * @param {bytes} data
   * @returns {Promise<void>}
   */
  /* async uniswapV3FlashCallback(fee0, fee1, data) {
      return await this.__sendTx(this.getWeb3Contract().methods.uniswapV3FlashCallback(fee0, fee1, data))
    }; */
}
