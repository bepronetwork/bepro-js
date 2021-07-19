//const { devConstants } = require("@sablier/dev-utils");
//const project_root = process.cwd();
const { dappConstants, devConstants } = require("../../src/sablier/dev-utils");

import { expect, assert } from "chai";
import moment from "moment";
import delay from "delay";
import { mochaAsync, mochaContextAsync } from "../utils";
import { ERC20Contract, Sablier } from "../../build";
import CERC20Mock from '../../build/models/mocks/CERC20Mock';
import ERC20Mock  from '../../build/models/mocks/ERC20Mock';
import Numbers from "../../build/utils/Numbers";

const BigNumber = require("bignumber.js");
const truffleAssert = require("truffle-assertions");


/*const { chaiPlugin } = require(project_root + "/src/sablier/dev-utils");
const chai = require("chai");
const chaiBigNumber = require("chai-bignumber");

chai.should();
chai.use(chaiBigNumber(BigNumber));
chai.use(chaiPlugin);
*/

import Web3Connection from "../../build/Web3Connection";

const shouldBehaveLikeSablier = require("./sablier.behavior");
//const shouldBehaveLikeUpdateFee = require("./admin/UpdateFee");

const { INITIAL_EXCHANGE_RATE, STANDARD_SALARY } = dappConstants;
const { STANDARD_SABLIER_FEE } = dappConstants;

var deployed_tokenAddress;
const ethAmount = 0.1;
let contractAddress = "0x949d274F63127bEd53e21Ed1Dd83dD6ACAfF7f64";
// this is already deployed on rinkeby network for testing
// var deployed_contractAddress = '0xf7177df4a4797304cf59aa1e2dd4718cb390cbad';
let deployed_contractAddress = "0xeAE93A3C4d74C469B898C345DEAD456C8Db06194";

//const lockSeconds = 30; // lock tokens for x amount of seconds
//let endDate = moment().add(lockSeconds, "seconds");
const testConfig = {
  test: true,
  localtest: true, //ganache local blockchain
};

//let _this = {};
//const web3Conn = new Web3Connection(testConfig);
global.web3 = undefined;// = web3Conn.web3;
//const web3 = web3Conn.web3;
//console.log('---sablier.web3', web3Conn);


const { chaiPlugin } = require("../../src/sablier/dev-utils");
const traveler = require("ganache-time-traveler");

//const BigNumber = require("bignumber.js");
const chai = require("chai");
const chaiBigNumber = require("chai-bignumber");

chai.should();
chai.use(chaiBigNumber(BigNumber));
chai.use(chaiPlugin);


let snapshotId;



