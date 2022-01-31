import {fromDecimals} from '@utils/numbers';
import {VoterInfo} from '@interfaces/voter-info';

interface Params {'0': number; '1': number}

export default function voterInfo({0: vote, 1: weight}: Params, decimals = 18): VoterInfo {
  return ({vote, weight: +fromDecimals(weight, decimals)})
}
