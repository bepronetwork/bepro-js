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

export default class Network extends Model<NetworkMethods> implements Deployable {
  private _transactionToken!: ERC20;
  private _settlerToken!: ERC20;
  get transactionToken() { return this._transactionToken; }
  get settlerToken() { return this._settlerToken; }

  constructor(web3Connection: Web3Connection, contractAddress?: string) {
    super(web3Connection, NetworkAbi.abi as any, contractAddress); // investigate type: constructor messing this up
  }

  async getTransactionTokenAddress(): Promise<string> {
    return this.sendTx(await this.contract.methods.transactionToken(), true);
  }

  async getSettlerTokenAddress(): Promise<string> {
    return this.sendTx(await this.contract.methods.settlerToken(), true);
  }

  async getIssuesByAddress(address: string): Promise<number[]> {
    const ids = await this.sendTx(await this.contract.methods.getIssuesByAddress(address), true);

    return ids.map((id: string) => parseInt(id, 10));
  }

  async getAmountOfIssuesOpened(): Promise<number> {
    return parseInt(await this.sendTx(await this.contract.methods.incrementIssueID(), true), 10);
  }

  async getAmountOfIssuesClosed(): Promise<number> {
    return parseInt(await this.sendTx(await this.contract.methods.closedIdsCount(), true), 10);
  }

  async getOraclesByAddress(address: string) {
    return +fromDecimals(await this.sendTx(await this.contract.methods.getOraclesByAddress(address), true), this.settlerToken.decimals);
  }

  async getOraclesSummary(address: string) {
    const [oraclesDelegatedByOthers, amounts, addresses, tokensLocked] =
      await this.sendTx(await this.contract.methods.getOraclesSummary(address), true);

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
    return parseInt(await this.sendTx(this.contract.methods.percentageNeededForDispute(), true), 10);
  }

  // Method does not exist
  // async percentageNeededForMerge(): Promise<number> {
  //   return parseInt(await this.sendTx(this.contract.methods.percentageNeededForMerge(), true), 10)
  // }

  async mergeCreatorFeeShare(): Promise<number> {
    return parseInt(await this.sendTx(this.contract.methods.mergeCreatorFeeShare(), true), 10);
  }

  async disputableTime(): Promise<number> {
    const seconds = this.sendTx(this.contract.methods.disputableTime(), true);
    return parseInt((+seconds / 60).toString(), 10);
  }

  async redeemTime(): Promise<number> {
    return parseInt(await this.sendTx(this.contract.methods.redeemTime(), true), 10)
  }

  async getTokensStaked(): Promise<number> {
    return +fromDecimals(await this.sendTx(this.contract.methods.totalStaked(), true), this.transactionToken.decimals);
  }

  async getBEPROStaked(): Promise<number> {
    return +fromDecimals(await this.sendTx(this.contract.methods.oraclesStaked(), true), this.settlerToken.decimals)
  }

  async COUNCIL_AMOUNT(): Promise<number> {
    return +fromDecimals(await this.sendTx(this.contract.methods.COUNCIL_AMOUNT(), true), this.settlerToken.decimals);
  }

  async isCouncil(address: string): Promise<boolean> {
    return await this.getOraclesByAddress(address) >= await this.COUNCIL_AMOUNT();
  }

  async changeCouncilAmount(value: string): Promise<TransactionReceipt> {
    const amount = toSmartContractDecimals(value, this.settlerToken.decimals, true);
    return this.sendTx(this.contract.methods.changeCOUNCIL_AMOUNT(amount as number));
  }

  async changeRedeemTime(amount: number): Promise<TransactionReceipt> {
    return this.sendTx(this.contract.methods.changeRedeemTime(amount as number));
  }

  async changeDisputableTime(amount: number): Promise<TransactionReceipt> {
    return this.sendTx(this.contract.methods.changeDisputableTime(amount as number));
  }

  async isIssueInDraft(issueId: number): Promise<boolean> {
    return this.sendTx(this.contract.methods.isIssueInDraft(issueId), true);
  }

  async isMergeDisputed(issueId: number, mergeId: number): Promise<boolean> {
    return this.sendTx(this.contract.methods.isMergeDisputed(issueId, mergeId), true)
  }

  async isMergeInDraft(id: number, mergeId: number) {
    return this.sendTx(this.contract.methods.isMergeInDraft(id, mergeId))
  }

  async getIssueByCID(cid: string): Promise<NetworkIssue> {
    return networkIssue(await this.sendTx(this.contract.methods.getIssueByCID(cid), true), this.transactionToken.decimals);
  }

  async getIssueById(id: number): Promise<NetworkIssue> {
    return networkIssue(await this.sendTx(this.contract.methods.getIssueById(id), true), this.transactionToken.decimals);
  }

  async getMergeById(issueId: number, mergeId: number): Promise<any> {
    return networkMerge(await this.sendTx(this.contract.methods.getMergeById(issueId, mergeId)), this.transactionToken.decimals)
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

    return this.sendTx(this.contract.methods.lock(toSmartContractDecimals(amount, this.settlerToken.decimals, true) as number))
  }

  async unlock(amount: number, from: string) {
    if (amount <= 0)
      throw new Error(Errors.AmountNeedsToBeHigherThanZero);

    return this.sendTx(this.contract.methods.unlock(toSmartContractDecimals(amount, this.settlerToken.decimals, true) as number, from))
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
      return;

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
