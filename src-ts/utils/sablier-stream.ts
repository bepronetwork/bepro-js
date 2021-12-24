import {fromDecimals, fromSmartContractDate} from '@utils/numbers';
import {SablierStream} from '@interfaces/sablier-stream';

interface Params {
  '0': string;
  '1': string;
  '2': number;
  '3': string;
  '4': number;
  '5': number;
  '6': number;
  '7': number
}



export default function sablierStream({
                                        0: sender,
                                        1: recipient,
                                        2: deposit,
                                        3: tokenAddress,
                                        4: startTime,
                                        5: stopTime,
                                        6: remainingBalance,
                                        7: ratePerSecond
                                      }: Params, decimals = 18): SablierStream {
  return {
    sender, recipient, deposit: +fromDecimals(deposit, decimals), tokenAddress,
    startTime: fromSmartContractDate(startTime),
    stopTime: fromSmartContractDate(stopTime),
    remainingBalance: +fromDecimals(remainingBalance, decimals),
    ratePerSecond: +fromDecimals(ratePerSecond, decimals)
  }
}
