import {Model} from '@base/model';
import {Web3Connection} from '@base/web3-connection';
import {Web3ConnectionOptions} from '@interfaces/web3-connection-options';
import {Deployable} from '@interfaces/deployable';
import ISwapRouterJson from '@abi/ISwapRouter.json';
import {SwapRouterMethods} from '@methods/swap-router';
import {AbiItem} from 'web3-utils';

export class SwapRouter extends Model<SwapRouterMethods> implements Deployable {
  constructor(web3Connection: Web3Connection|Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, ISwapRouterJson.abi as AbiItem[], contractAddress);
  }

  async deployJsonAbi() {
    const deployOptions = {
        data: ISwapRouterJson.bytecode,
        arguments: []
    };

    return this.deploy(deployOptions, this.web3Connection.Account);
  }

  async uniswapV3SwapCallback(amount0Delta: number, amount1Delta: number, data: string) {
    return this.sendTx(this.contract.methods.uniswapV3SwapCallback(amount0Delta, amount1Delta, data));
  }

  async exactInputSingle(params: {'tokenIn': string; 'tokenOut': string; 'fee': number; 'recipient': string; 'deadline': number; 'amountIn': number; 'amountOutMinimum': number; 'sqrtPriceLimitX96': number}) {
    return this.callTx(this.contract.methods.exactInputSingle(params));
  }

  async exactInput(params: {'path': string; 'recipient': string; 'deadline': number; 'amountIn': number; 'amountOutMinimum': number}) {
    return this.callTx(this.contract.methods.exactInput(params));
  }

  async exactOutputSingle(params: {'tokenIn': string; 'tokenOut': string; 'fee': number; 'recipient': string; 'deadline': number; 'amountOut': number; 'amountInMaximum': number; 'sqrtPriceLimitX96': number}) {
    return this.callTx(this.contract.methods.exactOutputSingle(params));
  }

  async exactOutput(params: {'path': string; 'recipient': string; 'deadline': number; 'amountOut': number; 'amountInMaximum': number}) {
    return this.callTx(this.contract.methods.exactOutput(params));
  }

}
