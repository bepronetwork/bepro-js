import {ContractSendMethod} from 'web3-eth-contract';
export interface NetworkFactoryMethods {
  OPERATOR_AMOUNT(): ContractSendMethod;
  beproAddress(): ContractSendMethod;
  networks(v: number): ContractSendMethod;
  networksAmount(): ContractSendMethod;
  networksArray(v: number): ContractSendMethod;
  networksByAddress(v: string): ContractSendMethod;
  tokensLocked(v: string): ContractSendMethod;
  tokensLockedTotal(): ContractSendMethod;
  lock(_tokenAmount: number): ContractSendMethod;
  createNetwork(_settlerToken: string, _transactionToken: string): ContractSendMethod;
  unlock(): ContractSendMethod;
  getTokensLocked(_address: string): ContractSendMethod;
  getNetworkById(_id: number): ContractSendMethod;
  getNetworkByAddress(_address: string): ContractSendMethod;
}
