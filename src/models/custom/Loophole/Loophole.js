import { loophole } from '../../../interfaces';
import ERC20Contract from '../../ERC20/ERC20Contract';
import ETHUtils from '../../../utils/ETHUtils';
import Numbers from '../../../utils/Numbers';
import IContract from '../../IContract';
// const assert = require('assert');

/** @typedef {Object} Loophole~Options
* @property {Boolean} test
* @property {Boolean} localtest
* @property {Web3Connection} [web3Connection=Web3Connection]
* @property {address} [contractAddress]
* @property {address} [lpTokenAddress]
* @property {address} [ethUtilsAddress]
*/

/**
 * Loophole Object
 * @class Loophole
 * @param {Loophole~Options} options
 */
export default class Loophole extends IContract {
  constructor(params = {}) {
    super({ abi: loophole, ...params });
    if (!params.lpTokenAddress) {
      throw new Error('Please provide an LP token address');
    }
    if (!params.ethUtilsAddress) {
      throw new Error('Please provide an ETHUtils contract address');
    }
    if (!params.swapRouterAddress) {
      throw new Error('Please provide an SwapRouter contract address');
    }

    this.params.LPTokenContract = new ERC20Contract({
      web3Connection: this.web3Connection,
      contractAddress: params.lpTokenAddress,
    });
    this.params.ETHUtils = new ETHUtils({
      web3Connection: this.web3Connection,
      contractAddress: params.ethUtilsAddress,
    });

    this.params.LPTokenAddress = params.lpTokenAddress; // LP token address
    this.params.ethUtilsAddress = params.ethUtilsAddress; // ETHUtils contract
    this.params.swapRouterAddress = params.swapRouterAddress; // swapRouter exchange contract address
  }


  /**
     * @returns {Promise<address>}
     */
  async lpToken() {
    // return await this.getWeb3Contract().methods.lpToken().call();
    return this.params.LPTokenAddress;
  }


  /**
     * @returns {Promise<uint256>}
     */
  async lpTokensPerBlock() {
    const decimals = await this.ETHUtils.decimals(this.params.LPTokenAddress);
    const res = await this.getWeb3Contract().methods.lpTokensPerBlock().call();
    return Numbers.fromDecimalsToBN(res, decimals);
  }


  /**
     * @param {address}
     * @returns {Promise<bool>}
     */
  async poolExists(address) {
    return await this.getWeb3Contract().methods.poolExists(address).call();
  }


  /**
     * @returns {Promise<uint24>}
     */
  async poolFee() {
    return await this.getWeb3Contract().methods.poolFee().call();
  }


  /**
     * @returns {Promise<uint256>}
     */
  async startBlock() {
    return await this.getWeb3Contract().methods.startBlock().call();
  }


  /**
     * @returns {Promise<address>}
     */
  async swapRouter() {
    // return await this.getWeb3Contract().methods.swapRouter().call();
    return this.params.swapRouterAddress;
  }


  /**
     * @returns {Promise<uint256>}
     */
  async totalAllocPoint() {
    return await this.getWeb3Contract().methods.totalAllocPoint().call();
  }


  /**
     * @param {address} newOwner
     * @returns {Promise<void>}
     */
  /* async transferOwnership(newOwner) {
      return await this.__sendTx(this.params.getContract().methods.transferOwnership(newOwner))
    }; */


  /**
     * @param {uint256} pid
     * @param {uint256} amount
     * @returns {Promise<void>}
     */
  async stake(pid, amount) {
    return await this.__sendTx(this.getWeb3Contract().methods.stake(pid, amount));
  }


  /**
     * @param {address} token
     * @param {uint256} allocPoint
     * @returns {Promise<void>}
     */
  async add(token, allocPoint) {
    return await this.__sendTx(this.getWeb3Contract().methods.add(token, allocPoint));
  }


  /**
     * @param {uint256} pid
     * @param {uint256} allocPoint
     * @param {bool} withUpdate
     * @returns {Promise<void>}
     */
  async set(pid, allocPoint, withUpdate) {
    return await this.__sendTx(this.getWeb3Contract().methods.set(pid, allocPoint, withUpdate));
  }


  /**
     * @param {uint256} pid
     * @param {uint256} amount
     * @returns {Promise<uint256>}
     */
  async exit(pid, amount) {
    // TODO:
    return await this.__sendTx(this.getWeb3Contract().methods.exit(pid, amount));
  }


  /**
     * @param {uint256} amount
     * @returns {Promise<uint256>}
     */
  async exitLP(amount) {
    // TODO:
    return await this.__sendTx(this.getWeb3Contract().methods.exit(amount));
  }


  /**
     * @param {uint256} pid
     * @param {address} user
     * @returns {Promise<uint256>}
     */
  async currentStake(pid, user) {
    // TODO:
    return await this.getWeb3Contract().methods.currentStake(pid, user).call();
  }


  /**
     * @param {uint256} pid
     * @param {address} user
     * @returns {Promise<uint256>}
     */
  async earnings(pid, user) {
    // TODO:
    return await this.getWeb3Contract().methods.earnings(pid, user).call();
  }


