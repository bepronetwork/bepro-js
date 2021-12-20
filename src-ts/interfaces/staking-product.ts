export interface StakingProduct {
  _id: number;
  createdAt: number;
  startDate: number;
  endDate:  number;
  totalMaxAmount:  number;
  individualMinimumAmount:  number;
  individualMaxAmount:  number;
  currentAmount:  number;
  APR: number;
  lockedUntilFinalization: boolean;
  subscribers: string[];
  subscriptionIds: number[];
}
