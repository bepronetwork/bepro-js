//import bn from 'bignumber.js'
import BigNumber from 'bignumber.js'
//import { BigNumber, BigNumberish, constants, Contract, ContractTransaction, utils, Wallet } from 'ethers'
//import { TestUniswapV3Callee } from '../../typechain/TestUniswapV3Callee'
//import { TestUniswapV3Router } from '../../typechain/TestUniswapV3Router'
//import { MockTimeUniswapV3Pool } from '../../typechain/MockTimeUniswapV3Pool'
//import { TestERC20 } from '../../typechain/TestERC20'

//export const MaxUint128 = BigNumber.from(2).pow(128).sub(1)
export const MaxUint128 = BigNumber(2).pow(128).minus(1)
export const MaxUint256 = BigNumber(2).pow(256).minus(1)

//input param types to number functions, default as BigNmber assumed
const types = ['string', 'number'];
  
//tickSpacing is number type
export const getMinTick = (tickSpacing) => Math.ceil(-887272 / tickSpacing) * tickSpacing
export const getMaxTick = (tickSpacing) => Math.floor(887272 / tickSpacing) * tickSpacing
export const getMaxLiquidityPerTick = (tickSpacing) =>
  BigNumber(2)
    .pow(128)
    .minus(1)
    .div((getMaxTick(tickSpacing) - getMinTick(tickSpacing)) / tickSpacing + 1)

export const MIN_SQRT_RATIO = BigNumber('4295128739')
export const MAX_SQRT_RATIO = BigNumber('1461446703485210103287273052203988822378723970342')

//parts per 1 million
//export enum FeeAmount {
export const FeeAmount = {
  LOW: 500,     //0.05%
  MEDIUM: 3000, //0.3%
  HIGH: 10000,  //1%
}

//amount is number type
//export const TICK_SPACINGS: { [amount in FeeAmount] } = {
export const TICK_SPACINGS = new Array();
TICK_SPACINGS[FeeAmount.LOW] = 10
TICK_SPACINGS[FeeAmount.MEDIUM] = 60
TICK_SPACINGS[FeeAmount.HIGH] = 200

//n is number type
export function expandTo18Decimals(n) {
  return BigNumber(n).times(BigNumber(10).pow(18))
}



//bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })
BigNumber.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })

