export interface BountyCanceledEvent { returnValues: {'id': number;} }
export interface BountyClosedEvent { returnValues: {'id': number;} }
export interface BountyCreatedEvent { returnValues: {'cid': string;'creator': string;'amount': number;} }
export interface BountyDistributedEvent { returnValues: {'id': number;'proposalId': number;} }
export interface BountyProposalCreatedEvent { returnValues: {'bountyId': number;'prId': number;'proposalId': number;} }
export interface BountyProposalDisputedEvent { returnValues: {'bountyId': number;'prId': number;'proposalId': number;} }
export interface BountyProposalRefusedEvent { returnValues: {'bountyId': number;'prId': number;'proposalId': number;} }
export interface BountyPullRequestCanceledEvent { returnValues: {'bountyId': number;'pullRequestId': number;} }
export interface BountyPullRequestCreatedEvent { returnValues: {'bountyId': number;'pullRequestId': number;} }
export interface BountyPullRequestReadyForReviewEvent { returnValues: {'bountyId': number;'pullRequestId': number;} }
export interface GovernorTransferredEvent { returnValues: {'previousGovernor': string;'newGovernor': string;} }
