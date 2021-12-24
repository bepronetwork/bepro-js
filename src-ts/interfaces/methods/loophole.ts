import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@methods/contract-call-method';

export interface LoopholeMethods {
  LPtokensPerShareMultiplier() :ContractCallMethod<number>;
  exitPenalty() :ContractCallMethod<number>;
  exitPenaltyLP() :ContractCallMethod<number>;
  lpToken() :ContractCallMethod<string>;
  lpTokensPerBlock() :ContractCallMethod<number>;
  owner() :ContractCallMethod<string>;
  poolExists(v1: string) :ContractCallMethod<boolean>;
  startBlock() :ContractCallMethod<number>;
  swapRouter() :ContractCallMethod<string>;
  totalAllocPoint() :ContractCallMethod<number>;
  transferOwnership(newOwner: string) :ContractSendMethod;
  uniswapPoolFee() :ContractCallMethod<undefined>;
  add(token: string, allocPoint: number) :ContractCallMethod<number>;
  set(pid: number, allocPoint: number, withUpdate: boolean) :ContractSendMethod;
  stake(pid: number, amount: number) :ContractSendMethod;
  exit(pid: number, amount: number, amountOutMinimum: number) :ContractCallMethod<number>;
  exit(amount: number) :ContractCallMethod<number>;
  getUserReward(pid: number, userAddress: string) :ContractCallMethod<number>;
  collectRewards(pid: number) :ContractCallMethod<number>;
  currentStake(pid: number, user: string) :ContractCallMethod<number>;
  earnings(pid: number, user: string) :ContractCallMethod<number>;
  getBlocksFromRange(from: number, to: number) :ContractCallMethod<number>;
  massUpdatePools() :ContractSendMethod;
  updatePool(pid: number) :ContractCallMethod<{'0': number; '1': number; '2': number}>;
  getPoolReward(pid: number) :ContractCallMethod<number>;
  getBlockTimestamp() :ContractCallMethod<number>;
  getBlockNumber() :ContractCallMethod<number>;
  getPool(pid: number) :ContractCallMethod<{'0': string; '1': number; '2': number; '3': number; '4': number; '5': number; '6': number}>;
  getPoolInfo(pid: number) :ContractCallMethod<undefined>;
  poolsCount() :ContractCallMethod<number>;
  getUserInfo(pid: number, user: string) :ContractCallMethod<undefined>;
  getTotalEntryStakeUser(pid: number, user: string) :ContractCallMethod<number>;
  getTotalUnstakeUser(pid: number, user: string) :ContractCallMethod<number>;
  getEntryStakeAdjusted(pid: number, user: string) :ContractCallMethod<number>;
}