import {defaultWeb3Connection, erc20Deployer, hasTxBlockNumber, revertChain} from '../utils';
import {ERC721Collectibles} from '../../src-ts';
import {toSmartContractDecimals} from '../../src-ts/utils/numbers';
import {expect} from 'chai';

describe(`ERC271Collectibles`, () => {
  let contract: ERC721Collectibles;
  let purchaseTokenAddress!: string;
  let contractAddress!: string;
  let accountAddress!: string;


  const purchaseTokenCap = toSmartContractDecimals(1000000) as number;
  const collectableCap = 10
  const web3Connection = defaultWeb3Connection();

  before(async () => {
    await web3Connection.start();
    await revertChain(web3Connection.Web3);
    accountAddress = web3Connection.Account.address;
  });

  it(`Deploys the contract`, async () => {
    const erc20 = await erc20Deployer(`Settler`, `$settler`, purchaseTokenCap, web3Connection)

    const deployer = new ERC721Collectibles(web3Connection);
    deployer.loadAbi();
    const tx = await deployer
      .deployJsonAbi(
        `Collectible`, `$stamp`,
        collectableCap, erc20.contractAddress!,
        accountAddress, accountAddress, accountAddress);

    expect(tx.blockNumber).to.exist;
    contractAddress = tx.contractAddress!;
    purchaseTokenAddress = erc20.contractAddress!;
  });

  describe(`Methods`, () => {
    before(async () => {
      contract = new ERC721Collectibles(web3Connection, contractAddress!, purchaseTokenAddress);
      await contract.loadContract();
    });

    it(`Asserts that created is limited`, async () => {
      expect(await contract.isLimited()).to.be.true;
    });

    it(`Adds a base tokenURI`, async () => {
      await hasTxBlockNumber(contract.setBaseURI('https://domain.tld/'));
      expect(await contract.baseURI()).to.have.string('https://domain.tld/')
    });

    it(`Sets pack price`, async () => {
      await hasTxBlockNumber(contract.setPricePerPack(2));
    });

    it(`Opens a pack`, async () => {
      await hasTxBlockNumber(contract.approveERC20Transfer());
      await hasTxBlockNumber(contract.openPack(1));
      expect(await contract.openedPacks()).to.eql(1)
      expect(await contract._currentTokenId()).to.eq(1001) // base is 1000, +1 open pack = 1001
    });

    it(`Queries tokens held by user`, async () => {
      const held = await contract.getRegisteredIDs(accountAddress);
      expect(held.length).to.eq(1);
      expect(held[0]).to.eq(1000) // base is 1000, we opened 1, thus we opened the first and is the 1000
    });

    it(`Match ownership of held token`, async () => {
      expect(await contract.registeredIDs(accountAddress, 1000)).to.be.true; // we just asserted that base is 1000 and we have it (we bailed otherwise)
      expect(await contract.exists(1000)).to.be.false; // we own it, but haven't minted
    });

    it(`mints the token id`, async () => {
      await hasTxBlockNumber(contract.mint(1000));
      expect(await contract.exists(1000)).to.be.true;
    });

    it(`Asserts tokenURI url for tokenId`, async () => {
      expect(await contract.tokenURI(1000)).to.have.string(`domain.tld/1000`);
    });

  });

});
