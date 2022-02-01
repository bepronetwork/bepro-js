import {AbiItem} from 'web3-utils';
import {Contract, ContractSendMethod, DeployOptions} from 'web3-eth-contract';
import Web3 from 'web3';
import {Account, TransactionConfig} from 'web3-core';
import {TransactionReceipt} from '@interfaces/web3-core';
import {Errors} from '@interfaces/error-enum';
import {transactionHandler} from '@utils/transaction-handler';

const DEFAULT_CONFIRMATIONS_NEEDED = 1;

export interface Web3ContractOptions {
  /**
   * If not provided, gas will be `Math.round(gasAmount * gasFactor)`
   */
  gas?: number;

  /**
   * If not provided, gasPrice will be queried on the network
   */
  gasPrice?: string;

  /**
   * If not provided, gasAmount will be estimated from the network
   */
  gasAmount?: number;

  /**
   * Used as a multiplier if no {@link Web3ContractOptions.gas} is provided
   * @default 1
   */
  gasFactor?: number;

  /**
   * If false, {@link Web3ContractOptions.gas} and {@link Web3ContractOptions.gasPrice} are mandatory
   * @default true
   */
  auto: boolean; // default: true, auto = true will calculate needed values if none is provided.
}

export class Web3Contract<Methods = any, Events = any> {
  readonly self!: Contract;

  /**
   * Transaction options that will be used on each transaction.
   * While this object is readonly, is values are not and can be changed.
   * @example
   * `myWeb3Connection.options.gas = 10000;`
   *
   * @default `{auto: true}`
   */
  readonly options: Web3ContractOptions = {auto: true}

  constructor(readonly web3: Web3,
              readonly abi: AbiItem[],
              readonly address?: string,
              options: Web3ContractOptions = {auto: true}) {
    this.self = new web3.eth.Contract(abi, address);
    this.options = options;
  }

  get methods(): Methods { return this.self.methods; }
  get events(): Events { return this.self.events; }

  async txOptions(method: ContractSendMethod, value?: string, from?: string) {
    let {gas = 0, gasAmount = 0, gasPrice = ``, gasFactor = 1, auto = false} = this.options || {};

    if (!auto && (!gas || !gasPrice))
      throw new Error(Errors.GasAndGasPriceMustBeProvidedIfNoAutoTxOptions);

    if (auto) {
      if (!gasPrice)
        gasPrice = await this.web3.eth.getGasPrice();

      if (!gasAmount)
        gasAmount = await method.estimateGas({...value ? {value} : {}, ... from ? {from} : {}});

      if (!gas)
        gas = Math.round(gasAmount * gasFactor);
    }

    return {
      ... gas ? {gas} : {},
      ... gasPrice ? {gasPrice} : {},
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

        function onConfirmation(number: number, receipt: any) {
          if (DEFAULT_CONFIRMATIONS_NEEDED >= number)
            resolve(receipt as unknown as TransactionReceipt);
        }

        function onError(error: any) { reject(error); }

        if (account) {
          const data = limbo.encodeABI();
          const signedTx = await account.signTransaction({data, from, ...await this.txOptions(limbo, undefined, from)});
          this.web3.eth.sendSignedTransaction(signedTx.rawTransaction!)
              .on(`confirmation`, onConfirmation)
              .on(`error`, onError);
        } else
          limbo.send({from, ...await this.txOptions(limbo, undefined, from)})
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
  async sendSignedTx(account: Account, data: string, value = ``, txOptions: Partial<TransactionConfig>, debug?: boolean): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      try {

        const from = account.address;
        const to = this.address;
        const signedTx = await account.signTransaction({from, to, data, value, ...txOptions});

        await transactionHandler(this.web3.eth.sendSignedTransaction(signedTx.rawTransaction!), resolve, reject, debug);

      } catch (e) {
        console.error(e);
        reject(e);
      }
    })
  }
}
