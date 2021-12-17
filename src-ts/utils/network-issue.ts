import {fromDecimals} from './numbers';
import {NetworkIssue} from '@interfaces/network-issue';

type Params = [number, string, string, string, string, string, boolean, boolean, boolean]

export default function networkIssue([_id, cid, creationDate, tokensStaked, issueGenerator,
                               mergeProposalsAmount, finalized, canceled, recognizedAsFinished]: Params,
                             decimals = 18): NetworkIssue {
  return {
    _id, cid, issueGenerator, finalized, canceled, recognizedAsFinished,
    creationDate: parseInt(creationDate, 10) / 60,
    tokensStaked: +fromDecimals(tokensStaked, decimals),
    mergeProposalAmount: parseInt(mergeProposalsAmount, 10),
  }
}
