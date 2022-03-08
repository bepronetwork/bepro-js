import { expect, assert } from 'chai';
import { mochaAsync } from '../../utils';
import Numbers from '../../../build/utils/Numbers';
//import Application from '../../../src/Application';

import { ERC20Contract, ETHUtils, ERC20Mock, MarketplaceRealFvr, OpenerRealFvr } from '../../../build';
//import ERC20Mock  from '../../../build/models/mocks/ERC20Mock';
import Numbers from '../../../build/utils/Numbers';
import beproAssert from '../../../build/utils/beproAssert';

const truffleAssert = require("truffle-assertions");

//const { chaiPlugin } = require("../../../src/sablier/dev-utils");
const traveler = require("ganache-time-traveler");

const BigNumber = require("bignumber.js");
const chai = require("chai");
const chaiBigNumber = require("chai-bignumber");

chai.should();
chai.use(chaiBigNumber(BigNumber));
//chai.use(chaiPlugin);

const testConfig = {
  test: true,
  localtest: true, //ganache local blockchain
};

// global web3 object is needed for ganache-time-traveler to work
global.web3 = undefined; // = web3Conn.web3;

let snapshotId;

let ethUtils;
let erc20Token;
let erc721Token;
let marketplace;
let erc20TokenAddress;
let erc721TokenAddress;
let marketplaceAddress;

let owner;
let userAddress;
let userAddress2;
let userAddress3;

const TOKEN_AMOUNT_1M = 1000000; //1 million token amount
const TOKEN_AMOUNT_1B = 1000000000; //1 billion token amount

const erc20TokenSupply = BigNumber(TOKEN_AMOUNT_1B).multipliedBy(10);




const checkLocalTestOnly = () => {
	if (!testConfig.localtest) {
		console.warn('--- we only run this function in localtest mode ---');
		return false;
	}
	return true;
}

// load users/addresses/signers from connected wallet via contract
const loadSigners = async (contract) => { //contract is IContract
	console.log('...loadSigners');
	//userAddress = await contract.getUserAddress();
	[userAddress, userAddress2, userAddress3] = await contract.getSigners();
	owner = userAddress;
}

// forward blockchain with x number of blocks, for testing purposes
const forwardBlocks = async (nblocks) => {
	let blocksTx = [];
	for (let i=0; i < nblocks; ++i) {
		blocksTx.push(traveler.advanceBlock());
	}
	return Promise.all(blocksTx);
  //return Promise.all([ ...new Array(nblocks) ].map(() => traveler.advanceBlock()));
  //return Promise.all((new Array(nblocks)).map(() => traveler.advanceBlock()));
}

// deploy erc20Token contract
/*const deployErc20Token = async () => {
	console.log('...deploying new erc20Token contract');

  erc20Token = new ERC20Contract(testConfig);
  expect(erc20Token).to.not.equal(null);
  let res = await erc20Token.deploy({
    name: 'test',
    symbol: 'B.E.P.R.O',
    cap: Numbers.fromBNToDecimals(erc20TokenSupply, 18),
    distributionAddress: userAddress, //local test with ganache
  });
  expect(res).to.not.equal(false);
  erc20TokenAddress = erc20Token.getAddress();
};*/

// deploy erc721Token contract
/*const deployErc721Token = async () => {
	console.log('...deploying new erc721Token contract');

  erc721Token = new ERC721Contract(testConfig);
  expect(erc721Token).to.not.equal(null);
  let res = await erc721Token.deploy({
    name: "ERC20 Token",
    symbol: "ERC20T"
  });
  expect(res).to.not.equal(false);
  erc20TokenAddress = erc20Token.getAddress();
};*/

// deploy MarketplaceRealFvr contract
const deployMarketplace = async ({ startBlockNumber = 1, erc20TokenAddress1 = '0', erc721TokenAddress1 } = {}) => {
	console.log('...deploying new MarketplaceRealFvr contract');
	
	//deployedBlock = await ethUtils.blockNumber();
	//deployedBlock = BigNumber(0);
	if (startBlockNumber)
		initStartBlock = startBlockNumber; //0
	else initStartBlock = BigNumber(1); //0
	
	// Create Contract
	marketplace = new MarketplaceRealFvr(testConfig);
	expect(marketplace).to.not.equal(null);
	// Deploy
	let testConfig2 = {
    ...testConfig,
    erc20TokenAddress: erc20TokenAddress1,
    erc721TokenAddress: erc721TokenAddress1,
  };
	//console.log('...Marketplace.testConfig2: ', testConfig2);
	let res = await marketplace.deploy(testConfig2);
	//await marketplace.__assert();

  contractAddress = marketplace.getAddress();
  expect(res).to.not.equal(false);
  expect(contractAddress).to.equal(res.contractAddress);
  console.log(`Deployed Marketplace address: ${contractAddress}`);
  marketplaceAddress = contractAddress;

	console.log('---marketplace.userAddress: ', await marketplace.getUserAddress());

	deployedBlock = await ethUtils.blockNumber();

	// load user addresses
	await loadSigners(marketplace);
};



