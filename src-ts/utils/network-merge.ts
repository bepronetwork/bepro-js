import {fromDecimals} from '@utils/numbers';
import {NetworkMerge} from '@interfaces/network-merge';

type Params = [number, string, string, string[], string[], string];
export default function networkMerge([_id, votes, disputes, prAddresses, prAmounts, proposalAddress]: Params,
                                     decimals = 18): NetworkMerge {
  return {
    _id: _id.toString(),
    votes: +fromDecimals(votes, decimals),
    disputes: +fromDecimals(disputes, decimals),
    prAddresses,
    prAmounts: prAmounts.map((amount: string) => +fromDecimals(amount, decimals)),
    proposalAddress,
  }
}
