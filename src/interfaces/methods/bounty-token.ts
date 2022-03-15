import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@methods/contract-call-method';

export interface BountyTokenMethods {
  _governor() :ContractCallMethod<string>;
  _proposedGovernor() :ContractCallMethod<string>;
  approve(to: string, tokenId: number) :ContractSendMethod;
  balanceOf(owner: string) :ContractCallMethod<number>;
  baseURI() :ContractCallMethod<string>;
  claimGovernor() :ContractSendMethod;
  getApproved(tokenId: number) :ContractCallMethod<string>;
  isApprovedForAll(owner: string, operator: string) :ContractCallMethod<boolean>;
  name() :ContractCallMethod<string>;
  ownerOf(tokenId: number) :ContractCallMethod<string>;
  proposeGovernor(proposedGovernor: string) :ContractSendMethod;
  safeTransferFrom(from: string, to: string, tokenId: number, _data?: string) :ContractSendMethod;
  setApprovalForAll(operator: string, approved: boolean) :ContractSendMethod;
  supportsInterface(interfaceId: string) :ContractCallMethod<boolean>;
  symbol() :ContractCallMethod<string>;
  tokenByIndex(index: number) :ContractCallMethod<number>;
  tokenOfOwnerByIndex(owner: string, index: number) :ContractCallMethod<number>;
  tokenURI(tokenId: number) :ContractCallMethod<string>;
  totalSupply() :ContractCallMethod<number>;
  transferFrom(from: string, to: string, tokenId: number) :ContractSendMethod;
  awardBounty(to: string, uri: string, bountyId: number, percentage: number) :ContractSendMethod;
  getBountyToken(id: number) :ContractCallMethod<{'bountyConnector': {'bountyId': number;'percentage': number;};}>;
}
