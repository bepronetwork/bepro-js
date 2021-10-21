import { loophole } from '../../../interfaces';
import ERC20Contract from '../../ERC20/ERC20Contract';
import ETHUtils from '../../../utils/ETHUtils';
import Numbers from '../../../utils/Numbers';
import IContract from '../../IContract';

const assert = require('assert');
const BigNumber = require('bignumber.js');

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
    const decimals = await this.ETHUtils().decimals(this.params.LPTokenAddress);
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
    // TODO: ???
    return await this.getWeb3Contract().methods.poolFee().call();
  }


  /**
   * @returns {Promise<uint256>}
   */
  async startBlock() {
    return await this.getWeb3Contract().methods.startBlock().call();
  }


  /**
   * @returns {Promise<uint256>}
   */
  async exitPenalty() {
    // penalty is stored as 20 for 20%
    const res = await this.getWeb3Contract().methods.exitPenalty().call();
    return Number(res / 100.0);
  }


  /**
   * @returns {Promise<uint256>}
   */
  async exitPenaltyLP() {
    // penalty is stored as 20 for 20%
    const res = await this.getWeb3Contract().methods.exitPenaltyLP().call();
    return Number(res / 100.0);
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
   * @returns {Promise<void>}
   */
  async stake(pid, amount) {
    const amount2 = await this.fromBNToDecimals(amount, pid);
    return await this.__sendTx(this.getWeb3Contract().methods.stake(pid, amount2));
  }


  /**
   * @param {uint256} pid
   * @param {uint256} amount
   * @param {uint256} amountOutMinimum
   * @returns {Promise<uint256>}
   */
  async exit(pid, amount, amountOutMinimum) {
    const amount2 = await this.fromBNToDecimals(amount, pid);
    return await this.__sendTx(this.getWeb3Contract().methods.exit(pid, amount2, amountOutMinimum));
  }


  /**
   * @param {uint256} amount
   * @returns {Promise<uint256>}
   */
  async exitLP(amount) {
    const amount2 = Numbers.fromBNToDecimals(amount, this.LPTokenContract().getDecimals());
    return await this.__sendTx(this.getWeb3Contract().methods.exit(amount2));
  }


  /**
   * @param {uint256} pid
   * @param {address} user
   * @returns {Promise<uint256>}
   */
  async getUserReward(pid, user) {
    const res = await this.getWeb3Contract().methods.getUserReward(pid, user).call();
    return await this.fromDecimalsToBN(res, pid);
  }


  /**
   * @param {uint256} pid
   * @returns {Promise<uint256>}
   */
  async collectRewards(pid) {
    const res = await this.__sendTx(this.getWeb3Contract().methods.collectRewards(pid));
    return res;
  }

  /**
   * @param {uint256} pid
   * @returns {Promise<uint256>}
   */
  async collectRewardsCall(pid) { //TODO: fix this fn, it always returns zero
    const res = await this.getWeb3Contract().methods.collectRewards(pid).call();
    console.log('collectRewardsCall.bp-0: ', res);
    return await this.fromDecimalsToBN(res, pid);
  }


  /**
   * @param {uint256} pid
   * @returns {Promise<uint256[]>}
   */
  /* async collectRewardsAll() {
    const res = await this.__sendTx(this.getWeb3Contract().methods.collectRewardsAll());
    return res;
  } */

  /**
   * @param {uint256} pid
   * @returns {Promise<uint256[]>}
   */
  /* async collectRewardsAllCall() {
    let res = await this.getWeb3Contract().methods.collectRewardsAll().call();
    // convert all rewards decimals to ui tokens
    console.log('---collectRewardsAll(): ', res);
    for (let i=1; i < res.length; ++i) {
      res[i] = await this.fromDecimalsToBN(res[i], i);
    }
    return res;
  } */


  /**
   * @param {uint256} pid
   * @param {address} user
   * @returns {Promise<uint256>}
   */
  async currentStake(pid, user) {
    const res = await this.getWeb3Contract().methods.currentStake(pid, user).call();
    return await this.fromDecimalsToBN(res, pid);
  }


  /**
   * @param {uint256} pid
   * @param {address} user
   * @returns {Promise<uint256>}
   */
  async earnings(pid, user) {
    const res = await this.getWeb3Contract().methods.earnings(pid, user).call();
    return await this.fromDecimalsToBN(res, pid);
  }


  /**
   * @param {uint256} from
   * @param {uint256} to
   * @returns {Promise<uint256>}
   */
  async getBlocksFromRange(from, to) {
    const res = await this.getWeb3Contract().methods.getBlocksFromRange(from, to).call();
    return BigNumber(res);
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
   * @returns {Promise<void>}
   */
  async updatePoolCall(pid) {
    const res = await this.getWeb3Contract().methods.updatePool(pid).call();
    //res.blocksElapsed, res.lpTokensReward, res.accLPtokensPerShare
    const decimals = this.LPTokenContract().getDecimals();
    const lpPerTokenMult = await this.getWeb3Contract().methods.LPtokensPerShareMultiplier().call();
    const accLPperToken = BigNumber(res.accLPtokensPerShare).div(lpPerTokenMult);
    
    return {
      blocksElapsed: BigNumber(res.blocksElapsed),
      lpTokensReward: Numbers.fromDecimalsToBN(res.lpTokensReward, decimals),
      accLPtokensPerShare: accLPperToken,
    }
  }


  /**
   * Get LP tokens reward for a pool id
   * @param {uint256} pid
   * @returns {Promise<uint256>} tokensReward
   */
  async getPoolReward(pid) {
    // LP tokens reward
    const res = await this.getWeb3Contract().methods.getPoolReward(pid).call();
    const decimals = this.LPTokenContract().getDecimals();
    return Numbers.fromDecimalsToBN(res, decimals);
    // return await this.fromDecimalsToBN(res, pid);
  }

  /**
   * Get pool token decimals given pool id
   * @param {uint256} pid
   * @returns {Promise<uint256>} poolTokenDecimals
   */
  async getPoolTokenDecimals(pid) {
    // TODO: cache decimals by pid for token address
    const res = await this.getWeb3Contract().methods.getPool(pid).call();
    return await this.ETHUtils().decimals(res[0]); // token = res[0]
  }

  /**
   * Convert given tokens amount integer to float number with decimals for UI.
   * @function
   * @param {number} amount Tokens amount to convert
   * @param {number} pid Pool id
   * @returns {Promise<number>} tokensAmount
   */
  async fromDecimalsToBN(amount, pid) {
    return Numbers.fromDecimalsToBN(
      amount,
      await this.getPoolTokenDecimals(pid),
    );
  }

  /**
   * Convert float number with decimals from UI to tokens amount integer for smart contract function.
   * @function
   * @param {number} amount Tokens float amount to convert
   * @param {number} pid Pool id
   * @returns {Promise<number>} tokensAmount
   */
  async fromBNToDecimals(amount, pid) {
    return Numbers.fromBNToDecimals(
      amount,
      await this.getPoolTokenDecimals(pid),
    );
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
    const decimals = await this.ETHUtils().decimals(token);
    const lpDecimals = this.LPTokenContract().getDecimals();
    const lpPerTokenMult = await this.getWeb3Contract().methods.LPtokensPerShareMultiplier().call();
    const accLPperToken = BigNumber(res[6]).div(lpPerTokenMult);
    
    return {
      token: res[0],
      allocPoint: BigNumber(res[1]),
      lastRewardBlock: BigNumber(res[2]),
      totalPool: Numbers.fromDecimalsToBN(res[3], decimals),
      entryStakeTotal: Numbers.fromDecimalsToBN(res[4], decimals),
      totalDistributedPenalty: Numbers.fromDecimalsToBN(res[5], decimals),
      accLPtokensPerShare: accLPperToken,
    };
  }


  /**
   * @param {uint256} pid
   * @returns {Promise<Loophole~getPoolInfo>}
   */
  async getPoolInfo(pid) {
    const res = await this.getWeb3Contract().methods.getPoolInfo(pid).call();
    // TODO ???
    return res;
  }


  /**
   * @returns {Promise<uint256>} pools count
   */
  async poolsCount() {
    return await this.getWeb3Contract().methods.poolsCount().call();
  }


  /**
   * @param {uint256} pid
   * @param {address} user
   * @returns {Promise<Loophole~getPoolInfo>}
   */
  async getUserInfo(pid, user) {
    const res = await this.getWeb3Contract().methods.getUserInfo(pid, user).call();
    // TODO ???
    // return res;
    return {
      ...res,
      entryStake: await this.fromDecimalsToBN(res.entryStake, pid),
      unstake: await this.fromDecimalsToBN(res.unstake, pid),
      entryStakeAdjusted: await this.fromDecimalsToBN(res.entryStakeAdjusted, pid),
      payRewardMark: await this.fromDecimalsToBN(res.payRewardMark, pid),
    };
  }


  /**
   * @param {uint256} pid
   * @param {address} user
   * @returns {Promise<uint256>}
   */
  async getTotalEntryStakeUser(pid, user) {
    const res = await this.getWeb3Contract().methods.getTotalEntryStakeUser(pid, user).call();
    return await this.fromDecimalsToBN(res, pid);
  }


  /**
   * @param {uint256} pid
   * @param {address} user
   * @returns {Promise<uint256>}
   */
  async getTotalUnstakeUser(pid, user) {
    const res = await this.getWeb3Contract().methods.getTotalUnstakeUser(pid, user).call();
    return await this.fromDecimalsToBN(res, pid);
  }


  //WARNING: Function NOT fully working:
  // when user had profit from others exits and entryStake is less than what he had withdrown
  //SOLUTION? maybe return only what is greather than zero?
  /**
   * @param {uint256} pid
   * @param {address} user
   * @returns {Promise<uint256>}
   */
  async getCurrentEntryStakeUser(pid, user) {
    // const res = await this.getWeb3Contract().methods.getCurrentEntryStakeUser(pid, user).call();
    // return await this.fromDecimalsToBN(res, pid);
    let selExitPenalty;
    if (this.isLoopPoolId(pid)) {
      selExitPenalty = await this.exitPenaltyLP();
    } else selExitPenalty = await this.exitPenalty();
    const userInfo = await this.getUserInfo(pid, user);
    const totalGrossUnstaked = userInfo.unstake.div(1 - selExitPenalty);
    return userInfo.entryStake.minus(totalGrossUnstaked);
  }

  isLoopPoolId(pid) {
    return (pid == 0);
  }


  /**
   * @param {uint256} pid
   * @param {address} user
   * @returns {Promise<uint256>}
   */
  async getEntryStakeAdjusted(pid, user) {
    const res = await this.getWeb3Contract().methods.getEntryStakeAdjusted(pid, user).call();
    return await this.fromDecimalsToBN(res, pid);
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
   * Deploy the Loophole Contract
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

    assert(lpToken === this.LPTokenContract().getAddress()); // LPTokenAddress
    assert(swapRouter === this.params.swapRouterAddress);

    const lpTokenDecimals = await this.ETHUtils().decimals(lpToken);
    const lpTokensPerBlock1 = Numbers.fromBNToDecimals(lpTokensPerBlock, lpTokenDecimals);
    const params = [swapRouter, lpToken, lpTokensPerBlock1, startBlock, exitPenalty, exitPenaltyLP];

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
