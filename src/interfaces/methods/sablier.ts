import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@methods/contract-call-method';

export interface SablierMethods {
  addPauser(account: string) :ContractSendMethod;
  fee() :ContractCallMethod<number>;
  initialize(sender: string) :ContractSendMethod;
  isPauser(account: string) :ContractCallMethod<boolean>;
  nextStreamId() :ContractCallMethod<number>;
  owner() :ContractCallMethod<string>;
  pause() :ContractSendMethod;
  paused() :ContractCallMethod<boolean>;
  transferOwnership(newOwner: string) :ContractSendMethod;
  unpause() :ContractSendMethod;
  updateFee(feePercentage: number) :ContractSendMethod;
  takeEarnings(tokenAddress: string, amount: number) :ContractSendMethod;
  getStream(streamId: number) :ContractCallMethod<{'0': string; '1': string; '2': number; '3': string; '4': number; '5': number; '6': number; '7': number}>;
  deltaOf(streamId: number) :ContractCallMethod<number>;
  balanceOf(streamId: number, who: string) :ContractCallMethod<number>;
  isCompoundingStream(streamId: number) :ContractCallMethod<boolean>;
  getCompoundingStream(streamId: number) :ContractCallMethod<{'0': string; '1': string; '2': number; '3': string; '4': number; '5': number; '6': number; '7': number; '8': number; '9': number; '10': number}>;
  interestOf(streamId: number, amount: number) :ContractCallMethod<{'0': number; '1': number; '2': number}>;
  getEarnings(tokenAddress: string) :ContractCallMethod<number>;
  createStream(recipient: string, deposit: number, tokenAddress: string, startTime: number, stopTime: number) :ContractCallMethod<number>;
  createCompoundingStream(recipient: string, deposit: number, tokenAddress: string, startTime: number, stopTime: number, senderSharePercentage: number, recipientSharePercentage: number) :ContractCallMethod<number>;
  withdrawFromStream(streamId: number, amount: number) :ContractCallMethod<boolean>;
  cancelStream(streamId: number) :ContractCallMethod<boolean>;
  getTokenDecimalsFromStream(streamId: number) :ContractCallMethod<undefined>;
  getTokenDecimals(tokenAddress: string) :ContractCallMethod<undefined>;
}