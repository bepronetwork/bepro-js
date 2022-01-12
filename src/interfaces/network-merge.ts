export interface NetworkMerge {
  _id: string;
  votes: number;
  disputes: number;
  prAddresses: string[];
  prAmounts: number[];
  proposalAddress: string;
}