context("Sablier contract", () => {
//const setup = () => {
  let _this = {};
  let alice;
  const bob   = "0x000000000000000000000000000000000000000A";
  const carol = "0x000000000000000000000000000000000000000B";
  const eve   = "0x000000000000000000000000000000000000000C";
  
  let erc20Contract;
  let sablier;
  let userAddress;
  
  
  /// works fine
  //let c = 0;
  //beforeEach(async () => {
  //  console.log('+++sablier.beforeEach.', c);
  //  c = c + 1;
  //});
  ///
  
  before(async () => {
    //const snapshot = await traveler.takeSnapshot();
	//snapshotId = snapshot.result;
	console.log('+++sablier.before.');
	//this.test = 3;
  });
  
  it(
    "should start the Sablier contract",
    async () => {//async function() {
      sablier = new Sablier(testConfig);
      expect(sablier).to.not.equal(null);
    }
  );
  
  it(
    "should deploy Sablier Contract",
    async () => {//async function () {
      // Create Contract
      /*let testConfig2 = { ...testConfig, tokenAddress: deployed_tokenAddress };
      console.log(
        "---should deploy sablier.testConfig2: " + JSON.stringify(testConfig2)
      );*/
      sablier = new Sablier(testConfig);
      // Deploy
      let res = await sablier.deploy();
      await sablier.__assert();
      contractAddress = sablier.getAddress();
      deployed_contractAddress = sablier.getAddress();
      console.log(
        "Deployed Sablier address: " + deployed_contractAddress
      );
      expect(res).to.not.equal(false);
	  //_this.sablier = sablier;
	  //_this.userAddress = await sablier.getUserAddress();
	  //_this.alice = _this.userAddress;
	  console.log('---sablier.userAddress: ', await sablier.getUserAddress());
    }
  );

  it(
    "Sablier Contract should have expected initial values",
    async () => {//async function () {
	  console.log("***init.sablier.bp0");
      const res = await sablier.nextStreamId();
      //const res2 = await sablier.fee().mantissa;
	  console.log("***init.sablier.bp1");
      console.log("***init.nextStreamId : ", res);
      //console.log("***init.fee [0 to 100] : " + res2);
      expect(Number(res)).to.equal(1); //"nextStreamId should be one by default");
      //expect(Number(res2)).to.equal(0);
    }
  );
  
  
  
  //after('Sablier after hook', async () => {
  describe('Sablier shouldBehaveLikeSablier...', async () => {
    
	beforeEach('Sablier beforeEach hook', async () => {
		
		//this.token = await ERC20Mock.new(opts);
		//await this.token.mint(this.userAddress, STANDARD_SALARY.multipliedBy(3).toString(10), opts);
		
		_this.token = new ERC20Mock(testConfig);
		expect(_this.token).to.not.equal(null);
		console.log('---sablier.before hook.bp0');
		let res = await _this.token.deploy();
		console.log('---sablier.before hook.bp1');
		await _this.token.__assert();
		console.log('---sablier.before hook.bp2');
		userAddress = await _this.token.getUserAddress();
		_this.userAddress = userAddress;
		await _this.token.mint({ to: userAddress, amount: STANDARD_SALARY.multipliedBy(100).toString(10) });
		
		console.log('---sablier.ERC20Mock.balance: ', await _this.token.balanceOf(userAddress));
		console.log('---sablier.before hook.bp3');
		console.log('---STANDARD_SALARY: ', STANDARD_SALARY);
		
		
		sablier = new Sablier(testConfig);
		//userAddress = await sablier.getUserAddress(); //local test with ganache
		alice = userAddress;
		
		res = await sablier.deploy();
		await sablier.__assert();
		contractAddress = sablier.getAddress();
		deployed_contractAddress = sablier.getAddress();
		console.log("Deployed Sablier address: " + deployed_contractAddress);
		expect(res).to.not.equal(false);
		
		/// set global web3 object for ganache time traveler testing
		web3 = sablier.web3Connection.web3;
		console.log('---sablier.before hook: ', await userAddress);
		console.log('---sablier.before hook.web3: ', (web3 != null));
		
		_this.sablier = sablier;
		_this.userAddress = userAddress;
		//_this.testme = 7;
		_this.alice = alice;
		_this.bob = bob;
		_this.carol = carol;
		_this.eve = eve;
		
		
		const cTokenDecimals = 8;
		//this.cToken = await CERC20Mock.new(this.token.address, INITIAL_EXCHANGE_RATE.toString(10), cTokenDecimals, opts);
		//await this.token.approve(this.cToken.address, STANDARD_SALARY.toString(10), opts);
		//await this.cToken.mint(STANDARD_SALARY.toString(10), opts);
		let testConfig2 = { ...testConfig, tokenAddress: _this.token.getAddress() };
		_this.cToken = new CERC20Mock(testConfig2);
		console.log('---cToken.bp0.devConstants.INITIAL_EXCHANGE_RATE: ', devConstants.INITIAL_EXCHANGE_RATE.toString(10));
		expect(_this.cToken).to.not.equal(null);
		res = await _this.cToken.deploy({
			//underlying: _this.token.getAddress(),
			initialExchangeRate: devConstants.INITIAL_EXCHANGE_RATE.toString(10),
			decimals: cTokenDecimals,
		});
		//console.log('---cToken.bp1');
		await _this.cToken.__assert();
		//console.log('---cToken.bp2');
		await _this.token.approve({ address: _this.cToken.getAddress(), amount: STANDARD_SALARY.toString(10) });
		//console.log('---cToken.bp3.devConstants.STANDARD_SALARY: ', devConstants.STANDARD_SALARY.toString(10));
		await _this.cToken.mint(STANDARD_SALARY.toString(10)); //devConstants.STANDARD_SALARY.toString(10));
		//console.log('---cToken.bp4');
		
		//this.nonStandardERC20Token = await NonStandardERC20.new(opts);
		//this.nonStandardERC20Token.nonStandardMint(alice, STANDARD_SALARY.toString(10), opts);
		
		//this.cTokenManager = await CTokenManager.new(opts);
		//this.sablier = await Sablier.new(this.cTokenManager.address, opts);
	});
	
	
    //shouldBehaveLikeUpdateFee(_this); //alice, bob, carol, eve);
	
	it("Sablier shouldBehaveLikeSablier", async () => {
	  shouldBehaveLikeSablier(_this);
	  console.log('---Sablier shouldBehaveLikeSablier finished.');
	});
	
  });
  
  
  after(async () => {
    //await traveler.revertToSnapshot(snapshotId);
    console.log('+++sablier.after.');
  });
});

/*context("Sablier contract", () => {
	setup();
	shouldBehaveLikeSablier(_this);
});*/
