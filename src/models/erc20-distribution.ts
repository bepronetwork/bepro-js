import {Model} from '@base/model';
import {Web3Connection} from '@base/web3-connection';
import {Web3ConnectionOptions} from '@interfaces/web3-connection-options';
import {Deployable} from '@interfaces/deployable';
import ERC20DistributionJson from '@abi/ERC20Distribution.json';
import {ERC20DistributionMethods} from '@methods/erc20-distribution';
import {AbiItem} from 'web3-utils';
import {IsOwnable, IsPausable} from '@interfaces/modifiers';
import {ERC20} from '@models/erc20';
import {Pausable} from '@base/pausable';
import {Ownable} from '@base/ownable';
import {toSmartContractDate, toSmartContractDecimals} from '@utils/numbers';

export class ERC20Distribution extends Model<ERC20DistributionMethods> implements Deployable, IsOwnable, IsPausable {
  constructor(web3Connection: Web3Connection|Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, ERC20DistributionJson.abi as AbiItem[], contractAddress);
  }

  private _erc20!: ERC20;
  get erc20() { return this._erc20; }

  private _pausable!: Pausable;
  private _ownable!: Ownable;

  get pausable() { return this._pausable }
  get ownable() { return this._ownable }

  async loadContract() {
    if (!this.contract)
      super.loadContract();

    this._ownable = new Ownable(this);
    this._pausable = new Pausable(this);

    this._erc20 = new ERC20(this.web3Connection, await this.callTx(this.contract.methods.erc20()));
    await this._erc20.loadContract();
  }

  async start() {
    await super.start();
    await this.loadContract();
  }

  async deployJsonAbi() {
    const deployOptions = {
      data: ERC20DistributionJson.bytecode,
      arguments: []
    };

    return this.deploy(deployOptions, this.web3Connection.Account);
  }

  async TGEDate() {
    return this.callTx(this.contract.methods.TGEDate());
  }

  async decimals() {
    return this.callTx(this.contract.methods.decimals());
  }

  async distributions(v1: string, v2: number) {
    return this.callTx(this.contract.methods.distributions(v1, v2));
  }

  async erc20Address() {
    return this.callTx(this.contract.methods.erc20());
  }

  async lastDateDistribution() {
    return this.callTx(this.contract.methods.lastDateDistribution());
  }

  async month() {
    return this.callTx(this.contract.methods.month());
  }

  async tokenOwners(v1: number) {
    return this.callTx(this.contract.methods.tokenOwners(v1));
  }

  async transferOwnership(newOwner: string) {
    return this.sendTx(this.contract.methods.transferOwnership(newOwner));
  }

  async year() {
    return this.callTx(this.contract.methods.year());
  }

  async setTokenAddress(_tokenAddress: string) {
    return this.sendTx(this.contract.methods.setTokenAddress(_tokenAddress));
  }

  async safeGuardAllTokens(_address: string) {
    return this.sendTx(this.contract.methods.safeGuardAllTokens(_address));
  }

  async setTGEDate(_time: number) {
    return this.sendTx(this.contract.methods.setTGEDate(toSmartContractDate(_time)));
  }

  async triggerTokenSend() {
    return this.sendTx(this.contract.methods.triggerTokenSend());
  }

  async setInitialDistribution(_address: string, _tokenAmount: number, _unlockDays: number) {
    return this.sendTx(this.contract.methods
                           .setInitialDistribution(_address,
                                                   toSmartContractDecimals(_tokenAmount, this.erc20.decimals),
                                                   toSmartContractDate(_unlockDays)));
  }

}
