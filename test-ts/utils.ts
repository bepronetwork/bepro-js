import Web3ConnectionOptions from '@interfaces/web3-connection-options';
import Web3Connection from '@base/web3-connection';
import ERC20 from '@models/erc20';

export function defaultWeb3Connection() {
  const options: Web3ConnectionOptions = {
    web3Host: process.env.WEB3_HOST_PROVIDER,
    privateKey: process.env.WALLET_PRIVATE_KEY,
    skipWindowAssignment: true,
  }

  return new Web3Connection(options);
}

export async function erc20Deployer(name: string, symbol: string, cap = 1000000*10**18, web3Connection: Web3Connection|Web3ConnectionOptions) {
  const deployer = new ERC20(web3Connection);
  await deployer.start();
  const address = await deployer.connection.getAddress();
  return  deployer.deployJsonAbi(name, symbol, cap, address);
}

export function newWeb3Account(web3Connection: Web3Connection) {
  return web3Connection.Web3.eth.accounts.create(`0xB3pR0Te511Ng`);
}
