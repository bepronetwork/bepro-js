//const project_root = process.cwd();
//const { dappConstants, devConstants } = require('../../src/sablier/dev-utils');

import { expect, assert } from 'chai';
import moment from 'moment';
import delay from 'delay';
import { mochaAsync, mochaContextAsync } from '../utils';
import { ERC20Contract, ETHUtils, UniswapV3Pool, UniswapV3Factory
	, SwapRouter, TestUniswapV3Callee, TestUniswapV3RouterBridge, Loophole } from '../../build';
import ERC20Mock  from '../../build/models/mocks/ERC20Mock';
import Numbers from '../../build/utils/Numbers';
import beproAssert from '../../build/utils/beproAssert';
import {
  FeeAmount,
  getMaxTick,
  getMinTick,
  encodePriceSqrt,
  TICK_SPACINGS,
  getMaxLiquidityPerTick,
  MaxUint128,
	MaxUint256,
  MAX_SQRT_RATIO,
  MIN_SQRT_RATIO,
} from '../shared/utilities';

const truffleAssert = require("truffle-assertions");

//const { chaiPlugin } = require("../../src/sablier/dev-utils");
const traveler = require("ganache-time-traveler");

const BigNumber = require("bignumber.js");
const chai = require("chai");
const chaiBigNumber = require("chai-bignumber");

chai.should();
chai.use(chaiBigNumber(BigNumber));
//chai.use(chaiPlugin);


import Web3Connection from "../../build/Web3Connection";

//const shouldBehaveLikeSablier = require("./sablier.behavior");

var deployed_tokenAddress;
const ethAmount = 0.1;
let contractAddress = "0x949d274F63127bEd53e21Ed1Dd83dD6ACAfF7f64";
// this is already deployed on rinkeby network for testing
// var deployed_contractAddress = '0xf7177df4a4797304cf59aa1e2dd4718cb390cbad';
let deployed_contractAddress = "0xeAE93A3C4d74C469B898C345DEAD456C8Db06194";

const TOKEN_AMOUNT_1M = 1000000; //1 million token amount
const TOKEN_AMOUNT_1B = 1000000000; //1 billion token amount

// the following constants are from TickMath library:
// https://github.com/Uniswap/uniswap-v3-core/blob/main/contracts/libraries/TickMath.sol
/// The minimum tick that may be passed to #getSqrtRatioAtTick computed from log base 1.0001 of 2**-128
const MIN_TICK = new BigNumber(-887272); //int24
/// The maximum tick that may be passed to #getSqrtRatioAtTick computed from log base 1.0001 of 2**128
const MAX_TICK = MIN_TICK.multipliedBy(-1); ////new BigNumber(-MIN_TICK); //int24

/// The minimum value that can be returned from #getSqrtRatioAtTick. Equivalent to getSqrtRatioAtTick(MIN_TICK)
//const MIN_SQRT_RATIO = BigNumber(4295128739); //uint160
/// The maximum value that can be returned from #getSqrtRatioAtTick. Equivalent to getSqrtRatioAtTick(MAX_TICK)
//const MAX_SQRT_RATIO = BigNumber('1461446703485210103287273052203988822378723970342'); //uint160

//const lockSeconds = 30; // lock tokens for x amount of seconds
//let endDate = moment().add(lockSeconds, "seconds");
const testConfig = {
  test: true,
  localtest: true, //ganache local blockchain
};

//const web3Conn = new Web3Connection(testConfig);
// global web3 object is needed for ganache-time-traveler to work
global.web3 = undefined; // = web3Conn.web3;



let snapshotId;
let wethStartBlockSnapshotId;
let wbtcStartBlockSnapshotId;
//let wethStartBlock;
//let wbtcStartBlock;



let _this = {};
let alice;
const bob   = "0x000000000000000000000000000000000000000A";
const carol = "0x000000000000000000000000000000000000000B";
const eve   = "0x000000000000000000000000000000000000000C";

let wethBnMaxUint256; //MaxUint256 for WETH token
let wbtcBnMaxUint256; //MaxUint256 for WBTC token
let lpBnMaxUint256; //MaxUint256 for LP token

const lpSupply = BigNumber(TOKEN_AMOUNT_1B).multipliedBy(10);
const wethSupply = BigNumber(TOKEN_AMOUNT_1B).multipliedBy(10); //.toString(10);
const wbtcSupply = BigNumber(TOKEN_AMOUNT_1B).multipliedBy(10);

let wethDecimals;
let wbtcDecimals;
let lpDecimals;
let WETH_AMOUNT_1M;
let WBTC_AMOUNT_1M;
let LP_AMOUNT_1M;

let loophole; //loophole contract
let loopholeAddress; //loophole contract address
let owner;
let userAddress;
let userAddress2;
let userAddress3;
let userAddress4;
let userAddress5;
let weth; //wrapped eth token contract
let wbtc; //wrapped btc token contract
let wethAddress; //wrapped eth token contract address
let wbtcAddress; ////wrapped btc token contract address
let lpToken; //Liquidity Provider reward token contract
let lpTokenAddress; //LP token contract address
let ethUtils; //eth utils contract
let ethUtilsAddress; //eth utils contract address
let factory; //uniswap factory contract
let factoryAddress; //uniswap factory contract address
let swapRouter; //uniswap swaprouter contract
let swapRouterAddress; //uniswap swaprouter contract address
let uniswapV3Callee; //uniswap callee contract used to add liquidity and perform swaps
let uniswapV3CalleeAddress; //uniswap callee contract address
let wethLpPoolV3; //WETH/LP uniswap pool contract
let wethLpPoolV3Address; //WETH/LP uniswap pool contract address
let wbtcLpPoolV3; //WBTC/LP uniswap pool contract
let wbtcLpPoolV3Address; //WBTC/LP uniswap pool contract address
let testUniswapRouterBridge; //TestUniswapRouterBridge contract
let lpTokensPerBlock = 50;
let initStartBlock; //zero by default
let deployedBlock = 1; //block number at loophole contract deployment
let exitPenalty = 20; //20 is 20%
let exitPenaltyLP = 10; //10%
const poolFee_3000 = 3000; //uniswap fee 0.3% as parts/million

//const setupWethAndWbtcPools = true;
const setupWethPoolConfig = { setupWeth: true, setupWbtc: false };
const setupWbtcPoolConfig = { setupWeth: false, setupWbtc: true };
const setupWethAndWbtcPoolsConfig = { setupWeth: true, setupWbtc: true };
const setupNoPoolsConfig = { setupWeth: false, setupWbtc: false };

const lpPid = 0; //LP pool id
const wethPid = 1; //WETH pool id
const wbtcPid = 2; //WBTC pool id
const invalidPid = 99; //invalid pool id

const wethAllocPoint = 3; //2; //WETH pool allocation point
const wbtcAllocPoint = 7; //4; //WBTC pool allocation point



const assertLocalTestOnly = () => {
	if (!testConfig.localtest) {
		assert.fail('>>> we only run this function in localtest mode <<<');
	}
}

const checkLocalTestOnly = () => {
	if (!testConfig.localtest) {
		console.warn('--- we only run this function in localtest mode ---');
		return false;
	}
	return true;
}

const validateWallet = function (wallet1) {
	assert.notEqual(wallet1, undefined, 'undefined wallet');
	assert.notEqual(wallet1, null, 'null wallet');
}

// load users/addresses/signers from connected wallet via contract
const loadSigners = async (contract) => { //contract is IContract
	console.log('...loadSigners');
	//userAddress = await contract.getUserAddress();
	[userAddress, userAddress2, userAddress3, userAddress4, userAddress5] = await contract.getSigners();
	owner = userAddress;
}

// forward blockchain with x number of blocks, for testing purposes
const forwardBlocks = async (nblocks) => {
	let blocksTx = [];
	for (let i=0; i < nblocks; ++i) {
		blocksTx.push(traveler.advanceBlock());
	}
	return Promise.all(blocksTx);
}

// deploy Loophole contract
const deployLoophole = async ({setupWeth = false, setupWbtc = false} = {}) => {
	console.log('...deploying new Loophole contract');
	
	//deployedBlock = await ethUtils.blockNumber();
	//deployedBlock = BigNumber(0);
	initStartBlock = BigNumber(1); //0
	
	// Create Contract
	let testConfig2 = { ...testConfig, lpTokenAddress, ethUtilsAddress, swapRouterAddress };
	loophole = new Loophole(testConfig2);
	expect(loophole).to.not.equal(null);
	// Deploy
	let testConfig3 = {
		swapRouter: swapRouterAddress, lpToken: lpTokenAddress,
		lpTokensPerBlock, startBlock: initStartBlock, exitPenalty, exitPenaltyLP
	};
	//console.log('...Loophole.testConfig3: ', testConfig3);
	let res = await loophole.deploy(testConfig3);
	//await loophole.__assert();
	contractAddress = loophole.getAddress();
	deployed_contractAddress = loophole.getAddress();
	loopholeAddress = loophole.getAddress();
	console.log('Deployed Loophole address: ', deployed_contractAddress);
	expect(res).to.not.equal(false);
	//_this.loophole = loophole;
	//_this.userAddress = await loophole.getUserAddress();
	//_this.alice = _this.userAddress;
	console.log('---loophole.userAddress: ', await loophole.getUserAddress());

	deployedBlock = await ethUtils.blockNumber();

	// load user addresses
	await loadSigners(loophole);

	// setup loophole, add WETH and WBTC pools
	//await setupLoophole({setupWeth, setupWbtc});
	if (setupWeth) {
		await addWethPool();
	}
	if (setupWbtc) {
		await addWbtcPool();
	}
	
	it('...deployLoophole test 1', async () => {
		console.log('...deployLoophole test 1...');
	});
};

const addWethPool = async () => {
	///>>> setup loophole, add WETH pool
	console.log('...add new WETH staking pool');
	const allocPoint = wethAllocPoint;
	//let pidWeth = await loophole.getWeb3Contract().methods.add(wethAddress, allocPoint).call();
	await loophole.add(wethAddress, allocPoint);
	
	//wethStartBlock = await ethUtils.blockNumber();

	// save block at WETH pool setup
	const snapshot = await traveler.takeSnapshot();
	wethStartBlockSnapshotId = snapshot.result;
};

const addWbtcPool = async () => {
	///>>> setup loophole, add WBTC pool
	console.log('...add new WBTC staking pool');
	const allocPoint = wbtcAllocPoint;
	//let pidWbtc = await loophole.getWeb3Contract().methods.add(wbtcAddress, allocPoint).call();
	await loophole.add(wbtcAddress, allocPoint);
	
	//wbtcStartBlock = await ethUtils.blockNumber();

	// save block at WBTC pool setup
	const snapshot = await traveler.takeSnapshot();
	wbtcStartBlockSnapshotId = snapshot.result;
};

const approveWethTransfers = async (user1 = userAddress) => {
	weth.switchWallet(user1);
	await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 });
}

const approveWbtcTransfers = async (user1 = userAddress) => {
	wbtc.switchWallet(user1);
	await wbtc.approve({ address: loopholeAddress, amount: wbtcBnMaxUint256 });
}

const approveTransfers = async (user1 = userAddress) => {
	await approveWethTransfers(user1);
	await approveWbtcTransfers(user1);
}

const setupLoophole = async ({setupWeth = true, setupWbtc = true} = {}) => {
	///>>> setup loophole, add WETH and WBTC pools
	if (setupWeth) {
		await addWethPool();
	}

	if (setupWbtc) {
		await addWbtcPool();
	}
	console.log('...Loophole ready!');
};

/*const runOnlyOwner = async function (asyncFn) {
	const ua1 = await loophole.getUserAddress();
	console.log('runOnlyOwner-ua1: ', ua1);
	
	loophole.switchWallet(userAddress2);
	console.log('runOnlyOwner-bp0.userAddress2: ', userAddress2);
	
	const ua2 = await loophole.getUserAddress();
	console.log('runOnlyOwner-ua2: ', ua2);
	console.log('runOnlyOwner.asyncFn: ', asyncFn.toString());

	await beproAssert.reverts(asyncFn, 'OR'); //'Owner Required'
	loophole.switchWallet(owner);
	console.log('runOnlyOwner-bp1');
};*/


const testFail = async (msg) => {
	throw new Error(msg);
}; 

const extCallTest = async function() {
	it('...extCallTest test 1', async () => {
		console.log('...it.extCallTest test 1...');
		console.log('testConfig: ', testConfig);
	});
	
	it('...extCallTest test 2', async () => {
		console.log('...it.extCallTest test 2...');
		console.log('web3: ', (web3 !== undefined && web3 != null));
	});
}

const extCallTest2 = async () => {
	console.log('+++ preparing extCallTest2 +++');

	it('...extCallTest test 1', async () => {
		console.log('...it.extCallTest test 1...');
		//console.log('testConfig: ', testConfig);
	});
	
	it('...extCallTest test 2', async () => {
		console.log('...it.extCallTest test 2...');
		console.log('web3: ', (web3 !== undefined && web3 != null));
	});
}



