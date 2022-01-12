export interface StakingSubscription {
  _id: number;
  productId: number;
  startDate: number;
  endDate: number;
  amount: number;
  subscriberAddress: string;
  APR: number;
  finalized: boolean;
  withdrawAmount: number;
}
