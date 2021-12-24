import {Model} from '@base/model';
import {Web3Connection} from '@base/web3-connection';
import {Web3ConnectionOptions} from '@interfaces/web3-connection-options';
import {Deployable} from '@interfaces/deployable';
import LoopholeJson from '@abi/Loophole.json';
import {LoopholeMethods} from '@methods/loophole';
import {AbiItem} from 'web3-utils';

export class Loophole extends Model<LoopholeMethods> implements Deployable {
  constructor(web3Connection: Web3Connection|Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, LoopholeJson as any as AbiItem[], contractAddress);
  }

  async deployJsonAbi(_swapRouter: string, _lpToken: string, _lpTokensPerBlock: number, _startBlock: number, _exitPenalty: number, _exitPenaltyLP: number) {
    const deployOptions = {
        data: LoopholeJson.bytecode,
        arguments: [_swapRouter, _lpToken, _lpTokensPerBlock, _startBlock, _exitPenalty, _exitPenaltyLP]
    };

    return this.deploy(deployOptions, this.web3Connection.Account);
  }

  async LPtokensPerShareMultiplier() {
    return this.callTx(this.contract.methods.LPtokensPerShareMultiplier()); 
  }

  async exitPenalty() {
    return this.callTx(this.contract.methods.exitPenalty()); 
  }

  async exitPenaltyLP() {
    return this.callTx(this.contract.methods.exitPenaltyLP()); 
  }

  async lpToken() {
    return this.callTx(this.contract.methods.lpToken()); 
  }

  async lpTokensPerBlock() {
    return this.callTx(this.contract.methods.lpTokensPerBlock()); 
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

  async transferOwnership(newOwner: string) {
    return this.sendTx(this.contract.methods.transferOwnership(newOwner)); 
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

  async exit(pid: number, amount: number, amountOutMinimum: number) {
    return this.callTx(this.contract.methods.exit(pid, amount, amountOutMinimum)); 
  }

  async exit(amount: number) {
    return this.callTx(this.contract.methods.exit(amount)); 
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
    return this.callTx(this.contract.methods.updatePool(pid)); 
  }

  async getPoolReward(pid: number) {
    return this.callTx(this.contract.methods.getPoolReward(pid)); 
  }

  async getBlockTimestamp() {
    return this.callTx(this.contract.methods.getBlockTimestamp()); 
  }

  async getBlockNumber() {
    return this.callTx(this.contract.methods.getBlockNumber()); 
  }

  async getPool(pid: number) {
    return this.callTx(this.contract.methods.getPool(pid)); 
  }

  async getPoolInfo(pid: number) {
    return this.callTx(this.contract.methods.getPoolInfo(pid)); 
  }

  async poolsCount() {
    return this.callTx(this.contract.methods.poolsCount()); 
  }

  async getUserInfo(pid: number, user: string) {
    return this.callTx(this.contract.methods.getUserInfo(pid, user)); 
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