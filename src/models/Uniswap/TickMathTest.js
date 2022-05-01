import BigNumber from 'bignumber.js';

import { tickMathTest } from '../../interfaces';
import IContract from '../IContract';

/** @typedef {Object} TickMathTest~Options
* @property {Boolean} test
* @property {Boolean} localtest
* @property {Web3Connection} [web3Connection=Web3Connection]
* @property {address} [contractAddress]
*/

/**
 * TickMathTest Object
 * @class TickMathTest
 * @param {TickMathTest~Options} options
 */
export default class TickMathTest extends IContract {
  constructor(params = {}) {
    super({ abi: tickMathTest, ...params });
  }

  /**
   * @param {Object} params
   * @param {int24} params.tick
   * @returns {Promise<uint160>}
   */
  async getSqrtRatioAtTick({ tick }) {
    return BigNumber(await this.getContract().methods.getSqrtRatioAtTick(tick).call());
  }

  /**
   * @param {Object} params
   * @param {int24} params.tick
   * @returns {Promise<uint256>}
   */
  async getGasCostOfGetSqrtRatioAtTick({ tick }) {
    return BigNumber(await this.getContract().methods.getGasCostOfGetSqrtRatioAtTick(tick).call());
  }

  /**
   * @param {Object} params
   * @param {uint160} params.sqrtPriceX96
   * @returns {Promise<int24>}
   */
  async getTickAtSqrtRatio({ sqrtPriceX96 }) {
    return BigNumber(await this.getContract().methods.getTickAtSqrtRatio(sqrtPriceX96).call());
  }

  /**
   * @param {Object} params
   * @param {uint160} params.sqrtPriceX96
   * @returns {Promise<uint256>}
   */
  async getGasCostOfGetTickAtSqrtRatio({ sqrtPriceX96 }) {
    return BigNumber(await this.getContract().methods.getGasCostOfGetTickAtSqrtRatio(sqrtPriceX96).call());
  }

  /**
   * @returns {Promise<uint160>}
   */
  async MIN_SQRT_RATIO() {
    return BigNumber(await this.getContract().methods.MIN_SQRT_RATIO().call());
  }

  /**
   * @returns {Promise<uint160>}
   */
  async MAX_SQRT_RATIO() {
    return BigNumber(await this.getContract().methods.MAX_SQRT_RATIO().call());
  }

  /**
   * Deploy the TickMathTest Contract
   * @function
   * @param {IContract~TxOptions} options
   * @return {Promise<*|undefined>}
   */
  deploy = async options => {
    const params = [];

    const res = await this.__deploy(params, options);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };
}
