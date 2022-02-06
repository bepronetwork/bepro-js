import {HttpProvider, IpcProvider, WebsocketProvider} from 'web3-core';
import {HttpProviderOptions, WebsocketProviderOptions} from 'web3-core-helpers';

export interface Web3ConnectionOptions {
  web3Host?: string;
  privateKey?: string;
  web3ProviderOptions?: HttpProviderOptions | WebsocketProviderOptions; // you can provide a node server if you're using IPC
  provider?: HttpProvider|IpcProvider|WebsocketProvider; // connect through a wallet's supplied web3 provider
  skipWindowAssignment?: boolean; // default: false; Skip window.web3 = web3
}
