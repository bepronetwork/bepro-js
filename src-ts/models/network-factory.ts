import Model from '@base/model';
import {NetworkFactoryMethods} from '@methods/network-factory';
import {Deployable} from '@base/deployable';
import {TransactionReceipt} from 'web3-core';
import NetworkFactoryAbi from '@abi/NetworkFactory.json';
import Web3Connection from '@base/web3-connection';
import {AbiItem} from 'web3-utils';
import ERC20 from '@models/erc20';
import {fromDecimals, toSmartContractDecimals} from '@utils/numbers';
import {Errors} from '@interfaces/error-enum';

export default class NetworkFactory extends Model<NetworkFactoryMethods> implements Deployable {
  private _settlerToken!: ERC20;
  get settlerToken() { return this._settlerToken; }

  constructor(web3Connection: Web3Connection, contractAddress?: string) {
    super(web3Connection, NetworkFactoryAbi.abi as AbiItem[], contractAddress);
  }

  async getNetworkByAddress(address: string) {
    return this.callTx(this.contract.methods.getNetworkByAddress(address));
  }

  async getNetworkById(id: number) {
    return this.callTx(this.contract.methods.getNetworkById(id))
  }

  async getAmountOfNetworksForked() {
    return this.callTx(this.contract.methods.networksAmount())
  }

  async getBEPROLocked() {
    return fromDecimals(await this.callTx(this.contract.methods.tokensLockedTotal()), this.settlerToken.decimals)
  }

  async getLockedStakedByAddress(address: string) {
    return this.callTx(this.contract.methods.tokensLocked(address))
  }

  async OPERATOR_AMOUNT() {
    return this.callTx(this.contract.methods.OPERATOR_AMOUNT());
  }

  async isOperator(address: string) {
    return await this.getLockedStakedByAddress(address) >= await this.OPERATOR_AMOUNT()
  }

  async approveSettlerERC20Token() {
    return this.settlerToken.approve(this.contractAddress!, await this.settlerToken.totalSupply())
  }

  async isApprovedSettlerToken(address: string = this.contractAddress!, amount: number) {
    return this.settlerToken.isApproved(address, amount)
  }

  async getSettlerTokenAddress() {
    return this.callTx(this.contract.methods.beproAddress());
  }

  async lock(amount: number) {
    if (amount <= 0)
      throw new Error(Errors.AmountNeedsToBeHigherThanZero);

    return this.sendTx(this.contract.methods.lock(toSmartContractDecimals(amount, this.settlerToken.decimals) as number))
  }

  async unlock() {
    return this.sendTx(this.contract.methods.unlock());
  }

  async createNetwork(settlerToken: string, transactionalToken: string) {
    return this.sendTx(this.contract.methods.createNetwork(settlerToken, transactionalToken));
  }

  async loadContract() {
    super.loadContract();
    this._settlerToken = new ERC20(this.web3Connection, await this.getSettlerTokenAddress())
  }

  deployJsonAbi(erc20ContractAddress: string): Promise<TransactionReceipt> {
    const deployOptions = {
      data: NetworkFactoryAbi.bytecode,
      arguments: [erc20ContractAddress]
    }

    return this.deploy(deployOptions, this.web3Connection.Account);
  }
}
