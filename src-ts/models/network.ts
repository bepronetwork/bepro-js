import Model from '@base/model';
import Web3Connection from '@base/web3-connection';
import * as NetworkAbi from '@abi/Network.json';
import ERC20 from '@models/erc20';
import {fromDecimals, toSmartContractDecimals} from '@utils/numbers';
import {TransactionReceipt} from 'web3-core';
import networkIssue from '@utils/network-issue';
import {NetworkIssue} from '@interfaces/network-issue';
import networkMerge from '@utils/network-merge';
import {Errors} from '@interfaces/error-enum';
import {Deployable} from '@base/deployable';
import {NetworkMethods} from '@methods/network';
import {OraclesSummary} from '@interfaces/oracles-summary';
import {AbiItem} from 'web3-utils';

export default class Network extends Model<NetworkMethods> implements Deployable {
  private _transactionToken!: ERC20;
  private _settlerToken!: ERC20;
  get transactionToken() { return this._transactionToken; }
  get settlerToken() { return this._settlerToken; }

  constructor(web3Connection: Web3Connection, contractAddress?: string) {
    super(web3Connection, NetworkAbi.abi as AbiItem[], contractAddress);
  }

  async getTransactionTokenAddress(): Promise<string> {
    return this.callTx(await this.contract.methods.transactionToken());
  }

  async getSettlerTokenAddress(): Promise<string> {
    return this.callTx(await this.contract.methods.settlerToken());
  }

  async getIssuesByAddress(address: string): Promise<number[]> {
    const ids = await this.callTx(await this.contract.methods.getIssuesByAddress(address));

    return ids.map((id: string) => parseInt(id, 10));
  }

  async getAmountOfIssuesOpened(): Promise<number> {
    return parseInt(await this.callTx(await this.contract.methods.incrementIssueID()), 10);
  }

  async getAmountOfIssuesClosed(): Promise<number> {
    return parseInt(await this.callTx(await this.contract.methods.closedIdsCount()), 10);
  }

  async getOraclesByAddress(address: string) {
    return +fromDecimals(await this.callTx(await this.contract.methods.getOraclesByAddress(address)), this.settlerToken.decimals);
  }

  async getOraclesSummary(address: string): Promise<OraclesSummary> {
    const {'0': oraclesDelegatedByOthers, '1': amounts, '2': addresses, '3': tokensLocked} =
      await this.callTx(await this.contract.methods.getOraclesSummary(address));


    const decimals = this.settlerToken.decimals;

    return {
      oraclesDelegatedByOthers: +fromDecimals(oraclesDelegatedByOthers, this.settlerToken.decimals),
      amounts: amounts.map((amount: number) => +fromDecimals(amount, decimals)),
      addresses,
      tokensLocked: +fromDecimals(tokensLocked, decimals),
    }
  }

  // Arrays cant be queried without an argument
  // async getAmountOfDisputers(): Promise<number> {
  //   return (await this.sendTx(this.contract.methods.oraclersArray(), true)).length;
  // }

  // Method does not exist
  // async percentageNeededForApprove(): Promise<number> {
  //   return parseInt(await this.sendTx(this.contract.methods.percentageNeededForApprove(), true), 10);
  // }

  async percentageNeededForDispute(): Promise<number> {
    return parseInt(await this.callTx(this.contract.methods.percentageNeededForDispute()), 10);
  }

  // Method does not exist
  // async percentageNeededForMerge(): Promise<number> {
  //   return parseInt(await this.sendTx(this.contract.methods.percentageNeededForMerge(), true), 10)
  // }

  async mergeCreatorFeeShare(): Promise<number> {
    return parseInt(await this.callTx(this.contract.methods.mergeCreatorFeeShare()), 10);
  }

  async disputableTime(): Promise<number> {
    return parseInt(await this.callTx(this.contract.methods.disputableTime()), 10)
  }

  async redeemTime(): Promise<number> {
    return parseInt(await this.callTx(this.contract.methods.redeemTime()), 10)
  }

  async getTokensStaked(): Promise<number> {
    return +fromDecimals(await this.callTx(this.contract.methods.totalStaked()), this.transactionToken.decimals);
  }

  async getBEPROStaked(): Promise<number> {
    return +fromDecimals(await this.callTx(this.contract.methods.oraclesStaked()), this.settlerToken.decimals)
  }

  async COUNCIL_AMOUNT(): Promise<number> {
    return +fromDecimals(await this.callTx(this.contract.methods.COUNCIL_AMOUNT()), this.settlerToken.decimals);
  }

  async isCouncil(address: string): Promise<boolean> {
    return await this.getOraclesByAddress(address) >= await this.COUNCIL_AMOUNT();
  }

  async changeCouncilAmount(value: string): Promise<TransactionReceipt> {
    const amount = toSmartContractDecimals(value, this.settlerToken.decimals);
    return this.sendTx(this.contract.methods.changeCOUNCIL_AMOUNT(amount as number));
  }

  async changeRedeemTime(amount: number): Promise<TransactionReceipt> {
    return this.sendTx(this.contract.methods.changeRedeemTime(amount as number));
  }

