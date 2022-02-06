import {defaultWeb3Connection, erc20Deployer, revertChain} from '../utils/';
import {expect} from 'chai';
import {RealFevrOpener} from '@models/real-fevr-opener';
import {RealFevrMarketplace} from '@models/real-fevr-marketplace';
import {toSmartContractDecimals} from '@utils/numbers';

describe('Marketplace RealFevr', async () => {
  let marketplaceContract: RealFevrMarketplace;
  let tokenAddress!: string;
  let openerAddress!: string;
  let contractAddress!: string;
  let accountAddress!: string;

  const purchaseTokenCap = toSmartContractDecimals(1000000) as number;
  const web3Connection = defaultWeb3Connection();

  before(async () => {
    await web3Connection.start();
    await revertChain(web3Connection.Web3);
    accountAddress = web3Connection.Account.address;
  });

  it(`Deploys the contract`, async () => {
    const erc20 = await erc20Deployer(`Settler`, `$settler`, purchaseTokenCap, web3Connection);
    tokenAddress = erc20.contractAddress!;

    const openerDeployer = new RealFevrOpener(web3Connection);
    openerDeployer.loadAbi();
    const openerTx = await openerDeployer.deployJsonAbi(`Collectible`, `$stamp`, tokenAddress);

    expect(openerTx.blockNumber).to.exist;
    openerAddress = openerTx.contractAddress!;

    const marketplaceDeployer = new RealFevrMarketplace(web3Connection);
    marketplaceDeployer.loadAbi();
    const marketplaceTx = await marketplaceDeployer.deployJsonAbi(openerAddress, tokenAddress);

    expect(marketplaceTx.blockNumber).to.exist;
    contractAddress = marketplaceTx.contractAddress;
  });

  describe('Methods', () => {
    before(async () => {
      marketplaceContract = new RealFevrMarketplace(web3Connection, contractAddress!, openerAddress, tokenAddress);
      await marketplaceContract.loadContract();
    });

    it('should create pack of NFTs', async () => {
      const res = await marketplaceContract.opener.createPack(1, 1, '', 'foo', 'bar', 1, [ '0x0000000000000000000000000000000000000000' ], [ 100 ], [], []);
      expect(res).to.not.equal(false);
    });

    it('should offer pack to owner', async () => {
      const res = await marketplaceContract.opener.offerPack(1, accountAddress);
      expect(res).to.not.equal(false);
    });

    it('should open pack', async () => {
      const res = await marketplaceContract.opener.openPack(1);
      expect(res).to.not.equal(false);
    });

    it('should mint NFT', async () => {
      const res = await marketplaceContract.opener.mint(1);
      expect(res).to.not.equal(false);
    });

    it('should approve NFT', async () => {
      const res = await marketplaceContract.opener.approve(contractAddress, 1);
      expect(res).to.not.equal(false);
    });

    it('should put NFT up for sale', async () => {
      const res = await marketplaceContract.putERC721OnSale(1, 1000);
      expect(res).to.not.equal(false);
    });
  });
});
