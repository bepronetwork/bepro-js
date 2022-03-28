import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@methods/contract-call-method';

export interface GovernedMethods {
  _governor() :ContractCallMethod<string>;
  _proposedGovernor() :ContractCallMethod<string>;
  proposeGovernor(proposedGovernor: string) :ContractSendMethod;
  claimGovernor() :ContractSendMethod;
}