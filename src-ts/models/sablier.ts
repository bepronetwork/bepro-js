import {Model} from '@base/model';
import {Web3Connection} from '@base/web3-connection';
import {Web3ConnectionOptions} from '@interfaces/web3-connection-options';
import {Deployable} from '@interfaces/deployable';
import SablierJson from '@abi/Sablier.json';
import {SablierMethods} from '@methods/sablier';
import {AbiItem} from 'web3-utils';
import {fromDecimals, toSmartContractDecimals} from '@utils/numbers';
import sablierStream from '@utils/sablier-stream';
import sablierCompoundingStream from '@utils/sablier-compounding-stream';
import sablierInterest from '@utils/sablier-interest';

export class Sablier extends Model<SablierMethods> implements Deployable {
  constructor(web3Connection: Web3Connection|Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, SablierJson.abi as AbiItem[], contractAddress);
  }

  async deployJsonAbi() {
    const deployOptions = {
        data: SablierJson.bytecode,
        arguments: []
    };

    return this.deploy(deployOptions, this.web3Connection.Account);
  }

  async addPauser(account: string) {
    return this.sendTx(this.contract.methods.addPauser(account));
  }

  async fee() {
    return +fromDecimals(await this.callTx(this.contract.methods.fee()), 16);
  }

  async initialize(sender: string) {
    return this.sendTx(this.contract.methods.initialize(sender));
  }

  async isPauser(account: string) {
    return this.callTx(this.contract.methods.isPauser(account));
  }

  async nextStreamId() {
    return this.callTx(this.contract.methods.nextStreamId());
  }

  async owner() {
    return this.callTx(this.contract.methods.owner());
  }

  async pause() {
    return this.sendTx(this.contract.methods.pause());
  }

  async paused() {
    return this.callTx(this.contract.methods.paused());
  }

  async transferOwnership(newOwner: string) {
    return this.sendTx(this.contract.methods.transferOwnership(newOwner));
  }

  async unpause() {
    return this.sendTx(this.contract.methods.unpause());
  }

  async updateFee(feePercentage: number) {
    return this.sendTx(this.contract.methods.updateFee(feePercentage));
  }

  async takeEarnings(tokenAddress: string, amount: number) {
    const decimals = await this.callTx(this.contract.methods.getTokenDecimals(tokenAddress))
    return this.sendTx(this.contract.methods.takeEarnings(tokenAddress, toSmartContractDecimals(amount, decimals) as number));
  }

  async getStream(streamId: number) {
    return sablierStream(await this.callTx(this.contract.methods.getStream(streamId)));
  }

  async deltaOf(streamId: number) {
    return this.callTx(this.contract.methods.deltaOf(streamId));
  }

  async balanceOf(streamId: number, who: string) {
    return +fromDecimals(await this.callTx(this.contract.methods.balanceOf(streamId, who)), await this.getTokenDecimalsFromStream(streamId));
  }

  async isCompoundingStream(streamId: number) {
    return this.callTx(this.contract.methods.isCompoundingStream(streamId));
  }

  async getCompoundingStream(streamId: number) {
    return sablierCompoundingStream(await this.callTx(this.contract.methods.getCompoundingStream(streamId)), await this.getTokenDecimalsFromStream(streamId));
  }

  async interestOf(streamId: number, amount: number) {
    return sablierInterest(await this.callTx(this.contract.methods.interestOf(streamId, amount)), await this.getTokenDecimalsFromStream(streamId));
  }

  async getEarnings(tokenAddress: string) {
    return +fromDecimals(await this.callTx(this.contract.methods.getEarnings(tokenAddress)), await this.getTokenDecimals(tokenAddress));
  }

  async createStream(recipient: string, deposit: number, tokenAddress: string, startTime: number, stopTime: number) {
    return this.callTx(this.contract.methods.createStream(recipient, toSmartContractDecimals(deposit, await this.getTokenDecimals(tokenAddress)) as number, tokenAddress, startTime, stopTime));
  }

  async createCompoundingStream(recipient: string, deposit: number, tokenAddress: string, startTime: number, stopTime: number, senderSharePercentage: number, recipientSharePercentage: number) {
    return this.callTx(this.contract.methods.createCompoundingStream(recipient, toSmartContractDecimals(deposit, await this.getTokenDecimals(tokenAddress)) as number, tokenAddress, startTime, stopTime, senderSharePercentage, recipientSharePercentage));
  }

  async withdrawFromStream(streamId: number, amount: number) {
    return this.callTx(this.contract.methods.withdrawFromStream(streamId, toSmartContractDecimals(amount, await this.getTokenDecimalsFromStream(streamId)) as number));
  }

  async cancelStream(streamId: number) {
    return this.callTx(this.contract.methods.cancelStream(streamId));
  }

  async getTokenDecimalsFromStream(streamId: number) {
    return this.callTx(this.contract.methods.getTokenDecimalsFromStream(streamId));
  }

  async getTokenDecimals(tokenAddress: string) {
    return this.callTx(this.contract.methods.getTokenDecimals(tokenAddress));
  }

}
