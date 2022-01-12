export interface SablierCompoundingStream {
  sender: string;
  recipient: string;
  tokenAddress: string;
  deposit: number;
  startTime: number;
  stopTime: number;
  remainingBalance: number;
  ratePerSecond: number;
  exchangeRateInitial: number;
  senderSharePercentage: number;
  recipientSharePercentage: number;
}
