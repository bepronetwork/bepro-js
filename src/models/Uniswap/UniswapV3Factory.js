import { uniswapFactory } from '../../interfaces';
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
   * @param {Object} params
   * @param {address} params.tokenA
   * @param {address} params.tokenB
   * @param {uint24} params.fee
   * @returns {Promise<address>} pool
   */
  createPool({ tokenA, tokenB, fee }, options) {
    return this.__sendTx(
      this.getContract().methods.createPool(tokenA, tokenB, fee),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {uint24} params.fee
   * @param {int24} params.tickSpacing
   * @returns {Promise<void>}
   */
  enableFeeAmount({ fee, tickSpacing }, options) {
    return this.__sendTx(
      this.getContract().methods.enableFeeAmount(fee, tickSpacing),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {uint24} params.fee
   * @returns {Promise<int24>}
   */
  feeAmountTickSpacing({ fee }) {
    return this.getContract().methods.feeAmountTickSpacing(fee).call();
  }

  /**
   * @param {Object} params
   * @param {address} params.tokenA
   * @param {address} params.tokenB
   * @param {uint24} params.fee
   * @returns {Promise<address>}
   */
  getPool({ tokenA, tokenB, fee }) {
    return this.getContract().methods.getPool(tokenA, tokenB, fee).call();
  }

  /**
   * @returns {Promise<address>}
   */
  owner() {
    return this.getContract().methods.owner().call();
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
    const res = await this.getContract().methods.parameters().call();
    return {
      factory: res[0],
      token0: res[1],
      token1: res[2],
      fee: res[3],
      tickSpacing: res[4],
    };
  }

  /**
   * @param {Object} params
   * @param {address} params.owner
   * @returns {Promise<void>}
   */
  setOwner({ owner }, options) {
    return this.__sendTx(
      this.getContract().methods.setOwner(owner),
      options,
    );
  }
}
