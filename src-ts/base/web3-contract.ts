import {AbiItem} from 'web3-utils';
import {Contract, DeployOptions} from 'web3-eth-contract';
import Web3 from 'web3';
import {Account, TransactionReceipt} from 'web3-core';

const DEFAULT_CONFIRMATIONS_NEEDED = 1;

export interface Web3ContractOptions {
  gas: number;
  gasPrice: string;
}

export default class Web3Contract {
  protected contract!: Contract;

  constructor(readonly web3: Web3,
              readonly abi: AbiItem[],
              readonly address: string,
              readonly options?: Web3ContractOptions) {
    this.contract = new web3.eth.Contract(abi, address);
  }

  get methods() { return this.contract.methods; }
  get txOptions() {
    const {gas = 0, gasPrice = ``} = this.contract.options || {};
    return {
      ... gas ? {gas} : {},
      ... gasPrice ? {gasPrice} : {}
    };
  }

  /**
   * Deploys the new AbiItem and returns its transaction receipt
   */
  async deploy(abi: AbiItem[], deployOptions: DeployOptions, account?: Account): Promise<TransactionReceipt> {

    const deployer = async (resolve: (receipt: TransactionReceipt) => void, reject: (error: Error) => void) => {
      try {
        const newContract = new this.web3.eth.Contract(abi);
        const limbo = newContract.deploy(deployOptions);
        const from = account?.address || (await this.web3.eth.getAccounts())[0];

        function onConfirmation(number: number, receipt: TransactionReceipt) {
          if (DEFAULT_CONFIRMATIONS_NEEDED >= number)
            resolve(receipt);
        }

        function onError(error: any) { reject(error); }

        if (account) {
          const data = limbo.encodeABI();
          const signedTx = await account.signTransaction({data, from, ...this.options});
          this.web3.eth.sendSignedTransaction(signedTx.rawTransaction!)
              .on(`confirmation`, onConfirmation)
              .on(`error`, onError);
        } else
          limbo.send({from, ...this.txOptions})
               .on(`confirmation`, onConfirmation)
               .on(`error`, onError);

      } catch (e: any) {
        reject(e);
      }
    }

    return new Promise<TransactionReceipt>(deployer);
  }

  /**
   * Sends a signed transaction with the provided account
   */
  async send(account: Account, data: string, value = `0x0`): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      try {

        const from = account.address;
        const to = this.address;
        const signedTx = await account.signTransaction({from, to, data, value, ...this.txOptions});

        function onConfirmation(number: number, receipt: TransactionReceipt) {
          if (DEFAULT_CONFIRMATIONS_NEEDED >= number)
            resolve(receipt);
        }

        this.web3.eth.sendSignedTransaction(signedTx.rawTransaction!)
            .on(`confirmation`, onConfirmation)
            .on(`error`, (err) => reject(err));
      } catch (e) {
        reject(e);
      }
    })

  }
}
