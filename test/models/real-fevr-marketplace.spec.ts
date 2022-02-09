import {defaultWeb3Connection, erc20Deployer, hasTxBlockNumber, revertChain} from '../utils/';
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

  describe('Contracts', () => {
    it(`Deploys the token contract`, async () => {
      const erc20 = await erc20Deployer(`Settler`, `$settler`, purchaseTokenCap, web3Connection);

      expect(erc20.contractAddress).to.not.be.empty;
      tokenAddress = erc20.contractAddress!;
    });

    it(`Deploys the opener contract`, async () => {
      const openerDeployer = new RealFevrOpener(web3Connection);
      openerDeployer.loadAbi();
      const openerTx = await openerDeployer.deployJsonAbi(`Collectible`, `$stamp`, tokenAddress);

      expect(openerTx.blockNumber).to.exist;
      expect(openerTx.contractAddress).to.not.be.empty;
      openerAddress = openerTx.contractAddress!;
    });

    it(`Deploys the marketplace contract`, async () => {
      const marketplaceDeployer = new RealFevrMarketplace(web3Connection);
      marketplaceDeployer.loadAbi();
      const marketplaceTx = await marketplaceDeployer.deployJsonAbi(openerAddress, tokenAddress);

      expect(marketplaceTx.blockNumber).to.exist;
      expect(marketplaceTx.contractAddress).to.not.be.empty;
      contractAddress = marketplaceTx.contractAddress;
    });
  });

  describe('Methods', () => {
    before(async () => {
      marketplaceContract = new RealFevrMarketplace(web3Connection, contractAddress!, openerAddress, tokenAddress);
      await marketplaceContract.loadContract();
    });

    it('should create pack of NFTs', async () => {
      await hasTxBlockNumber(marketplaceContract.opener.createPack(1, 1, '', 'foo', 'bar', 1, [ '0x0000000000000000000000000000000000000000' ], [ 100 ], [], []));
    });

    it('should offer pack to owner', async () => {
      await hasTxBlockNumber(marketplaceContract.opener.offerPack(1, accountAddress));
    });

    it('should open pack', async () => {
      await hasTxBlockNumber(marketplaceContract.opener.openPack(1));
    });

    it('should mint NFT', async () => {
      await hasTxBlockNumber(marketplaceContract.opener.mint(1));
    });

    it('should approve NFT', async () => {
      await hasTxBlockNumber(marketplaceContract.opener.approve(contractAddress, 1));
    });

    it('should put NFT up for sale', async () => {
      await hasTxBlockNumber(marketplaceContract.putERC721OnSale(1, 1000));
    });
  });
});
