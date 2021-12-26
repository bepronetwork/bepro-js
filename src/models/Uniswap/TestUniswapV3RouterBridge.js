import { uniswapRouterBridge } from '../../interfaces';
import Numbers from '../../utils/Numbers';
import IContract from '../IContract';

/** @typedef {Object} TestUniswapV3RouterBridge~Options
* @property {address} _swapRouter
* @property {Boolean} test
* @property {Boolean} localtest
* @property {Web3Connection} [web3Connection=Web3Connection]
* @property {address} [contractAddress]
*/

/**
 * TestUniswapV3RouterBridge Object
 * @class TestUniswapV3RouterBridge
 * @param {TestUniswapV3RouterBridge~Options} options
 */
export default class TestUniswapV3RouterBridge extends IContract {
  constructor(params) {
    super({ abi: uniswapRouterBridge, ...params });

    if (!params.swapRouterAddress) {
      throw new Error('Please provide an SwapRouter contract address');
    }

    this.params.swapRouterAddress = params.swapRouterAddress; // swapRouter exchange contract address
  }

  /**
   * @returns {Promise<address>}
   */
  async swapRouter() {
    return await this.getContract().methods.swapRouter().call();
  }

  /**
   * @param {address} tokenIn
   * @param {address} tokenOut
   * @param {uint24} poolFee
   * @param {uint256} amountIn
   * @param {uint256} amountOutMinimum
   * @returns {Promise<uint256>} amountOut
   */
  async swapExactInputSingleEx(tokenIn, tokenOut, poolFee, amountIn, amountOutMinimum) {
    return await this.__sendTx(
      this.getContract().methods.swapExactInputSingleEx(tokenIn, tokenOut, poolFee, amountIn, amountOutMinimum),
    );
  }

  async swapExactInputSingleExCall(tokenIn, tokenOut, poolFee, amountIn, amountOutMinimum) {
    return await this.getContract().methods.swapExactInputSingleEx(tokenIn, tokenOut, poolFee, amountIn, amountOutMinimum).call();
  }

  /**
   * @param {address} tokenIn
   * @param {address} tokenOut
   * @param {uint24} poolFee
   * @param {uint256} amountOut
   * @param {uint256} amountInMaximum
   * @returns {Promise<uint256>} amountIn
   */
  async swapExactOutputSingleEx(tokenIn, tokenOut, poolFee, amountOut, amountInMaximum) {
    return await this.__sendTx(
      this.getContract().methods.swapExactOutputSingleEx(tokenIn, tokenOut, poolFee, amountOut, amountInMaximum),
    );
  }

  async swapExactOutputSingleExCall(tokenIn, tokenOut, poolFee, amountOut, amountInMaximum) {
    return await this.getContract().methods.swapExactOutputSingleEx(tokenIn, tokenOut, poolFee, amountOut, amountInMaximum).call();
  }

  /**
   * Deploy the TestUniswapV3RouterBridge Contract
   * @function
   * @param {Object} params Parameters
   * @param {function():void} params.callback
   * @return {Promise<*|undefined>}
   * @throws {Error} No Token Address Provided
   */
  deploy = async ({
    callback,
  } = {}) => {
    const params = [this.params.swapRouterAddress];

    const res = await this.__deploy(params, callback);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };
}
