import {fromDecimals, fromSmartContractDate} from '@utils/numbers';
import {StakingSubscription} from '@interfaces/staking-subscription';

interface Params {'0': number; '1': number; '2': number; '3': number; '4': number; '5': string; '6': number; '7': boolean; '8': number}
export default function stakeSubscription({
                                            0: _id, 1: productId, 2: startDate, 3: endDate, 4: amount,
                                            5: subscriberAddress, 6: APR, 7: finalized, 8: withdrawAmount}: Params,
                                          decimals = 18): StakingSubscription {
  return {
    _id, productId,
    startDate: fromSmartContractDate(startDate),
    endDate: fromSmartContractDate(endDate),
    amount: +fromDecimals(amount, decimals),
    subscriberAddress, APR, finalized,
    withdrawAmount: +fromDecimals(withdrawAmount, decimals)
  }
}
