export interface ExactInputSingleParams {
  tokenIn: string;
  tokenOut: string;
  fee: number;
  recipient: string;
  deadline: number;
  amountIn: number;
  amountOutMinimum: number;
  sqrtPriceLimitX96: number
}

export interface ExactInputParams {
  path: string;
  recipient: string;
  deadline: number;
  amountIn: number;
  amountOutMinimum: number
}

export interface ExactOutputSingleParams {
  tokenIn: string;
  tokenOut: string;
  fee: number;
  recipient: string;
  deadline: number;
  amountOut: number;
  amountInMaximum: number;
  sqrtPriceLimitX96: number
}

export interface ExactOutputParams {
  path: string;
  recipient: string;
  deadline: number;
  amountOut: number;
  amountInMaximum: number
}
