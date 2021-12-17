import Web3Connection from '@base/web3-connection';
import Model from '@base/model';
import * as Json from '@abi/Token.json';
import {TransactionReceipt} from 'web3-core';
import {fromDecimals, toSmartContractDecimals} from '@utils/numbers';
import {Deployable} from '@base/deployable';
import {ERC20Methods} from '@methods/erc20';
import Web3ConnectionOptions from '@interfaces/web3-connection-options';

export default class ERC20 extends Model<ERC20Methods> implements Deployable {
  private _decimals: number = 0;
  get decimals(): number { return this._decimals; }

  constructor(web3Connection: Web3Connection|Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, Json.abi as any, contractAddress);
  }

  async loadContract() {
    super.loadContract();
    this._decimals = (await this.sendTx(this.contract.methods.decimals(), true)) || 18;
  }

  async name(): Promise<string> {
    return await this.sendTx(this.contract.methods.name(), true);
  }

  async symbol(): Promise<string> {
    return await this.sendTx(this.contract.methods.symbol(), true);
  }

  async totalSupply(): Promise<number> {
    return +fromDecimals(await this.sendTx(this.contract.methods.totalSupply(), true), this.decimals) as number;
  }

  async getTokenAmount(address: string): Promise<number> {
    return +fromDecimals(await this.sendTx(this.contract.methods.balanceOf(address), true), this.decimals);
  }

  async transferTokenAmount(toAddress: string, amount: number) {
    const tokenAmount = toSmartContractDecimals(amount, this.decimals, true) as number;
    return this.sendTx(this.contract.methods.transfer(toAddress, tokenAmount));
  }

  async isApproved(spenderAddress = this.contractAddress, amount: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const wei = await this.sendTx(this.contract.methods.allowance(this.web3Connection.Account.address, spenderAddress!), true);
        const approvedAmount = fromDecimals(wei, this.decimals);
        resolve(+approvedAmount >= fromDecimals(amount, this.decimals));
      } catch (e) {
        reject(e);
      }
    })

  }

  async approve(address: string, amount: number): Promise<TransactionReceipt> {
    return this.sendTx(this.contract.methods.approve(address, toSmartContractDecimals(amount, this.decimals) as number));
  }

  async deployJsonAbi(name: string, symbol: string, cap: number, distributionAddress: string): Promise<TransactionReceipt> {
    const deployOptions = {
      data: Json.bytecode,
      arguments: [name, symbol, cap, distributionAddress]
    }

    return this.deploy(deployOptions, this.web3Connection.Account);
  }
}
