import {defaultWeb3Connection, erc20Deployer} from '../utils/';
import {toSmartContractDecimals} from '../../src-ts/utils/numbers';
import {AMOUNT_1M, bn} from '../utils/constants';
import {expect} from 'chai';

describe(`Loophole`, async () => {


  let wETHAddress;
  let wBTCAddress;

  let contract;
  let wBTCContract;
  let wETHContract;

  let lpToken;
  let accountAddress;

  const web3Connection = defaultWeb3Connection();
  const cap = AMOUNT_1M;
  const capSc = toSmartContractDecimals(cap) as number;
  const airDropAmount = bn(cap).div(bn(1000)) // 1000

  before(async () => {
    await web3Connection.start()
    wBTCAddress = (await erc20Deployer(`Wrapped BTC`, `$wBTC`, capSc, web3Connection))?.contractAddress;
    wETHAddress = (await erc20Deployer(`Wrapped ETH`, `$wETH`, capSc, web3Connection))?.contractAddress;



  });

})
