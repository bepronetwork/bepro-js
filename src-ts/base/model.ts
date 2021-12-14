import Web3Connection from './web3-connection';
import {AbiItem} from 'web3-utils';
import {Errors} from '@interfaces/error-enum';
import Web3 from 'web3';
import {Account, TransactionReceipt} from 'web3-core';
import Web3Contract from './web3-contract';
import Web3ConnectionOptions from '@interfaces/web3-connection-options';
import {ContractSendMethod, DeployOptions} from 'web3-eth-contract';

export default class Model<Methods = any> {
  protected contract!: Web3Contract<Methods>;
  protected web3Connection!: Web3Connection;

  constructor(web3Connection: Web3Connection | Web3ConnectionOptions,
              readonly contractAddress: string,
              readonly abi: AbiItem[]) {
    if (!abi)
      throw new Error(Errors.MissingAbiInterfaceFromArguments);

    if (web3Connection instanceof Web3Connection)
      this.web3Connection = web3Connection;
    else this.web3Connection = new Web3Connection(web3Connection);
  }

  get web3(): Web3 { return this.web3Connection.Web3; }

  get account(): Account { return this.web3Connection.Account; }

  loadContract() {
    this.contract = new Web3Contract(this.web3, this.abi, this.contractAddress);
  }

  /**
   * Alias for Web3Connection.connect();
   * Will load contract if success
   */
  async connect(): Promise<boolean> {
    const connected = await this.web3Connection.connect();

    if (connected)
      this.loadContract();

    return connected;
  }

  /**
   * Alias for Web3Connection.start();
   * Will load contract if success
   */
  async start() {
    this.web3Connection.start();
    this.loadContract();
  }

  async sendTx(method: ContractSendMethod, call = false, value?: any) {

    if (this.account) {
      if (call)
        return method.call({from: this.account.address, ...await this.contract.txOptions(method, value, this.account.address)});
      return this.contract.send(this.account, method.encodeABI(), value);
    }

    if (call)
      return method.call();

    const from = (await this.web3.eth.getAccounts())[0];
    return new Promise((resolve, reject) => {

      method.send({from, value, ...this.contract.txOptions(method, value, from)})
            .on(`confirmation`, (_n: number, receipt: TransactionReceipt) => resolve(receipt))
            .on(`error`, (e) => reject(e));
    })
  }

  protected async deploy(deployOptions: DeployOptions, account?: Account) {
    return this.contract.deploy(this.abi, deployOptions, account)
  }
}
