import {fromDecimals} from './numbers';
import {NetworkIssue} from '@interfaces/network-issue';

type Params = [number, string, string, string, string, string, boolean, boolean, boolean]

export default function networkIssue({'0': _id, '1': cid, '2': creationDate, '3': tokensStaked, '4': issueGenerator,
                                       '5': mergeProposalsAmount, '6': finalized, '7': canceled, '8': recognizedAsFinished}: Params,
                             decimals = 18): NetworkIssue {
  return {
    _id, cid, issueGenerator, finalized, canceled, recognizedAsFinished,
    creationDate: parseInt(creationDate, 10) * 1000,
    tokensStaked: +fromDecimals(tokensStaked, decimals),
    mergeProposalAmount: parseInt(mergeProposalsAmount, 10),
  }
}
