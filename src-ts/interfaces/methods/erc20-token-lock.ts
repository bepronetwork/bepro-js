import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@methods/contract-call-method';

export interface ERC20TokenLockMethods {
  erc20(): ContractCallMethod<string>;
  lockedTokensMap(v1: string): ContractCallMethod<{'0': number; '1': number; '2': number}>;
  maxAmountToLock(): ContractCallMethod<number>;
  minAmountToLock(): ContractCallMethod<number>;
  owner(): ContractCallMethod<string>;
  paused(): ContractCallMethod<boolean>;
  totalAmountStaked(): ContractCallMethod<number>;
  transferOwnership(newOwner: string): ContractSendMethod;
  admin(): ContractCallMethod<string>;
  setMaxAmountToLock(tokenAmount: number): ContractCallMethod<boolean>;
  setMinAmountToLock(tokenAmount: number): ContractCallMethod<boolean>;
  lock(amount: number, endDate: number): ContractCallMethod<boolean>;
  release(): ContractCallMethod<boolean>;
  canRelease(user: string): ContractCallMethod<boolean>;
  getLockedTokens(user: string): ContractCallMethod<number>;
  getLockedTokensInfo(user: string): ContractCallMethod<{'0': number; '1': number; '2': number}>;
}
