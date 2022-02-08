import {HttpProviderOptions, WebsocketProviderOptions} from 'web3-core-helpers';

export interface Web3ConnectionOptions {
  /**
   * Web3 Provider host
   */
  web3Host?: string;

  /**
   * Provide a privateKey to automatically use that account when started
   */
  privateKey?: string;

  /**
   * Pass options to provider
   * @note you can provide a node server if you're using IPC
   */
  web3ProviderOptions?: HttpProviderOptions | WebsocketProviderOptions;

  /**
   * Skip the assignment of `window.web3 = Web3`
   * @default false
   */
  skipWindowAssignment?: boolean;

  /**
   * output sendTx debug messages to console (via console.log)
   * @default false
   */
  debug?: boolean;
}
