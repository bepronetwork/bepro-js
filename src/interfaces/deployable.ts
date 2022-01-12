import {TransactionReceipt} from 'web3-core';

export interface Deployable {
  deployJsonAbi(...args: any[]): Promise<TransactionReceipt>;
}
