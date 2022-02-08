import {fromDecimals} from '@utils/numbers';
import Web3 from 'web3';
import {LoopholePoolUpdate} from '@interfaces/loophole-pool-update';

interface Params {
  '0': number;
  '1': number;
  '2': number
}

export default function lhPoolUpdate({0: blockNumber,
                                       1: lpTokensReward,
                                       2: accLPtokensPerShare}: Params,
                                     decimals = 18, multiplier = 1): LoopholePoolUpdate {
  return {
    blockNumber,
    lpTokensReward: +fromDecimals(lpTokensReward, decimals),
    accLPtokensPerShare: Web3.utils.toBN(accLPtokensPerShare).div(Web3.utils.toBN(multiplier)).toNumber()
  }
}
