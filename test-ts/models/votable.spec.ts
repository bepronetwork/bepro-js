import {Votable} from '../../src-ts';
import {defaultWeb3Connection, erc20Deployer} from '../utils';
import {toSmartContractDecimals} from '../../src-ts/utils/numbers';
import {expect} from 'chai';

describe(`Votable`, () => {
  // let accountAddress: string;
  let contractAddress: string;
  let tokenContractAddress: string;

  let contract: Votable;

  const cap = 1000;
  const smartContractCap = toSmartContractDecimals(cap) as number;
  const web3Connection = defaultWeb3Connection();

  before(async () => {
    await web3Connection.start();
    // accountAddress = web3Connection.Account.address;
  });

  it(`Deploys`, async () => {
    const erc = await erc20Deployer(`Voting`, `$voting`, smartContractCap, web3Connection);
    const deployer = new Votable(web3Connection);
    deployer.loadAbi();

    const deployed = await deployer.deployJsonAbi(erc.contractAddress!);
    expect(deployed.contractAddress).to.exist;
    contractAddress = deployed.contractAddress!;
    tokenContractAddress = erc.contractAddress!;
  });

  describe(`Methods`, () => {
    before(async () => {
      contract = new Votable(web3Connection, contractAddress, tokenContractAddress);
      await contract.loadContract();
    });

  });


})
