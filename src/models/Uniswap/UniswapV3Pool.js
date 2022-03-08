import { uniswapPool } from '../../interfaces';
import Numbers from '../../utils/Numbers';
import IContract from '../IContract';

/**
 * UniswapV3Pool Object
 * @class UniswapV3Pool
 * @param {UniswapV3Pool~Options} options
 */
export default class UniswapV3Pool extends IContract {
  constructor(params = {}) {
    super({ abi: uniswapPool, ...params });
  }


  /** @typedef {Object} UniswapV3Pool~burnType
   * @property {uint256} amount0
   * @property {uint256} amount1
   */

  /**
   * @param {int24} tickLower
   * @param {int24} tickUpper
   * @param {uint128} amount
   * @param {IContract~TxOptions} options
   * @returns {Promise<UniswapV3Pool~burn>}
   */
  async burn(tickLower, tickUpper, amount, options) {
    const res = await this.__sendTx(
      this.getWeb3Contract().methods.burn(tickLower, tickUpper, amount),
      options,
    );
    return {
      amount0: res[0],
      amount1: res[1],
    };
  }


  /** @typedef {Object} UniswapV3Pool~collectType
   * @property {uint128} amount0
   * @property {uint128} amount1
   */

  /**
   * @param {address} recipient
   * @param {int24} tickLower
   * @param {int24} tickUpper
   * @param {uint128} amount0Requested
   * @param {uint128} amount1Requested
   * @param {IContract~TxOptions} options
   * @returns {Promise<UniswapV3Pool~collect>}
   */
  async collect(recipient, tickLower, tickUpper, amount0Requested, amount1Requested, options) {
    const res = await this.__sendTx(
      this.getWeb3Contract().methods.collect(recipient, tickLower, tickUpper, amount0Requested, amount1Requested),
      options,
    );
    return {
      amount0: res[0],
      amount1: res[1],
    };
  }


  /** @typedef {Object} UniswapV3Pool~collectProtocolType
   * @property {uint128} amount0
   * @property {uint128} amount1
   */

  /**
   * @param {address} recipient
   * @param {uint128} amount0Requested
   * @param {uint128} amount1Requested
   * @param {IContract~TxOptions} options
   * @returns {Promise<UniswapV3Pool~collectProtocol>}
   */
  async collectProtocol(recipient, amount0Requested, amount1Requested, options) {
    const res = await this.__sendTx(
      this.getWeb3Contract().methods.collectProtocol(recipient, amount0Requested, amount1Requested),
      options,
    );
    return {
      amount0: res[0],
      amount1: res[1],
    };
  }


  /**
   * @returns {Promise<address>}
   */
  async factory() {
    return await this.getWeb3Contract().methods.factory().call();
  }


  /**
   * @returns {Promise<uint24>}
   */
  async fee() {
    return await this.getWeb3Contract().methods.fee().call();
  }


  /**
   * @returns {Promise<uint256>}
   */
  async feeGrowthGlobal0X128() {
    return await this.getWeb3Contract().methods.feeGrowthGlobal0X128().call();
  }


  /**
   * @returns {Promise<uint256>}
   */
  async feeGrowthGlobal1X128() {
    return await this.getWeb3Contract().methods.feeGrowthGlobal1X128().call();
  }


