import Web3Connection from '@base/web3-connection';
import Model from '@base/model';
import * as Json from '@abi/ERC20.json';
import {TransactionReceipt} from 'web3-core';
import {fromDecimals, toSmartContractDecimals} from '../utils/numbers';

export default class ERC20 extends Model {
  private _decimals: number = 0;
  get decimals(): number { return this._decimals; }

  constructor(web3Connection: Web3Connection, contractAddress: string) {
    super(web3Connection, contractAddress, Json.abi as any);
  }

  async loadContract() {
    super.loadContract();
    this._decimals = await this.sendTx(this.contract.methods.decimals, true);
  }

  async totalSupply(): Promise<number> {
    return +fromDecimals(await this.sendTx(this.contract.methods.totalSupply(), true), this.decimals);
  }

  async getTokenAmount(address: string): Promise<number> {
    return +fromDecimals(await this.sendTx(this.contract.methods.balanceOf(address), true), this.decimals);
  }

  async transferTokenAmount(toAddress: string, amount: string) {
    const tokenAmount = toSmartContractDecimals(amount, this.decimals);
    return this.sendTx(this.contract.methods.transfer(toAddress, tokenAmount));
  }

  async isApproved(address:string, spenderAddress: string, amount: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const {fromWei} = this.web3Connection.utils;
        const wei = await this.sendTx(this.contract.methods.allowance(address, spenderAddress));
        const approvedAmount = fromWei(wei, `ether`);
        resolve(+approvedAmount >= amount);
      } catch (e) {
        reject(e);
      }
    })

  }

  async approve(address: string, amount: string) {
    const {toWei} = this.web3Connection.utils;
    const weiAmount = toWei(amount);
    return this.sendTx(this.contract.methods.approve(address, weiAmount));
  }

  async deployJsonAbi(name: string, symbol: string, cap: number, distributionAddress: string): Promise<TransactionReceipt> {
    const deployOptions = {
      data: Json as any,
      arguments: [name, symbol, cap, distributionAddress]
    }

    return super.deploy(deployOptions);
  }
}
