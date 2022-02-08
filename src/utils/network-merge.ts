import {fromDecimals} from '@utils/numbers';
import {NetworkMerge} from '@interfaces/network-merge';

interface Params {'0': number; '1': number; '2': number; '3': string[]; '4': number[]; '5': string}
export default function networkMerge({'0': _id, '1': votes, '2': disputes, '3': prAddresses,
                                       '4': prAmounts, '5': proposalAddress}: Params,
                                     decimals = 18): NetworkMerge {
  return {
    _id: _id.toString(),
    votes: +fromDecimals(votes, decimals),
    disputes: +fromDecimals(disputes, decimals),
    prAddresses,
    prAmounts: prAmounts.map((amount: number) => +fromDecimals(amount, decimals)),
    proposalAddress,
  }
}
