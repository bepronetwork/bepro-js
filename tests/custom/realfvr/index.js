import { expect } from 'chai';
import { mochaAsync } from '../../utils';
import Numbers from '../../../src/utils/Numbers';
import { ERC20Contract, OpenerRealFvr, MarketplaceRealFvr } from '../../../build';

let contractAddress;
let deployed_tokenAddress;

const testConfig = {
  test: true,
  localtest: true, // ganache local blockchain
};

context('Marketplace RealFvr', async () => {
  let erc20Contract;
  let openerContract;
  let marketplaceContract;
  let userAddress;

  it(
    'should deploy a ERC20 contract',
    mochaAsync(async () => {
      /* Create Contract */
      erc20Contract = new ERC20Contract(testConfig);

      userAddress = await erc20Contract.getUserAddress();

      /* Deploy */
      const res = await erc20Contract.deploy({
        name: 'test',
        symbol: 'B.E.P.R.O',
        cap: Numbers.toSmartContractDecimals(100000000, 18),
        // /distributionAddress : app.account.getAddress() //original
        distributionAddress: userAddress, // local test with ganache
      });
      await erc20Contract.__assert();
      contractAddress = erc20Contract.getAddress();
      expect(res).to.not.equal(false);
      expect(contractAddress).to.equal(res.contractAddress);
      deployed_tokenAddress = contractAddress;
    }),
  );

  it(
    'should deploy a Opener contract',
    mochaAsync(async () => {
      /* Create Contract */
      openerContract = new OpenerRealFvr({
        ...testConfig,
        tokenAddress: deployed_tokenAddress,
      });
      /* Deploy */
      const res = await openerContract.deploy({
        name: 'test',
        symbol: 'B.E.P.R.O',
        tokenAddress: deployed_tokenAddress, // tokenAddress
      });
      await openerContract.__assert();
      contractAddress = openerContract.getAddress();
      expect(res).to.not.equal(false);
      expect(contractAddress).to.equal(res.contractAddress);
    }),
  );

  it(
    'should deploy the MarketPlace contract',
    mochaAsync(async () => {
      /* Create Contract */
      marketplaceContract = new MarketplaceRealFvr(testConfig);
      /* Deploy */
      const res = await marketplaceContract.deploy({
        erc20TokenAddress: erc20Contract.getAddress(),
        erc721TokenAddress: openerContract.getAddress(),
      });
      await marketplaceContract.__assert();
      contractAddress = marketplaceContract.getAddress();
      expect(res).to.not.equal(false);
      expect(contractAddress).to.equal(res.contractAddress);
    }),
  );

  it(
    'should create pack of NFTs',
    mochaAsync(async () => {
      const res = await openerContract.createPack({
        nftAmount: 1,
        price: 1,
        serie: '',
        packType: 'foo',
        drop: 'bar',
        saleStart: 1,
        saleDistributionAddresses: [ '0x0000000000000000000000000000000000000000' ],
        saleDistributionAmounts: [ 100 ],
        marketplaceDistributionAddresses: [],
        marketplaceDistributionAmounts: [],
      });
      expect(res).to.not.equal(false);
    }),
  );

  it(
    'should offer pack to owner',
    mochaAsync(async () => {
      const res = await openerContract.offerPack({
        packId: 1,
        receivingAddress: userAddress,
      });
      expect(res).to.not.equal(false);
    }),
  );

  it(
    'should open pack',
    mochaAsync(async () => {
      const res = await openerContract.openPack({ packId: 1 });
      expect(res).to.not.equal(false);
    }),
  );

  it(
    'should mint NFT',
    mochaAsync(async () => {
      const res = await openerContract.mint({
        tokenId: 1,
        to: userAddress,
      });
      expect(res).to.not.equal(false);
    }),
  );

  it(
    'should approve NFT',
    mochaAsync(async () => {
      const res = await openerContract.approve({
        tokenId: 1,
        to: marketplaceContract.getAddress(),
      });
      expect(res).to.not.equal(false);
    }),
  );

  it(
    'should put NFT in sale',
    mochaAsync(async () => {
      /* Put in Sale */
      const res = await marketplaceContract.putERC721OnSale({
        tokenId: 1,
        price: 1000,
      });
      expect(res).to.not.equal(false);
    }),
  );
});
