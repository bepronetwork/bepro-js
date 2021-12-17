import Model from '@base/model';
import {NetworkFactoryMethods} from '@methods/network-factory';
import {Deployable} from '@base/deployable';
import {TransactionReceipt} from 'web3-core';
import NetworkFactoryAbi from '@abi/NetworkFactory.json';
import Web3Connection from '@base/web3-connection';
import {AbiItem} from 'web3-utils';

export default class NetworkFactory extends Model<NetworkFactoryMethods> implements Deployable {

  constructor(web3Connection: Web3Connection, contractAddress?: string) {
    super(web3Connection, NetworkFactoryAbi.abi as AbiItem[], contractAddress);
  }

  deployJsonAbi(erc20ContractAddress: string): Promise<TransactionReceipt> {
    const deployOptions = {
      data: NetworkFactoryAbi.bytecode,
      arguments: [erc20ContractAddress]
    }

    return this.deploy(deployOptions, this.web3Connection.Account);
  }
}