  /**
   * @param {address} recipient
   * @param {uint256} amount0
   * @param {uint256} amount1
   * @param {bytes} data
   * @param {IContract~TxOptions} options
   * @returns {Promise<void>}
   */
  async flash(recipient, amount0, amount1, data, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.flash(recipient, amount0, amount1, data),
      options,
    );
  }


  /**
   * @param {uint16} observationCardinalityNext
   * @param {IContract~TxOptions} options
   * @returns {Promise<void>}
   */
  async increaseObservationCardinalityNext(observationCardinalityNext, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.increaseObservationCardinalityNext(observationCardinalityNext),
      options,
    );
  }


  /**
   * @param {uint160} sqrtPriceX96
   * @param {IContract~TxOptions} options
   * @returns {Promise<void>}
   */
  async initialize(sqrtPriceX96, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.initialize(sqrtPriceX96),
      options,
    );
  }


  /**
   * @returns {Promise<uint128>}
   */
  async liquidity() {
    return await this.getWeb3Contract().methods.liquidity().call();
  }


  /**
   * @returns {Promise<uint128>}
   */
  async maxLiquidityPerTick() {
    return await this.getWeb3Contract().methods.maxLiquidityPerTick().call();
  }


  /** @typedef {Object} UniswapV3Pool~mintType
   * @property {uint256} amount0
   * @property {uint256} amount1
   */

  /**
   * @param {address} recipient
   * @param {int24} tickLower
   * @param {int24} tickUpper
   * @param {uint128} amount
   * @param {bytes} data
   * @param {IContract~TxOptions} options
   * @returns {Promise<UniswapV3Pool~mint>}
   */
  async mint(recipient, tickLower, tickUpper, amount, data, options) {
    const res = await this.__sendTx(
      this.getWeb3Contract().methods.mint(recipient, tickLower, tickUpper, amount, data),
      options,
    );
    return {
      amount0: res[0],
      amount1: res[1],
    };
  }


  /** @typedef {Object} UniswapV3Pool~observationsType
   * @property {uint32} blockTimestamp
   * @property {int56} tickCumulative
   * @property {uint160} secondsPerLiquidityCumulativeX128
   * @property {bool} initialized
   */

  /**
   * @param {uint256}
   * @returns {Promise<UniswapV3Pool~observations>}
   */
  /* async observations() {
      return await this.getWeb3Contract().methods.observations().call();
    }; */


  /** @typedef {Object} UniswapV3Pool~observeType
   * @property {int56[]} tickCumulatives
   * @property {uint160[]} secondsPerLiquidityCumulativeX128s
   */

  /**
   * @param {uint32[]} secondsAgos
   * @returns {Promise<UniswapV3Pool~observe>}
   */
  /* async observe(secondsAgos) {
      return await this.__sendTx(this.getWeb3Contract().methods.observe(secondsAgos));
    }; */


  /** @typedef {Object} UniswapV3Pool~positionsType
   * @property {uint128} liquidity
   * @property {uint256} feeGrowthInside0LastX128
   * @property {uint256} feeGrowthInside1LastX128
   * @property {uint128} tokensOwed0
   * @property {uint128} tokensOwed1
   */

  /**
   * @param {bytes32}
   * @returns {Promise<UniswapV3Pool~positions>}
   */
  /* async positions() {
      return await this.getWeb3Contract().methods.positions().call();
    }; */


  /** @typedef {Object} UniswapV3Pool~protocolFeesType
   * @property {uint128} token0
   * @property {uint128} token1
   */

  /**
   * @returns {Promise<UniswapV3Pool~protocolFees>}
   */
  async protocolFees() {
    const res = await this.getWeb3Contract().methods.protocolFees().call();
    return {
      token0: res[0],
      token1: res[1],
    };
  }


  /**
   * @param {uint8} feeProtocol0
   * @param {uint8} feeProtocol1
   * @param {IContract~TxOptions} options
   * @returns {Promise<void>}
   */
  async setFeeProtocol(feeProtocol0, feeProtocol1, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.setFeeProtocol(feeProtocol0, feeProtocol1),
      options,
    );
  }


  /** @typedef {Object} UniswapV3Pool~slot0Type
   * @property {uint160} sqrtPriceX96
   * @property {int24} tick
   * @property {uint16} observationIndex
   * @property {uint16} observationCardinality
   * @property {uint16} observationCardinalityNext
   * @property {uint8} feeProtocol
   * @property {bool} unlocked
   */

  /**
   * @returns {Promise<UniswapV3Pool~slot0>}
   */
  async slot0() {
    const res = await this.getWeb3Contract().methods.slot0().call();
    return {
      sqrtPriceX96: res[0],
      tick: res[1],
      observationIndex: res[2],
      observationCardinality: res[3],
      observationCardinalityNext: res[4],
      feeProtocol: res[5],
      unlocked: res[6],
    };
  }


  /** @typedef {Object} UniswapV3Pool~snapshotCumulativesInsideType
   * @property {int56} tickCumulativeInside
   * @property {uint160} secondsPerLiquidityInsideX128
   * @property {uint32} secondsInside
   */

  /**
   * @param {int24} tickLower
   * @param {int24} tickUpper
   * @param {IContract~TxOptions} options
   * @returns {Promise<UniswapV3Pool~snapshotCumulativesInside>}
   */
  async snapshotCumulativesInside(tickLower, tickUpper, options) {
    const res = await this.__sendTx(
      this.getWeb3Contract().methods.snapshotCumulativesInside(tickLower, tickUpper),
      options,
    );
    return {
      tickCumulativeInside: res[0],
      secondsPerLiquidityInsideX128: res[1],
      secondsInside: res[2],
    };
  }


  /** @typedef {Object} UniswapV3Pool~swapType
   * @property {int256} amount0
   * @property {int256} amount1
   */

  /**
   * @param {address} recipient
   * @param {bool} zeroForOne
   * @param {int256} amountSpecified
   * @param {uint160} sqrtPriceLimitX96
   * @param {bytes} data
   * @param {IContract~TxOptions} options
   * @returns {Promise<UniswapV3Pool~swap>}
   */
  async swap(recipient, zeroForOne, amountSpecified, sqrtPriceLimitX96, data, options) {
    const res = await this.__sendTx(
      this.getWeb3Contract().methods.swap(recipient, zeroForOne, amountSpecified, sqrtPriceLimitX96, data),
      options,
    );
    return {
      amount0: res[0],
      amount1: res[1],
    };
  }


  /**
   * @param {int16}
   * @returns {Promise<uint256>}
   */
  /* async tickBitmap() {
      return await this.getWeb3Contract().methods.tickBitmap().call();
    }; */


  /**
   * @returns {Promise<int24>}
   */
  async tickSpacing() {
    return await this.getWeb3Contract().methods.tickSpacing().call();
  }


  /** @typedef {Object} UniswapV3Pool~ticksType
   * @property {uint128} liquidityGross
   * @property {int128} liquidityNet
   * @property {uint256} feeGrowthOutside0X128
   * @property {uint256} feeGrowthOutside1X128
   * @property {int56} tickCumulativeOutside
   * @property {uint160} secondsPerLiquidityOutsideX128
   * @property {uint32} secondsOutside
   * @property {bool} initialized
   */

  /**
   * @param {int24}
   * @returns {Promise<UniswapV3Pool~ticks>}
   */
  async ticks(i) {
    const res = await this.getWeb3Contract().methods.ticks(i).call();
    return {
      liquidityGross: res[0],
      liquidityNet: res[1],
      feeGrowthOutside0X128: res[2],
      feeGrowthOutside1X128: res[3],
      tickCumulativeOutside: res[4],
      secondsPerLiquidityOutsideX128: res[5],
      secondsOutside: res[6],
      initialized: res[7],
    };
  }


  /**
   * @returns {Promise<address>}
   */
  async token0() {
    return await this.getWeb3Contract().methods.token0().call();
  }


  /**
   * @returns {Promise<address>}
   */
  async token1() {
    return await this.getWeb3Contract().methods.token1().call();
  }
}
