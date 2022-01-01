import { uniswapRouterBridge } from '../../interfaces';
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
  swapRouter() {
    return this.getContract().methods.swapRouter().call();
  }

  /**
   * @param {Object} params
   * @param {address} params.tokenIn
   * @param {address} params.tokenOut
   * @param {uint24} params.poolFee
   * @param {uint256} params.amountIn
   * @param {uint256} params.amountOutMinimum
   * @returns {Promise<uint256>} amountOut
   */
  swapExactInputSingleEx({
    tokenIn, tokenOut, poolFee, amountIn, amountOutMinimum,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.swapExactInputSingleEx(tokenIn, tokenOut, poolFee, amountIn, amountOutMinimum),
      options,
    );
  }

  /**
   * @param {Object} params
   * @param {address} params.tokenIn
   * @param {address} params.tokenOut
   * @param {uint24} params.poolFee
   * @param {uint256} params.amountOut
   * @param {uint256} params.amountInMaximum
   * @returns {Promise<uint256>} amountIn
   */
  swapExactOutputSingleEx({
    tokenIn, tokenOut, poolFee, amountOut, amountInMaximum,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.swapExactOutputSingleEx(tokenIn, tokenOut, poolFee, amountOut, amountInMaximum),
      options,
    );
  }

  /**
   * Deploy the TestUniswapV3RouterBridge Contract
   * @function
   * @param {IContract~TxOptions} options
   * @return {Promise<*|undefined>}
   * @throws {Error} No Token Address Provided
   */
  deploy = async options => {
    const params = [ this.params.swapRouterAddress ];

    const res = await this.__deploy(params, options);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };
}
