import { assert, expect } from 'chai';
import { mochaAsync } from './utils';
import { ERC20Contract, ERC721Collectibles } from '../build';
import Numbers from '../build/utils/Numbers';

let deployed_tokenAddress;
const testConfig = {
  test: true,
  localtest: true, // ganache local blockchain
};

context('ERC721 Collectibles', async () => {
  let erc721Contract;
  let erc20Contract;
  // let app;
  let tokensHeld;
  let userAddress;

  before(async () => {
    erc721Contract = new ERC721Collectibles(testConfig);
    userAddress = await erc721Contract.getUserAddress(); // local test with ganache
  });

  /// this function is needed in all contracts working with an ERC20Contract token
  /// NOTE: it deploys a new ERC20Contract token for individual contract functionality testing
  it(
    'should deploy a new ERC20Contract',
    mochaAsync(async () => {
      // Create Contract
      erc20Contract = new ERC20Contract(testConfig);
      expect(erc20Contract).to.not.equal(null);
      // Deploy
      const res = await erc20Contract.deploy({
        name: 'test',
        symbol: 'B.E.P.R.O',
        cap: Numbers.toSmartContractDecimals(100000000, 18),
        distributionAddress: userAddress, // await app.getAddress()
      });
      await erc20Contract.__assert();
      deployed_tokenAddress = erc20Contract.getAddress();
      expect(res).to.not.equal(false);
      expect(deployed_tokenAddress).to.equal(res.contractAddress);
    }),
  );

  it(
    'should start the ERC721Collectibles',
    mochaAsync(async () => {
      erc721Contract = new ERC721Collectibles(testConfig);
      expect(erc721Contract).to.not.equal(null);
    }),
  );

  it(
    'should deploy Contract',
    mochaAsync(async () => {
      // Deploy
      const res = await erc721Contract.deploy({
        name: 'Art | BEPRO',
        symbol: 'B.E.P.R.O',
        limitedAmount: 100,
        erc20Purchase: deployed_tokenAddress, // tokenAddress,
        // feeAddress : app.account.getAddress()
        feeAddress: userAddress, // local test with ganache
      });
      await erc721Contract.__assert();
      expect(res).to.not.equal(false);
    }),
  );

  it(
    'should verify if sale is limited',
    mochaAsync(async () => {
      const res = await erc721Contract.isLimited();
      expect(res).to.equal(true);
    }),
  );

  it(
    'should add base tokenURI',
    mochaAsync(async () => {
      const res = await erc721Contract.setBaseTokenURI({
        URI: 'https://bepronetwork.github.io/B.E.P.R.O/meta/',
      });
      expect(res).to.not.equal(false);
    }),
  );

  it(
    'should set Pack Price',
    mochaAsync(async () => {
      /* Set Price for Pack */
      let res = await erc721Contract.setPricePerPack({
        newPrice: 1000,
      });
      expect(res).to.not.equal(false);
      res = await erc721Contract.getPricePerPack();
      expect(res).to.equal(Number(1000).toString());
    }),
  );

  it(
    'should open a pack',
    mochaAsync(async () => {
      /* Approve */
      await erc721Contract.approveERC20();

      /* Set Price for Pack */
      const res = await erc721Contract.openPack({
        amount: 1,
      });
      expect(res).to.not.equal(false);
    }),
  );

  it(
    'should verify the opened packs',
    mochaAsync(async () => {
      const res = await erc721Contract.openedPacks();
      expect(res).to.equal(1);
    }),
  );

  it(
    'should verify the current Token id',
    mochaAsync(async () => {
      const res = await erc721Contract.currentTokenId();
      expect(res).to.equal(1001);
    }),
  );

  it(
    'should get the available token ids',
    mochaAsync(async () => {
      tokensHeld = await erc721Contract.getRegisteredIDs({
        address: userAddress,
      });
      expect(tokensHeld.length).to.equal(1);
      expect(tokensHeld[0]).to.equal(1000);
    }),
  );

  it(
    'should verify the available token id is not minted already',
    mochaAsync(async () => {
      let res = await erc721Contract.isIDRegistered({
        address: userAddress,
        tokenID: tokensHeld[0],
      });
      expect(res).to.equal(true);
      res = await erc721Contract.exists({ tokenID: tokensHeld[0] });
      expect(res).to.equal(false);
    }),
  );

  it(
    'should mint the token id',
    mochaAsync(async () => {
      const res = await erc721Contract.mint({
        tokenID: tokensHeld[0],
      });
      expect(res).to.not.equal(false);
    }),
  );

  it(
    'should verify the available token id is already',
    mochaAsync(async () => {
      let res = await erc721Contract.isIDRegistered({
        address: userAddress,
        tokenID: tokensHeld[0],
      });
      expect(res).to.equal(true);
      res = await erc721Contract.exists({ tokenID: tokensHeld[0] });
      expect(res).to.equal(true);
    }),
  );

  it(
    'should open a pack',
    mochaAsync(async () => {
      /* Approve */
      await erc721Contract.approveERC20();
      const isApproved = await erc721Contract.isApproved({
        address: userAddress,
        amount: 1000,
      });
      expect(isApproved).to.equal(true);

      /* Set Price for Pack */
      const res = await erc721Contract.openPack({
        amount: 1,
      });
      expect(res).to.not.equal(false);
    }),
  );

  it(
    'should verify the opened packs',
    mochaAsync(async () => {
      const res = await erc721Contract.openedPacks();
      expect(res).to.equal(2);
    }),
  );

  it(
    'should verify the current Token id',
    mochaAsync(async () => {
      const res = await erc721Contract.currentTokenId();
      expect(res).to.equal(1002);
    }),
  );

  it(
    'should verify the current Token Metadatta URI',
    mochaAsync(async () => {
      await erc721Contract.getURITokenID({ tokenID: 1000 });
    }),
  );

  it(
    'should get the available token ids',
    mochaAsync(async () => {
      tokensHeld = await erc721Contract.getRegisteredIDs({
        address: userAddress,
      });
      expect(tokensHeld.length).to.equal(2);
      expect(tokensHeld[0]).to.equal(1000);
      expect(tokensHeld[1]).to.equal(1001);
    }),
  );

  it(
    'should mint the token id 2',
    mochaAsync(async () => {
      const res = await erc721Contract.mint({
        tokenID: tokensHeld[1],
      });
      expect(res).to.not.equal(false);
    }),
  );

  it(
    'shouldn´t mint a token id 3',
    mochaAsync(async () => {
      try {
        await erc721Contract.mint({
          to: userAddress,
          tokenID: 1003,
        });
      }
      catch(err) {
        assert(
          err.message.indexOf('Token Id not registered') >= 0,
          'erc721Contract.mint should fail with expected error',
        );
      }
    }),
  );

  it(
    'should be able to open a pack',
    mochaAsync(async () => {
      /* Approve */
      await erc721Contract.approveERC20();
      const isApproved = await erc721Contract.isApproved({
        address: userAddress,
        amount: 1000,
      });
      expect(isApproved).to.equal(true);

      /* Set Price for Pack */
      const res = await erc721Contract.openPack({
        amount: 1,
      });

      expect(res).to.not.equal(false);
    }),
  );
});
