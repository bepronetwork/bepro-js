import {Model} from '@base/model';
import {Web3Connection} from '@base/web3-connection';
import {Web3ConnectionOptions} from '@interfaces/web3-connection-options';
import {Deployable} from '@interfaces/deployable';
import CERC20MockJson from '@abi/CERC20Mock.json';
import {CERC20Methods} from '@methods/cerc20';
import * as Events from '@events/cerc20-events';
import {PastEventOptions} from 'web3-eth-contract';
import {XEvents} from '@events/x-events';
import {AbiItem} from 'web3-utils';
import {ERC20} from '@models/erc20';
import {Errors} from '@interfaces/error-enum';

export class CERC20 extends Model<CERC20Methods> implements Deployable {
  private _erc20!: ERC20;
  get erc20(): ERC20 { return this._erc20; }

  constructor(web3Connection: Web3Connection|Web3ConnectionOptions, contractAddress?: string, readonly underlyingAddress?: string) {
    super(web3Connection, CERC20MockJson.abi as AbiItem[], contractAddress);
  }

  async start() {
    await super.start();
    await this.loadContract();
  }

  async loadContract() {
    if (!this.contract)
      super.loadContract();

    if (!this.contractAddress)
      throw new Error(Errors.MissingContractAddress);

    let underlying = this.underlyingAddress;
    if (!underlying)
      underlying = await this.underlying();

    if (!underlying)
      throw new Error(Errors.MissingERC20UnderlyingToken);

    this._erc20 = new ERC20(this.web3Connection, underlying);
    await this._erc20.loadContract();
  }

  async deployJsonAbi(underlying_: string, initialExchangeRate_: number, decimals_: number) {
    const deployOptions = {
        data: CERC20MockJson.bytecode,
        arguments: [underlying_, initialExchangeRate_, decimals_]
    };

    return this.deploy(deployOptions, this.web3Connection.Account);
  }

  /**
   * Function to check the amount of tokens that an owner allowed to a spender.
   */
  async allowance(owner: string, spender: string) {
    return this.callTx(this.contract.methods.allowance(owner, spender));
  }

  /**
   * Approve the passed address to spend the specified amount of tokens on behalf of msg.sender. Beware that changing an allowance with this method brings the risk that someone may use both the old and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards: https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   */
  async approve(spender: string, value: number) {
    return this.callTx(this.contract.methods.approve(spender, value));
  }

  /**
   * Gets the balance of the specified address.
   */
  async balanceOf(owner: string) {
    return this.callTx(this.contract.methods.balanceOf(owner));
  }

  async decimals() {
    return this.callTx(this.contract.methods.decimals());
  }

  /**
   * Decrease the amount of tokens that an owner allowed to a spender. approve should be called when _allowances[msg.sender][spender] == 0. To decrement allowed value is better to use this function to avoid 2 calls (and wait until the first transaction is mined) From MonolithDAO Token.sol Emits an Approval event.
   */
  async decreaseAllowance(spender: string, subtractedValue: number) {
    return this.callTx(this.contract.methods.decreaseAllowance(spender, subtractedValue));
  }

  /**
   * Increase the amount of tokens that an owner allowed to a spender. approve should be called when _allowances[msg.sender][spender] == 0. To increment allowed value is better to use this function to avoid 2 calls (and wait until the first transaction is mined) From MonolithDAO Token.sol Emits an Approval event.
   */
  async increaseAllowance(spender: string, addedValue: number) {
    return this.callTx(this.contract.methods.increaseAllowance(spender, addedValue));
  }

  async initialBlockNumber() {
    return this.callTx(this.contract.methods.initialBlockNumber());
  }

  async initialExchangeRate() {
    return this.callTx(this.contract.methods.initialExchangeRate());
  }

  async isCToken() {
    return this.callTx(this.contract.methods.isCToken());
  }

  /**
   * Total number of tokens in existence
   */
  async totalSupply() {
    return this.callTx(this.contract.methods.totalSupply());
  }

  /**
   * Transfer token to a specified address
   */
  async transfer(to: string, value: number) {
    return this.callTx(this.contract.methods.transfer(to, value));
  }

  /**
   * Transfer tokens from one address to another. Note that while this function emits an Approval event, this is not required as per the specification, and other compliant implementations may not emit the event.
   */
  async transferFrom(from: string, to: string, value: number) {
    return this.callTx(this.contract.methods.transferFrom(from, to, value));
  }

  async underlying() {
    return this.callTx(this.contract.methods.underlying());
  }

  /**
   * This also accrues interest in a transaction
   */
  async balanceOfUnderlying(owner: string) {
    return this.callTx(this.contract.methods.balanceOfUnderlying(owner));
  }

  async exchangeRateCurrent() {
    return this.callTx(this.contract.methods.exchangeRateCurrent());
  }

  /**
   * Accrues interest whether or not the operation succeeds, unless reverted
   */
  async mint(mintAmount: number) {
    return this.callTx(this.contract.methods.mint(mintAmount));
  }

  /**
   * This is just a mock
   */
  async supplyUnderlying(supplyAmount: number) {
    return this.callTx(this.contract.methods.supplyUnderlying(supplyAmount));
  }

  /**
   * This is just a mock
   */
  async redeemUnderlying(redeemAmount: number) {
    return this.callTx(this.contract.methods.redeemUnderlying(redeemAmount));
  }

  async getApprovalEvents(filter: PastEventOptions): Promise<XEvents<Events.ApprovalEvent>[]> {
    return this.contract.self.getPastEvents(`Approval`, filter)
  }

  async getTransferEvents(filter: PastEventOptions): Promise<XEvents<Events.TransferEvent>[]> {
    return this.contract.self.getPastEvents(`Transfer`, filter)
  }

}
