//import bn from 'bignumber.js'
import BigNumber from 'bignumber.js'
//import { BigNumber, BigNumberish, constants, Contract, ContractTransaction, utils, Wallet } from 'ethers'
//import { TestUniswapV3Callee } from '../../typechain/TestUniswapV3Callee'
//import { TestUniswapV3Router } from '../../typechain/TestUniswapV3Router'
//import { MockTimeUniswapV3Pool } from '../../typechain/MockTimeUniswapV3Pool'
//import { TestERC20 } from '../../typechain/TestERC20'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
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
