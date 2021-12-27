import {LoopholePoolInfo} from '@interfaces/loophole-pool-info';
import {fromDecimals} from '@utils/numbers';
import Web3 from 'web3';

interface Params {
  '0': string;
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
  '6': number
}

export default function lhPoolInfo({
                                     0: address,
                                     1: allocPoint,
                                     2: lastRewardBlock,
                                     3: totalPool,
                                     4: entryStakeTotal,
                                     5: totalDistributedPenalty,
                                     6: accLPtokensPerShare
                                   }: Params, decimals = 18, multiplier = 1): LoopholePoolInfo {
  return {
    address,
    allocPoint,
    lastRewardBlock,
    totalPool: +fromDecimals(totalPool, decimals),
    entryStakeTotal: +fromDecimals(entryStakeTotal, decimals),
    totalDistributedPenalty: +fromDecimals(totalDistributedPenalty, decimals),
    accLPtokensPerShare: Web3.utils.toBN(accLPtokensPerShare).div(Web3.utils.toBN(multiplier)).toNumber()
  }
}