  async changeDisputableTime(amount: number): Promise<TransactionReceipt> {
    return this.sendTx(this.contract.methods.changeDisputableTime(amount as number));
  }

  async isIssueInDraft(issueId: number): Promise<boolean> {
    return this.callTx(this.contract.methods.isIssueInDraft(issueId));
  }

  async isMergeDisputed(issueId: number, mergeId: number): Promise<boolean> {
    return this.callTx(this.contract.methods.isMergeDisputed(issueId, mergeId))
  }

  async isMergeInDraft(id: number, mergeId: number) {
    return this.sendTx(this.contract.methods.isMergeInDraft(id, mergeId))
  }

  async getIssueByCID(cid: string): Promise<NetworkIssue> {
    return networkIssue(await this.callTx(this.contract.methods.getIssueByCID(cid)), this.transactionToken.decimals);
  }

  async getIssueById(id: number): Promise<NetworkIssue> {
    return networkIssue(await this.callTx(this.contract.methods.getIssueById(id)), this.transactionToken.decimals);
  }

  async getMergeById(issueId: number, mergeId: number): Promise<any> {
    return networkMerge(await this.callTx(this.contract.methods.getMergeById(issueId, mergeId)), this.transactionToken.decimals)
  }

  async approveSettlerERC20Token() {
    return this.settlerToken.approve(this.contractAddress!, await this.settlerToken.totalSupply())
  }

  async approveTransactionalERC20Token() {
    return this.transactionToken.approve(this.contractAddress!, await this.transactionToken.totalSupply())
  }

  async isApprovedSettlerToken(address: string = this.contractAddress!, amount: number) {
    return this.settlerToken.isApproved(address, amount)
  }

  async isApprovedTransactionalToken(address: string = this.contractAddress!, amount: number) {
    return this.transactionToken.isApproved(address, amount)
  }

  async lock(amount: number): Promise<TransactionReceipt> {
    if (amount <= 0)
      throw new Error(Errors.AmountNeedsToBeHigherThanZero);

    return this.sendTx(this.contract.methods.lock(toSmartContractDecimals(amount, this.settlerToken.decimals) as number))
  }

  async unlock(amount: number, from: string) {
    if (amount <= 0)
      throw new Error(Errors.AmountNeedsToBeHigherThanZero);

    return this.sendTx(this.contract.methods.unlock(toSmartContractDecimals(amount, this.settlerToken.decimals) as number, from))
  }

  async delegateOracles(amount: number, delegateTo: string) {
    if (amount <= 0)
      throw new Error(Errors.AmountNeedsToBeHigherThanZero);

    return this.sendTx(this.contract.methods.delegateOracles(toSmartContractDecimals(amount, this.transactionToken.decimals, true) as number, delegateTo))
  }

  async openIssue(cid: string, amount: number) {
    if (amount <= 0)
      throw new Error(Errors.AmountNeedsToBeHigherThanZero);

    return this.sendTx(this.contract.methods.openIssue(cid, toSmartContractDecimals(amount, this.settlerToken.decimals, true) as number))
  }

  async updateIssue(id: number, amount: number) {
    if (amount <= 0)
      throw new Error(Errors.AmountNeedsToBeHigherThanZero);

    return this.sendTx(this.contract.methods.updateIssue(id, toSmartContractDecimals(amount, this.settlerToken.decimals, true) as number))
  }

  async recognizeAsFinished(id: number) {
    return this.sendTx(this.contract.methods.recognizeAsFinished(id))
  }

  async redeemIssue(id: number) {
    return this.sendTx(this.contract.methods.redeemIssue(id))
  }

  async closeIssue(id: number, mergeId: number) {
    return this.sendTx(this.contract.methods.closeIssue(id, mergeId))
  }

  async disputeMerge(id: number, mergeId: number) {
    return this.sendTx(this.contract.methods.disputeMerge(id, mergeId))
  }

  async proposeIssueMerge(id: number, prAddresses: string[], prAmounts: number[]) {
    const amounts = prAmounts.map((amount) => toSmartContractDecimals(amount, this.transactionToken.decimals, true) as number)
    return this.sendTx(this.contract.methods.proposeIssueMerge(id, prAddresses, amounts))
  }

  async loadContract() {
    super.loadContract();

    if (!this.contractAddress)
      throw new Error(Errors.MissingContractAddress);

    const transactionAddress = await this.getTransactionTokenAddress();
    const settlerAddress = await this.getTransactionTokenAddress();
    this._transactionToken = new ERC20(this.web3Connection, transactionAddress);
    this._settlerToken = new ERC20(this.web3Connection, settlerAddress);

    await this._transactionToken.loadContract();
    await this._settlerToken.loadContract();

  }

  deployJsonAbi(settlerAddress: string, transactionalAddress: string, governanceAddress: string) {

    const deployOptions = {
      data: NetworkAbi.bytecode,
      arguments: [settlerAddress, transactionalAddress, governanceAddress]
    }

    return this.deploy(deployOptions, this.web3Connection.Account);
  }
}