export interface SablierStream {
  sender: string;
  recipient: string;
  deposit: number;
  tokenAddress: string;
  startTime: number;
  stopTime: number;
  remainingBalance: number;
  ratePerSecond: number;
}
