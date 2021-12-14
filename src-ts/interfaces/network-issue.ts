export interface NetworkIssue {
  _id: string;
  cid: string;
  issueGenerator: string;
  creationDate: number;
  tokensStaked: number;
  mergeProposalAmount: number;
  finalized: boolean;
  canceled: boolean;
  recognizedAsFinished: boolean
}
