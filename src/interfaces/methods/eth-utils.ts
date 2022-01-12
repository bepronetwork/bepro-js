import {ContractCallMethod} from '@methods/contract-call-method';

export interface ETHUtilsMethods {
  name(tokenAddress: string) :ContractCallMethod<string>;
  symbol(tokenAddress: string) :ContractCallMethod<string>;
  decimals(tokenAddress: string) :ContractCallMethod<undefined>;
  blockNumber() :ContractCallMethod<number>;
  blockTimestamp() :ContractCallMethod<number>;
  blockNumberAndTimestamp() :ContractCallMethod<{'0': number; '1': number}>;
}