// returns the sqrt ratio as a Q64.96 corresponding to a given ratio of reserve1 and reserve0
// params are BigNumber or number or string types, return BigNumber
export function encodePriceSqrt(reserve1, reserve0) {
  return BigNumber(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(BigNumber(2).pow(96))
      .integerValue(3)
}


//sqrtRatioAX96, sqrtRatioBX96, liquidity are BigNumber
//roundUp is bool
//returns amount0
/*function getAmount0Delta(sqrtRatioAX96, sqrtRatioBX96, liquidity, roundUp) {
  if (sqrtRatioAX96 > sqrtRatioBX96)
    (sqrtRatioAX96, sqrtRatioBX96) = (sqrtRatioBX96, sqrtRatioAX96);
  
  const numerator1 = liquidity.shiftedBy(-96); // << FixedPoint96.RESOLUTION;
  const numerator2 = sqrtRatioBX96 - sqrtRatioAX96;

  //require(sqrtRatioAX96 > 0);
  if (sqrtRatioAX96 <= 0) {
    console.log('!getAmount0Delta: sqrtRatioAX96 > 0 required');
    return -1;
  }

  return
      roundUp
          ? UnsafeMath.divRoundingUp(
              FullMath.mulDivRoundingUp(numerator1, numerator2, sqrtRatioBX96),
              sqrtRatioAX96
          )
          : FullMath_mulDiv(numerator1, numerator2, sqrtRatioBX96) / sqrtRatioAX96;
}*/

/*export function getPositionKey(address: string, lowerTick: number, upperTick: number): string {
  return utils.keccak256(utils.solidityPack(['address', 'int24', 'int24'], [address, lowerTick, upperTick]))
}*/
/*
export type SwapFunction = (
  amount: BigNumberish,
  to: Wallet | string,
  sqrtPriceLimitX96?: BigNumberish
) => Promise<ContractTransaction>
export type SwapToPriceFunction = (sqrtPriceX96: BigNumberish, to: Wallet | string) => Promise<ContractTransaction>
export type FlashFunction = (
  amount0: BigNumberish,
  amount1: BigNumberish,
  to: Wallet | string,
  pay0?: BigNumberish,
  pay1?: BigNumberish
) => Promise<ContractTransaction>
export type MintFunction = (
  recipient: string,
  tickLower: BigNumberish,
  tickUpper: BigNumberish,
  liquidity: BigNumberish
) => Promise<ContractTransaction>
export interface PoolFunctions {
  swapToLowerPrice: SwapToPriceFunction
  swapToHigherPrice: SwapToPriceFunction
  swapExact0For1: SwapFunction
  swap0ForExact1: SwapFunction
  swapExact1For0: SwapFunction
  swap1ForExact0: SwapFunction
  flash: FlashFunction
  mint: MintFunction
}
export function createPoolFunctions({
  swapTarget,
  token0,
  token1,
  pool,
}: {
  swapTarget: TestUniswapV3Callee
  token0: TestERC20
  token1: TestERC20
  pool: MockTimeUniswapV3Pool
}): PoolFunctions {
  async function swapToSqrtPrice(
    inputToken: Contract,
    targetPrice: BigNumberish,
    to: Wallet | string
  ): Promise<ContractTransaction> {
    const method = inputToken === token0 ? swapTarget.swapToLowerSqrtPrice : swapTarget.swapToHigherSqrtPrice

    await inputToken.approve(swapTarget.address, constants.MaxUint256)

    const toAddress = typeof to === 'string' ? to : to.address

    return method(pool.address, targetPrice, toAddress)
  }

  async function swap(
    inputToken: Contract,
    [amountIn, amountOut]: [BigNumberish, BigNumberish],
    to: Wallet | string,
    sqrtPriceLimitX96?: BigNumberish
  ): Promise<ContractTransaction> {
    const exactInput = amountOut === 0

    const method =
      inputToken === token0
        ? exactInput
          ? swapTarget.swapExact0For1
          : swapTarget.swap0ForExact1
        : exactInput
        ? swapTarget.swapExact1For0
        : swapTarget.swap1ForExact0

    if (typeof sqrtPriceLimitX96 === 'undefined') {
      if (inputToken === token0) {
        sqrtPriceLimitX96 = MIN_SQRT_RATIO.add(1)
      } else {
        sqrtPriceLimitX96 = MAX_SQRT_RATIO.sub(1)
      }
    }
    await inputToken.approve(swapTarget.address, constants.MaxUint256)

    const toAddress = typeof to === 'string' ? to : to.address

    return method(pool.address, exactInput ? amountIn : amountOut, toAddress, sqrtPriceLimitX96)
  }

  const swapToLowerPrice: SwapToPriceFunction = (sqrtPriceX96, to) => {
    return swapToSqrtPrice(token0, sqrtPriceX96, to)
  }

  const swapToHigherPrice: SwapToPriceFunction = (sqrtPriceX96, to) => {
    return swapToSqrtPrice(token1, sqrtPriceX96, to)
  }

  const swapExact0For1: SwapFunction = (amount, to, sqrtPriceLimitX96) => {
    return swap(token0, [amount, 0], to, sqrtPriceLimitX96)
  }

  const swap0ForExact1: SwapFunction = (amount, to, sqrtPriceLimitX96) => {
    return swap(token0, [0, amount], to, sqrtPriceLimitX96)
  }

  const swapExact1For0: SwapFunction = (amount, to, sqrtPriceLimitX96) => {
    return swap(token1, [amount, 0], to, sqrtPriceLimitX96)
  }

  const swap1ForExact0: SwapFunction = (amount, to, sqrtPriceLimitX96) => {
    return swap(token1, [0, amount], to, sqrtPriceLimitX96)
  }

  const mint: MintFunction = async (recipient, tickLower, tickUpper, liquidity) => {
    await token0.approve(swapTarget.address, constants.MaxUint256)
    await token1.approve(swapTarget.address, constants.MaxUint256)
    return swapTarget.mint(pool.address, recipient, tickLower, tickUpper, liquidity)
  }

  const flash: FlashFunction = async (amount0, amount1, to, pay0?: BigNumberish, pay1?: BigNumberish) => {
    const fee = await pool.fee()
    if (typeof pay0 === 'undefined') {
      pay0 = BigNumber.from(amount0)
        .mul(fee)
        .add(1e6 - 1)
        .div(1e6)
        .add(amount0)
    }
    if (typeof pay1 === 'undefined') {
      pay1 = BigNumber.from(amount1)
        .mul(fee)
        .add(1e6 - 1)
        .div(1e6)
        .add(amount1)
    }
    return swapTarget.flash(pool.address, typeof to === 'string' ? to : to.address, amount0, amount1, pay0, pay1)
  }

  return {
    swapToLowerPrice,
    swapToHigherPrice,
    swapExact0For1,
    swap0ForExact1,
    swapExact1For0,
    swap1ForExact0,
    mint,
    flash,
  }
}

export interface MultiPoolFunctions {
  swapForExact0Multi: SwapFunction
  swapForExact1Multi: SwapFunction
}

export function createMultiPoolFunctions({
  inputToken,
  swapTarget,
  poolInput,
  poolOutput,
}: {
  inputToken: TestERC20
  swapTarget: TestUniswapV3Router
  poolInput: MockTimeUniswapV3Pool
  poolOutput: MockTimeUniswapV3Pool
}): MultiPoolFunctions {
  async function swapForExact0Multi(amountOut: BigNumberish, to: Wallet | string): Promise<ContractTransaction> {
    const method = swapTarget.swapForExact0Multi
    await inputToken.approve(swapTarget.address, constants.MaxUint256)
    const toAddress = typeof to === 'string' ? to : to.address
    return method(toAddress, poolInput.address, poolOutput.address, amountOut)
  }

  async function swapForExact1Multi(amountOut: BigNumberish, to: Wallet | string): Promise<ContractTransaction> {
    const method = swapTarget.swapForExact1Multi
    await inputToken.approve(swapTarget.address, constants.MaxUint256)
    const toAddress = typeof to === 'string' ? to : to.address
    return method(toAddress, poolInput.address, poolOutput.address, amountOut)
  }

  return {
    swapForExact0Multi,
    swapForExact1Multi,
  }
}
*/