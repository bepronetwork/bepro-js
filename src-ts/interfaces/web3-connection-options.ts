import {HttpProviderOptions, WebsocketProviderOptions} from 'web3-core-helpers';

export interface Web3ConnectionOptions {
  web3Host?: string;
  privateKey?: string;
  web3ProviderOptions?: HttpProviderOptions | WebsocketProviderOptions; // you can provide a node server if you're using IPC
  skipWindowAssignment?: boolean; // default: false; Skip window.web3 = web3
}
