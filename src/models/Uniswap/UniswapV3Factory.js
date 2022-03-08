import { uniswapFactory } from '../../interfaces';
import Numbers from '../../utils/Numbers';
import IContract from '../IContract';

/**
 * UniswapV3Factory Object
 * @class UniswapV3Factory
 * @param {UniswapV3Factory~Options} options
 */
export default class UniswapV3Factory extends IContract {
  constructor(params = {}) {
    super({ abi: uniswapFactory, ...params });
  }


  /**
   * @param {address} tokenA
   * @param {address} tokenB
   * @param {uint24} fee
   * @param {IContract~TxOptions} options
   * @returns {Promise<address>} pool
   */
  async createPool(tokenA, tokenB, fee, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.createPool(tokenA, tokenB, fee),
      options,
    );
  }


  /**
   * @param {uint24} fee
   * @param {int24} tickSpacing
   * @param {IContract~TxOptions} options
   * @returns {Promise<void>}
   */
  async enableFeeAmount(fee, tickSpacing, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.enableFeeAmount(fee, tickSpacing),
      options,
    );
  }


  /**
   * @param {uint24}
   * @returns {Promise<int24>}
   */
  async feeAmountTickSpacing(fee) {
    return await this.getWeb3Contract().methods.feeAmountTickSpacing(fee).call();
  }


  /**
   * @param {address} tokenA
   * @param {address} tokenB
   * @param {uint24} fee
   * @returns {Promise<address>}
   */
  async getPool(tokenA, tokenB, fee) {
    return await this.getWeb3Contract().methods.getPool(tokenA, tokenB, fee).call();
  }


  /**
   * @returns {Promise<address>}
   */
  async owner() {
    return await this.getWeb3Contract().methods.owner().call();
  }


  /** @typedef {Object} UniswapV3Factory~parametersType
   * @property {address} factory
   * @property {address} token0
   * @property {address} token1
   * @property {uint24} fee
   * @property {int24} tickSpacing
   */

  /**
   * @returns {Promise<UniswapV3Factory~parameters>}
   */
  async parameters() {
    const res = await this.getWeb3Contract().methods.parameters().call();
    return {
      factory: res[0],
      token0: res[1],
      token1: res[2],
      fee: res[3],
      tickSpacing: res[4],
    };
  }


  /**
   * @param {address} _owner
   * @param {IContract~TxOptions} options
   * @returns {Promise<void>}
   */
  async setOwner(_owner, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.setOwner(_owner),
      options,
    );
  }
}
