import chai from 'chai';
import { mochaAsync } from '../../utils';
import Numbers from '../../../src/utils/Numbers';
import { ERC20Contract, ERC721Contract, MarketplaceRealFvr } from "../../../build";

const { expect } = chai;
export var contractAddress;
export var deployed_tokenAddress;
export var deployed_erc721Address;
export var deployed_marketplaceAddress;

const testConfig = {
  test: true,
  localtest: true, //ganache local blockchain
};

context('Marketplace RealFvr', async () => {
  let erc20Contract;
  let erc721Contract;
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
    'should deploy a ERC721 contract',
    mochaAsync(async () => {
      /* Create Contract */
      erc721Contract = new ERC721Contract(testConfig);
      /* Deploy */
      const res = await erc721Contract.deploy({
        name: 'test',
        symbol: 'B.E.P.R.O',
        erc20Purchase: deployed_tokenAddress, //tokenAddress
      });
      await erc721Contract.__assert();
      contractAddress = erc721Contract.getAddress();
      expect(res).to.not.equal(false);
      expect(contractAddress).to.equal(res.contractAddress);
      deployed_erc721Address = contractAddress;
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
        erc721TokenAddress: erc721Contract.getAddress(),
      });
      await marketplaceContract.__assert();
      contractAddress = marketplaceContract.getAddress();
      expect(res).to.not.equal(false);
      expect(contractAddress).to.equal(res.contractAddress);
      deployed_marketplaceAddress = contractAddress;
    }),
  );

  it(
    'should mint, approve and add to sale NFT',
    mochaAsync(async () => {
      /* Mint */
      const res = await erc721Contract.mint({
        tokenId : 1,
        to : userAddress
      });
      expect(res).to.not.equal(false);
    }),
  );


  it(
    'should approve  NFT',
    mochaAsync(async () => {
      /* Approve */
      const res = await erc721Contract.approve({
        tokenId : 1,
        to : marketplaceContract.getAddress()
      });
      expect(res).to.not.equal(false);
    }),
  );


  it(
    'should put NFT in sale',
    mochaAsync(async () => {
      /* Put in Sale */
      const res = await marketplaceContract.putERC721OnSale({
        tokenId : 1,
        price : 1000
      });
      expect(res).to.not.equal(false);
    }),
  );
});
