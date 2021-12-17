import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@methods/contract-call-method';

export interface NetworkFactoryMethods {
  OPERATOR_AMOUNT(): ContractCallMethod<number>;
  beproAddress(): ContractCallMethod<string>;
  networks(v1: number): ContractCallMethod<string>;
  networksAmount(): ContractCallMethod<number>;
  networksArray(v1: number): ContractCallMethod<string>;
  networksByAddress(v1: string): ContractCallMethod<string>;
  tokensLocked(v1: string): ContractCallMethod<number>;
  tokensLockedTotal(): ContractCallMethod<number>;
  lock(_tokenAmount: number): ContractSendMethod;
  createNetwork(_settlerToken: string, _transactionToken: string): ContractSendMethod;
  unlock(): ContractSendMethod;
  getTokensLocked(_address: string): ContractCallMethod<number>;
  getNetworkById(_id: number): ContractCallMethod<string>;
  getNetworkByAddress(_address: string): ContractCallMethod<string>;
}
