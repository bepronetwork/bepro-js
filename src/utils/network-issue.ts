import {fromDecimals} from './numbers';
import {NetworkIssue} from '@interfaces/network-issue';

type Params = {
  '0': number; '1': string; '2': number;
  '3': number; '4': string; '5': number;
  '6': boolean; '7': boolean; '8': boolean
}

export default function networkIssue({'0': _id, '1': cid, '2': creationDate, '3': tokensStaked, '4': issueGenerator,
                                       '5': mergeProposalsAmount, '6': finalized,
                                       '7': canceled, '8': recognizedAsFinished}: Params,
                             decimals = 18): NetworkIssue {
  return {
    _id, cid, issueGenerator, finalized, canceled, recognizedAsFinished,
    creationDate: creationDate * 1000,
    tokensStaked: +fromDecimals(tokensStaked, decimals),
    mergeProposalAmount: mergeProposalsAmount,
  }
}
