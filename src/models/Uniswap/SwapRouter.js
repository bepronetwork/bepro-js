import { swapRouter } from '../../interfaces';
import Numbers from '../../utils/Numbers';
import IContract from '../IContract';

/** @typedef {Object} SwapRouter~Options
* @property {address} _factory
* @property {address} _WETH9
* @property {Boolean} test
* @property {Boolean} localtest
* @property {Web3Connection} [web3Connection=Web3Connection]
* @property {address} [contractAddress]
*/

/**
 * SwapRouter Object for uniswap provided files located in node_modules folder:
 * Sol file: <project_folder>/node_modules/@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol
 * JSON file: <project_folder>/node_modules/@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json
 * @class SwapRouter
 * @param {SwapRouter~Options} options
 */
export default class SwapRouter extends IContract {
  constructor(params = {}) {
    super({ abi: swapRouter, ...params });
    if (!params.factory) {
      throw new Error('Please provide a UniswapV3Factory contract address');
    }
    if (!params.weth9) {
      throw new Error('Please provide a WETH9 contract address');
    }
    this.params.factory = params.factory;
    this.params.weth9 = params.weth9;
  }


  /**
   * @returns {Promise<address>}
   */
  async WETH9() {
    // return await this.getWeb3Contract().methods.WETH9().call();
    return this.params.weth9;
  }


  /**
   * @param {tuple} params
   * @returns {Promise<uint256>} amountOut
   */
  async exactInput(params) {
    return await this.__sendTx(this.getWeb3Contract().methods.exactInput(params));
  }


  /**
   * @param {tuple} params
   * @returns {Promise<uint256>} amountOut
   */
  async exactInputSingle(params) {
    return await this.__sendTx(this.getWeb3Contract().methods.exactInputSingle(params));
  }


  /**
   * @param {tuple} params
   * @returns {Promise<uint256>} amountIn
   */
  async exactOutput(params) {
    return await this.__sendTx(this.getWeb3Contract().methods.exactOutput(params));
  }


  /**
   * @param {tuple} params
   * @returns {Promise<uint256>} amountIn
   */
  async exactOutputSingle(params) {
    return await this.__sendTx(this.getWeb3Contract().methods.exactOutputSingle(params));
  }


  /**
   * @returns {Promise<address>}
   */
  async factory() {
    // return await this.getWeb3Contract().methods.factory().call();
    return this.params.factory;
  }


  /**
   * @param {bytes[]} data
   * @returns {Promise<bytes[]>} results
   */
  async multicall(data) {
    return await this.__sendTx(this.getWeb3Contract().methods.multicall(data));
  }


  /**
   * @returns {Promise<void>}
   */
  async refundETH() {
    return await this.__sendTx(this.getWeb3Contract().methods.refundETH());
  }


  /**
   * @param {address} token
   * @param {uint256} value
   * @param {uint256} deadline
   * @param {uint8} v
   * @param {bytes32} r
   * @param {bytes32} s
   * @returns {Promise<void>}
   */
  async selfPermit(token, value, deadline, v, r, s) {
    return await this.__sendTx(this.getWeb3Contract().methods.selfPermit(token, value, deadline, v, r, s));
  }


  /**
   * @param {address} token
   * @param {uint256} nonce
   * @param {uint256} expiry
   * @param {uint8} v
   * @param {bytes32} r
   * @param {bytes32} s
   * @returns {Promise<void>}
   */
  async selfPermitAllowed(token, nonce, expiry, v, r, s) {
    return await this.__sendTx(this.getWeb3Contract().methods.selfPermitAllowed(token, nonce, expiry, v, r, s));
  }


  /**
   * @param {address} token
   * @param {uint256} nonce
   * @param {uint256} expiry
   * @param {uint8} v
   * @param {bytes32} r
   * @param {bytes32} s
   * @returns {Promise<void>}
   */
  async selfPermitAllowedIfNecessary(token, nonce, expiry, v, r, s) {
    return await this.__sendTx(this.getWeb3Contract().methods.selfPermitAllowedIfNecessary(token, nonce, expiry, v, r, s));
  }


  /**
   * @param {address} token
   * @param {uint256} value
   * @param {uint256} deadline
   * @param {uint8} v
   * @param {bytes32} r
   * @param {bytes32} s
   * @returns {Promise<void>}
   */
  async selfPermitIfNecessary(token, value, deadline, v, r, s) {
    return await this.__sendTx(this.getWeb3Contract().methods.selfPermitIfNecessary(token, value, deadline, v, r, s));
  }


  /**
   * @param {address} token
   * @param {uint256} amountMinimum
   * @param {address} recipient
   * @returns {Promise<void>}
   */
  async sweepToken(token, amountMinimum, recipient) {
    return await this.__sendTx(this.getWeb3Contract().methods.sweepToken(token, amountMinimum, recipient));
  }


  /**
   * @param {address} token
   * @param {uint256} amountMinimum
   * @param {address} recipient
   * @param {uint256} feeBips
   * @param {address} feeRecipient
   * @returns {Promise<void>}
   */
  async sweepTokenWithFee(token, amountMinimum, recipient, feeBips, feeRecipient) {
    return await this.__sendTx(this.getWeb3Contract().methods.sweepTokenWithFee(token, amountMinimum, recipient, feeBips, feeRecipient));
  }


  /**
   * @param {int256} amount0Delta
   * @param {int256} amount1Delta
   * @param {bytes} _data
   * @returns {Promise<void>}
   */
  // async uniswapV3SwapCallback(amount0Delta, amount1Delta, _data) {
  //  return await this.__sendTx(this.getWeb3Contract().methods.uniswapV3SwapCallback(amount0Delta, amount1Delta, _data))
  // };


  /**
   * @param {uint256} amountMinimum
   * @param {address} recipient
   * @returns {Promise<void>}
   */
  async unwrapWETH9(amountMinimum, recipient) {
    return await this.__sendTx(this.getWeb3Contract().methods.unwrapWETH9(amountMinimum, recipient));
  }


  /**
   * @param {uint256} amountMinimum
   * @param {address} recipient
   * @param {uint256} feeBips
   * @param {address} feeRecipient
   * @returns {Promise<void>}
   */
  async unwrapWETH9WithFee(amountMinimum, recipient, feeBips, feeRecipient) {
    return await this.__sendTx(this.getWeb3Contract().methods.unwrapWETH9WithFee(amountMinimum, recipient, feeBips, feeRecipient));
  }


  /**
   * Deploy the SwapRouter Contract
   * @function
   * @param {Object} params Parameters
   * @param {IContract~TxOptions} options
   * @return {Promise<*|undefined>}
   */
  deploy = async (options) => {
    const params = [this.params.factory, this.params.weth9];

    const res = await this.__deploy(params, options);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };
}
