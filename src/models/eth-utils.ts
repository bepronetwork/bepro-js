import {Model} from '@base/model';
import {Web3Connection} from '@base/web3-connection';
import {Web3ConnectionOptions} from '@interfaces/web3-connection-options';
import {Deployable} from '@interfaces/deployable';
import ETHUtilsJson from '@abi/ETHUtils.json';
import {ETHUtilsMethods} from '@methods/eth-utils';
import {AbiItem} from 'web3-utils';
import blockNumberAndTimestamp from '@utils/block-number-timestamp';
import {fromSmartContractDate} from '@utils/numbers';

export class ETHUtils extends Model<ETHUtilsMethods> implements Deployable {
  constructor(web3Connection: Web3Connection|Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, ETHUtilsJson.abi as AbiItem[], contractAddress);
  }

  async deployJsonAbi() {
    const deployOptions = {
        data: ETHUtilsJson.bytecode,
        arguments: []
    };

    return this.deploy(deployOptions, this.web3Connection.Account);
  }

  async name(tokenAddress: string) {
    return this.callTx(this.contract.methods.name(tokenAddress));
  }

  async symbol(tokenAddress: string) {
    return this.callTx(this.contract.methods.symbol(tokenAddress));
  }

  async decimals(tokenAddress: string) {
    return this.callTx(this.contract.methods.decimals(tokenAddress));
  }

  async blockNumber() {
    return this.callTx(this.contract.methods.blockNumber());
  }

  async blockTimestamp() {
    return fromSmartContractDate(await this.callTx(this.contract.methods.blockTimestamp()));
  }

  async blockNumberAndTimestamp() {
    return blockNumberAndTimestamp(await this.callTx(this.contract.methods.blockNumberAndTimestamp()));
  }

}
