import { ethutils } from '../interfaces';

/**
 * ETHUtils Object
 * @class ETHUtils
 * @param {ETHUtils~Options} options
 */
export default class ETHUtils extends IContract {
  constructor(params) {
    super({ abi: ethutils, ...params });
  }


  /**
     * @param {address} tokenAddress
     * @returns {Promise<string>}
     */
  async name(tokenAddress) {
    return await this.getWeb3Contract().methods.name(tokenAddress).call();
  }


  /**
     * @param {address} tokenAddress
     * @returns {Promise<string>}
     */
  async symbol(tokenAddress) {
    return await this.getWeb3Contract().methods.symbol(tokenAddress).call();
  }


  /**
     * @param {address} tokenAddress
     * @returns {Promise<uint8>}
     */
  async decimals(tokenAddress) {
    return await this.getWeb3Contract().methods.decimals(tokenAddress).call();
  }


  /**
     * @returns {Promise<uint256>}
     */
  async blockTimestamp() {
    return await this.getWeb3Contract().methods.blockTimestamp().call();
  }


  /**
     * @returns {Promise<uint256>}
     */
  async blockNumber() {
    return await this.getWeb3Contract().methods.blockNumber().call();
  }
}
