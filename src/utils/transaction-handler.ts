import {PromiEvent, TransactionReceipt} from 'web3-core';
import {Contract} from 'web3-eth-contract';

type ResolveReject = (value?: any | unknown) => void;

export async function transactionHandler(transaction: PromiEvent<TransactionReceipt|Contract>, resolve: ResolveReject, reject: ResolveReject, debug?: boolean) {
  transaction
    .on(`receipt`, (receipt) => {
      if (debug)
        console.log(receipt);

      resolve(receipt as unknown as TransactionReceipt)
    })
    .on(`error`, (err) => {
      if (debug)
        console.error(err);

      reject(err)
    });
}
