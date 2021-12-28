import assert from 'assert';
import BigNumber from 'bignumber.js';

import { loophole } from '../../../interfaces';
import ERC20Contract from '../../ERC20/ERC20Contract';
import ETHUtils from '../../../utils/ETHUtils';
import Numbers from '../../../utils/Numbers';
import IContract from '../../IContract';

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
    // return await this.getContract().methods.lpToken().call();
    return this.params.LPTokenAddress;
  }

  /**
   * @returns {Promise<uint256>}
   */
  async lpTokensPerBlock() {
    const decimals = await this.ETHUtils().decimals(this.params.LPTokenAddress);
    const res = await this.getContract().methods.lpTokensPerBlock().call();
    return Numbers.fromDecimalsToBN(res, decimals);
  }

  /**
   * @param {address}
   * @returns {Promise<bool>}
   */
  poolExists(address) {
    return this.getContract().methods.poolExists(address).call();
  }

  /**
   * @returns {Promise<uint24>}
   */
  poolFee() {
    // TODO: ???
    return this.getContract().methods.poolFee().call();
  }

  /**
   * @returns {Promise<uint256>}
   */
  startBlock() {
    return this.getContract().methods.startBlock().call();
  }

  /**
   * @returns {Promise<uint256>}
   */
  async exitPenalty() {
    // penalty is stored as 20 for 20%
    const res = await this.getContract().methods.exitPenalty().call();
    return Number(res / 100.0);
  }

  /**
   * @returns {Promise<uint256>}
   */
  async exitPenaltyLP() {
    // penalty is stored as 20 for 20%
    const res = await this.getContract().methods.exitPenaltyLP().call();
    return Number(res / 100.0);
  }

  /**
   * @returns {Promise<address>}
   */
  async swapRouter() {
    // return await this.getContract().methods.swapRouter().call();
    return this.params.swapRouterAddress;
  }

  /**
   * @returns {Promise<uint256>}
   */
  totalAllocPoint() {
    return this.getContract().methods.totalAllocPoint().call();
  }

  /**
   * @param {address} newOwner
   * @returns {Promise<void>}
   */
  // transferOwnership({ newOwner }, options) {
  //   return this.__sendTx(this.getContract().methods.transferOwnership(newOwner, options))
  // };

  /**
   * Add/enable new pool, only owner mode
   * @dev ADD | NEW TOKEN POOL
   * @param {Object} params
   * @param {address} params.token Token address as IERC20
   * @param {uint256} params.allocPoint Pool allocation point/share distributed to this pool from mining rewards
   * @returns {Promise<uint256>} pid added token pool index
   */
  add({ token, allocPoint }, options) {
    return this.__sendTx(
      this.getContract().methods.add(token, allocPoint),
      options,
    );
  }

  /**
   * Update pool allocation point/share
   * @dev UPDATE | ALLOCATION POINT
   * @param {Object} params
   * @param {uint256} params.pid Pool id
   * @param {uint256} params.allocPoint Set allocation point/share for pool id
   * @param {bool} params.withUpdate Update all pools and distribute mining reward for all
   * @returns {Promise<void>}
   */
  set({ pid, allocPoint, withUpdate }, options) {
    return this.__sendTx(
      this.getContract().methods.set(pid, allocPoint, withUpdate),
      options,
    );
  }

  /**
   * Stake tokens on given pool id
   * @param {Object} params
   * @param {uint256} params.pid Pool id
   * @param {uint256} params.amount The token amount user wants to stake to the pool.
   * @returns {Promise<void>}
   */
  async stake({ pid, amount }, options) {
    const amount2 = await this.fromBNToDecimals(amount, pid);
    return this.__sendTx(
      this.getContract().methods.stake(pid, amount2),
      options,
    );
  }

  /**
   * User exit staking amount from main pool, require main pool only
   * @param {Object} params
   * @param {uint256} params.pid Pool id
   * @param {uint256} params.amount The token amount user wants to exit/unstake from the pool.
   * @param {uint256} params.amountOutMinimum The min LP token amount expected to be received from exchange,
   * needed from outside for security reasons, using zero value in production is discouraged.
   * @returns {Promise<uint256>} net tokens amount sent to user address
   */
  async exit({ pid, amount, amountOutMinimum }, options) {
    const amount2 = await this.fromBNToDecimals(amount, pid);
    return this.__sendTx(
      this.getContract().methods.exit(pid, amount2, amountOutMinimum),
      options,
    );
  }

  /**
   * User exit staking amount from LOOP pool, require LOOP pool only
   * @param {Object} params
   * @param {uint256} params.amount The token amount user wants to exit/unstake from the pool.
   * @returns {Promise<uint256>} net tokens amount sent to user address
   */
  exitLP({ amount }, options) {
    const amount2 = Numbers.fromBNToDecimals(amount, this.LPTokenContract().getDecimals());
    return this.__sendTx(
      this.getContract().methods.exit(amount2),
      options,
    );
  }

  /**
   * View pending LP token rewards for user
   * @dev VIEW | PENDING REWARD
   * @param {Object} params
   * @param {uint256} params.pid Pool id of main pool
   * @param {address} params.user User address to check pending rewards for
   * @returns {Promise<uint256>} Pending LP token rewards for user
   */
  async getUserReward({ pid, user }) {
    const res = await this.getContract().methods.getUserReward(pid, user).call();
    return this.fromDecimalsToBN(res, pid);
  }

  /**
   * User collects his share of LP tokens reward
   * @param {Object} params
   * @param {uint256} params.pid Pool id
   * @returns {Promise<uint256>} LP reward tokens amount sent to user address
   */
  collectRewards({ pid }, options) {
    return this.__sendTx(
      this.getContract().methods.collectRewards(pid),
      options,
    );
  }

  // TODO: fix this fn, it always returns zero
  /**
   * @param {Object} params
   * @param {uint256} params.pid
   * @returns {Promise<uint256>}
   */
  async collectRewardsCall({ pid }) {
    const res = await this.getContract().methods.collectRewards(pid).call();
    return this.fromDecimalsToBN(res, pid);
  }

  /**
   * @param {uint256} pid
   * @returns {Promise<uint256[]>}
   */
  // collectRewardsAll(options) {
  //   return this.__sendTx(this.getContract().methods.collectRewardsAll(), options);
  // }

  /**
   * @param {uint256} pid
   * @returns {Promise<uint256[]>}
   */
  // async collectRewardsAllCall() {
  //   const res = await this.getContract().methods.collectRewardsAll().call();
  //   return Promise.all(res.map((val, idx) => this.fromDecimalsToBN(val, idx)));
  // }

  /**
   * Current total user stake in a given pool
   * @param {Object} params
   * @param {uint256} params.pid Pool id
   * @param {address} params.user The user address
   * @returns {Promise<uint256>} stake tokens amount
   */
  async currentStake({ pid, user }) {
    const res = await this.getContract().methods.currentStake(pid, user).call();
    return this.fromDecimalsToBN(res, pid);
  }

  /**
   * Percentage of how much a user has earned so far from the other users exit, would be just a statistic
   * @param {Object} params
   * @param {uint256} params.pid Pool id
   * @param {address} params.user The user address
   * @returns {Promise<uint256>} earnings percent as integer
   */
  async earnings({ pid, user }) {
    const res = await this.getContract().methods.earnings(pid, user).call();
    return this.fromDecimalsToBN(res, pid);
  }

  /**
   * Get blocks range given two block numbers, usually computes blocks elapsed since last mining reward block.
   * @dev RETURN | BLOCK RANGE SINCE LAST REWARD AS REWARD MULTIPLIER | INCLUDES START BLOCK
   * @param {Object} params
   * @param {uint256} params.from block start
   * @param {uint256} params.to block end
   * @returns {Promise<uint256>} blocks count
   */
  async getBlocksFromRange({ from, to }) {
    const res = await this.getContract().methods.getBlocksFromRange(from, to).call();
    return BigNumber(res);
  }

  /**
   * Update all pools for mining rewards
   * @dev UPDATE | (ALL) REWARD VARIABLES | BEWARE: HIGH GAS POTENTIAL
   * @returns {Promise<void>}
   */
  massUpdatePools(options) {
    return this.__sendTx(
      this.getContract().methods.massUpdatePools(),
      options,
    );
  }

  /**
   * Update pool to trigger LP tokens reward since last reward mining block
   * @dev UPDATE | (ONE POOL) REWARD VARIABLES
   * @param {Object} params
   * @param {uint256} params.pid Pool id
   * @returns {Promise<void>}
   */
  updatePool({ pid }, options) {
    return this.__sendTx(
      this.getContract().methods.updatePool(pid),
      options,
    );
  }

  /**
   * Update pool to trigger LP tokens reward since last reward mining block, function call for results and no transaction
   * @dev UPDATE | (ONE POOL) REWARD VARIABLES
   * @param {Object} params
   * @param {uint256} params.pid Pool id
   * @returns {Promise<uint256>} blocksElapsed Blocks elapsed since last reward block
   * @returns {Promise<uint256>} lpTokensReward Amount of LP tokens reward since last reward block
   * @returns {Promise<uint256>} accLPtokensPerShare Pool accumulated LP tokens per pool token (per share)
   */
  async updatePoolCall({ pid }) {
    const res = await this.getContract().methods.updatePool(pid).call();
    // res.blocksElapsed, res.lpTokensReward, res.accLPtokensPerShare
    const decimals = this.LPTokenContract().getDecimals();
    const lpPerTokenMult = await this.getContract().methods.LPtokensPerShareMultiplier().call();
    const accLPperToken = BigNumber(res.accLPtokensPerShare).div(lpPerTokenMult);

    return {
      blocksElapsed: BigNumber(res.blocksElapsed),
      lpTokensReward: Numbers.fromDecimalsToBN(res.lpTokensReward, decimals),
      accLPtokensPerShare: accLPperToken,
    };
  }

  /**
   * Get LP tokens reward for given pool id, only MAIN pool, LOOP pool reward will always be zero
   * @param {Object} params
   * @param {uint256} params.pid Pool id
   * @returns {Promise<uint256>} tokensReward Tokens amount as reward based on last mining block
   */
  async getPoolReward({ pid }) {
    // LP tokens reward
    const res = await this.getContract().methods.getPoolReward(pid).call();
    const decimals = this.LPTokenContract().getDecimals();
    return Numbers.fromDecimalsToBN(res, decimals);
  }

  /**
   * Get pool token decimals given pool id
   * @param {Object} params
   * @param {uint256} params.pid Pool id
   * @returns {Promise<uint256>} poolTokenDecimals
   */
  async getPoolTokenDecimals({ pid }) {
    // TODO: cache decimals by pid for token address
    const res = await this.getContract().methods.getPool(pid).call();
    return this.ETHUtils().decimals(res[0]); // token = res[0]
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
      await this.getPoolTokenDecimals({ pid }),
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
      await this.getPoolTokenDecimals({ pid }),
    );
  }

  /**
   * Get current block timestamp
   * @returns {Promise<uint256>} current block timestamp
   */
  getBlockTimestamp() {
    return this.getContract().methods.getBlockTimestamp().call();
  }

  /**
   * Get current block number
   * @returns {Promise<uint256>} current block number
   */
  getBlockNumber() {
    return this.getContract().methods.getBlockNumber().call();
  }

  /** @typedef {Object} Loophole~PoolInfo
   * @property {address} token
   * @property {uint256} allocPoint
   * @property {uint256} lastRewardBlock
   * @property {uint256} totalPool
   * @property {uint256} entryStakeTotal
   * @property {uint256} totalDistributedPenalty
   * @property {uint256} accLPtokensPerShare
   */

  /**
   * Get pool attributes
   * @param {Object} params
   * @param {uint256} params.pid Pool id
   * @returns {Promise<Loophole~PoolInfo>}
   */
  async getPool({ pid }) {
    const res = await this.getContract().methods.getPool(pid).call();
    const token = res[0];
    const decimals = await this.ETHUtils().decimals(token);
    // const lpDecimals = this.LPTokenContract().getDecimals();
    const lpPerTokenMult = await this.getContract().methods.LPtokensPerShareMultiplier().call();
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
   * Get pool attributes, raw with no conversion.
   * @param {Object} params
   * @param {uint256} params.pid
   * @returns {Promise<Loophole~PoolInfo>}
   */
  getPoolInfo({ pid }) {
    return this.getContract().methods.getPoolInfo(pid).call();
  }

  /**
   * Get pools array length
   * @returns {Promise<uint256>} pools count
   */
  poolsCount() {
    return this.getContract().methods.poolsCount().call();
  }

  /** @typedef {Object} Loophole~UserInfo
   * @property {uint256} entryStake Accumulated staked amount
   * @property {uint256} unstake Accumulated net unstaked amount or exitStake
   * @property {uint256} entryStakeAdjusted Current user adjusted stake in the pool
   * @property {uint256} payRewardMark LP tokens reward mark to control new rewards and already paid ones
   */

  /**
   * Get pool attributes as struct
   * @param {Object} params
   * @param {uint256} params.pid Pool id
   * @param {address} params.user User address
   * @returns {Promise<Loophole~UserInfo>}
   */
  async getUserInfo({ pid, user }) {
    const res = await this.getContract().methods.getUserInfo(pid, user).call();
    return {
      ...res,
      entryStake: await this.fromDecimalsToBN(res.entryStake, pid),
      unstake: await this.fromDecimalsToBN(res.unstake, pid),
      entryStakeAdjusted: await this.fromDecimalsToBN(res.entryStakeAdjusted, pid),
      payRewardMark: await this.fromDecimalsToBN(res.payRewardMark, 0), // 0 is LOOP pool id token
    };
  }

  /**
   * Get total accumulated 'entry stake' so far for a given user address in a pool id
   * @param {Object} params
   * @param {uint256} params.pid Pool id
   * @param {address} params.user User address
   * @returns {Promise<uint256>} user entry stake amount in a given pool
   */
  async getTotalEntryStakeUser({ pid, user }) {
    const res = await this.getContract().methods.getTotalEntryStakeUser(pid, user).call();
    return this.fromDecimalsToBN(res, pid);
  }

  /**
   * Get total accumulated 'unstake' so far for a given user address in a pool id
   * @param {Object} params
   * @param {uint256} params.pid Pool id
   * @param {address} params.user User address
   * @returns {Promise<uint256>} user unstake amount in a given pool
   */
  async getTotalUnstakeUser({ pid, user }) {
    const res = await this.getContract().methods.getTotalUnstakeUser(pid, user).call();
    return this.fromDecimalsToBN(res, pid);
  }

  // WARNING: Function NOT fully working:
  // when user had profit from others exits and entryStake is less than what he had withdrown
  // SOLUTION? maybe return only what is greather than zero?
  /**
   * Get 'entry stake adjusted' for a given user address in a pool id
   * @param {Object} params
   * @param {uint256} params.pid Pool id
   * @param {address} params.user User address
   * @returns {Promise<uint256>} user entry stake adjusted amount in given pool
   */
  async getCurrentEntryStakeUser({ pid, user }) {
    // const res = await this.getContract().methods.getCurrentEntryStakeUser(pid, user).call();
    // return await this.fromDecimalsToBN(res, pid);
    let selExitPenalty;
    if (this.isLoopPoolId(pid)) {
      selExitPenalty = await this.exitPenaltyLP();
    }
    else selExitPenalty = await this.exitPenalty();
    const userInfo = await this.getUserInfo({ pid, user });
    const totalGrossUnstaked = userInfo.unstake.div(1 - selExitPenalty);
    return userInfo.entryStake.minus(totalGrossUnstaked);
  }

  /**
   * Returns true if given pis is a LOOP pool id, false otherwise.
   * @param {uint256} pid Pool id
   * @returns {Boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  isLoopPoolId(pid) {
    return (pid === 0);
  }

  /**
   * Get 'entry stake adjusted' for a given user address in a pool id
   * @param {Object} params
   * @param {uint256} params.pid Pool id
   * @param {address} params.user User address
   * @returns {Promise<uint256>} user entry stake adjusted amount in given pool
   */
  async getEntryStakeAdjusted({ pid, user }) {
    const res = await this.getContract().methods.getEntryStakeAdjusted(pid, user).call();
    return this.fromDecimalsToBN(res, pid);
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
    await this.params.LPTokenContract.__assert();

    if (!this.params.ETHUtils) {
      this.params.ETHUtils = new ETHUtils({
        web3Connection: this.web3Connection,
        contractAddress: this.params.ethUtilsAddress,
      });
    }
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
