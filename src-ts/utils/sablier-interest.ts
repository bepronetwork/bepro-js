import {fromDecimals} from '@utils/numbers';
import {SablierInterest} from '@interfaces/sablier-interest';

interface Params { '0': number; '1': number; '2': number }

export default function sablierInterest({
                                          0: spenderInterest,
                                          1: recipientInterest,
                                          2: sablierInterest
                                        }: Params, decimals = 18): SablierInterest {
  return {
    spenderInterest: +fromDecimals(spenderInterest, decimals),
    recipientInterest: +fromDecimals(recipientInterest, decimals),
    sablierInterest: +fromDecimals(sablierInterest, decimals)
  }
}
