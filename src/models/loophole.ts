import {Model} from '@base/model';
import {Web3Connection} from '@base/web3-connection';
import {Web3ConnectionOptions} from '@interfaces/web3-connection-options';
import {Deployable} from '@interfaces/deployable';
import LoopholeJson from '@abi/Loophole.json';
import {LoopholeMethods} from '@methods/loophole';
import {AbiItem} from 'web3-utils';
import {ERC20} from '@models/erc20';
import {Errors} from '@interfaces/error-enum';
import {UniswapV3RouterBridge} from '@models/uniswap-v3-router-bridge';
import {fromDecimals, toSmartContractDecimals} from '@utils/numbers';
import lhUserInfo from '@utils/loophole-user-info';
import lhPoolInfo from '@utils/loophole-pool-info';
import {ETHUtils} from '@models/eth-utils';
import lhPoolUpdate from '@utils/loophole-pool-update';
import {IsOwnable} from '@interfaces/modifiers';
import {Ownable} from '@base/ownable';

export class Loophole extends Model<LoopholeMethods> implements Deployable, IsOwnable {
  constructor(web3Connection: Web3Connection | Web3ConnectionOptions,
              contractAddress?: string,
              readonly ethUtilsAddress?: string,
              readonly lpTokenAddress?: string,
              readonly swapRouterAddress?: string) {
    super(web3Connection, LoopholeJson.abi as AbiItem[], contractAddress);
  }

  private _erc20!: ERC20;
  private _swap!: UniswapV3RouterBridge;
  private _ethUtils!: ETHUtils;
  private _ownable!: Ownable;

  get ownable() { return this._ownable; }
  get erc20() { return this._erc20; }
  get swap() { return this._swap; }
  get ethUtils() { return this._ethUtils; }

  /* eslint-disable complexity */
  async loadContract() {
    if (!this.contract)
      super.loadContract();

    if (!this.ethUtilsAddress)
      throw new Error(Errors.MissingEthUtilsAddressPleaseProvideOne);

    this._ethUtils = new ETHUtils(this.web3Connection, this.ethUtilsAddress);
    this._ownable = new Ownable(this);

    const lpTokenAddress = await this.lpToken() || this.lpTokenAddress;
    if (!lpTokenAddress)
      throw new Error(Errors.MissingLpTokenAddressPleaseDeployUsingOne);

    this._erc20 = new ERC20(this.web3Connection, lpTokenAddress);

    const swapRouterAddress = await this.swapRouter() || this.swapRouterAddress;
    if (!swapRouterAddress)
      throw new Error(Errors.MissingSwapAddressPleaseDeployUsingOne);

    this._swap = new UniswapV3RouterBridge(this.web3Connection, swapRouterAddress);

    await this._swap.loadContract();
    await this._erc20.loadContract();
    await this._ethUtils.loadContract();
  }
  /* eslint-enable complexity */

  async start() {
    await super.start();
    await this.loadContract();
  }

  async deployJsonAbi(_swapRouter: string,
                      _lpToken: string,
                      _lpTokensPerBlock: number,
                      _startBlock: number,
                      _exitPenalty: number,
                      _exitPenaltyLP: number) {

    const erc20 = new ERC20(this.web3Connection, _lpToken);
    await erc20.loadContract();
    const lpTokensPerBlock = toSmartContractDecimals(_lpTokensPerBlock, erc20.decimals);

    const deployOptions = {
      data: LoopholeJson.bytecode,
      arguments: [_swapRouter, _lpToken, lpTokensPerBlock, _startBlock, _exitPenalty, _exitPenaltyLP]
    };

    return this.deploy(deployOptions, this.web3Connection.Account);
  }

  async LPtokensPerShareMultiplier() {
    return this.callTx(this.contract.methods.LPtokensPerShareMultiplier());
  }

  async exitPenalty() {
    return await this.callTx(this.contract.methods.exitPenalty()) / 100;
  }

  async exitPenaltyLP() {
    return await this.callTx(this.contract.methods.exitPenaltyLP()) / 100;
  }

