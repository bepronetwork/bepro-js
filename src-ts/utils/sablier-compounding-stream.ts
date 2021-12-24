import {fromDecimals, fromSmartContractDate,} from '@utils/numbers';
import {SablierCompoundingStream} from '@interfaces/sablier-compound-stream'

interface Params {
  '0': string;
  '1': string;
  '2': number;
  '3': string;
  '4': number;
  '5': number;
  '6': number;
  '7': number;
  '8': number;
  '9': number;
  '10': number
}


export default function sablierCompoundingStream({
                                                   0: sender,
                                                   1: recipient,
                                                   2: deposit,
                                                   3: tokenAddress,
                                                   4: startTime,
                                                   5: stopTime,
                                                   6: remainingBalance,
                                                   7: ratePerSecond,
                                                   8: exchangeRateInitial,
                                                   9: senderSharePercentage,
                                                   10: recipientSharePercentage
                                                 }: Params, decimals = 18): SablierCompoundingStream {
  return {
    sender, recipient, tokenAddress,
    deposit: +fromDecimals(deposit, decimals),
    startTime: fromSmartContractDate(startTime),
    stopTime: fromSmartContractDate(stopTime),
    remainingBalance: +fromDecimals(remainingBalance, decimals),
    ratePerSecond: +fromDecimals(ratePerSecond, decimals),
    exchangeRateInitial: +fromDecimals(exchangeRateInitial, decimals),
    senderSharePercentage: +fromDecimals(senderSharePercentage, decimals),
    recipientSharePercentage: +fromDecimals(recipientSharePercentage, decimals)
  }
}
