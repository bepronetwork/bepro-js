import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@methods/contract-call-method';

export interface StakingContractMethods {
  erc20() :ContractCallMethod<string>;
  erc721() :ContractCallMethod<string>;
  mySubscriptions(v1: string, v2: number) :ContractCallMethod<number>;
  owner() :ContractCallMethod<string>;
  paused() :ContractCallMethod<boolean>;
  productIds(v1: number) :ContractCallMethod<number>;
  products(v1: number) :ContractCallMethod<{'0': number; '1': number; '2': number; '3': number; '4': number; '5': number; '6': number; '7': number; '8': boolean}>;
  transferOwnership(newOwner: string) :ContractSendMethod;
  heldTokens() :ContractCallMethod<number>;
  futureLockedTokens() :ContractCallMethod<number>;
  availableTokens() :ContractCallMethod<number>;
  subscribeProduct(_product_id: number, _amount: number) :ContractSendMethod;
  createProduct(_startDate: number, _endDate: number, _totalMaxAmount: number, _individualMinimumAmount: number, _individualMaximumAmount: number, _APR: number, _lockedUntilFinalization: boolean) :ContractSendMethod;
  getAPRAmount(_APR: number, _startDate: number, _endDate: number, _amount: number) :ContractCallMethod<number>;
  getProductIds() :ContractCallMethod<number[]>;
  getMySubscriptions(_address: string) :ContractCallMethod<number[]>;
  withdrawSubscription(_product_id: number, _subscription_id: number) :ContractSendMethod;
  getSubscription(_subscription_id: number, _product_id: number) :ContractCallMethod<{'0': number; '1': number; '2': number; '3': number; '4': number; '5': string; '6': number; '7': boolean; '8': number}>;
  getProduct(_product_id: number) :ContractCallMethod<{'0': number; '1': number; '2': number; '3': number; '4': number; '5': number; '6': number; '7': number; '8': boolean; '9': string[]; '10': number[]}>;
  safeGuardAllTokens(_address: string) :ContractSendMethod;
  changeTokenAddress(_tokenAddress: string) :ContractSendMethod;
}