  async lpToken() {
    return this.callTx(this.contract.methods.lpToken());
  }

  async lpTokensPerBlock() {
    return +fromDecimals(await this.callTx(this.contract.methods.lpTokensPerBlock()), this.erc20.decimals);
  }

  async owner() {
    return this.callTx(this.contract.methods.owner());
  }

  async poolExists(v1: string) {
    return this.callTx(this.contract.methods.poolExists(v1));
  }

  async startBlock() {
    return this.callTx(this.contract.methods.startBlock());
  }

  async swapRouter() {
    return this.callTx(this.contract.methods.swapRouter());
  }

  async totalAllocPoint() {
    return this.callTx(this.contract.methods.totalAllocPoint());
  }

  async uniswapPoolFee() {
    return this.callTx(this.contract.methods.uniswapPoolFee());
  }

  async add(token: string, allocPoint: number) {
    return this.callTx(this.contract.methods.add(token, allocPoint));
  }

  async set(pid: number, allocPoint: number, withUpdate: boolean) {
    return this.sendTx(this.contract.methods.set(pid, allocPoint, withUpdate));
  }

  async stake(pid: number, amount: number) {
    return this.sendTx(this.contract.methods.stake(pid, amount));
  }

  async exit(amount: number, pid?: number, amountOutMinimum?: number) {
    if (!pid && !amountOutMinimum && amount)
      return this.callTx(this.contract.methods.exit(amount));

    return this.callTx(this.contract.methods.exit(pid!, amount, amountOutMinimum));
  }

  async getUserReward(pid: number, userAddress: string) {
    return this.callTx(this.contract.methods.getUserReward(pid, userAddress));
  }

  async collectRewards(pid: number) {
    return this.callTx(this.contract.methods.collectRewards(pid));
  }

  async currentStake(pid: number, user: string) {
    return this.callTx(this.contract.methods.currentStake(pid, user));
  }

  async earnings(pid: number, user: string) {
    return this.callTx(this.contract.methods.earnings(pid, user));
  }

  async getBlocksFromRange(from: number, to: number) {
    return this.callTx(this.contract.methods.getBlocksFromRange(from, to));
  }

  async massUpdatePools() {
    return this.sendTx(this.contract.methods.massUpdatePools());
  }

  async updatePool(pid: number) {
    return lhPoolUpdate(await this.callTx(this.contract.methods.updatePool(pid)));
  }

  async getPoolReward(pid: number) {
    return +fromDecimals(await this.callTx(this.contract.methods.getPoolReward(pid)), this.erc20.decimals);
  }

  async getBlockTimestamp() {
    return this.callTx(this.contract.methods.getBlockTimestamp());
  }

  async getBlockNumber() {
    return this.callTx(this.contract.methods.getBlockNumber());
  }

  async getPool(pid: number) {
    const rawInfo = await this.callTx(this.contract.methods.getPool(pid))
    const decimals = await this.ethUtils.decimals(rawInfo[0]);
    return lhPoolInfo(rawInfo, decimals, await this.LPtokensPerShareMultiplier());
  }

  async getPoolInfo(pid: number) {
    const rawInfo = await this.callTx(this.contract.methods.getPoolInfo(pid));
    const decimals = await this.ethUtils.decimals(rawInfo[0]);
    return lhPoolInfo(rawInfo, decimals, await this.LPtokensPerShareMultiplier());
  }

  async poolsCount() {
    return this.callTx(this.contract.methods.poolsCount());
  }

  async getUserInfo(pid: number, user: string) {
    return lhUserInfo(await this.callTx(this.contract.methods.getUserInfo(pid, user)));
  }

  async getTotalEntryStakeUser(pid: number, user: string) {
    return this.callTx(this.contract.methods.getTotalEntryStakeUser(pid, user));
  }

  async getTotalUnstakeUser(pid: number, user: string) {
    return this.callTx(this.contract.methods.getTotalUnstakeUser(pid, user));
  }

  async getEntryStakeAdjusted(pid: number, user: string) {
    return this.callTx(this.contract.methods.getEntryStakeAdjusted(pid, user));
  }

}
