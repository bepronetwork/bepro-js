import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@methods/contract-call-method';

export interface ERC721StandardMethods {
  approve(to: string, tokenId: number): ContractSendMethod;
  balanceOf(owner: string): ContractCallMethod<number>;
  baseURI(): ContractCallMethod<string>;
  getApproved(tokenId: number): ContractCallMethod<string>;
  isApprovedForAll(owner: string, operator: string): ContractCallMethod<boolean>;
  name(): ContractCallMethod<string>;
  owner(): ContractCallMethod<string>;
  ownerOf(tokenId: number): ContractCallMethod<string>;
  safeTransferFrom(from: string, to: string, tokenId: number): ContractSendMethod;
  safeTransferFrom(from: string, to: string, tokenId: number, _data: undefined): ContractSendMethod;
  setApprovalForAll(operator: string, approved: boolean): ContractSendMethod;
  supportsInterface(interfaceId: undefined): ContractCallMethod<boolean>;
  symbol(): ContractCallMethod<string>;
  tokenByIndex(index: number): ContractCallMethod<number>;
  tokenOfOwnerByIndex(owner: string, index: number): ContractCallMethod<number>;
  tokenURI(tokenId: number): ContractCallMethod<string>;
  totalSupply(): ContractCallMethod<number>;
  transferFrom(from: string, to: string, tokenId: number): ContractSendMethod;
  transferOwnership(newOwner: string): ContractSendMethod;
  exists(tokenId: number): ContractCallMethod<boolean>;
  setTokenURI(tokenId: number, uri: string): ContractSendMethod;
  setBaseURI(baseURI: string): ContractSendMethod;
  mint(to: string, tokenId: number): ContractSendMethod;
  mint(to: string, tokenId: number, _data?: string): ContractSendMethod;
}
