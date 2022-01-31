import {fromDecimals, fromSmartContractDate} from '@utils/numbers';
import {StakingProduct} from '@interfaces/staking-product';

interface Params {
  '0': number;
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
  '6': number;
  '7': number;
  '8': boolean;
  '9': string[];
  '10': number[]
}

export default function stakingProduct({
                                         0: createdAt, 1: startDate, 2: endDate, 3: totalMaxAmount,
                                         4: individualMinimumAmount, 5: individualMaxAmount, 6: APR, 7: currentAmount,
                                         8: lockedUntilFinalization, 9: subscribers, 10: subscriptionIds
                                       }: Params, decimals = 18, _id: number): StakingProduct {
  return {
    _id,
    createdAt: fromSmartContractDate(createdAt),
    startDate: fromSmartContractDate(startDate),
    endDate: fromSmartContractDate(endDate),
    totalMaxAmount: +fromDecimals(totalMaxAmount, decimals),
    individualMinimumAmount: +fromDecimals(individualMinimumAmount, decimals),
    individualMaxAmount: +fromDecimals(individualMaxAmount, decimals),
    currentAmount: +fromDecimals(currentAmount, decimals),
    APR, lockedUntilFinalization, subscribers, subscriptionIds,
  }
}
