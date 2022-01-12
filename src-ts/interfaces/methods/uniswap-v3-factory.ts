import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@methods/contract-call-method';

export interface UniswapV3FactoryMethods {
  owner() :ContractCallMethod<string>;
  feeAmountTickSpacing(fee: number) :ContractCallMethod<number>;
  getPool(tokenA: string, tokenB: string, fee: number) :ContractCallMethod<string>;
  createPool(tokenA: string, tokenB: string, fee: number) :ContractCallMethod<string>;
  setOwner(_owner: string) :ContractSendMethod;
  enableFeeAmount(fee: number, tickSpacing: number) :ContractSendMethod;
}
