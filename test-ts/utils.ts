import {Web3ConnectionOptions} from '@interfaces/web3-connection-options';
import {Web3Connection} from '@base/web3-connection';
import {ERC20} from '@models/erc20';
import {toSmartContractDecimals} from '@utils/numbers';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {expect} from 'chai';
import Web3 from 'web3';
import {HttpProvider, WebsocketProvider} from 'web3-core';

export function getPrivateKeyFromFile(index = 0) {
  return Object.values(JSON.parse(readFileSync(resolve('./keys.json'), 'utf-8')).private_keys)[index] as string;
}

export function defaultWeb3Connection() {
  const options: Web3ConnectionOptions = {
    web3Host: process.env.WEB3_HOST_PROVIDER,
    privateKey: process.env.WALLET_PRIVATE_KEY || getPrivateKeyFromFile(),
    skipWindowAssignment: true,
  }

  return new Web3Connection(options);
}

export async function erc20Deployer(name: string, symbol: string, cap = toSmartContractDecimals(1000000, 18) as number, web3Connection: Web3Connection|Web3ConnectionOptions) {
  if (!(web3Connection instanceof Web3Connection))
    web3Connection = new Web3Connection(web3Connection)

  await web3Connection.start();

  const deployer = new ERC20(web3Connection);
  await deployer.loadAbi();

  const address = await deployer.connection.getAddress();
  return deployer.deployJsonAbi(name, symbol, cap, address);
}

export function newWeb3Account(web3Connection: Web3Connection) {
  return web3Connection.Web3.eth.accounts.create(`0xB3pR0Te511Ng`);
}

export async function shouldBeRejected(promise: Promise<any>, withErrorMessage?: string) {
  try {
    await promise;
    expect(`to have failed`).to.not.exist;
  } catch (e: any) {
    if (withErrorMessage)
      expect(e?.message).to.contain(withErrorMessage);
    else expect(e).to.exist;
  }
}

const payload = (method: string, params: any[] = []) => ({jsonrpc: `2.0`, method, params, id: 0});

export async function increaseTime(time: number, web3: Web3) {

  const timeAdvance = payload(`evm_increaseTime`, [time]);
  const mine = payload(`evm_mine`, []);
  const provider = (web3.currentProvider as HttpProvider|WebsocketProvider);

  return new Promise((resolve, reject) => {
    provider.send(timeAdvance, (err,) => {
      if (err)
        reject(err);
      else provider.send(mine, (err, resp) => {
        if (err)
          reject(err)
        resolve(resp);
      })
    })
  });
}

export async function revertChain(web3: Web3) {
  return new Promise((resolve, reject) => {
    (web3.currentProvider as HttpProvider|WebsocketProvider)
      .send(payload(`evm_revert`, []),
            (err, resp) => {
              if (err)
                reject(err)
              resolve(resp);
            })
  })
}

export async function hasTxBlockNumber(promise: Promise<any>) {
  expect(await promise, `Failed tx`).property('blockNumber').to.exist;
}