context('MarketplaceRealFvr', async () => {

  before('MarketplaceRealFvr::before_hook', async () => {
    //const loophole = new Loophole(testConfig);
    const token = new ERC20Mock(testConfig);
    
    if (testConfig.localtest) {
      /// set global web3 object for ganache time traveler testing
      web3 = token.web3Connection.web3;
      console.log('---MarketplaceRealFvr.before.web3: ', (web3 != null));
      ///
      
      /// take blockchain snapshot
      const snapshot = await traveler.takeSnapshot();
      snapshotId = snapshot.result;
      console.log('+++MarketplaceRealFvr.before.');
      console.log('--- take blockchain snapshot ---');
      ///
    }
    else {
      console.log('--- we only take blockchain snapshot for localtest ---');
    }
  });



	//NOTE: make sure we only run these tests in local blockchain
	before('MarketplaceRealFvr::before_hook::checkLocalTestOnly', async () => {
		if (!checkLocalTestOnly()) {
			assert.fail('LOCAL_TEST_REQUIRED');
		}
	});



	before('MarketplaceRealFvr::setup', async () => {
    let res;
		ethUtils = new ETHUtils(testConfig);
		expect(ethUtils).to.not.equal(null);
		res = await ethUtils.deploy({});
		expect(res).to.not.equal(false);
		ethUtilsAddress = ethUtils.getAddress();
		//deployedBlock = await ethUtils.blockNumber();
	});



  it('should deploy an ERC20 contract', mochaAsync(async () => {
    /* Create Contract */  
    erc20Token = new ERC20Contract(testConfig);
    expect(erc20Token).to.not.equal(null);
    let res = await erc20Token.deploy({
      name: 'test',
      symbol: 'B.E.P.R.O',
      cap: Numbers.fromBNToDecimals(erc20TokenSupply, 18),
      distributionAddress: userAddress, //local test with ganache
    });
    expect(res).to.not.equal(false);
    contractAddress = erc20Token.getAddress();
    expect(contractAddress).to.equal(res.contractAddress);
    console.log(`Deployed ERC20Contract address: ${contractAddress}`);
    erc20TokenAddress = contractAddress;
  }));


  it('should deploy a ERC721 contract', mochaAsync(async () => {
    /* Create Contract */
    erc721Token = new ERC721Contract(testConfig);
    expect(erc721Token).to.not.equal(null);
    let res = await erc721Token.deploy({
      name: 'test',
      symbol: 'B.E.P.R.O'
    });
    await erc721Token.__assert();
    contractAddress = erc721Token.getAddress();
    expect(res).to.not.equal(false);
    expect(contractAddress).to.equal(res.contractAddress);
    console.log(`Deployed ERC721Contract address: ${contractAddress}`);
    erc721TokenAddress = contractAddress;
  }));


  it('should deploy the MarketPlace contract', mochaAsync(async () => {
    await deployMarketplace({
      startBlockNumber: 1,
      erc20TokenAddress: erc20Token.getAddress(),
      erc721TokenAddress: erc721Token.getAddress(),
    });
  }));


//...
  it(
    'should mint, approve and add to sale NFT',
    mochaAsync(async () => {
      /* Mint */
      const res = await erc721Token.mint({
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
      const res = await erc721Token.approve({
        tokenId : 1,
        to : marketplace.getAddress()
      });
      expect(res).to.not.equal(false);
    }),
  );


  it(
    'should put NFT in sale',
    mochaAsync(async () => {
      /* Put in Sale */
      const res = await marketplace.putERC721OnSale({
        tokenId : 1,
        price : 1000
      });
      expect(res).to.not.equal(false);
    }),
  );



  after('MarketplaceRealFvr::after_hook', async () => {
    if (testConfig.localtest) {
      await traveler.revertToSnapshot(snapshotId);
      console.log('+++MarketplaceRealFvr.after.');
      console.log('--- revert blockchain to last snapshot ---');
    }
    else {
      console.log('--- we only revert blockchain to last snapshot for localtest ---');
    }
  });
});
