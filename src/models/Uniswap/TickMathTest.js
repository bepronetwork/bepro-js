import { tickMathTest } from '../../interfaces';
import Numbers from '../../utils/Numbers';
import IContract from '../IContract';

const BigNumber = require('bignumber.js');

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
   * @param {int24} tick
   * @returns {Promise<uint160>}
   */
  async getSqrtRatioAtTick(tick) {
    return BigNumber(await this.getWeb3Contract().methods.getSqrtRatioAtTick(tick).call());
  }


  /**
   * @param {int24} tick
   * @returns {Promise<uint256>}
   */
  async getGasCostOfGetSqrtRatioAtTick(tick) {
    return BigNumber(await this.getWeb3Contract().methods.getGasCostOfGetSqrtRatioAtTick(tick).call());
  }


  /**
   * @param {uint160} sqrtPriceX96
   * @returns {Promise<int24>}
   */
  async getTickAtSqrtRatio(sqrtPriceX96) {
    return BigNumber(await this.getWeb3Contract().methods.getTickAtSqrtRatio(sqrtPriceX96).call());
  }


  /**
   * @param {uint160} sqrtPriceX96
   * @returns {Promise<uint256>}
   */
  async getGasCostOfGetTickAtSqrtRatio(sqrtPriceX96) {
    return BigNumber(await this.getWeb3Contract().methods.getGasCostOfGetTickAtSqrtRatio(sqrtPriceX96).call());
  }


  /**
   * @returns {Promise<uint160>}
   */
  async MIN_SQRT_RATIO() {
    return BigNumber(await this.getWeb3Contract().methods.MIN_SQRT_RATIO().call());
  }


  /**
   * @returns {Promise<uint160>}
   */
  async MAX_SQRT_RATIO() {
    return BigNumber(await this.getWeb3Contract().methods.MAX_SQRT_RATIO().call());
  }


  /**
   * Deploy the TickMathTest Contract
   * @function
   * @param {Object} params Parameters
   * @param {function():void} params.callback
   * @return {Promise<*|undefined>}
   */
  deploy = async ({ callback } = {}) => {
    const params = [];

    const res = await this.__deploy(params, callback);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };
}
