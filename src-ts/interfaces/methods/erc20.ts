import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@methods/contract-call-method';

export interface ERC20Methods {
  allowance(owner: string, spender: string): ContractCallMethod<number>;
  approve(spender: string, amount: number): ContractCallMethod<boolean>;
  balanceOf(account: string): ContractCallMethod<number>;
  decimals(): ContractCallMethod<undefined>;
  decreaseAllowance(spender: string, subtractedValue: number): ContractCallMethod<boolean>;
  distributionContract(): ContractCallMethod<string>;
  increaseAllowance(spender: string, addedValue: number): ContractCallMethod<boolean>;
  name(): ContractCallMethod<string>;
  owner(): ContractCallMethod<string>;
  symbol(): ContractCallMethod<string>;
  totalSupply(): ContractCallMethod<number>;
  transfer(recipient: string, amount: number): ContractCallMethod<boolean>;
  transferFrom(sender: string, recipient: string, amount: number): ContractCallMethod<boolean>;
  transferOwnership(newOwner: string): ContractSendMethod;
}