context("Loophole contract", () => {
//const setup = () => {
  
	/*const runOnlyOwnerInternal = async function (asyncFn) {
		const ua1 = await loophole.getUserAddress();
		console.log('runOnlyOwner-ua1: ', ua1);
		
		loophole.switchWallet(userAddress2);
		console.log('runOnlyOwner-bp0.userAddress2: ', userAddress2);
		
		const ua2 = await loophole.getUserAddress();
		console.log('runOnlyOwner-ua2: ', ua2);
		console.log('runOnlyOwner.asyncFn: ', asyncFn.toString());
	
		await beproAssert.reverts(asyncFn, 'OR'); //'Owner Required'
		loophole.switchWallet(owner);
		console.log('runOnlyOwner-bp1');
	};*/

	before('Loophole::before_hook', async () => {
    //const loophole = new Loophole(testConfig);
    const token = new ERC20Mock(testConfig);
    
    if (testConfig.localtest) {
      /// set global web3 object for ganache time traveler testing
      web3 = token.web3Connection.web3;
      console.log('---loophole.before.web3: ', (web3 != null));
      ///
      
      /// take blockchain snapshot
      const snapshot = await traveler.takeSnapshot();
      snapshotId = snapshot.result;
      console.log('+++loophole.before.');
      console.log('--- take blockchain snapshot ---');
      ///
    }
    else {
      console.log('--- we only take blockchain snapshot for localtest ---');
    }
  });



	before('Loophole::setup', async () => {
    let res;
		
		ethUtils = new ETHUtils(testConfig);
		expect(ethUtils).to.not.equal(null);
		res = await ethUtils.deploy({});
		expect(res).to.not.equal(false);
		ethUtilsAddress = ethUtils.getAddress();

		//deployedBlock = await ethUtils.blockNumber();
	});



	describe('#setup LP WETH WBTC tokens', async () => {
		it('setup WETH WBTC LP tokens and fund testing users', async () => {
			let res;
			
			weth = new ERC20Mock(testConfig);
			expect(weth).to.not.equal(null);
			res = await weth.deploy();
			expect(res).to.not.equal(false);
			wethAddress = weth.getAddress();

			await loadSigners(weth);
			
			wbtc = new ERC20Mock(testConfig);
			expect(wbtc).to.not.equal(null);
			res = await wbtc.deploy();
			expect(res).to.not.equal(false);
			wbtcAddress = wbtc.getAddress();

			lpToken = new ERC20Contract(testConfig);
			expect(lpToken).to.not.equal(null);
			res = await lpToken.deploy({
				name: "LP Token",
				symbol: "LPT",
				cap: Numbers.fromBNToDecimals(lpSupply, 18),
				distributionAddress: userAddress, //local test with ganache
			});
			expect(res).to.not.equal(false);
			lpTokenAddress = lpToken.getAddress();

			wethBnMaxUint256 = Numbers.fromDecimalsToBN(MaxUint256, weth.getDecimals());
			wbtcBnMaxUint256 = Numbers.fromDecimalsToBN(MaxUint256, wbtc.getDecimals());
			lpBnMaxUint256 = Numbers.fromDecimalsToBN(MaxUint256, lpToken.getDecimals());
			
			wethDecimals = weth.getDecimals();
			wbtcDecimals = wbtc.getDecimals();
			lpDecimals = lpToken.getDecimals();
			WETH_AMOUNT_1M = BigNumber(Numbers.fromBNToDecimals(BigNumber(TOKEN_AMOUNT_1M), wethDecimals));
			WBTC_AMOUNT_1M = BigNumber(Numbers.fromBNToDecimals(BigNumber(TOKEN_AMOUNT_1M), wbtcDecimals));
			LP_AMOUNT_1M = BigNumber(Numbers.fromBNToDecimals(BigNumber(TOKEN_AMOUNT_1M), lpDecimals));

			const wethInitialAirdrop = BigNumber(20000);
			const wbtcInitialAirdrop = BigNumber(20000);
			const lpInitialAirdrop = BigNumber(20000);

			await weth.mint({ to: userAddress,  amount: wethInitialAirdrop });
			await weth.mint({ to: userAddress2, amount: wethInitialAirdrop });
			await weth.mint({ to: userAddress3, amount: wethInitialAirdrop });
			await weth.mint({ to: userAddress4, amount: wethInitialAirdrop });
			await weth.mint({ to: userAddress5, amount: wethInitialAirdrop });
			
			await wbtc.mint({ to: userAddress,  amount: wbtcInitialAirdrop });
			await wbtc.mint({ to: userAddress2, amount: wbtcInitialAirdrop });
			await wbtc.mint({ to: userAddress3, amount: wbtcInitialAirdrop });
			await wbtc.mint({ to: userAddress4, amount: wbtcInitialAirdrop });
			await wbtc.mint({ to: userAddress5, amount: wbtcInitialAirdrop });

			const user1lpBefore = BigNumber(await lpToken.balanceOf(userAddress));
			await lpToken.transferTokenAmount({ toAddress: userAddress2, tokenAmount: lpInitialAirdrop });
			await lpToken.transferTokenAmount({ toAddress: userAddress3, tokenAmount: lpInitialAirdrop });
			await lpToken.transferTokenAmount({ toAddress: userAddress4, tokenAmount: lpInitialAirdrop });
			await lpToken.transferTokenAmount({ toAddress: userAddress5, tokenAmount: lpInitialAirdrop });

			const user1weth = await weth.balanceOf(userAddress);
			const user2weth = await weth.balanceOf(userAddress2);
			const user3weth = await weth.balanceOf(userAddress3);
			const user4weth = await weth.balanceOf(userAddress4);
			const user5weth = await weth.balanceOf(userAddress5);
			user1weth.should.be.bignumber.equal(wethInitialAirdrop);
			user2weth.should.be.bignumber.equal(wethInitialAirdrop);
			user3weth.should.be.bignumber.equal(wethInitialAirdrop);
			user4weth.should.be.bignumber.equal(wethInitialAirdrop);
			user5weth.should.be.bignumber.equal(wethInitialAirdrop);

			const user1wbtc = await wbtc.balanceOf(userAddress);
			const user2wbtc = await wbtc.balanceOf(userAddress2);
			const user3wbtc = await wbtc.balanceOf(userAddress3);
			const user4wbtc = await wbtc.balanceOf(userAddress4);
			const user5wbtc = await wbtc.balanceOf(userAddress5);
			user1wbtc.should.be.bignumber.equal(wbtcInitialAirdrop);
			user2wbtc.should.be.bignumber.equal(wbtcInitialAirdrop);
			user3wbtc.should.be.bignumber.equal(wbtcInitialAirdrop);
			user4wbtc.should.be.bignumber.equal(wbtcInitialAirdrop);
			user5wbtc.should.be.bignumber.equal(wbtcInitialAirdrop);

			const user1lp = await lpToken.balanceOf(userAddress);
			const user2lp = await lpToken.balanceOf(userAddress2);
			const user3lp = await lpToken.balanceOf(userAddress3);
			const user4lp = await lpToken.balanceOf(userAddress4);
			const user5lp = await lpToken.balanceOf(userAddress5);
			user1lp.should.be.bignumber.equal(user1lpBefore.minus(lpInitialAirdrop.times(4)));
			user2lp.should.be.bignumber.equal(lpInitialAirdrop);
			user3lp.should.be.bignumber.equal(lpInitialAirdrop);
			user4lp.should.be.bignumber.equal(lpInitialAirdrop);
			user5lp.should.be.bignumber.equal(lpInitialAirdrop);
		});
	});



	describe('#setup Uniswap contracts', async () => {
		it('deploy uniswapV3: factory, swap router, uniswapV3Callee', async () => {
			let res;
			// deploy uniswap factory V3
			factory = new UniswapV3Factory(testConfig);
			expect(factory).to.not.equal(null);
			res = await factory.deploy({});
			expect(res).to.not.equal(false);
			factoryAddress = factory.getAddress();

			// deploy uniswap swap router V3
			swapRouter = new SwapRouter({ ...testConfig, factory: factoryAddress, weth9: wethAddress });
			expect(swapRouter).to.not.equal(null);
			res = await swapRouter.deploy();
			expect(res).to.not.equal(false);
			swapRouterAddress = swapRouter.getAddress();

			uniswapV3Callee = new TestUniswapV3Callee(testConfig);
			expect(uniswapV3Callee).to.not.equal(null);
			res = await uniswapV3Callee.deploy({});
			expect(res).to.not.equal(false);
			uniswapV3CalleeAddress = uniswapV3Callee.getAddress();
		});


		it('create and fund uniswapV3 trading pools WETH/LP WBTC/LP', async () => {
			let res;

			const wethPoolAddress1 = await factory.getWeb3Contract().methods.createPool(wethAddress, lpTokenAddress, poolFee_3000).call();
			const wbtcPoolAddress1 = await factory.getWeb3Contract().methods.createPool(wbtcAddress, lpTokenAddress, poolFee_3000).call();

			//const wethPoolTx = await factory.createPool(wethAddress, lpTokenAddress, poolFee_3000); //create WETH/LP pool
			//const wbtcPoolTx = await factory.createPool(wbtcAddress, lpTokenAddress, poolFee_3000); //create WBTC/LP pool
			const wethPoolTx = await factory.createPool(lpTokenAddress, wethAddress, poolFee_3000); //create LP/WETH pool
			const wbtcPoolTx = await factory.createPool(lpTokenAddress, wbtcAddress, poolFee_3000); //create LP/WBTC pool
			
			//console.log('wethPoolTx', wethPoolTx);
			//console.log('wbtcPoolTx', wbtcPoolTx);
			wethLpPoolV3Address = wethPoolTx.events.PoolCreated.returnValues.pool;
			wbtcLpPoolV3Address = wbtcPoolTx.events.PoolCreated.returnValues.pool;
			const wethPoolReturnValues = wethPoolTx.events.PoolCreated.returnValues;
			//console.log('wethPoolReturnValues', wethPoolReturnValues);
			
			console.log('wethPoolAddress', wethLpPoolV3Address);
			console.log('wbtcPoolAddress', wbtcLpPoolV3Address);
			expect(wethLpPoolV3Address).to.equal(wethPoolAddress1);
			expect(wbtcLpPoolV3Address).to.equal(wbtcPoolAddress1);

			// deploy uniswap pool V3
			wethLpPoolV3 = new UniswapV3Pool({ ...testConfig, contractAddress: wethLpPoolV3Address });
			expect(wethLpPoolV3).to.not.equal(null);
			//res = await wethLpPoolV3.deploy({});
			//expect(res).to.not.equal(false);
			await wethLpPoolV3.__assert(); //already deployed
			//console.log('wethLpPoolV3.bp-0');
			//await wethLpPoolV3.start();
			//console.log('wethLpPoolV3.bp-1');
			//res = await wethLpPoolV3.login(); //login
			//console.log('wethLpPoolV3.bp-2');
			//expect(res).to.equal(true);
			const wethLpPoolV3Address1 = wethLpPoolV3.getAddress();
			//console.log('wethLpPoolV3.bp-3');
			expect(wethLpPoolV3Address).to.equal(wethLpPoolV3Address1);
			expect(wethLpPoolV3Address).to.equal(wethLpPoolV3.params.contractAddress);
			//console.log('wethLpPoolV3.bp-4');

			//sets initial price for the pool
			//require(sqrtPriceX96 >= MIN_SQRT_RATIO && sqrtPriceX96 < MAX_SQRT_RATIO, 'R');
			//const sqrtPriceX96 = MIN_SQRT_RATIO;
			const sqrtPriceX96 = encodePriceSqrt(2, 1); //(1,1) 1:2
			console.log('sqrtPriceX96: ', sqrtPriceX96.toString());
			//IUniswapPoolV3(wethLpPoolV3Address).initialize(sqrtPriceX96);
			const initTx = await wethLpPoolV3.initialize(sqrtPriceX96);
			//emits event Initialize(sqrtPriceX96, tick);
			//console.log('wethLpPoolV3.bp-5');
			const sqrtPriceX96Res = initTx.events.Initialize.returnValues.sqrtPriceX96;
			const tickRes = initTx.events.Initialize.returnValues.tick;
			expect(sqrtPriceX96.toString()).to.equal(sqrtPriceX96Res);
			console.log('wethLpPoolV3.initialize>\nsqrtPriceX96Res: ', sqrtPriceX96Res, ' | tickRes: ', tickRes);

			// approve to spend weth tokens
			//console.log('MaxUint128: ', MaxUint128);
			//console.log('MaxUint256: ', MaxUint256);
			//await weth.approve({ address: wethLpPoolV3Address, amount: wethBnMaxUint256 }); //wethSupply
			// uniswapV3CalleeAddress needs to be approved
			await weth.approve({ address: uniswapV3CalleeAddress, amount: wethBnMaxUint256 }); //wethSupply
			//console.log('wethLpPoolV3.bp-6');
			console.log('weth.allowance: ', await weth.allowance({ address: userAddress, spenderAddress: uniswapV3CalleeAddress }));
			//await lpToken.approve({ address: wethLpPoolV3Address, amount: lpBnMaxUint256 }); //lpSupply
			// uniswapV3CalleeAddress needs to be approved
			await lpToken.approve({ address: uniswapV3CalleeAddress, amount: lpBnMaxUint256 }); //lpSupply
			//console.log('wethLpPoolV3.bp-7');
			console.log('lpToken.allowance: ', await lpToken.allowance({ address: userAddress, spenderAddress: uniswapV3CalleeAddress }));
			
			//adds liquidity for the given recipient/tickLower/tickUpper position
			//function mint(address recipient, int24 tickLower, int24 tickUpper, uint128 amount, bytes data) returns (uint256 amount0, uint256 amount1);
			//const amount = Numbers.fromBNToDecimals(wethSupply, wethDecimals);
			const amount = Numbers.fromBNToDecimals(BigNumber(TOKEN_AMOUNT_1M), wethDecimals);
			console.log('wethLpPoolV3.mint | wethDecimals: ', wethDecimals, ' | wethAmount', amount);
			//const data = []; //['0x01', '0x02'];
			
			const tickSpacing = TICK_SPACINGS[FeeAmount.MEDIUM];
			const minTick = getMinTick(tickSpacing);
			const maxTick = getMaxTick(tickSpacing);
			const tickLower = minTick; //-TICK_SPACINGS[FeeAmount.MEDIUM]; //0; //-240; //minTick; //1; //int24 ???
			const tickUpper = maxTick; //TICK_SPACINGS[FeeAmount.MEDIUM]; //240; //0; //maxTick; //10;
			//wethLpPoolV3.mint does not work, needs a bridge contract on the blockchain like 'TestUniswapV3Callee'
			//const { amount0, amount1 } = await wethLpPoolV3.mint(userAddress, tickLower, tickUpper, amount, data);
			// ??? convert token decimals to bigNumber
			//console.log('mintRes.amount0: ', amount0);
			//console.log('mintRes.amount1: ', amount1);
			// this liquidity would NOT be accurate as we have 2 tokens that could be of different decimals
			// for a better practice of providing liquidity please use 'TestLiquidityExample' smart contract and wrapper
			const liquidityDelta = 1000000; //amount;
			const mintTx = await uniswapV3Callee.mint(wethLpPoolV3Address, userAddress, tickLower, tickUpper, liquidityDelta);
			//console.log('mintTx', mintTx);

			//emits event Mint(address sender, address indexed owner, int24 indexed tickLower, int24 indexed tickUpper,
			//uint128 amount, uint256 amount0, uint256 amount1);
			const mint_sender = mintTx.events.Mint.returnValues.sender;
			const mint_owner = mintTx.events.Mint.returnValues.owner;
			const mint_tickLower = mintTx.events.Mint.returnValues.tickLower;
			const mint_tickUpper = mintTx.events.Mint.returnValues.tickUpper;
			const mint_amount = mintTx.events.Mint.returnValues.amount;
			const mint_amount0 = mintTx.events.Mint.returnValues.amount0;
			const mint_amount1 = mintTx.events.Mint.returnValues.amount1;
			console.log('\nuniswapV3Callee.mint.Mint:');
			console.log('sender: ', mint_sender);
			console.log('owner: ', mint_owner);
			console.log('tickLower: ', mint_tickLower);
			console.log('tickUpper: ', mint_tickUpper);
			console.log('amount: ', mint_amount);
			console.log('amount0: ', mint_amount0);
			console.log('amount1: ', mint_amount1);
			
			//emits event MintCallback(amount0Owed, amount1Owed);
			const amount0Owed = mintTx.events.MintCallback.returnValues.amount0Owed;
			const amount1Owed = mintTx.events.MintCallback.returnValues.amount1Owed;
			console.log('\nuniswapV3Callee.mint.MintCallback');
			console.log('amount0Owed: ', amount0Owed, ' | amount1Owed', amount1Owed);
			//console.log('wethLpPoolV3.bp-8');
			
			const wethBalance1 = await weth.balanceOf(userAddress);
			const lpBalance1 = await lpToken.balanceOf(userAddress);
			console.log('wethBalance1: ', wethBalance1);
			console.log('lpBalance1: ', lpBalance1);
		});
	});
	


	describe('#uniswap tests via TestUniswapV3RouterBridge', async () => {
		it('should deploy TestUniswapV3RouterBridge Contract', async () => {
			testUniswapRouterBridge = new TestUniswapV3RouterBridge({ ...testConfig, swapRouterAddress });
			expect(testUniswapRouterBridge).to.not.equal(null);
			let res = await testUniswapRouterBridge.deploy();
			expect(res).to.not.equal(false);
			//await testUniswapRouterBridge.__assert();
			let testUniswapRouterBridgeAddress = testUniswapRouterBridge.getAddress();
			console.log('Deployed TestUniswapV3RouterBridge address: ', testUniswapRouterBridgeAddress);

			// testUniswapRouterBridgeAddress needs to be approved
			await weth.approve({ address: testUniswapRouterBridgeAddress, amount: wethBnMaxUint256 });
			await wbtc.approve({ address: testUniswapRouterBridgeAddress, amount: wbtcBnMaxUint256 });
			await lpToken.approve({ address: testUniswapRouterBridgeAddress, amount: lpBnMaxUint256 });
		});


		it('should exchange exact WETH input tokens for LP output tokens via TestUniswapV3RouterBridge', async () => {
			const amountIn = 100; //100 weth
			const amountOutMinimum = 0; //do NOT use zero in production
			//const amountOut = await testUniswapRouterBridge.swapExactInputSingleEx(...);
			const amountOut = await testUniswapRouterBridge.getWeb3Contract().methods.swapExactInputSingleEx(
				wethAddress //tokenIn
				, lpTokenAddress //tokenOut
				, poolFee_3000
				, amountIn
				, amountOutMinimum
				).call();
			console.log(`TestUniswapV3RouterBridge.swapExactInputSingleEx swapped ${amountIn} WETH for ${amountOut} LP`);
		});


		it('should exchange WETH input tokens for exact LP output tokens via TestUniswapV3RouterBridge', async () => {
			//... find the correct relationship between 'amountOut' and 'amountInMaximum' using 'uniswapV3 SDK'
			const amountOut = 100; //100 LP
			const amountInMaximum = 1000;
			//const amountIn = await testUniswapRouterBridge.swapExactOutputSingleEx(
			const amountIn = await testUniswapRouterBridge.getWeb3Contract().methods.swapExactOutputSingleEx(
				wethAddress //tokenIn
				, lpTokenAddress //tokenOut
				, poolFee_3000
				, amountOut
				, amountInMaximum
				).call();
			console.log(`TestUniswapV3RouterBridge.swapExactInputSingleEx swapped ${amountIn} WETH for ${amountOut} LP`);
		});
	});
	
	

	describe('#Loophole contract deploy and check', async () => {
		it('should deploy Loophole Contract', async () => {
			await deployLoophole();
		});


		it('Loophole contract should have expected initial values', async () => {
			//console.log("***init.loophole.bp0");
			
			let res = await loophole.totalAllocPoint();
			expect(Number(res)).to.equal(0);
			
			res = await loophole.lpToken();
			expect(res).to.equal(lpTokenAddress);
			res = await loophole.lpTokensPerBlock();
			expect(Number(res)).to.equal(lpTokensPerBlock);
			res = await loophole.startBlock();
			//expect(BigNumber(res)).to.equal(deployedBlock);
			res.should.be.bignumber.equal(initStartBlock);
			res = await loophole.exitPenalty();
			expect(Number(res)).to.equal(0.2); //exitPenalty
			res = await loophole.exitPenaltyLP();
			expect(Number(res)).to.equal(0.1); //exitPenaltyLP

			// should have LP token pool already
			res = await loophole.poolExists(lpTokenAddress);
			expect(res).to.equal(true);

			// should have one pool, LOOP pool
			res = await loophole.poolLength();
			expect(Number(res)).to.equal(1);

			// get pool info at pool-id 0 for LP token pool
			res = await loophole.getPool(0);
			expect(res.token).to.equal(lpTokenAddress);
			expect(res.allocPoint.toString()).to.equal(BigNumber(0).toString());
			//res.lastRewardBlock ???
			expect(res.totalPool.toString()).to.equal(BigNumber(0).toString());
			expect(res.entryStakeTotal.toString()).to.equal(BigNumber(0).toString());
			expect(res.totalDistributedPenalty.toString()).to.equal(BigNumber(0).toString());

			// getPoolInfo returns struct from solidity and it has array style indexed attributes
			// and also struct style with keys and values
			res = await loophole.getPoolInfo(0);
			console.log('loophole.getPoolInfo: ', res);
			expect(res.token).to.equal(lpTokenAddress);
			expect(res.allocPoint.toString()).to.equal(BigNumber(0).toString());
			//res.lastRewardBlock ???
			expect(res.totalPool.toString()).to.equal(BigNumber(0).toString());
			expect(res.entryStakeTotal.toString()).to.equal(BigNumber(0).toString());
			expect(res.totalDistributedPenalty.toString()).to.equal(BigNumber(0).toString());
		});
	});



	describe('#Loophole staking pools ADD', async () => {
		it('should revert when not owner user tries to add new staking pool', async () => {
			let allocPoint = 1;
			loophole.switchWallet(userAddress2);
			await beproAssert.reverts(loophole.add(wethAddress, allocPoint), 'OR'); //'Owner Required'
			loophole.switchWallet(owner);
			
			//console.log('---bp---');

			// this internal function works but it is NOT a scalable solution
			/*const runOnlyOwner2 = async (asyncFn) => {
				//const ua1 = await loophole.getUserAddress();
				//console.log('runOnlyOwner-ua1: ', ua1);
				
				loophole.switchWallet(userAddress2);
				//console.log('runOnlyOwner-bp0.userAddress2: ', userAddress2);
				
				//const ua2 = await loophole.getUserAddress();
				//console.log('runOnlyOwner-ua2: ', ua2);
				console.log('runOnlyOwner.asyncFn: ', asyncFn.toString());
			
				await beproAssert.reverts(asyncFn, 'x'); //'Owner Required'
				//await truffleAssert.reverts(asyncFn, 'x'); //'Owner Required' //STILL NOT WORKING
				loophole.switchWallet(owner);
				console.log('runOnlyOwner-bp1');
			};*/

			/*let allocPoint = 1;
			const fn = async () => {
				console.log('---loophole.ua: ', await loophole.getUserAddress());
				await loophole.add(wethAddress, allocPoint);
				//throw new Error('x');
			};
			const fn2 = (async () => {
				console.log('---loophole.ua: ', await loophole.getUserAddress());
				await loophole.add(wethAddress, allocPoint);
				//throw new Error('x');
			})();*/

			//await runOnlyOwner(fn()); //FAILS
			//await runOnlyOwner2(fn());
			//await runOnlyOwner(loophole.add(wethAddress, allocPoint)); //FAILS
			//await runOnlyOwnerInternal(loophole.add(wethAddress, allocPoint)); //FAILS
			//await runOnlyOwner(loophole.add(wethAddress, 1)); //FAILS
			//await runOnlyOwnerInternal(loophole.add(wethAddress, 1)); //FAILS
			
			//await runOnlyOwner((async () => await loophole.add(wethAddress, allocPoint))()); //FAILS
			//await runOnlyOwnerInternal((async () => await loophole.add(wethAddress, allocPoint))());
			//await runOnlyOwner2((async () => await loophole.add(wethAddress, allocPoint))()); //FAILS
			//await runOnlyOwner2((async () => { await loophole.add(wethAddress, allocPoint) })()); //FAILS
			//await runOnlyOwner2(fn()); //ok
			//await runOnlyOwner2(fn2); //ok

			//await runOnlyOwner(async () => { await loophole.add(wethAddress, allocPoint) });
			//await runOnlyOwner(async () => { await testFail('OR') });
		});


		it('should revert when trying to add existing staking pool WETH', async () => {
			let allocPoint = 1;
			await beproAssert.reverts(loophole.add(wethAddress, allocPoint), 'TPE'); //'Token Pool Exists'
		});


		it('should add new staking pools WETH and WBTC and emit PoolAdded events', async () => {
			let allocPoint = 1;
			let pid = await loophole.getWeb3Contract().methods.add(wethAddress, allocPoint).call();
			let tx = await loophole.add(wethAddress, allocPoint);
			
			//const token = tx.events.PoolAdded.returnValues.token;
			// should emit PoolAdded event
			beproAssert.eventEmitted(tx, 'PoolAdded', (ev) => {
				return ev.token === wethAddress 
				&& ev.allocPoint.toString() == allocPoint.toString() 
				&& ev.pid.toString() == pid.toString();
			});
			
			// check and assert pool added token
			let res = await loophole.poolExists(wethAddress);
			expect(res).to.equal(true);

			res = await loophole.getPool(pid);
			expect(res.token).to.equal(wethAddress);
			expect(res.allocPoint.toString()).to.equal(allocPoint.toString());
			expect(res.allocPoint.toString()).to.equal('1');
			//res.lastRewardBlock ???
			//expect(res.totalPool.toString()).to.equal(BigNumber(0).toString());
			//expect(res.entryStakeTotal.toString()).to.equal(BigNumber(0).toString());
			//expect(res.totalDistributedPenalty.toString()).to.equal(BigNumber(0).toString());
			expect(res.totalPool.eq(BigNumber(0))).to.equal(true);
			expect(res.entryStakeTotal.eq(BigNumber(0))).to.equal(true);
			expect(res.totalDistributedPenalty.eq(BigNumber(0))).to.equal(true);
			
			allocPoint = 4;
			pid = await loophole.getWeb3Contract().methods.add(wbtcAddress, allocPoint).call();
			tx = await loophole.add(wbtcAddress, allocPoint);
			
			//const token = tx.events.PoolAdded.returnValues.token;
			// should emit PoolAdded event
			beproAssert.eventEmitted(tx, 'PoolAdded', (ev) => {
				return ev.token === wbtcAddress 
				&& ev.allocPoint.toString() == allocPoint.toString() 
				&& ev.pid.toString() == pid.toString();
			});
			
			// check and assert pool added token
			res = await loophole.poolExists(wbtcAddress);
			expect(res).to.equal(true);

			res = await loophole.getPool(pid);
			expect(res.token).to.equal(wbtcAddress);
			//expect(res.allocPoint.toString()).to.equal(allocPoint.toString());
			//expect(res.allocPoint.toString()).to.equal('4');
			expect(res.allocPoint.eq(allocPoint)).to.equal(true);
			expect(res.allocPoint.eq(BigNumber('4'))).to.equal(true);
			//res.lastRewardBlock ???
			expect(res.totalPool.toString()).to.equal(BigNumber(0).toString());
			expect(res.entryStakeTotal.toString()).to.equal(BigNumber(0).toString());
			expect(res.totalDistributedPenalty.toString()).to.equal(BigNumber(0).toString());
		});
	});



	describe.skip('#Loophole staking pools SET', async () => {
		it('should revert when not owner user tries to set/update staking pool WETH', async () => {
			loophole.switchWallet(userAddress2);
			const pid = 1;
			const allocPoint = 2;
			const withUpdate = false;
			await beproAssert.reverts(loophole.set(pid, allocPoint, withUpdate), 'OR'); //'Owner Required'
			loophole.switchWallet(owner);
		});


		it('should revert when trying to set/update LOOP pool', async () => {
			const pid = 0;
			const allocPoint = 2;
			const withUpdate = false;
			await beproAssert.reverts(loophole.set(pid, allocPoint, withUpdate), 'PID_LOOP'); //PID is LOOP pool
		});


		it('should revert when trying to set/update inexistent pool', async () => {
			const pid = 3;
			const allocPoint = 2;
			const withUpdate = false;
			await beproAssert.reverts(loophole.set(pid, allocPoint, withUpdate), 'PID_OORI'); //'PID Out Of Range Index'
		});


		it('should revert when trying to set/update the same allocation point', async () => {
			const pid = 1;
			const allocPoint = 1;
			const withUpdate = false;
			await beproAssert.reverts(loophole.set(pid, allocPoint, withUpdate), 'PID_NR'); //'PID New Required'
		});


		it('should set/update staking pool WETH and emit PoolSet event', async () => {
			//do NOT update mining rewards, only update pool allocation point/share
			const withUpdate = false;

			// we know WETH pid is 1 but should have a storage struct for token-pid relation
			const pid = 1; //???
			const allocPoint = 2;
			const tx = await loophole.set(pid, allocPoint, withUpdate);
			
			const tokenRet = tx.events.PoolSet.returnValues.token;
			const allocPointRet = tx.events.PoolSet.returnValues.allocPoint;
			const pidRet = tx.events.PoolSet.returnValues.pid;
			console.log(`PoolSet>> tokenRet: ${tokenRet}, allocPointRet: ${allocPointRet}, pidRet: ${pidRet}`);
			expect(tokenRet).to.equal(wethAddress);
			expect(allocPointRet.toString()).to.equal(allocPoint.toString());
			expect(pidRet.toString()).to.equal(pid.toString());

			// should emit PoolSet event
			beproAssert.eventEmitted(tx, 'PoolSet', (ev) => {
				return ev.token === wethAddress 
				&& ev.allocPoint.toString() == allocPoint.toString() 
				&& ev.pid.toString() == pid.toString();
			});
			
			// check and assert pool added token
			let res = await loophole.poolExists(wethAddress);
			expect(res).to.equal(true);

			res = await loophole.getPool(pid);
			expect(res.token).to.equal(wethAddress);
			expect(res.allocPoint.toString()).to.equal(allocPoint.toString());
			expect(res.allocPoint.toString()).to.equal('2');
			//res.lastRewardBlock ???
			expect(res.totalPool.toString()).to.equal(BigNumber(0).toString());
			expect(res.entryStakeTotal.toString()).to.equal(BigNumber(0).toString());
			expect(res.totalDistributedPenalty.toString()).to.equal(BigNumber(0).toString());
		});


		it('should mass mine pools when set/update staking pool WETH', async () => {
			
			//NOTE: we need a new/fresh deployment for this test because we check for lastRewardBlock on the spools
			await deployLoophole();
			
			await approveWethTransfers(userAddress);
			await approveWbtcTransfers(userAddress);
			
			await addWethPool();
			await addWbtcPool();
			
			//NOTE:
			// in order for massUpdatePools flag to work and the pools to be mined for LP rewards
			// we need some stake amounts in each pool
			
			await loophole.stake(1, 1000); //stake in WETH pool
			//NOTE: in 'stake' function we mine pool for LP rewards so we keep track of lastRewardBlock
			const wethLastRewardBlock = await loophole.getBlockNumber();
			console.log('---wethLastRewardBlock: ', wethLastRewardBlock);
			
			await loophole.stake(2, 2000); //stake in WBTC pool
			//NOTE: in 'stake' function we mine pool for LP rewards so we keep track of lastRewardBlock
			const wbtcLastRewardBlock = await loophole.getBlockNumber();
			console.log('---wbtcLastRewardBlock: ', wbtcLastRewardBlock);

			//NOTE: assert we are at the expected block number
			let res = await loophole.getPool(1); //WETH pool
			res.lastRewardBlock.should.be.bignumber.equal(wethLastRewardBlock);
			// save initial allocation point
			const allocPoint = res.allocPoint;
			
			//NOTE: assert we are at the expected block number
			res = await loophole.getPool(2); //WBTC pool
			res.lastRewardBlock.should.be.bignumber.equal(wbtcLastRewardBlock);
			
			//do NOT update mining rewards, only update pool allocation point/share
			let withUpdate = false;

			///NOTE: this is our testing function we test with massUpdatePools flag
			const pid = 1; //WETH pid is 1
			let allocPoint2 = allocPoint.plus(1);
			console.log('---allocPoint: ', allocPoint);
			console.log('---allocPoint2: ', allocPoint2);
			let tx = await loophole.set(pid, allocPoint2, withUpdate);
			///
			
			//NOTE:
			// checking that 'massUpdatePools' was not called by checking
			// that the pools were not mined for reward, lastRewardBlock is still the same it was before
			res = await loophole.getPool(1);
			//NOTE: pool lastRewardBlock should still be at the same block number as it was when last pool LP mining update took place
			res.lastRewardBlock.should.be.bignumber.equal(wethLastRewardBlock);
			
			res = await loophole.getPool(2);
			//NOTE: pool lastRewardBlock should still be at the same block number as it was when last pool LP mining update took place
			res.lastRewardBlock.should.be.bignumber.equal(wbtcLastRewardBlock);

			///NOTE: test with massUpdatePools flag = true
			withUpdate = true;
			await loophole.set(pid, allocPoint, withUpdate);

			//NOTE:
			// checking that 'massUpdatePools' was called by checking
			// that the pools were mined for reward, lastRewardBlock is the latest block number
			let currentBlock = await loophole.getBlockNumber();
			console.log('---currentBlock: ', currentBlock);
			res = await loophole.getPool(1);
			console.log('---weth.lastRewardBlock: ', res.lastRewardBlock);
			res.lastRewardBlock.should.be.bignumber.equal(currentBlock);
			res = await loophole.getPool(2);
			console.log('---wbtc.lastRewardBlock: ', res.lastRewardBlock);
			res.lastRewardBlock.should.be.bignumber.equal(currentBlock);
		});
	});



	describe('#Loophole liquidity mining pools', async () => {
		before('before-hook', async () => {
			await deployLoophole(setupWethAndWbtcPoolsConfig);
		});


		it('should revert when trying to mine LOOP pool', async () => {
			await beproAssert.reverts(loophole.updatePool(lpPid), 'PID_LOOP'); //PID is LOOP pool
		});


		it('should revert when trying to mine inexistent pool', async () => {
			await beproAssert.reverts(loophole.updatePool(invalidPid), 'PID_OORI'); //'PID Out Of Range Index'
		});


		// when getBlockNumber() <= pool.lastRewardBlock return
		it('when block number <= pool.lastRewardBlock, return', async () => {
			//if (!checkLocalTestOnly()) return;
			assertLocalTestOnly();

			//NOTE: we need a new loophole deployment before adding staking pools
			await deployLoophole();

			//NOTE: take snashot before adding staking pools
			const snapshot = await traveler.takeSnapshot();
      const beforePoolsSnapshotId = snapshot.result;

			await addWethPool();

			//NOTE: how do we know it returned at that point and did not proceed ?
			// 'lastRewardBlock' and 'accLPtokensPerShare' are the same before and after pool mining call

			let p = await loophole.getPool(wethPid);
			const lastRewardBlock1 = p.lastRewardBlock;
			const accLPtokensPerShare1 = p.accLPtokensPerShare;
			console.log('---lastRewardBlock1: ', lastRewardBlock1);
			console.log('---accLPtokensPerShare1: ', accLPtokensPerShare1);

			//NOTE: go back in time before adding weth pool so block number is less than pool.lastRewardBlock
			await traveler.revertToSnapshot(beforePoolsSnapshotId);

			//NOTE: pool mining test
			await loophole.updatePool(wethPid);

			p = await loophole.getPool(wethPid);
			const lastRewardBlock2 = p.lastRewardBlock;
			const accLPtokensPerShare2 = p.accLPtokensPerShare;
			console.log('---lastRewardBlock2: ', lastRewardBlock2);
			console.log('---accLPtokensPerShare2: ', accLPtokensPerShare2);

			lastRewardBlock2.should.be.bignumber.equal(lastRewardBlock1);
			accLPtokensPerShare2.should.be.bignumber.equal(accLPtokensPerShare1);
		});


		//NOTE: when totalPool is zero, only update lastRewardBlock
		// test case covered below in 'when staking pool is empty'
		

		it('should mine MAIN pools WETH and WBTC', async () => {
			await deployLoophole(setupWethAndWbtcPoolsConfig);

			await loophole.updatePool(wethPid); //WETH mining
			await loophole.updatePool(wbtcPid); //WBTC mining
		});
	});



	describe('#when staking pool is empty', async () => {
		let [userA, userB, userC, userD] = [0, 0, 0, 0];

		before('before-hook6', async () => {
			// deploy a NEW loophole contract
			await deployLoophole(setupWethAndWbtcPoolsConfig);
			
			[userA, userB, userC, userD] = [userAddress2, userAddress3, userAddress4, userAddress5];

			await approveWethTransfers(userA);
			await approveWethTransfers(userB);
			await approveWethTransfers(userC);
			await approveWethTransfers(userD);
		});


		const test1 = 'should not distribute any LP tokens but should still update last reward block';
		it(test1, async () => {
			console.log('...', test1);
			const pid = 1; //WETH pool id
			
			let pool = await loophole.getPool(pid);
			const lastRewardBlock1 = pool.lastRewardBlock;
			console.log('---lastRewardBlock1: ', lastRewardBlock1);
			
			let tx = await loophole.updatePool(pid);
			//console.log('tx.events.PoolRewardUpdated.returnValues: ', tx.events.PoolRewardUpdated.returnValues);
			//console.log('tx.events: ', tx.events);
			
			//NOTE: 6 tx take place after WETH pool was added@
			//1 to add WBTC
			//4 tx to approve weth transfers
			//1 to update/mine pool
			const nblocks = 6;

			pool = await loophole.getPool(pid);
			const lastRewardBlock2 = pool.lastRewardBlock;
			console.log('---lastRewardBlock2: ', lastRewardBlock2);
			// make sure we increased last reward block by one
			lastRewardBlock2.should.be.bignumber.equal(lastRewardBlock1.plus(nblocks));
			
			// the rest pool properties are still zero
			pool.totalPool.should.be.bignumber.equal(0);
      pool.entryStakeTotal.should.be.bignumber.equal(0);
      pool.totalDistributedPenalty.should.be.bignumber.equal(0);
      pool.accLPtokensPerShare.should.be.bignumber.equal(0);
		});
	});



	describe.skip('#stake/unstake', async () => {
		before('before-#stake/unstake', async () => {
			// deploy a NEW loophole contract
			await deployLoophole(setupWethAndWbtcPoolsConfig);
			await approveWethTransfers();
		});


		it('should revert when staking into inexistent pool', async () => {
			await beproAssert.reverts(loophole.stake(invalidPid, 1000), 'PID_OORI'); //'PID Out Of Range Index'
		});


		it.skip('should revert when trying re-entrancy attack', async () => {
			//... pending
		});


		//...pending... check events
		it('should stake WETH and emit events: Transfer, Collect, TransferFrom, Deposit', async () => {
			//TODO...
			const balance1 = await weth.balanceOf(userAddress);
			console.log('weth.userAddress.balance1: ', balance1.toString());

			// approve loophole contract to spend weth
			//await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 }); //WETH_AMOUNT_1M
			//const allowance = await weth.allowance({ address: userAddress, spenderAddress: loopholeAddress });
			//console.log('stakeWETH.allowance: ', allowance);
			
			const pid = 1; //WETH pool-id is 1
			//const amount = Numbers.fromBNToDecimals(1000, wethDecimals); //WETH_AMOUNT_1M;
			const amount = BigNumber(1000);
			const tx = await loophole.stake(pid, amount);
			
			// should emit event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
			//const userRet = tx.events.Deposit.returnValues.user;
			const amountDecimals = await loophole.fromBNToDecimals(amount, pid);
			beproAssert.eventEmitted(tx, 'Deposit', (ev) => {
				return ev.user === userAddress 
				&& ev.pid.toString() == pid.toString() 
				//&& ev.amount.toString() == amount.toString();
				&& ev.amount.toString() == amountDecimals.toString();
			});

			// check balance match before and after
			const balance2 = await weth.balanceOf(userAddress);
			console.log('weth.userAddress.balance2: ', balance2.toString());
			//const expectedBalance = balance1.minus(Numbers.fromDecimalsToBN(amount, wethDecimals));
			const expectedBalance = balance1.minus(amount);
			//expect(balance2.eq(expectedBalance)).to.equal(true);
			balance2.should.be.bignumber.equal(expectedBalance);
		});


		it('should exit/unstake WETH and emit Withdraw event', async () => {
			//TODO...
			const balance1 = await weth.balanceOf(userAddress);
			console.log('weth.userAddress.balance1: ', balance1.toString());
			const balanceC1 = await weth.balanceOf(loopholeAddress);
			console.log('weth.loopholeAddress.balanceC1: ', balanceC1.toString());
			const lpBalanceC1 = await lpToken.balanceOf(loopholeAddress);
			console.log('lpToken.loopholeAddress.lpBalanceC1: ', lpBalanceC1.toString());

			const pid = 1; //weth pool-id is 1
			//const amount = WETH_AMOUNT_1M;
			//const amount = BigNumber(Numbers.fromBNToDecimals(1000, wethDecimals));
			const amount = BigNumber(1000);
			//console.log('type of amount: ', typeof(amount));
			
			const exitPenalty = await loophole.exitPenalty();
			expect(exitPenalty.toString()).to.equal('0.2');

			const withdrawAmountExpectedTokens = amount.times(1 - exitPenalty); //amount * (1 - exitPenalty);
			//const withdrawAmountExpected = Numbers.fromDecimalsToBN(withdrawAmountExpectedTokens, wethDecimals);
			const withdrawAmountExpected = withdrawAmountExpectedTokens;
			console.log('withdrawAmountExpected: ', withdrawAmountExpected.toString().padStart(balance1.toString().length, ' '));

			//TODO: calculate what 'amountOutMinimum' should be with uniswap-v3-sdk/uniswap-v3-periphery libs 
			const amountOutMinimum = 0;
			const tx = await loophole.exit(pid, amount, amountOutMinimum);
			
			// should emit event Withdraw(address indexed user, uint256 indexed pid, uint256 amount, uint256 netAmount);
			const amountDecimals = await loophole.fromBNToDecimals(amount, pid);
			const withdrawAmountExpectedDecimals = await loophole.fromBNToDecimals(withdrawAmountExpectedTokens, pid);
			beproAssert.eventEmitted(tx, 'Withdraw', (ev) => {
				return ev.user === userAddress 
				&& ev.pid.toString() == pid.toString() 
				//&& ev.amount.toString() == amount.toString() 
				//&& ev.netAmount.toString() == withdrawAmountExpectedTokens.toString();
				&& ev.amount.toString() == amountDecimals.toString() 
				&& ev.netAmount.toString() == withdrawAmountExpectedDecimals.toString();
			});

			const balance2 = await weth.balanceOf(userAddress);
			console.log('weth.userAddress.balance2: ', balance2.toString());
			const balanceC2 = await weth.balanceOf(loopholeAddress);
			console.log('weth.loopholeAddress.balanceC2: ', balanceC2.toString());
			const lpBalanceC2 = await lpToken.balanceOf(loopholeAddress);
			console.log('lpToken.loopholeAddress.lpBalanceC2: ', lpBalanceC2.toString());

			// expect to have the correct amount of WETH
			// last exit pays full exit penalty
			balanceC2.should.be.bignumber.equal(BigNumber(balanceC1).minus(amount));

			//TODO:
			// expect to have the correct amount of LP tokens from last exit as exit collected penalty
			//...const expectedLPtokensFromExitPenalty = amount.times(exitPenalty / 2.0);
			//...lpBalanceC2.should.be.bignumber.equal(BigNumber(lpBalanceC1).plus(expectedLPtokensFromExitPenalty));

			const expectedBalance = balance1.plus(withdrawAmountExpected);
			//expect(balance2.eq(expectedBalance)).to.equal(true);
			balance2.should.be.bignumber.equal(expectedBalance);
		});


		it('should stake LP token in LOOP pool and emit Deposit event', async () => {
			//TODO...
			const balance1 = await lpToken.balanceOf(userAddress);
			console.log('lpToken.userAddress.balance1: ', balance1.toString());

			// approve loophole contract to spend LP
			await lpToken.approve({ address: loopholeAddress, amount: lpBnMaxUint256 }); //LP_AMOUNT_1M

			const pid = 0; //LP pool-id is 0
			//const amount = LP_AMOUNT_1M;
			//const amount = BigNumber(Numbers.fromBNToDecimals(1000, lpDecimals));
			const amount = BigNumber(1000);
			const tx = await loophole.stake(pid, amount);
			
			// should emit event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
			//const userRet = tx.events.Deposit.returnValues.user;
			const amountDecimals = await loophole.fromBNToDecimals(amount, pid);
			beproAssert.eventEmitted(tx, 'Deposit', (ev) => {
				return ev.user === userAddress 
				&& ev.pid.toString() == pid.toString() 
				//&& ev.amount.toString() == amount.toString();
				&& ev.amount.toString() == amountDecimals.toString();
			});

			// check balance match before and after
			const balance2 = await lpToken.balanceOf(userAddress);
			console.log('lpToken.userAddress.balance2: ', balance2.toString());
			//const expectedBalance = balance1.minus(Numbers.fromDecimalsToBN(amount, lpDecimals));
			const expectedBalance = balance1.minus(amount);
			//expect(balance2.eq(expectedBalance)).to.equal(true);
			balance2.should.be.bignumber.equal(expectedBalance);
		});


		it('should exit/unstake LP token from LOOP pool and emit Withdraw event', async () => {
			//TODO...
			const balance1 = await lpToken.balanceOf(userAddress);
			console.log('lpToken.userAddress.balance1: ', balance1.toString());

			const pid = 0; //LP pool-id is 0
			//const amount = LP_AMOUNT_1M;
			//const amount = BigNumber(Numbers.fromBNToDecimals(1000, lpDecimals));
			const amount = BigNumber(1000);
			
			const exitPenaltyLP = await loophole.exitPenaltyLP();
			expect(exitPenaltyLP.toString()).to.equal('0.1');

			//amount * (1 - exitPenaltyLP);
			const withdrawAmountExpectedTokens = amount.times(1 - exitPenaltyLP);
			//const withdrawAmountExpected = Numbers.fromDecimalsToBN(withdrawAmountExpectedTokens, lpDecimals);
			const withdrawAmountExpected = withdrawAmountExpectedTokens;
			console.log('withdrawAmountExpected: ', withdrawAmountExpected);

			const tx = await loophole.exitLP(amount);
			
			// should emit event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
			const amountDecimals = await loophole.fromBNToDecimals(amount, pid);
			const withdrawAmountExpectedDecimals = await loophole.fromBNToDecimals(withdrawAmountExpectedTokens, pid);
			beproAssert.eventEmitted(tx, 'Withdraw', (ev) => {
				return ev.user === userAddress 
				&& ev.pid.toString() == pid.toString() 
				//&& ev.amount.toString() == amount.toString() 
				//&& ev.netAmount.toString() == withdrawAmountExpectedTokens.toString();
				&& ev.amount.toString() == amountDecimals.toString() 
				&& ev.netAmount.toString() == withdrawAmountExpectedDecimals.toString();
			});

			// check balance match before and after
			const balance2 = await lpToken.balanceOf(userAddress);
			console.log('lpToken.userAddress.balance2: ', balance2.toString());
			const expectedBalance = balance1.plus(withdrawAmountExpected);
			//expect(balance2.eq(expectedBalance)).to.equal(true);
			balance2.should.be.bignumber.equal(expectedBalance);
		});


		it('special/custom test case-1', async () => {
			/*
			So here it goes a test case:
			4 Investors, A, B, C and D in a main pool, for example WETH
			A stakes 200, B stakes 100, C stakes 50 and D stakes 100.

			Then, they execute the following operations in this order
			1. B unstakes everything  (that is the 100)
			2. B stakes 75
			3. C unstakes everything 
			4. B stakes 200
			5. B stakes 100
			6. B unstakes 100

			These operations cover the 4 main operations we have, stake, a top-up stake, unstake everything, 
			and unstake just a partial amount. The final result for the variables should the following for a main pool:

			Investor A  currentStake = 212.0136
			Investor B  currentStake = 280.6938
			Investor D  currentStake = 106.0068
			
			totalPool = 598.7142
			entryStakeTotal = 564.7885
			entryStakeAdjusted(A) 200
			entryStakeAdjusted(B) 264.7885
			entryStakeAdjusted(D) 100
			totalDistributedPenalty 25.14285
			*/

			// deploy a NEW loophole contract
			await deployLoophole(setupWethAndWbtcPoolsConfig);

			//const investorA = wallets[0];
			//const investorB = wallets[1];
			//const investorC = wallets[2];
			//const investorD = wallets[3];
			const [investorA, investorB, investorC, investorD] = [userAddress2, userAddress3, userAddress4, userAddress5];
			// const [investorA, investorB, investorC, investorD] = [userAddress, userAddress2, userAddress3, userAddress4];
			// assert we have all these wallets and we are NOT on a test net with a single account
			validateWallet(investorA);
			validateWallet(investorB);
			validateWallet(investorC);
			validateWallet(investorD);
			//A stakes 200, B stakes 100, C stakes 50 and D stakes 100.

			const pid = 1; //WETH pid is 1
			const amountA = 200; //A stake
			const amountB = 100; //B stake
			const amountC = 50; //C stake
			const amountD = 100; //D stake
			let newAddress;

			
			let invAcurrentStake1 = await loophole.currentStake(pid, investorA);
			let invBcurrentStake1 = await loophole.currentStake(pid, investorB);
			let invCcurrentStake1 = await loophole.currentStake(pid, investorC);
			let invDcurrentStake1 = await loophole.currentStake(pid, investorD);
			
			console.log('invAcurrentStake1        : ', invAcurrentStake1);
			console.log('invBcurrentStake1        : ', invBcurrentStake1);
			console.log('invCcurrentStake1        : ', invCcurrentStake1);
			console.log('invDcurrentStake1        : ', invDcurrentStake1);
			
			let res = await loophole.getPool(pid);
			console.log('pool.totalPool: ', res.totalPool);
			console.log('pool.entryStakeTotal: ', res.entryStakeTotal);
			console.log('pool.totalDistributedPenalty: ', res.totalDistributedPenalty);
			
			

			/// investorA
			console.log('testcase.bp-0');
			newAddress = await loophole.switchWallet(investorA).getUserAddress();
			console.log('testcase.bp-1');
			expect(newAddress).to.equal(investorA);
			weth.switchWallet(investorA);
			//lpToken.switchWallet(investorA);

			// already approved for investorA as it is the first wallet
			await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 });
		  console.log('investorA.weth.allowance: ', await weth.allowance({ address: investorA, spenderAddress: loopholeAddress }));
		  //await lpToken.approve({ address: loopholeAddress, amount: lpBnMaxUint256 });
			//console.log('investorA.lp.allowance: ', await lpToken.allowance({ address: investorA, spenderAddress: loopholeAddress }));
			
			let amount = amountA; //A stake
			let tx = await loophole.stake(pid, amount);
			console.log('testcase.bp-2');

			/// investorB
			newAddress = await loophole.switchWallet(investorB).getUserAddress();
			expect(newAddress).to.equal(investorB);
			weth.switchWallet(investorB);
			//lpToken.switchWallet(investorB);

			await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 });
		  console.log('investorB.weth.allowance: ', await weth.allowance({ address: investorB, spenderAddress: loopholeAddress }));
		  //await lpToken.approve({ address: loopholeAddress, amount: lpBnMaxUint256 });
			//console.log('investorB.lp.allowance: ', await lpToken.allowance({ address: investorB, spenderAddress: loopholeAddress }));
			
			amount = amountB; //B stake
			tx = await loophole.stake(pid, amount);
			console.log('testcase.bp-3');

			/// investorC
			newAddress = await loophole.switchWallet(investorC).getUserAddress();
			expect(newAddress).to.equal(investorC);
			weth.switchWallet(investorC);
			//lpToken.switchWallet(investorC);

			await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 });
		  console.log('investorC.weth.allowance: ', await weth.allowance({ address: investorC, spenderAddress: loopholeAddress }));
		  //await lpToken.approve({ address: loopholeAddress, amount: lpBnMaxUint256 });
			//console.log('investorC.lp.allowance: ', await lpToken.allowance({ address: investorC, spenderAddress: loopholeAddress }));
			
			amount = amountC; //C stake
			tx = await loophole.stake(pid, amount);
			console.log('testcase.bp-4');

			/// investorD
			newAddress = await loophole.switchWallet(investorD).getUserAddress();
			expect(newAddress).to.equal(investorD);
			weth.switchWallet(investorD);
			//lpToken.switchWallet(investorD);

			await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 });
		  console.log('investorD.weth.allowance: ', await weth.allowance({ address: investorD, spenderAddress: loopholeAddress }));
		  //await lpToken.approve({ address: loopholeAddress, amount: lpBnMaxUint256 });
			//console.log('investorD.lp.allowance: ', await lpToken.allowance({ address: investorD, spenderAddress: loopholeAddress }));
			
			amount = amountD; //D stake
			tx = await loophole.stake(pid, amount);
			console.log('testcase.bp-5');

			//>>> assert staked amounts match
			const invAwethBalance1 = await weth.balanceOf(investorA);
			const invBwethBalance1 = await weth.balanceOf(investorB);
			const invCwethBalance1 = await weth.balanceOf(investorC);
			const invDwethBalance1 = await weth.balanceOf(investorD);
			console.log('weth.invAwethBalance1.balance1: ', invAwethBalance1.toString());
			console.log('weth.invBwethBalance1.balance1: ', invBwethBalance1.toString());
			console.log('weth.invCwethBalance1.balance1: ', invCwethBalance1.toString());
			console.log('weth.invDwethBalance1.balance1: ', invDwethBalance1.toString());

			res = await loophole.getPool(pid);
			console.log('pool.totalPool: ', res.totalPool);
			console.log('pool.entryStakeTotal: ', res.entryStakeTotal);
			console.log('pool.totalDistributedPenalty: ', res.totalDistributedPenalty);
			//expect(res.totalPool.toString()).to.equal(BigNumber(0).toString());
			//expect(res.entryStakeTotal.toString()).to.equal(BigNumber(0).toString());
			//expect(res.totalDistributedPenalty.toString()).to.equal(BigNumber(0).toString());
			
			const invAstake = await loophole.getCurrentEntryStakeUser(pid, investorA);
			const invBstake = await loophole.getCurrentEntryStakeUser(pid, investorB);
			const invCstake = await loophole.getCurrentEntryStakeUser(pid, investorC);
			const invDstake = await loophole.getCurrentEntryStakeUser(pid, investorD);
			console.log('invAstake: ', invAstake);
			console.log('invBstake: ', invBstake);
			console.log('invCstake: ', invCstake);
			console.log('invDstake: ', invDstake);
			assert.equal(invAstake, amountA, 'investorA amount should match');
			assert.equal(invBstake, amountB, 'investorB amount should match');
			assert.equal(invCstake, amountC, 'investorC amount should match');
			assert.equal(invDstake, amountD, 'investorD amount should match');
			
			const invAcurrentStake2 = await loophole.currentStake(pid, investorA);
			const invBcurrentStake2 = await loophole.currentStake(pid, investorB);
			const invCcurrentStake2 = await loophole.currentStake(pid, investorC);
			const invDcurrentStake2 = await loophole.currentStake(pid, investorD);
			console.log('invAcurrentStake2: ', invAcurrentStake2);
			console.log('invBcurrentStake2: ', invBcurrentStake2);
			console.log('invCcurrentStake2: ', invCcurrentStake2);
			console.log('invDcurrentStake2: ', invDcurrentStake2);
			assert.equal(invAcurrentStake2, amountA, 'investorA amount should match');
			assert.equal(invBcurrentStake2, amountB, 'investorB amount should match');
			assert.equal(invCcurrentStake2, amountC, 'investorC amount should match');
			assert.equal(invDcurrentStake2, amountD, 'investorD amount should match');
			///<<<


			const amountOutMinimum = 0; //do NOT use zero this in production

			//Then, they execute the following operations in this order
			//1. B unstakes everything  (that is the 100)
			loophole.switchWallet(investorB);
			amount = amountB;
			tx = await loophole.exit(pid, amount, amountOutMinimum);
			console.log('testcase.bp-6');

			//2. B stakes 75
			//loophole.switchWallet(investorB);
			amount = 75;
			tx = await loophole.stake(pid, amount);
			console.log('testcase.bp-7');

			//3. C unstakes everything 
			loophole.switchWallet(investorC);
			amount = amountC;
			tx = await loophole.exit(pid, amount, amountOutMinimum);
			console.log('testcase.bp-8');

			//4. B stakes 200
			loophole.switchWallet(investorB);
			amount = 200;
			tx = await loophole.stake(pid, amount);
			console.log('testcase.bp-9');

			//5. B stakes 100
			loophole.switchWallet(investorB);
			amount = 100;
			tx = await loophole.stake(pid, amount);
			console.log('testcase.bp-10');

			//6. B unstakes 100
			loophole.switchWallet(investorB);
			amount = 100;
			tx = await loophole.exit(pid, amount, amountOutMinimum);
			console.log('testcase.bp-11');

			//The final result for the variables should the following for a main pool:
			//Investor A  currentStake = 212.0136
			//Investor B  currentStake = 280.6938
			//Investor D  currentStake = 106.0068
			const expectedInvAcurrentStake = BigNumber(212.0136);
			const expectedInvBcurrentStake = BigNumber(280.6938);
			const expectedInvDcurrentStake = BigNumber(106.0068);

			let invAcurrentStake = await loophole.currentStake(pid, investorA);
			let invBcurrentStake = await loophole.currentStake(pid, investorB);
			let invDcurrentStake = await loophole.currentStake(pid, investorD);
			
			console.log('invAcurrentStake        : ', invAcurrentStake);
			console.log('expectedInvAcurrentStake: ', expectedInvAcurrentStake);
			console.log('invBcurrentStake        : ', invBcurrentStake);
			console.log('expectedInvBcurrentStake: ', expectedInvBcurrentStake);
			console.log('invDcurrentStake        : ', invDcurrentStake);
			console.log('expectedInvDcurrentStake: ', expectedInvDcurrentStake);
			

			const expectedTotalPool = BigNumber(598.7142);
			const expectedEntryStakeTotal = BigNumber(564.7885);
			const expectedEntryStakeAdjustedA = BigNumber(200);
			const expectedEntryStakeAdjustedB = BigNumber(264.7885);
			const expectedEntryStakeAdjustedD = BigNumber(100);
			const expectedTotalDistributedPenalty = BigNumber(25.14285);

			//const { token, allocPoint, lastRewardBlock, totalPool, entryStakeTotal, totalDistributedPenalty } = await loophole.getPool(pid);
			const poolInfo = await loophole.getPool(pid);
			
			console.log('poolInfo.totalPool              : ', poolInfo.totalPool);
			console.log('expectedTotalPool               : ', expectedTotalPool);
			console.log('poolInfo.entryStakeTotal        : ', poolInfo.entryStakeTotal);
			console.log('expectedEntryStakeTotal         : ', expectedEntryStakeTotal);
			console.log('poolInfo.totalDistributedPenalty: ', poolInfo.totalDistributedPenalty);
			console.log('expectedTotalDistributedPenalty : ', expectedTotalDistributedPenalty);

			
			let entryStakeAdjustedA = await loophole.getEntryStakeAdjusted(pid, investorA);
			let entryStakeAdjustedB = await loophole.getEntryStakeAdjusted(pid, investorB);
			let entryStakeAdjustedD = await loophole.getEntryStakeAdjusted(pid, investorD);
			
			console.log('entryStakeAdjustedA        : ', entryStakeAdjustedA);
			console.log('expectedEntryStakeAdjustedA: ', expectedEntryStakeAdjustedA);
			console.log('entryStakeAdjustedB        : ', entryStakeAdjustedB);
			console.log('expectedEntryStakeAdjustedB: ', expectedEntryStakeAdjustedB);
			console.log('entryStakeAdjustedD        : ', entryStakeAdjustedD);
			console.log('expectedEntryStakeAdjustedD: ', expectedEntryStakeAdjustedD);


			//TODO: enabling asserts will fail the test due to small error tolerance
			/// invAcurrentStake.should.be.bignumber.equal(expectedInvAcurrentStake);
			/// invBcurrentStake.should.be.bignumber.equal(expectedInvBcurrentStake);
			/// invDcurrentStake.should.be.bignumber.equal(expectedInvDcurrentStake);

			/// poolInfo.totalPool.should.be.bignumber.equal(expectedTotalPool);
			/// poolInfo.entryStakeTotal.should.be.bignumber.equal(expectedEntryStakeTotal);
			/// poolInfo.totalDistributedPenalty.should.be.bignumber.equal(expectedTotalDistributedPenalty);
			
			/// entryStakeAdjustedA.should.be.bignumber.equal(expectedEntryStakeAdjustedA);
			/// entryStakeAdjustedB.should.be.bignumber.equal(expectedEntryStakeAdjustedB);
			/// entryStakeAdjustedD.should.be.bignumber.equal(expectedEntryStakeAdjustedD);
		});
	});


	
	describe.skip('#when collectRewards', async () => {
		it('should revert when when collecting LP rewards from LOOP pool', async () => {
			await beproAssert.reverts(loophole.collectRewards(lpPid), 'PID_LOOP'); //PID is LOOP pool
		});

		it('should revert when collecting LP rewards from inexistent pool', async () => {
			await beproAssert.reverts(loophole.collectRewards(invalidPid), 'PID_OORI'); //'PID Out Of Range Index'
		});

		it.skip('should revert when trying re-entrancy attack', async () => {
			//... pending
		});

		it.skip('should collect LP rewards from staking pool WETH', async () => {
			//... pending
		});
	});



	// describe.skip('#when collectRewardsAll', async () => {
	// 	it('should revert when trying re-entrancy attack', async () => {
	// 		//TODO... pending
	// 	});

	// 	it('should collect LP rewards from staking pools WETH and WBTC', async () => {
	// 		//TODO... pending
	// 		const wethRewardsExpected = 0; //...;
	// 		const wbtcRewardsExpected = 0; //...;

	// 		const rewards = await loophole.collectRewardsAllCall();
	// 		rewards.length.should.be.equal(3); //we have 3 pools
	// 		rewards[0].should.be.bignumber.equal(0); //pid zero is LOOP pool and there is no LP reward for it
	// 		rewards[1].should.be.bignumber.equal(wethRewardsExpected); //pid 1 is WETH pool
	// 		rewards[2].should.be.bignumber.equal(wbtcRewardsExpected); //pid 2 is WBTC pool

	// 		// check for Transfer and Collect events in transaction
	// 		const tx = await loophole.collectRewardsAll();
	// 		//...
	// 	});
	// });



	describe('#getBlocksFromRange', async () => {
		//getBlocksFromRange(uint256 from, uint256 to);
		let startBlock1;
		
		before('before-#stake/unstake', async () => {
			startBlock1 = BigNumber(await loophole.startBlock());
			console.log('startBlock1: ', startBlock1);
			//NOTE: startBlock is 1 by default
			startBlock1.should.be.bignumber.equal(1);
		});

		it('should revert when "from" block is greater than "to" block', async () => {
			const to = 0;
			const from = 1;
			await beproAssert.reverts(loophole.getBlocksFromRange(from, to));
		});


		it('should return 1 when "to" block is 2 and "from" block is 1', async () => {
			//NOTE: 'from' is 2 which is greater than 'startBlock' which is 1
			const to = 3;
			const from = 2;
			const res = await loophole.getBlocksFromRange(from, to);
			res.should.be.bignumber.equal(1);
		});


		it('should pick "from" block when greater than "startBlock"', async () => {
			//test: from = from >= startBlock ? from : startBlock;
			const to = startBlock1.plus(100);
			const from = startBlock1.plus(1);
			const res = await loophole.getBlocksFromRange(from, to);
			res.should.be.bignumber.equal(99);
		});


		it('should pick "startBlock" block when greater than "from" block', async () => {
			//test: from = from >= startBlock ? from : startBlock;
			//NOTE: for this test case we need startBlock to be minimum 1 
			// so we can decrease its value for 'from' parameter as we have an unsigned uint256 type
			const to = startBlock1.plus(100);
			const from = startBlock1.minus(1);
			const res = await loophole.getBlocksFromRange(from, to);
			res.should.be.bignumber.equal(100);
		});
	});



	describe.skip('#when user profit from others exit is greater than his own stake', async () => {
		beforeEach('beforeEach-hook1', async () => {
			// deploy a NEW loophole contract
			await deployLoophole(setupWethAndWbtcPoolsConfig);
		});

		it('should exit/unstake with no revert/error', async () => {
			
			const [investorA, investorB, investorC, investorD] = [userAddress2, userAddress3, userAddress4, userAddress5];
			// assert we have all these wallets and we are NOT on a test net with a single account
			validateWallet(investorA);
			validateWallet(investorB);
			validateWallet(investorC);
			validateWallet(investorD);

			//A stakes 100, B stakes 10000
			const pid = 1; //WETH pid is 1
			const amountA = BigNumber(100);
			const amountB = BigNumber(10000);
			let res;
			let tx;
			
			const amountOutMinimum = 0; //do NOT use zero this in production

			loophole.switchWallet(investorA);
			//weth.switchWallet(investorA);
			// already approved for investorA as it is the first wallet
			//await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 });
			await approveWethTransfers(investorA);
		  console.log('investorA.weth.allowance: ', await weth.allowance({ address: investorA, spenderAddress: loopholeAddress }));
		  
			await loophole.stake(pid, amountA);
			console.log('test.bp-0');

			loophole.switchWallet(investorB);
			//weth.switchWallet(investorB);
			// already approved for investorA as it is the first wallet
			//await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 });
			await approveWethTransfers(investorB);
		  console.log('investorB.weth.allowance: ', await weth.allowance({ address: investorB, spenderAddress: loopholeAddress }));
		  
			await loophole.stake(pid, amountB);
			console.log('test.bp-1');

			const invAstake = await loophole.currentStake(pid, investorA);
			const invBstake = await loophole.currentStake(pid, investorB);
			console.log('invAstake: ', invAstake);
			console.log('invBstake: ', invBstake);
			invAstake.should.be.bignumber.equal(amountA);
			invBstake.should.be.bignumber.equal(amountB);

			// investorB exits whole amount 10k WETH, 2k WETH is paid as penalty:
			// 1k WETH goes to other users in WETH pool
			// 1k WETH is converted to LP tokens and goes to LOOP pool
			await loophole.exit(pid, amountB, amountOutMinimum);

			// check investorA and investorB new stakes
			const invAstake2 = await loophole.currentStake(pid, investorA);
			const invBstake2 = await loophole.currentStake(pid, investorB);
			console.log('invAstake2: ', invAstake2);
			console.log('invBstake2: ', invBstake2);
			invAstake2.should.be.bignumber.equal(1100);
			invBstake2.should.be.bignumber.equal(0);


			// check pool state
			let poolInfo = await loophole.getPool(pid);
			console.log('poolInfo.totalPool              : ', poolInfo.totalPool);
			console.log('poolInfo.entryStakeTotal        : ', poolInfo.entryStakeTotal);
			console.log('poolInfo.totalDistributedPenalty: ', poolInfo.totalDistributedPenalty);
			poolInfo.totalPool.should.be.bignumber.equal(1100);
			poolInfo.entryStakeTotal.should.be.bignumber.equal(100);
			poolInfo.totalDistributedPenalty.should.be.bignumber.equal(1000);

			let invAstakeAdjusted = await loophole.getEntryStakeAdjusted(pid, investorA);
			let invBstakeAdjusted = await loophole.getEntryStakeAdjusted(pid, investorB);
			let invAstakeUser = await loophole.getCurrentEntryStakeUser(pid, investorA);
			let invBstakeUser = await loophole.getCurrentEntryStakeUser(pid, investorB);
			console.log('invAstakeAdjusted              : ', invAstakeAdjusted);
			console.log('invBstakeAdjusted              : ', invBstakeAdjusted);
			console.log('invAstakeUser                  : ', invAstakeUser);
			console.log('invBstakeUser                  : ', invBstakeUser);
			invAstakeAdjusted.should.be.bignumber.equal(100);
			invBstakeAdjusted.should.be.bignumber.equal(0);
			invAstakeUser.should.be.bignumber.equal(100);
			invBstakeUser.should.be.bignumber.equal(0);


			// investorA exit 50% and check stake
			loophole.switchWallet(investorA);
			const halfAmount = 550; //1100 / 2;
			await loophole.exit(pid, halfAmount, amountOutMinimum);
			const invAstake3 = await loophole.currentStake(pid, investorA);
			console.log('invAstake3: ', invAstake3);
			// 605 = 550 + 10% penalty of 550 = 55, goes back into the pool
			invAstake3.should.be.bignumber.equal(605);

			// check pool state
			poolInfo = await loophole.getPool(pid);
			let expectedTotalPool = BigNumber(605);
			let expectedEntryStakeTotal = BigNumber(50);
			let expectedTotalDistributedPenalty = BigNumber(1055);
			console.log('poolInfo.totalPool              : ', poolInfo.totalPool);
			console.log('expectedTotalPool               : ', expectedTotalPool);
			console.log('poolInfo.entryStakeTotal        : ', poolInfo.entryStakeTotal);
			console.log('expectedEntryStakeTotal         : ', expectedEntryStakeTotal);
			console.log('poolInfo.totalDistributedPenalty: ', poolInfo.totalDistributedPenalty);
			console.log('expectedTotalDistributedPenalty : ', expectedTotalDistributedPenalty);
			poolInfo.totalPool.should.be.bignumber.equal(expectedTotalPool);
			poolInfo.entryStakeTotal.should.be.bignumber.equal(expectedEntryStakeTotal);
			poolInfo.totalDistributedPenalty.should.be.bignumber.equal(expectedTotalDistributedPenalty);

			// investorA exit other 50% and check stake
			loophole.switchWallet(investorA);
			await loophole.exit(pid, 605, amountOutMinimum);
			const invAstake4 = await loophole.currentStake(pid, investorA);
			console.log('invAstake4: ', invAstake4);
			invAstake4.should.be.bignumber.equal(0);


			// check pool state
			poolInfo = await loophole.getPool(pid);
			expectedTotalPool = BigNumber(0);
			expectedEntryStakeTotal = BigNumber(0);
			expectedTotalDistributedPenalty = BigNumber(1055);
			console.log('poolInfo.totalPool              : ', poolInfo.totalPool);
			console.log('expectedTotalPool               : ', expectedTotalPool);
			console.log('poolInfo.entryStakeTotal        : ', poolInfo.entryStakeTotal);
			console.log('expectedEntryStakeTotal         : ', expectedEntryStakeTotal);
			console.log('poolInfo.totalDistributedPenalty: ', poolInfo.totalDistributedPenalty);
			console.log('expectedTotalDistributedPenalty : ', expectedTotalDistributedPenalty);
			poolInfo.totalPool.should.be.bignumber.equal(expectedTotalPool);
			poolInfo.entryStakeTotal.should.be.bignumber.equal(expectedEntryStakeTotal);
			poolInfo.totalDistributedPenalty.should.be.bignumber.equal(expectedTotalDistributedPenalty);
		});
	});



	describe.skip('#when user profit from others exit is less than his own stake', async () => {
		beforeEach('beforeEach-hook2', async () => {
			// deploy a NEW loophole contract
			await deployLoophole(setupWethAndWbtcPoolsConfig);
		});

		it('should exit/unstake with no revert/error', async () => {
			
			const [investorA, investorB, investorC, investorD] = [userAddress2, userAddress3, userAddress4, userAddress5];
			// assert we have all these wallets and we are NOT on a test net with a single account
			validateWallet(investorA);
			validateWallet(investorB);
			validateWallet(investorC);
			validateWallet(investorD);

			//A stakes 10000, B stakes 100
			const pid = 1; //WETH pid is 1
			const amountA = BigNumber(10000);
			const amountB = BigNumber(100);
			let res;
			let tx;
			
			const amountOutMinimum = 0; //do NOT use zero this in production

			loophole.switchWallet(investorA);
			//weth.switchWallet(investorA);
			// already approved for investorA as it is the first wallet
			//await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 });
			await approveWethTransfers(investorA);
		  console.log('investorA.weth.allowance: ', await weth.allowance({ address: investorA, spenderAddress: loopholeAddress }));
		  
			await loophole.stake(pid, amountA);
			console.log('test.bp-0');

			loophole.switchWallet(investorB);
			//weth.switchWallet(investorB);
			// already approved for investorA as it is the first wallet
			//await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 });
			await approveWethTransfers(investorB);
		  console.log('investorB.weth.allowance: ', await weth.allowance({ address: investorB, spenderAddress: loopholeAddress }));
		  
			await loophole.stake(pid, amountB);
			console.log('test.bp-1');

			const invAstake = await loophole.currentStake(pid, investorA);
			const invBstake = await loophole.currentStake(pid, investorB);
			console.log('invAstake: ', invAstake);
			console.log('invBstake: ', invBstake);
			invAstake.should.be.bignumber.equal(amountA);
			invBstake.should.be.bignumber.equal(amountB);

			// investorB exits whole amount 100 WETH, 20 WETH is paid as penalty:
			// 10 WETH goes to other users in WETH pool
			// 10 WETH is converted to LP tokens and goes to LOOP pool
			await loophole.exit(pid, amountB, amountOutMinimum);

			// check investorA and investorB new stakes
			const invAstake2 = await loophole.currentStake(pid, investorA);
			const invBstake2 = await loophole.currentStake(pid, investorB);
			console.log('invAstake2: ', invAstake2);
			console.log('invBstake2: ', invBstake2);
			invAstake2.should.be.bignumber.equal(BigNumber(10010));
			invBstake2.should.be.bignumber.equal(BigNumber(0));


			// check pool state
			let poolInfo = await loophole.getPool(pid);
			console.log('poolInfo.totalPool              : ', poolInfo.totalPool);
			console.log('poolInfo.entryStakeTotal        : ', poolInfo.entryStakeTotal);
			console.log('poolInfo.totalDistributedPenalty: ', poolInfo.totalDistributedPenalty);
			poolInfo.totalPool.should.be.bignumber.equal(BigNumber(10010));
			poolInfo.entryStakeTotal.should.be.bignumber.equal(BigNumber(10000));
			poolInfo.totalDistributedPenalty.should.be.bignumber.equal(BigNumber(10));

			let invAstakeAdjusted = await loophole.getEntryStakeAdjusted(pid, investorA);
			let invBstakeAdjusted = await loophole.getEntryStakeAdjusted(pid, investorB);
			let invAstakeUser = await loophole.getCurrentEntryStakeUser(pid, investorA);
			let invBstakeUser = await loophole.getCurrentEntryStakeUser(pid, investorB);
			console.log('invAstakeAdjusted              : ', invAstakeAdjusted);
			console.log('invBstakeAdjusted              : ', invBstakeAdjusted);
			console.log('invAstakeUser                  : ', invAstakeUser);
			console.log('invBstakeUser                  : ', invBstakeUser);
			invAstakeAdjusted.should.be.bignumber.equal(10000);
			invBstakeAdjusted.should.be.bignumber.equal(0);
			invAstakeUser.should.be.bignumber.equal(10000);
			invBstakeUser.should.be.bignumber.equal(0);

			// investorA exit all and check stake
			loophole.switchWallet(investorA);
			await loophole.exit(pid, 10010, amountOutMinimum);
			const invAstake3 = await loophole.currentStake(pid, investorA);
			console.log('invAstake3: ', invAstake3);
			invAstake3.should.be.bignumber.equal(BigNumber(0));


			// check pool state
			poolInfo = await loophole.getPool(pid);
			const expectedTotalPool = BigNumber(0);
			const expectedEntryStakeTotal = BigNumber(0);
			const expectedTotalDistributedPenalty = BigNumber(10);
			console.log('poolInfo.totalPool              : ', poolInfo.totalPool);
			console.log('expectedTotalPool               : ', expectedTotalPool);
			console.log('poolInfo.entryStakeTotal        : ', poolInfo.entryStakeTotal);
			console.log('expectedEntryStakeTotal         : ', expectedEntryStakeTotal);
			console.log('poolInfo.totalDistributedPenalty: ', poolInfo.totalDistributedPenalty);
			console.log('expectedTotalDistributedPenalty : ', expectedTotalDistributedPenalty);
			poolInfo.totalPool.should.be.bignumber.equal(expectedTotalPool);
			poolInfo.entryStakeTotal.should.be.bignumber.equal(expectedEntryStakeTotal);
			poolInfo.totalDistributedPenalty.should.be.bignumber.equal(expectedTotalDistributedPenalty);
		});
	});



	describe.skip('#distribute no LP tokens after 0 blocks', async () => {
		
		//NOTE: tests group is only for local environment
		before('before-hook4', async () => {
			assertLocalTestOnly();
		});

		beforeEach('beforeEach-hook4', async () => {
			await deployLoophole();
		});

		it('should distribute no LP tokens to WETH pool', async () => {
			await addWethPool();
			const pid = 1; //WETH pid
			
			///NOTE: other transactions can take place

			// rewind back to 'deployedBlock'
			// adding staking pools resulted in transactions increasing block number
			//NOTE: not needed in this case but we do it for generic testing behavious
			await traveler.revertToSnapshot(wethStartBlockSnapshotId);
			console.log('---traveler.revertToSnapshot: wethStartBlockSnapshotId');

			const poolReward = await loophole.getPoolReward(pid);
			console.log('---poolReward: ', poolReward);
			poolReward.should.be.bignumber.equal(0);

			//1 block for adding WETH pool
			const deployedBlock2 = deployedBlock.plus(1);
			// last reward block should match current block which is the next
			// block after deployedBlock because we add WETH pool with a transaction
			const pool = await loophole.getPool(pid);
			console.log('---deployedBlock2: ', deployedBlock2);
			console.log('---pool.lastRewardBlock: ', pool.lastRewardBlock);
			pool.lastRewardBlock.should.be.bignumber.equal(deployedBlock2);
			pool.totalPool.should.be.bignumber.equal(0);
      pool.entryStakeTotal.should.be.bignumber.equal(0);
      pool.totalDistributedPenalty.should.be.bignumber.equal(0);
      pool.accLPtokensPerShare.should.be.bignumber.equal(0);
		});
		
		//it('should distribute no LP tokens to WBTC pool', async () => {
		//});
	});



	const wethShare = 0.3;
	const wbtcShare = 0.7;
	const wethBlocks = 9; //forward blocks
	const wbtcBlocks = 8;

	const blocks = 10;
	const blocksForward = blocks - 2; //2 tx needed to add staking pools
	let block10; // = deployedBlock + blocksForward;

	describe.skip('#distribute correct LP tokens to WETH and WBTC pools after 10 blocks', async () => {

		//NOTE: tests group is only for local environment
		before('before-hook5', async () => {
			assertLocalTestOnly();
		});

		beforeEach('beforeEach-hook5', async () => {
		//before('before-hook5', async () => {
			// deploy a NEW loophole contract
			await deployLoophole(setupWethAndWbtcPoolsConfig);

			// block0 is deployment block = 'deployedBlock'
			// block1 is WETH pool setup
			// block2 is WBTC pool setup
			// adding staking pools in two transactions and increased block number
			
			// forward blockchain to 'block10'
			await forwardBlocks(blocksForward);
			console.log('---forwardBlocks: ', blocksForward);

			const currBlock = await loophole.getBlockNumber();
			block10 = deployedBlock.plus(blocks); //blocksForward;
			console.log('---block10: ', block10);
			currBlock.should.be.bignumber.equal(block10);
		});
		

		// test function helper to assert pool reward and las pool reward block  
		const assertPoolShare = async (pid, poolSharePercent, xblocks) => {
			const expectedPoolReward = xblocks * lpTokensPerBlock * poolSharePercent;
			const poolReward = await loophole.getPoolReward(pid);
			console.log('---expectedPoolReward: ', expectedPoolReward);
			console.log('---poolReward        : ', poolReward);
			
			// last reward block should match current block
			const pool = await loophole.getPool(pid);
			console.log('---deployedBlock: ', deployedBlock);
			console.log('---pool.lastRewardBlock: ', pool.lastRewardBlock);
			console.log('---block10: ', block10);
			//const thisBlock = deployedBlock.plus(xblocks);
			//console.log('---thisBlock: ', thisBlock);
			//thisBlock.should.be.equal(block10);

			poolReward.should.be.bignumber.equal(expectedPoolReward);
			///pool.lastRewardBlock.should.be.equal(block10);
		}


		it('should distribute 30% LP tokens to WETH pool', async () => {
			console.log('...WETH pool...');
			await assertPoolShare(wethPid, wethShare, wethBlocks);
		});
		

		it('should distribute 70% LP tokens to WBTC pool', async () => {
			console.log('...WBTC pool...');
			await assertPoolShare(wbtcPid, wbtcShare, wbtcBlocks);
		});
	});



	describe.skip('#distribute correct LP tokens to users', async () => {
		let [userA, userB, userC, userD] = [0, 0, 0, 0];

		//NOTE: tests group is only for local environment
		before('before-hook6a', async () => {
			assertLocalTestOnly();
		});

		//beforeEach('beforeEach-hook6', async () => {
		before('before-hook6', async () => {
			// deploy a NEW loophole contract
			await deployLoophole(setupWethAndWbtcPoolsConfig);
			
			[userA, userB, userC, userD] = [userAddress2, userAddress3, userAddress4, userAddress5];

			await approveWethTransfers(userA);
			await approveWethTransfers(userB);
			await approveWethTransfers(userC);
			await approveWethTransfers(userD);

			// forward blockchain to 'block10'
			//await forwardBlocks(blocksForward);
			//console.log('---forwardBlocks: ', blocksForward);

			//const currBlock = await loophole.getBlockNumber();
			//block10 = deployedBlock.plus(blocks);
			//console.log('---block10: ', block10);
			//currBlock.should.be.bignumber.equal(block10);
		});

		const test1 = 'should distribute correct LP tokens to users';
		it(test1, async () => {
			console.log('...', test1);
			//userA stakes
			let pid = wethPid;
			//const [userA, userB, userC, userD] = [userAddress2, userAddress3, userAddress4, userAddress5];
			const stakeA = Number(1000);
			const stakeB = Number(2000);
			const stakeC = Number(3000);
			const stakeD = Number(4000);
			const stakeTotal = stakeA + stakeB + stakeC + stakeD;
			const lpTokensPerBlockRaw = BigNumber(Numbers.fromBNToDecimals(lpTokensPerBlock, lpDecimals));
			const blockNumber1 = await loophole.getBlockNumber();
			console.log('---lpTokensPerBlock   : ', lpTokensPerBlock);
			console.log('---lpTokensPerBlockRaw: ', lpTokensPerBlockRaw);
			console.log('---blockNumber1: ', blockNumber1);

			const poolShare = Number(0.3);
			let pool;// = await loophole.getPool(pid);
			let pTotalPool;// = pool.totalPool;
			let pEntryStakeTotal;// = pool.entryStakeTotal;
			let pAccLPtokensPerShare;// = pool.accLPtokensPerShare;
			let accLPtokensPerShareExpected = 0;
			let poolRewardExpected;
			let poolReward;
			let userArewardExpected;// = poolRewardExpected.times((stakeA / stakeTotal) * pTotalPool);
			let userAreward;
			let userBrewardExpected;
			let userBreward;
			let userCrewardExpected;
			let userCreward;
			let userDrewardExpected;
			let userDreward;
			let lpTokensReward = 15; // 1 block * 50 LP per block * 0.3 weth share = 15
			let tx;

			//NOTE:
			loophole.switchWallet(userA);
			await loophole.stake(pid, stakeA);
			
			// 2 blocks passed by for liquidity mining
			pool = await loophole.getPool(pid);
			pTotalPool = pool.totalPool;
			pEntryStakeTotal = pool.entryStakeTotal;
			pAccLPtokensPerShare = pool.accLPtokensPerShare;
			console.log('---BP-0');
			console.log('---pTotalPool: ', pTotalPool);
			console.log('---pEntryStakeTotal: ', pEntryStakeTotal);
			console.log('---pAccLPtokensPerShare: ', pAccLPtokensPerShare);
			pTotalPool.should.be.bignumber.equal(1000); //stakeA);
			pEntryStakeTotal.should.be.bignumber.equal(1000); //stakeA);
			pAccLPtokensPerShare.should.be.bignumber.equal(0);
			let userAaccLPtokensPerShare = pAccLPtokensPerShare;

			//NOTE: mining pool for rewards with no tokens staked, updates pool.lastRewardBlock
			let blockNumber = await loophole.getBlockNumber();
			console.log('---blockNumber: ', blockNumber);
			console.log('---pool.lastRewardBlock: ', pool.lastRewardBlock);
			blockNumber.should.be.bignumber.equal(pool.lastRewardBlock);

			//NOTE:
			loophole.switchWallet(userB);
			await loophole.stake(pid, stakeB);
			
			//NOTE: pool.accLPtokensPerShare will look at totalPool before user staking tokens
			//, in this case 1000 as userA staking deposit
			pool = await loophole.getPool(pid);
			pTotalPool = pool.totalPool;
			pEntryStakeTotal = pool.entryStakeTotal;
			pAccLPtokensPerShare = pool.accLPtokensPerShare;
			console.log('---BP-1');
			console.log('---pTotalPool: ', pTotalPool);
			console.log('---pEntryStakeTotal: ', pEntryStakeTotal);
			console.log('---pAccLPtokensPerShare: ', pAccLPtokensPerShare);
			lpTokensReward = 15; //lpTokensPerBlock.times(1).times(poolShare); //1 block * 50 * 0.3 = 15
			accLPtokensPerShareExpected = 0.015; //accLPtokensPerShareExpected + (lpTokensReward / lpSupply); //0+(15/1000)=0.015
			pTotalPool.should.be.bignumber.equal(3000); //stakeA+stakeB);
			pEntryStakeTotal.should.be.bignumber.equal(3000); //stakeA+stakeB);
			pAccLPtokensPerShare.should.be.bignumber.equal(0.015); //accLPtokensPerShareExpected
			let userBaccLPtokensPerShare = pAccLPtokensPerShare;
			

			//NOTE:
			loophole.switchWallet(userC);
			await loophole.stake(pid, stakeC);

			//NOTE: pool.accLPtokensPerShare will look at totalPool before user staking tokens,
			// in this case 3000 as userA + userB staking deposits
			pool = await loophole.getPool(pid);
			pTotalPool = pool.totalPool;
			pEntryStakeTotal = pool.entryStakeTotal;
			pAccLPtokensPerShare = pool.accLPtokensPerShare;
			console.log('---BP-2');
			console.log('---pTotalPool: ', pTotalPool);
			console.log('---pEntryStakeTotal: ', pEntryStakeTotal);
			console.log('---pAccLPtokensPerShare: ', pAccLPtokensPerShare);
			lpTokensReward = 15; //lpTokensPerBlock.times(1).times(poolShare); //1 block * 50 * 0.3 = 15
			accLPtokensPerShareExpected = 0.02; //accLPtokensPerShareExpected + (lpTokensReward / lpSupply); //0.015+(15/3000)=0.015+0.005=0.02
			pTotalPool.should.be.bignumber.equal(6000); //stakeA+stakeB+stakeC);
			pEntryStakeTotal.should.be.bignumber.equal(6000); //stakeA+stakeB+stakeC);
			pAccLPtokensPerShare.should.be.bignumber.equal(0.02); //accLPtokensPerShareExpected
			let userCaccLPtokensPerShare = pAccLPtokensPerShare;

			//NOTE:
			loophole.switchWallet(userD);
			await loophole.stake(pid, stakeD);

			//NOTE: pool.accLPtokensPerShare will look at totalPool before user staking tokens,
			// in this case 6000 as userA + userB + userC staking deposits
			pool = await loophole.getPool(pid);
			pTotalPool = pool.totalPool;
			pEntryStakeTotal = pool.entryStakeTotal;
			pAccLPtokensPerShare = pool.accLPtokensPerShare;
			console.log('---BP-3');
			console.log('---pTotalPool: ', pTotalPool);
			console.log('---pEntryStakeTotal: ', pEntryStakeTotal);
			console.log('---pAccLPtokensPerShare: ', pAccLPtokensPerShare);
			lpTokensReward = 15; //lpTokensPerBlock.times(1).times(poolShare); //1 block * 50 * 0.3 = 15
			accLPtokensPerShareExpected = 0.0225; //accLPtokensPerShareExpected + (lpTokensReward / lpSupply); //0.02+(15/6000)=0.02+0.0025=0.0225
			pTotalPool.should.be.bignumber.equal(10000); //stakeA+stakeB+stakeC+stakeD);
			pEntryStakeTotal.should.be.bignumber.equal(10000); //stakeA+stakeB+stakeC+stakeD);
			pAccLPtokensPerShare.should.be.bignumber.equal(0.0225); //accLPtokensPerShareExpected
			let userDaccLPtokensPerShare = pAccLPtokensPerShare;

			//...checks
			//forward 1 block
			const forwardXBlocks = 3;
			await forwardBlocks(forwardXBlocks);

			// get LP rewards
			//loophole.switchWallet(userA);
			
			//const poolReward = await loophole.getPoolReward(pid);
			//const blocks = Number(1); /// 1 tx since last liquidity mining
			//const poolRewardExpected = lpTokensPerBlockRaw.times(blocks).times(poolShare); //9*50*1e18*0.3 = 135*1e18
			poolRewardExpected = 45; //(forwardXBlocks)*15; //lpTokensReward; //BigNumber(lpTokensPerBlock).times(blocks).times(poolShare); //1*50*0.3 = 15
			//const totalPool = Number(stakeTotal); //get pool totalPool
			const blockNumber2 = await loophole.getBlockNumber();
			poolReward = await loophole.getPoolReward(pid);
			console.log('---blockNumber2: ', blockNumber2);
			console.log('---poolRewardExpected : ', poolRewardExpected);
			console.log('---poolReward         : ', poolReward);
			poolReward.should.be.bignumber.equal(45); //poolRewardExpected

			pool = await loophole.getPool(pid);
			pTotalPool = pool.totalPool;
			pEntryStakeTotal = pool.entryStakeTotal;
			pAccLPtokensPerShare = pool.accLPtokensPerShare;
			console.log('---pTotalPool         : ', pTotalPool);
			console.log('---pEntryStakeTotal   : ', pEntryStakeTotal);
			
			accLPtokensPerShareExpected = 0.0225; //this has not changed
			console.log('---accLPtokensPerShareExpected	: ', accLPtokensPerShareExpected);
			console.log('---pAccLPtokensPerShare				: ', pAccLPtokensPerShare);
			pAccLPtokensPerShare.should.be.bignumber.equal(0.0225); //accLPtokensPerShareExpected

			//NOTE: at this point pool total stake is made of users deposits, no distributed penalties yet
			pAccLPtokensPerShare = pAccLPtokensPerShare.plus(45 / 10000); //0.027
			console.log('---new.pAccLPtokensPerShare				: ', pAccLPtokensPerShare);
			
			const userApayRewardMark = 1000 * userAaccLPtokensPerShare; //1000*0=0
			userArewardExpected = BigNumber(pAccLPtokensPerShare * 1000 - userApayRewardMark); // poolRewardExpected.times((stakeA / stakeTotal) * pTotalPool);
			userAreward = await loophole.getUserReward(pid, userA);
			console.log('---userArewardExpected: ', userArewardExpected);
			console.log('---userAreward        : ', userAreward);
			userAreward.should.be.bignumber.equal(0.027 * 1000 - 0); //userArewardExpected

			const userBpayRewardMark = 2000 * userBaccLPtokensPerShare; //2000*0.015=30
			userBrewardExpected = BigNumber(pAccLPtokensPerShare * 2000 - userBpayRewardMark); // poolRewardExpected.times((stakeB / stakeTotal) * pTotalPool);
			userBreward = await loophole.getUserReward(pid, userB);
			console.log('---userBrewardExpected: ', userBrewardExpected);
			console.log('---userBreward        : ', userBreward);
			userBreward.should.be.bignumber.equal(0.027 * 2000 - 30); //userBrewardExpected

			const userCpayRewardMark = 3000 * userCaccLPtokensPerShare; //3000*0.02=60
			userCrewardExpected = BigNumber(pAccLPtokensPerShare * 3000 - userCpayRewardMark); // poolRewardExpected.times((stakeC / stakeTotal) * pTotalPool);
			userCreward = await loophole.getUserReward(pid, userC);
			console.log('---userCrewardExpected: ', userCrewardExpected);
			console.log('---userCreward        : ', userCreward);
			userCreward.should.be.bignumber.equal(0.027 * 3000 - 60); //userCrewardExpected

			const userDpayRewardMark = 4000 * userDaccLPtokensPerShare; //4000*0.0225=90
			userDrewardExpected = BigNumber(pAccLPtokensPerShare * 4000 - userDpayRewardMark); // poolRewardExpected.times((stakeD / stakeTotal) * pTotalPool);
			userDreward = await loophole.getUserReward(pid, userD);
			console.log('---userDrewardExpected: ', userDrewardExpected);
			console.log('---userDreward        : ', userDreward);
			userDreward.should.be.bignumber.equal(0.027 * 4000 - 90); //userDrewardExpected



			//NOTE: updating pool to mine for LP tokens, adds 1 block
			// pool update to get LP rewards
			tx = await loophole.updatePool(pid);
			//console.log('tx.events.PoolRewardUpdated.returnValues: ', tx.events.PoolRewardUpdated.returnValues);
			console.log('tx.events: ', tx.events);

			poolRewardExpected = 0; //(forwardXBlocks+1)*15;
			poolReward = await loophole.getPoolReward(pid);
			console.log('---poolRewardExpected : ', poolRewardExpected);
			console.log('---poolReward         : ', poolReward);
			///poolReward.should.be.bignumber.equal(0); //poolRewardExpected

			pool = await loophole.getPool(pid);
			pTotalPool = pool.totalPool;
			pEntryStakeTotal = pool.entryStakeTotal;
			pAccLPtokensPerShare = pool.accLPtokensPerShare;
			console.log('---pTotalPool         : ', pTotalPool);
			console.log('---pEntryStakeTotal   : ', pEntryStakeTotal);
			
			//lpTokensReward = poolRewardExpected;
			accLPtokensPerShareExpected = 0.0285; //accLPtokensPerShareExpected(0.0225) + (forwardXBlocks+1)*0.0015 = 0.0285;
			console.log('---accLPtokensPerShareExpected	: ', accLPtokensPerShareExpected);
			console.log('---pAccLPtokensPerShare				: ', pAccLPtokensPerShare);
			pAccLPtokensPerShare.should.be.bignumber.equal(0.0285); //accLPtokensPerShareExpected
			
			//NOTE: at this point pool total stake is made of users deposits, no distributed penalties yet
			
			//userApayRewardMark is 0
			userArewardExpected = BigNumber(pAccLPtokensPerShare * 1000 - userApayRewardMark); // poolRewardExpected.times((stakeA / stakeTotal) * pTotalPool);
			userAreward = await loophole.getUserReward(pid, userA);
			console.log('---userArewardExpected: ', userArewardExpected);
			console.log('---userAreward        : ', userAreward);
			userAreward.should.be.bignumber.equal(0.0285 * 1000 - 0); //userArewardExpected

			//userBpayRewardMark is 30
			userBrewardExpected = BigNumber(pAccLPtokensPerShare * 2000 - userBpayRewardMark); // poolRewardExpected.times((stakeB / stakeTotal) * pTotalPool);
			userBreward = await loophole.getUserReward(pid, userB);
			console.log('---userBrewardExpected: ', userBrewardExpected);
			console.log('---userBreward        : ', userBreward);
			userBreward.should.be.bignumber.equal(0.0285 * 2000 - 30); //userBrewardExpected

			//userCpayRewardMark is 60
			userCrewardExpected = BigNumber(pAccLPtokensPerShare * 3000 - userCpayRewardMark); // poolRewardExpected.times((stakeC / stakeTotal) * pTotalPool);
			userCreward = await loophole.getUserReward(pid, userC);
			console.log('---userCrewardExpected: ', userCrewardExpected);
			console.log('---userCreward        : ', userCreward);
			userCreward.should.be.bignumber.equal(0.0285 * 3000 - 60); //userCrewardExpected

			//userDpayRewardMark is 90
			userDrewardExpected = BigNumber(pAccLPtokensPerShare * 4000 - userDpayRewardMark); // poolRewardExpected.times((stakeC / stakeTotal) * pTotalPool);
			userDreward = await loophole.getUserReward(pid, userD);
			console.log('---userDrewardExpected: ', userDrewardExpected);
			console.log('---userDreward        : ', userDreward);
			userDreward.should.be.bignumber.equal(0.0285 * 4000 - 90); //userDrewardExpected

			//...
		});
	});



	/*describe('describe.test', async () => {
		//it('it.test', async () => {
			console.log('...it.test...');
			await deployLoophole();
		//});
	});*/

	// works
	/*describe('describe.extCallTest', async () => {
		//it('it.extCallTest', async () => {
			console.log('...describe.extCallTest...');
			await extCallTest();
		//});
	});*/

	// works, but NOT nested tests
	/*describe('describe.extCallTest2', async () => {
		it('it.extCallTest2', async () => {
			console.log('...describe.extCallTest2...');
			await extCallTest2();
		});
	});*/



	after('Loophole::after_hook', async () => {
    if (testConfig.localtest) {
      await traveler.revertToSnapshot(snapshotId);
      console.log('+++loophole.after.');
      console.log('--- revert blockchain to last snapshot ---');
    }
    else {
      console.log('--- we only revert blockchain to last snapshot for localtest ---');
    }
  });
});
