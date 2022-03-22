import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@methods/contract-call-method';

export interface Network_v2Methods {
  _governor() :ContractCallMethod<string>;
  _proposedGovernor() :ContractCallMethod<string>;
  bountyNftUri() :ContractCallMethod<string>;
  canceledBounties() :ContractCallMethod<number>;
  claimGovernor() :ContractSendMethod;
  closedBounties() :ContractCallMethod<number>;
  bountiesTotal() :ContractCallMethod<number>;
  councilAmount() :ContractCallMethod<number>;
  disputableTime() :ContractCallMethod<number>;
  draftTime() :ContractCallMethod<number>;
  mergeCreatorFeeShare() :ContractCallMethod<number>;
  nftToken() :ContractCallMethod<string>;
  oracleExchangeRate() :ContractCallMethod<number>;
  oraclesDistributed() :ContractCallMethod<number>;
  oraclesStaked() :ContractCallMethod<number>;
  percentageNeededForDispute() :ContractCallMethod<number>;
  proposeGovernor(proposedGovernor: string) :ContractSendMethod;
  proposerFeeShare() :ContractCallMethod<number>;
  settlerToken() :ContractCallMethod<string>;
  totalSettlerLocked() :ContractCallMethod<number>;
  totalStaked() :ContractCallMethod<number>;
  unlockPeriod() :ContractCallMethod<number>;
  getBountiesOfAddress(_address: string) :ContractCallMethod<number[]>;
  getBounty(id: number) :ContractCallMethod<{'id': number;'creationDate': number;'tokenAmount': number;'creator': string;'transactional': string;'rewardToken': string;'rewardAmount': number;'fundingAmount': number;'closed': boolean;'canceled': boolean;'funded': boolean;'title': string;'repoPath': string;'branch': string;'cid': string;'closedDate': number;'pullRequests': {'originRepo': string;'originCID': string;'originBranch': string;'userRepo': string;'userBranch': string;'ready': boolean;'canceled': boolean;'creator': string;'cid': number;'id': number;}[];'proposals': {'id': number;'creationDate': number;'oracles': number;'disputeWeight': number;'prId': number;'refusedByBountyOwner': boolean;'creator': string;'details': {'recipient': string;'percentage': number;}[];}[];'benefactors': {'benefactor': string;'amount': number;'creationDate': number;}[];'funding': {'benefactor': string;'amount': number;'creationDate': number;}[];}>;
  getPullRequest(bountyId: number, pullRequestId: number) :ContractCallMethod<{'originRepo': string;'originCID': string;'originBranch': string;'userRepo': string;'userBranch': string;'ready': boolean;'canceled': boolean;'creator': string;'cid': number;'id': number;}>;
  getProposal(bountyId: number, proposalId: number) :ContractCallMethod<{'proposal': {'id': number;'creationDate': number;'oracles': number;'disputeWeight': number;'prId': number;'refusedByBountyOwner': boolean;'creator': string;'details': {'recipient': string;'percentage': number;}[];};}>;
  changeNetworkParameter(parameter: number, value: number) :ContractSendMethod;
  changeCouncilAmount(newAmount: number) :ContractSendMethod;
  changeDraftTime(_draftTime: number) :ContractSendMethod;
  changeDisputableTime(_disputableTime: number) :ContractSendMethod;
  changePercentageNeededForDispute(_percentageNeededForDispute: number) :ContractSendMethod;
  changeMergeCreatorFeeShare(_mergeCreatorFeeShare: number) :ContractSendMethod;
  changeOracleExchangeRate(_oracleExchangeRate: number) :ContractSendMethod;
  isBountyInDraft(id: number) :ContractCallMethod<boolean>;
  isBountyFundingRequest(id: number) :ContractCallMethod<boolean>;
  isBountyFunded(id: number) :ContractCallMethod<boolean>;
  isProposalInDraft(bountyId: number, proposalId: number) :ContractCallMethod<boolean>;
  isProposalDisputed(bountyId: number, proposalId: number) :ContractCallMethod<boolean>;
  isProposalRefused(bountyId: number, proposalId: number) :ContractCallMethod<boolean>;
  isAfterUnlockPeriod(date: number) :ContractCallMethod<boolean>;
  getOraclesOf(_address: string) :ContractCallMethod<number>;
  getOracleExchangeRate() :ContractCallMethod<number>;
  calculatePercentPerTenK(amount: number) :ContractCallMethod<number>;
  calculateOracleExchangeRate(settlerAmount: number) :ContractCallMethod<number>;
  calculateSettlerExchangeRate(oraclesAmount: number) :ContractCallMethod<number>;
  lock(tokenAmount: number) :ContractSendMethod;
  unlock(tokenAmount: number, from: string) :ContractSendMethod;
  delegateOracles(tokenAmount: number, recipient: string) :ContractSendMethod;
  openBounty(tokenAmount: number, transactional: string, rewardToken: string, rewardAmount: number, fundingAmount: number, cid: string, title: string, repoPath: string, branch: string) :ContractSendMethod;
  supportBounty(id: number, tokenAmount: number) :ContractSendMethod;
  retractSupportFromBounty(bountyId: number, entryId: number) :ContractSendMethod;
  cancelBounty(id: number) :ContractSendMethod;
  cancelFundRequest(id: number) :ContractSendMethod;
  updateBountyAmount(id: number, newTokenAmount: number) :ContractSendMethod;
  fundBounty(id: number, fundingAmount: number) :ContractSendMethod;
  retractFunds(id: number, fundingIds: number[]) :ContractSendMethod;
  createPullRequest(forBountyId: number, originRepo: string, originBranch: string, originCID: string, userRepo: string, userBranch: string, cid: number) :ContractSendMethod;
  cancelPullRequest(ofBounty: number, prId: number) :ContractSendMethod;
  markPullRequestReadyForReview(bountyId: number, pullRequestId: number) :ContractSendMethod;
  createBountyProposal(id: number, prId: number, recipients: string[], percentages: number[]) :ContractSendMethod;
  disputeBountyProposal(bountyId: number, proposalId: number) :ContractSendMethod;
  refuseBountyProposal(bountyId: number, proposalId: number) :ContractSendMethod;
  closeBounty(id: number, proposalId: number) :ContractSendMethod;
  cidBountyId(cid: string): ContractCallMethod<number>;
  bountiesOfAddress(address: string): ContractCallMethod<number[]>;
}