  /**
     * @param {uint256} from
     * @param {uint256} to
     * @returns {Promise<uint256>}
     */
  async getBlocksFromRange(from, to) {
    return await this.getWeb3Contract().methods.getBlocksFromRange(from, to).call();
  }


  /**
     * @returns {Promise<void>}
     */
  async massUpdatePools() {
    return await this.__sendTx(this.getWeb3Contract().methods.massUpdatePools());
  }


  /**
     * @param {uint256} pid
     * @returns {Promise<void>}
     */
  async updatePool(pid) {
    return await this.__sendTx(this.getWeb3Contract().methods.updatePool(pid));
  }


  /**
     * @param {uint256} pid
     * @returns {Promise<uint256>} tokensReward
     */
  async getPoolReward(pid) {
    // LP tokens reward
    const res = await this.getWeb3Contract().methods.getPoolReward(pid).call();
    const decimals = this.LPTokenContract.getDecimals();
    return Numbers.fromDecimalsToBN(res, decimals);
  }


  /**
     * @returns {Promise<uint256>}
     */
  async getBlockTimestamp() {
    return await this.getWeb3Contract().methods.getBlockTimestamp().call();
  }


  /**
     * @returns {Promise<uint256>}
     */
  async getBlockNumber() {
    return await this.getWeb3Contract().methods.getBlockNumber().call();
  }


  /** @typedef {Object} Loophole~getPoolType
     * @property {address} token
     * @property {uint256} allocPoint
     * @property {uint256} lastRewardBlock
     * @property {uint256} totalPool
     * @property {uint256} entryStakeTotal
     * @property {uint256} totalDistributedPenalty
     */

  /**
     * @param {uint256} pid
     * @returns {Promise<Loophole~getPool>}
     */
  async getPool(pid) {
    const res = await this.getWeb3Contract().methods.getPool(pid).call();
    const token = res[0];
    const decimals = await this.ETHUtils.decimals(token);
    return {
      token: res[0],
      allocPoint: res[1],
      lastRewardBlock: res[2],
      totalPool: Numbers.fromDecimalsToBN(res[3], decimals),
      entryStakeTotal: Numbers.fromDecimalsToBN(res[4], decimals),
      totalDistributedPenalty: Numbers.fromDecimalsToBN(res[5], decimals),
    };
  }


  /**
     * @param {uint256} pid
     * @param {address} user
     * @returns {Promise<uint256>}
     */
  async getEntryStakeUser(pid, user) {
    // TODO: convert from decimals to BN
    return await this.getWeb3Contract().methods.getEntryStakeUser(pid, user).call();
  }


  /**
     * @param {uint256} pid
     * @param {address} user
     * @returns {Promise<uint256>}
     */
  async getEntryStakeAdjusted(pid, user) {
    // TODO: convert from decimals to BN
    return await this.getWeb3Contract().methods.getEntryStakeAdjusted(pid, user).call();
  }

  /**
   *
   * @return {Promise<void>}
   * @throws {Error} Contract is not deployed, first deploy it and provide a contract address
   */
  __assert = async () => {
    if (!this.getAddress()) {
      throw new Error(
        'Contract is not deployed, first deploy it and provide a contract address',
      );
    }

    /* Use ABI */
    this.params.contract.use(loophole, this.getAddress());

    if (!this.params.LPTokenContract) {
      this.params.LPTokenContract = new ERC20Contract({
        web3Connection: this.web3Connection,
        contractAddress: this.params.LPTokenAddress,
      });
    }
    /* Assert Token Contract */
    await this.params.LPTokenContract.login();
    await this.params.LPTokenContract.__assert();

    if (!this.params.ETHUtils) {
      this.params.ETHUtils = new ETHUtils({
        web3Connection: this.web3Connection,
        contractAddress: this.params.ethUtilsAddress,
      });
    }
    /* Assert Token Contract */
    await this.params.ETHUtils.login();
    await this.params.ETHUtils.__assert();
  };


  /**
   * Deploy the ERC20 Token Lock Contract
   * @function
   * @param {Object} params Parameters
   * @param {string} params.name Name of token
   * @param {address} swapRouter
   * @param {address} lpToken
   * @param {uint256} lpTokensPerBlock
   * @param {uint256} startBlock
   * @param {uint256} exitPenalty
   * @param {uint256} exitPenaltyLP
   * @param {function():void} params.callback
   * @return {Promise<*|undefined>}
   * @throws {Error} No Token Address Provided
   */
  deploy = async ({
    swapRouter, lpToken, lpTokensPerBlock, startBlock, exitPenalty, exitPenaltyLP, callback,
  } = {}) => {
    // if (!this.LPTokenContract()) {
    //  throw new Error('No LPTokenContract Address Provided');
    // }

    assert(lpToken === this.LPTokenContract().getAddress());
    assert(swapRouter === this.params.swapRouterAddress);

    const params = [swapRouter, lpToken, lpTokensPerBlock, startBlock, exitPenalty, exitPenaltyLP];

    const res = await this.__deploy(params, callback);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };


  /**
   * @function
   * @return LPTokenContract|undefined
   */
  LPTokenContract() {
    return this.params.LPTokenContract;
  }

  /**
   * @function
   * @return ETHUtils|undefined
   */
  ETHUtils() {
    return this.params.ETHUtils;
  }
}
