import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@methods/contract-call-method';

export interface VotableMethods {
  bank(v1: string) :ContractCallMethod<number>;
  erc20() :ContractCallMethod<string>;
  pollCount() :ContractCallMethod<number>;
  polls(v1: number) :ContractCallMethod<{'0': string; '1': undefined; '2': number; '3': string; '4': number; '5': number}>;
  createPoll(_description: string, _voteLength: number, options: number[]) :ContractCallMethod<number>;
  endPoll(_pollID: number) :ContractSendMethod;
  getPoolInformation(_pollID: number) :ContractCallMethod<{'0': string; '1': undefined; '2': number; '3': string; '4': string[]; '5': number}>;
  getPoolWinner(_pollID: number) :ContractCallMethod<{'0': number; '1': number}>;
  getPollOptionById(_pollID: number, id: number) :ContractCallMethod<number>;
  getPollHistory(_voter: string) :ContractCallMethod<number[]>;
  getPollInfoForVoter(_pollID: number, _voter: string) :ContractCallMethod<{'0': number; '1': number}>;
  userHasVoted(_pollID: number, _user: string) :ContractCallMethod<boolean>;
  castVote(_pollID: number, _voteId: number) :ContractSendMethod;
  stakeVotingTokens(_numTokens: number) :ContractSendMethod;
  withdrawTokens(_numTokens: number) :ContractSendMethod;
  getLockedAmount(_voter: string) :ContractCallMethod<number>;
  getTokenStake(_voter: string) :ContractCallMethod<number>;
}