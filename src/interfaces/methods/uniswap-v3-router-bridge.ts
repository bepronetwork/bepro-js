import {ContractCallMethod} from '@methods/contract-call-method';

export interface UniswapV3RouterBridgeMethods {
  swapRouter() :ContractCallMethod<string>;
  swapExactInputSingleEx(tokenIn: string, tokenOut: string, poolFee: undefined, amountIn: number, amountOutMinimum: number) :ContractCallMethod<number>;
  swapExactOutputSingleEx(tokenIn: string, tokenOut: string, poolFee: undefined, amountOut: number, amountInMaximum: number) :ContractCallMethod<number>;
}
