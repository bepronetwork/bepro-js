import {Model} from '@base/model';
import {Web3Connection} from '@base/web3-connection';
import {Web3ConnectionOptions} from '@interfaces/web3-connection-options';
import {Deployable} from '@interfaces/deployable';
import StakingContractJson from '@abi/StakingContract.json';
import {StakingContractMethods} from '@methods/staking-contract';
import {AbiItem} from 'web3-utils';
import {ERC20} from '@models/erc20';
import {fromDecimals, toSmartContractDate, toSmartContractDecimals} from '@utils/numbers';
import stakingProduct from '@utils/staking-product';
import {IsOwnable, IsPausable} from '@interfaces/modifiers';
import {Ownable} from '@base/ownable';
import {Pausable} from '@base/pausable';
import stakeSubscription from '@utils/stake-subscription';
import {Errors} from '@interfaces/error-enum';

export class StakingContract extends Model<StakingContractMethods> implements Deployable, IsOwnable, IsPausable {
  constructor(web3Connection: Web3Connection|Web3ConnectionOptions, contractAddress?: string, readonly stakeTokenAddress?: string) {
    super(web3Connection, StakingContractJson.abi as AbiItem[], contractAddress);
  }

  private _pausable!: Pausable;
  private _ownable!: Ownable;
  private _erc20!: ERC20;

  get pausable() { return this._pausable }
  get ownable() { return this._ownable }
  get erc20() { return this._erc20; }

  async loadContract() {
    if (!this.contract)
      super.loadContract();

    this._ownable = new Ownable(this);
    this._pausable = new Pausable(this);

    this._erc20 = new ERC20(this.web3Connection, this.stakeTokenAddress || await this.callTx(this.contract.methods.erc20()));
    await this._erc20.loadContract();
  }

  async start() {
    await super.start();
    await this.loadContract();
  }

  async deployJsonAbi(_tokenAddress: string) {
    const deployOptions = {
        data: StakingContractJson.bytecode,
        arguments: [_tokenAddress]
    };

    return this.deploy(deployOptions, this.web3Connection.Account);
  }

  async erc20Address() {
    return this.callTx(this.contract.methods.erc20());
  }

  async getTokenAmount(address: string) {
    return this.erc20.getTokenAmount(address);
  }

  async heldTokens() {
    return +fromDecimals(await this.callTx(this.contract.methods.heldTokens()), this.erc20.decimals);
  }

  async futureLockedTokens() {
    return +fromDecimals(await this.callTx(this.contract.methods.futureLockedTokens()), this.erc20.decimals);
  }

  async availableTokens() {
    return +fromDecimals(await this.callTx(this.contract.methods.availableTokens()), this.erc20.decimals);
  }

  async subscribeProduct(_product_id: number, _amount: number) {
    await this.pausable.whenNotPaused();

    const amount = toSmartContractDecimals(_amount, this.erc20.decimals) as number;
    const isApproved = await this.erc20.isApproved(this.contractAddress, amount);

    if (!isApproved)
      throw new Error(Errors.InteractionIsNotAvailableCallApprove);

    return this.sendTx(this.contract.methods.subscribeProduct(_product_id, amount));
  }

  async createProduct(_startDate: number, _endDate: number, _totalMaxAmount: number, _individualMinimumAmount: number, _individualMaximumAmount: number, _APR: number, _lockedUntilFinalization: boolean) {
    return this.sendTx(
      this.contract.methods.createProduct(
        toSmartContractDate(_startDate),
        toSmartContractDate(_endDate),
        toSmartContractDecimals(_totalMaxAmount, this.erc20.decimals) as number,
        toSmartContractDecimals(_individualMinimumAmount, this.erc20.decimals) as number,
        toSmartContractDecimals(_individualMaximumAmount, this.erc20.decimals) as number,
        _APR, _lockedUntilFinalization));
  }

  async getAPRAmount(_APR: number, _startDate: number, _endDate: number, _amount: number) {
    return +fromDecimals(
      await this.callTx(
        this.contract.methods.getAPRAmount(
          _APR,
          toSmartContractDate(_startDate),
          toSmartContractDate(_endDate),
          toSmartContractDecimals(_amount, this.erc20.decimals) as number)
      ), this.erc20.decimals);
  }

  async getProductIds() {
    return (await this.callTx(this.contract.methods.getProductIds())).map(id => +id);
  }

  async getMySubscriptions(_address: string) {
    const subscriptions = await this.callTx(this.contract.methods.getMySubscriptions(_address));
    return subscriptions.map(subscription => +fromDecimals(subscription, this.erc20.decimals))
  }

  async withdrawSubscription(_product_id: number, _subscription_id: number) {
    return this.sendTx(this.contract.methods.withdrawSubscription(_product_id, _subscription_id));
  }

  async getSubscription(_subscription_id: number, _product_id: number) {
    return stakeSubscription(await this.callTx(this.contract.methods.getSubscription(_subscription_id, _product_id)));
  }

  async getProduct(_product_id: number) {
    return stakingProduct(await this.callTx(this.contract.methods.getProduct(_product_id)), this.erc20.decimals, _product_id);
  }

  async approveERC20Transfer() {
    return this.erc20.approve(this.contractAddress!, await this.erc20.totalSupply());
  }

  async depositAPRTokens(amount: number) {
    return this.erc20.transferTokenAmount(this.contractAddress!, amount);
  }

  async getAllProducts() {
    const productIds = await this.getProductIds();
    const products = [];

    for (const productId of productIds)
      products.push(await this.getProduct(productId));

    return products;
  }

  async getTotalProductsAPRAmount() {
    let aprAmount = 0;
    const products = await this.getAllProducts();
    for (const {APR, startDate, endDate, totalMaxAmount} of products)
      aprAmount += await this.getAPRAmount(APR, startDate, endDate, totalMaxAmount);

    return aprAmount;
  }

  async getAllSubscriptions() {
    const subscriptions = [];
    for (const {_id, subscriptionIds} of await this.getAllProducts())
      for (const _sid of subscriptionIds)
        subscriptions.push(await this.getSubscription(_sid, _id))

    return subscriptions;
  }

}
