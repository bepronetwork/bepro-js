import {Errors} from '@interfaces/error-enum';
import Web3 from 'web3';
import {Account, HttpProvider, IpcProvider, WebsocketProvider} from 'web3-core';
import {HttpProviderOptions, WebsocketProviderOptions} from 'web3-core-helpers';
import {Web3ConnectionOptions} from '@interfaces/web3-connection-options';
import {Utils} from 'web3-utils';
import {Eth} from 'web3-eth';

export class Web3Connection {
  protected web3!: Web3;
  protected account!: Account;

  constructor(readonly options: Web3ConnectionOptions) {}

  get started() { return !!this.web3; }
  get eth(): Eth { return this.web3?.eth; }
  get utils(): Utils { return this.web3?.utils; }
  get Web3(): Web3 { return this.web3; }
  get Account(): Account { return this.account; }

  async getAddress(): Promise<string> {
    return this.account ? this.account.address : (await this.eth?.getAccounts() || [""])[0];
  }

  async getBalance(): Promise<string> {
    return this.eth?.getBalance(await this.getAddress());
  }

  async getETHNetworkId(): Promise<number> {
    return this.eth?.net.getId();
  }

  /**
   * Request user to connect web3 plugin with our contract (and assign window.web3)
   */
  async connect(): Promise<boolean> {
    if (typeof window === 'undefined')
      throw new Error(Errors.WindowObjectNotFound);

    if (!(window as any).ethereum)
      throw new Error(Errors.NoEthereumObjectFoundOnWindow);

    this.web3 = new Web3((window as any).web3.eth.currentProvider)
    await (window as any).ethereum.enable();

    this.web3.eth.handleRevert = false;

    if (!this.options.skipWindowAssignment)
      (window as any).web3 = this.web3;

    return true;
  }

  /**
   * change the privateKey prop of {@link Web3ConnectionOptions} and start a new connection
   */
  switchToAccount(privateKey: string) {
    if (this.options.privateKey !== privateKey)
      this.options.privateKey = privateKey;
    return this.start(true)
  }

  /* eslint-disable complexity */
  /**
   * Start this connection (and load an account if {@link Web3ConnectionOptions.privateKey} was provided)
   */
  start(restart = false): void {
    if (this.started && !restart)
      return;

    const {web3Host = ``, web3ProviderOptions = undefined} = this.options;

    if (!web3Host)
      throw new Error(Errors.MissingWeb3ProviderHost)

    const web3Link = web3Host.toLowerCase();
    let provider: HttpProvider|IpcProvider|WebsocketProvider;

    if (web3Link.includes(`http`))
      provider = new Web3.providers.HttpProvider(web3Link, web3ProviderOptions as HttpProviderOptions);
    else if (web3Link.includes(`ws`))
      provider = new Web3.providers.WebsocketProvider(web3Link, web3ProviderOptions as WebsocketProviderOptions);
    else {
      if (!this.options.web3ProviderOptions)
        throw new Error(Errors.ProviderOptionsAreMandatoryIfIPC);
      provider = new Web3.providers.IpcProvider(web3Link, web3ProviderOptions);
    }

    this.web3 = new Web3(provider);
    if (!this.options.skipWindowAssignment && typeof window !== 'undefined')
      (window as any).web3 = this.web3;

    if (this.options.privateKey)
      this.account = this.web3.eth.accounts.privateKeyToAccount(this.options.privateKey);
  }
  /* eslint-enable complexity */
}
