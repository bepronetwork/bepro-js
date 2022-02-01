import {ContractCallMethod} from '@methods/contract-call-method';

export interface CERC20Methods {
  allowance(owner: string, spender: string) :ContractCallMethod<number>;
  approve(spender: string, value: number) :ContractCallMethod<boolean>;
  balanceOf(owner: string) :ContractCallMethod<number>;
  decimals() :ContractCallMethod<number>;
  decreaseAllowance(spender: string, subtractedValue: number) :ContractCallMethod<boolean>;
  increaseAllowance(spender: string, addedValue: number) :ContractCallMethod<boolean>;
  initialBlockNumber() :ContractCallMethod<number>;
  initialExchangeRate() :ContractCallMethod<number>;
  isCToken() :ContractCallMethod<boolean>;
  totalSupply() :ContractCallMethod<number>;
  transfer(to: string, value: number) :ContractCallMethod<boolean>;
  transferFrom(from: string, to: string, value: number) :ContractCallMethod<boolean>;
  underlying() :ContractCallMethod<string>;
  balanceOfUnderlying(owner: string) :ContractCallMethod<number>;
  exchangeRateCurrent() :ContractCallMethod<number>;
  mint(mintAmount: number) :ContractCallMethod<boolean>;
  supplyUnderlying(supplyAmount: number) :ContractCallMethod<boolean>;
  redeemUnderlying(redeemAmount: number) :ContractCallMethod<boolean>;
}
