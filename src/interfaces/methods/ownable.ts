import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@methods/contract-call-method';

export interface OwnableMethods {
  owner(): ContractCallMethod<string>;
  transferOwnership(newOwner: string): ContractSendMethod;
}
