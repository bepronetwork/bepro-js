import {LoopholeUserInfo} from '@interfaces/loophole-user-info';

interface Params {
  '0': number;
  '1': number;
  '2': number;
  '3': number;
}

export default function lhUserInfo({0: entryStake,
                                     1: unstake,
                                     2: entryStakeAdjusted,
                                     3: payRewardMark}: Params): LoopholeUserInfo {
  return ({entryStake, unstake, entryStakeAdjusted, payRewardMark})
}
