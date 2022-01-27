import {Web3Connection} from './web3-connection';
import {AbiItem} from 'web3-utils';
import {Errors} from '@interfaces/error-enum';
import Web3 from 'web3';
import {Account,} from 'web3-core';
import {TransactionReceipt} from '@interfaces/web3-core';
import {Web3Contract} from './web3-contract';
import {Web3ConnectionOptions} from '@interfaces/web3-connection-options';
import {ContractSendMethod, DeployOptions} from 'web3-eth-contract';
import {ContractCallMethod} from '@methods/contract-call-method';

export class Model<Methods = any> {
  protected _contract!: Web3Contract<Methods>;
  protected web3Connection!: Web3Connection;

  /**
   * Returns the {@link Web3Contract} class representing this contract
   */
  get contract() { return this._contract; }

  constructor(web3Connection: Web3Connection | Web3ConnectionOptions,
              readonly abi: AbiItem[],
              readonly contractAddress?: string) {
    if (!abi || !abi.length)
      throw new Error(Errors.MissingAbiInterfaceFromArguments);

    if (web3Connection instanceof Web3Connection)
      this.web3Connection = web3Connection;
    else this.web3Connection = new Web3Connection(web3Connection);
  }

  /**
   * Pointer to the {@link Web3Connection} assigned to this contract class
   * @protected
   */
  get connection(): Web3Connection { return this.web3Connection; }

  /**
   * Returns the Web3 class assigned to this connection
   */
  get web3(): Web3 { return this.connection.Web3; }

  /**
   * Returns the Account associated with this connection
   */
  get account(): Account { return this.connection.Account; }

  /**
   * Permissive way of initializing the contract, used primarily for deploys. Prefer to use {@link loadContract}
   */
  loadAbi() {
    this._contract = new Web3Contract(this.web3, this.abi, this.contractAddress);
  }

  /**
   * Preferred way of initializing and loading a contract
   * @throws Errors.MissingContractAddress
   */
  loadContract() {
    if (!this.contractAddress)
      throw new Error(Errors.MissingContractAddress)

    try {
      this.loadAbi();
    } catch (e) {
      throw e;
    }
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
    await this.web3Connection.start();
    this.loadContract();
  }

  /**
   * Return a property value from the contract
   */
  async callTx<ReturnData = any>(method: ContractCallMethod<ReturnData>, value?: any) {
    if (this.account)
      return method.call({from: this.account.address, ...await this.contract.txOptions(method, value, this.account.address)});
    return method.call();
  }

  /**
   * Interact with, or change a value of, a property on the contract
   */
  async sendTx(method: ContractSendMethod, value?: any): Promise<TransactionReceipt> {
    return this.contract.sendSignedTx(this.account, method.encodeABI(), value, await this.contract.txOptions(method, value, this.account.address));
  }

  /**
   * Send unsigned transaction
   */
  async sendUnsignedTx(method: ContractSendMethod, value?: any): Promise<TransactionReceipt> {
    const from = (await this.web3.eth.getAccounts())[0];
    return new Promise((resolve, reject) => {

      method.send({from, value, ...this.contract.txOptions(method, value, from)})
            .on(`receipt`, (receipt) => resolve(receipt as unknown as TransactionReceipt))
            .on(`error`, (e) => reject(e));
    });
  }

  /**
   * Deploy the loaded abi contract
   * @protected
   */
  protected async deploy(deployOptions: DeployOptions, account?: Account) {
    return this.contract.deploy(this.abi, deployOptions, account)
  }
}
