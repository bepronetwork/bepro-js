import {Model} from '@base/model';
import {Web3Connection} from '@base/web3-connection';
import {Web3ConnectionOptions} from '@interfaces/web3-connection-options';
import {Deployable} from '@interfaces/deployable';
import TestUniswapV3RouterBridgeJson from '@abi/TestUniswapV3RouterBridge.json';
import {UniswapV3RouterBridgeMethods} from '@methods/uniswap-v3-router-bridge';
import {AbiItem} from 'web3-utils';

export class UniswapV3RouterBridge extends Model<UniswapV3RouterBridgeMethods> implements Deployable {
  constructor(web3Connection: Web3Connection|Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, TestUniswapV3RouterBridgeJson.abi as AbiItem[], contractAddress);
  }

  async deployJsonAbi(_swapRouter: string) {
    const deployOptions = {
        data: TestUniswapV3RouterBridgeJson.bytecode,
        arguments: [_swapRouter]
    };

    return this.deploy(deployOptions, this.web3Connection.Account);
  }

  async swapRouter() {
    return this.callTx(this.contract.methods.swapRouter());
  }

  async swapExactInputSingleEx(tokenIn: string, tokenOut: string, poolFee: undefined, amountIn: number, amountOutMinimum: number) {
    return this.callTx(this.contract.methods.swapExactInputSingleEx(tokenIn, tokenOut, poolFee, amountIn, amountOutMinimum));
  }

  async swapExactOutputSingleEx(tokenIn: string, tokenOut: string, poolFee: undefined, amountOut: number, amountInMaximum: number) {
    return this.callTx(this.contract.methods.swapExactOutputSingleEx(tokenIn, tokenOut, poolFee, amountOut, amountInMaximum));
  }

}
