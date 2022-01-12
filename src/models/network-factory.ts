import {Model} from '@base/model';
import {NetworkFactoryMethods} from '@methods/network-factory';
import {Deployable} from '@interfaces/deployable';
import {TransactionReceipt} from 'web3-core';
import NetworkFactoryAbi from '@abi/NetworkFactory.json';
import {Web3Connection} from '@base/web3-connection';
import {AbiItem} from 'web3-utils';
import {ERC20} from '@models/erc20';
import {fromDecimals, toSmartContractDecimals} from '@utils/numbers';
import {Errors} from '@interfaces/error-enum';

export class NetworkFactory extends Model<NetworkFactoryMethods> implements Deployable {
  private _erc20!: ERC20;
  get erc20() { return this._erc20; }

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
    return +(await this.callTx(this.contract.methods.networksAmount()));
  }

  async getBEPROLocked() {
    return +fromDecimals(await this.callTx(this.contract.methods.tokensLockedTotal()), this.erc20.decimals)
  }

  async getLockedStakedByAddress(address: string) {
    return this.callTx(this.contract.methods.tokensLocked(address))
  }

  async OPERATOR_AMOUNT() {
    return +fromDecimals(await this.callTx(this.contract.methods.OPERATOR_AMOUNT(), this.erc20.decimals));
  }

  async isOperator(address: string) {
    return await this.getLockedStakedByAddress(address) >= await this.OPERATOR_AMOUNT()
  }

  async approveSettlerERC20Token() {
    return this.erc20.approve(this.contractAddress!, await this.erc20.totalSupply())
  }

  async isApprovedSettlerToken(address: string = this.contractAddress!, amount: number) {
    return this.erc20.isApproved(address, amount)
  }

  async getSettlerTokenAddress() {
    return this.callTx(this.contract.methods.beproAddress());
  }

  async lock(amount: number) {
    if (amount <= 0)
      throw new Error(Errors.AmountNeedsToBeHigherThanZero);

    return this.sendTx(this.contract.methods.lock(toSmartContractDecimals(amount, this.erc20.decimals) as number))
  }

  async unlock() {
    return this.sendTx(this.contract.methods.unlock());
  }

  async createNetwork(erc20: string, transactionalToken: string) {
    return this.sendTx(this.contract.methods.createNetwork(erc20, transactionalToken));
  }

  async start() {
    await super.start();
    await this.loadContract();
  }

  async loadContract() {
    if (!this.contract)
      super.loadContract();

    this._erc20 = new ERC20(this.web3Connection, await this.getSettlerTokenAddress());
    await this._erc20.loadContract();
  }

  deployJsonAbi(erc20ContractAddress: string): Promise<TransactionReceipt> {
    const deployOptions = {
      data: NetworkFactoryAbi.bytecode,
      arguments: [erc20ContractAddress]
    }

    return this.deploy(deployOptions, this.web3Connection.Account);
  }
}
