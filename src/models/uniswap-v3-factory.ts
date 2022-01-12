import {Model} from '@base/model';
import {Web3Connection} from '@base/web3-connection';
import {Web3ConnectionOptions} from '@interfaces/web3-connection-options';
import {Deployable} from '@interfaces/deployable';
import IUniswapV3FactoryJson from '@abi/IUniswapV3Factory.json';
import {UniswapV3FactoryMethods} from '@methods/uniswap-v3-factory';
import {AbiItem} from 'web3-utils';

export class UniswapV3Factory extends Model<UniswapV3FactoryMethods> implements Deployable {
  constructor(web3Connection: Web3Connection|Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, IUniswapV3FactoryJson.abi as AbiItem[], contractAddress);
  }

  async deployJsonAbi() {
    const deployOptions = {
        data: IUniswapV3FactoryJson.bytecode,
        arguments: []
    };

    return this.deploy(deployOptions, this.web3Connection.Account);
  }

  async owner() {
    return this.callTx(this.contract.methods.owner());
  }

  async feeAmountTickSpacing(fee: number) {
    return this.callTx(this.contract.methods.feeAmountTickSpacing(fee));
  }

  async getPool(tokenA: string, tokenB: string, fee: number) {
    return this.callTx(this.contract.methods.getPool(tokenA, tokenB, fee));
  }

  async createPool(tokenA: string, tokenB: string, fee: number) {
    return this.callTx(this.contract.methods.createPool(tokenA, tokenB, fee));
  }

  async setOwner(_owner: string) {
    return this.sendTx(this.contract.methods.setOwner(_owner));
  }

  async enableFeeAmount(fee: number, tickSpacing: number) {
    return this.sendTx(this.contract.methods.enableFeeAmount(fee, tickSpacing));
  }

}
