import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@methods/contract-call-method';

export interface SwapRouterMethods {
  uniswapV3SwapCallback(amount0Delta: number, amount1Delta: number, data: string) :ContractSendMethod;
  exactInputSingle(params: {'tokenIn': string; 'tokenOut': string; 'fee': number; 'recipient': string; 'deadline': number; 'amountIn': number; 'amountOutMinimum': number; 'sqrtPriceLimitX96': number}) :ContractCallMethod<number>;
  exactInput(params: {'path': string; 'recipient': string; 'deadline': number; 'amountIn': number; 'amountOutMinimum': number}) :ContractCallMethod<number>;
  exactOutputSingle(params: {'tokenIn': string; 'tokenOut': string; 'fee': number; 'recipient': string; 'deadline': number; 'amountOut': number; 'amountInMaximum': number; 'sqrtPriceLimitX96': number}) :ContractCallMethod<number>;
  exactOutput(params: {'path': string; 'recipient': string; 'deadline': number; 'amountOut': number; 'amountInMaximum': number}) :ContractCallMethod<number>;
}
