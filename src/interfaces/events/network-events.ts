export interface CloseIssueEvent { returnValues: {'id': number; 'mergeID': number} }
export interface DisputeMergeEvent {
  returnValues: {'id': number; 'mergeID': number; 'oracles': number; 'disputer': string}
}
export interface GovernorTransferredEvent { returnValues: {'previousGovernor': string; 'newGovernor': string} }
export interface MergeProposalCreatedEvent { returnValues: {'id': number; 'mergeID': number; 'creator': string} }
export interface OpenIssueEvent { returnValues: {'id': number; 'opener': string; 'amount': number} }
export interface PausedEvent { returnValues: {'account': string} }
export interface RecognizedAsFinishedEvent { returnValues: {'id': number} }
export interface RedeemIssueEvent { returnValues: {'id': number} }
export interface UnpausedEvent { returnValues: {'account': string} }
