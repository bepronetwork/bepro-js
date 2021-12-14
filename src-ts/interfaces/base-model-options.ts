import Web3Connection from '@base/web3-connection';
import {AbiItem} from 'web3-utils';

export interface BaseModelOptions {
  web3Connection: Web3Connection;
  contractAddress: string;
  abi: AbiItem; // JSON representation of the contract
}
