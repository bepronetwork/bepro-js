import {defaultWeb3Connection, erc20Deployer, revertChain} from '../utils';
import {ERC721Collectibles} from '../../src-ts';
import {toSmartContractDecimals} from '../../src-ts/utils/numbers';
import {expect} from 'chai';

describe(`ERC271Collectibles`, () => {
  let contractAddress!: string;
  let accountAddress!: string;

  const collectableCap = 10
  const web3Connection = defaultWeb3Connection();

  before(async () => {
    await web3Connection.start();
    await revertChain(web3Connection.Web3);
    accountAddress = web3Connection.Account.address;
  });

  it(`Deploys the contract`, async () => {
    const erc20 = await erc20Deployer(`Settler`, `$settler`, toSmartContractDecimals(1000000) as number, web3Connection)

    const deployer = new ERC721Collectibles(web3Connection);
    deployer.loadAbi();
    const tx = await deployer
      .deployJsonAbi(
        `Collectible`, `$stamp`,
        collectableCap, erc20.contractAddress!,
        accountAddress, accountAddress, accountAddress);

    expect(tx.blockNumber).to.exist;
    contractAddress = tx.contractAddress!;
  });

})
