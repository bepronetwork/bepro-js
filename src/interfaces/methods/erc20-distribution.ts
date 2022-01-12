import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@methods/contract-call-method';

export interface ERC20DistributionMethods {
  TGEDate() :ContractCallMethod<number>;
  decimals() :ContractCallMethod<number>;
  distributions(v1: string, v2: number) :ContractCallMethod<{'0': number; '1': number; '2': number; '3': number}>;
  erc20() :ContractCallMethod<string>;
  lastDateDistribution() :ContractCallMethod<number>;
  month() :ContractCallMethod<number>;
  owner() :ContractCallMethod<string>;
  paused() :ContractCallMethod<boolean>;
  tokenOwners(v1: number) :ContractCallMethod<string>;
  transferOwnership(newOwner: string) :ContractSendMethod;
  year() :ContractCallMethod<number>;
  setTokenAddress(_tokenAddress: string) :ContractSendMethod;
  safeGuardAllTokens(_address: string) :ContractSendMethod;
  setTGEDate(_time: number) :ContractSendMethod;
  triggerTokenSend() :ContractSendMethod;
  setInitialDistribution(_address: string, _tokenAmount: number, _unlockDays: number) :ContractSendMethod;
}