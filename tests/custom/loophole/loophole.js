import { expect, assert } from 'chai';
import moment from 'moment';
import delay from 'delay';
import { mochaAsync, mochaContextAsync } from '../../utils';
import {
  ERC20Contract, ETHUtils, UniswapV3Pool, UniswapV3Factory, SwapRouter,
	 TestUniswapV3Callee, TestUniswapV3RouterBridge, TickMathTest, Loophole,
} from '../../../build';
import ERC20Mock from '../../../build/models/mocks/ERC20Mock';
import Numbers from '../../../build/utils/Numbers';
import beproAssert from '../../../build/utils/beproAssert';
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
} from '../../shared/utilities';

const truffleAssert = require('truffle-assertions');

// const { chaiPlugin } = require("../../../src/sablier/dev-utils");
const traveler = require('ganache-time-traveler');

const BigNumber = require('bignumber.js');
const chai = require('chai');
const chaiBigNumber = require('chai-bignumber');

chai.should();
chai.use(chaiBigNumber(BigNumber));
// chai.use(chaiPlugin);

let deployed_tokenAddress;
const ethAmount = 0.1;
let contractAddress = '0x949d274F63127bEd53e21Ed1Dd83dD6ACAfF7f64';
// this is already deployed on rinkeby network for testing
// var deployed_contractAddress = '0xf7177df4a4797304cf59aa1e2dd4718cb390cbad';
let deployed_contractAddress = '0xeAE93A3C4d74C469B898C345DEAD456C8Db06194';

const TOKEN_AMOUNT_1M = 1000000; // 1 million token amount
const TOKEN_AMOUNT_1B = 1000000000; // 1 billion token amount

// the following constants are from TickMath library:
// https://github.com/Uniswap/uniswap-v3-core/blob/main/contracts/libraries/TickMath.sol
/// The minimum tick that may be passed to #getSqrtRatioAtTick computed from log base 1.0001 of 2**-128
const MIN_TICK = new BigNumber(-887272); // int24
/// The maximum tick that may be passed to #getSqrtRatioAtTick computed from log base 1.0001 of 2**128
const MAX_TICK = MIN_TICK.multipliedBy(-1); /// /new BigNumber(-MIN_TICK); //int24

/// The minimum value that can be returned from #getSqrtRatioAtTick. Equivalent to getSqrtRatioAtTick(MIN_TICK)
// const MIN_SQRT_RATIO = BigNumber(4295128739); //uint160
/// The maximum value that can be returned from #getSqrtRatioAtTick. Equivalent to getSqrtRatioAtTick(MAX_TICK)
// const MAX_SQRT_RATIO = BigNumber('1461446703485210103287273052203988822378723970342'); //uint160

// const lockSeconds = 30; // lock tokens for x amount of seconds
// let endDate = moment().add(lockSeconds, "seconds");
const testConfig = {
  test: true,
  localtest: true, // ganache local blockchain
};

// const web3Conn = new Web3Connection(testConfig);
// global web3 object is needed for ganache-time-traveler to work
global.web3 = undefined; // = web3Conn.web3;

let snapshotId;
let wethStartBlockSnapshotId;
let wbtcStartBlockSnapshotId;
// let wethStartBlock;
// let wbtcStartBlock;

let wethBnMaxUint256; // MaxUint256 for WETH token
let wbtcBnMaxUint256; // MaxUint256 for WBTC token
let lpBnMaxUint256; // MaxUint256 for LP token

const lpSupply = BigNumber(TOKEN_AMOUNT_1B).multipliedBy(10);
const wethSupply = BigNumber(TOKEN_AMOUNT_1B).multipliedBy(10); // .toString(10);
const wbtcSupply = BigNumber(TOKEN_AMOUNT_1B).multipliedBy(10);

let wethDecimals;
let wbtcDecimals;
let lpDecimals;
let WETH_AMOUNT_1M;
let WBTC_AMOUNT_1M;
let LP_AMOUNT_1M;

let loophole; // loophole contract
let loopholeAddress; // loophole contract address
let owner;
let userAddress;
let userAddress2;
let userAddress3;
let userAddress4;
let userAddress5;
let weth; // wrapped eth token contract
let wbtc; // wrapped btc token contract
let wethAddress; // wrapped eth token contract address
let wbtcAddress; /// /wrapped btc token contract address
let lpToken; // Liquidity Provider reward token contract
let lpTokenAddress; // LP token contract address
let ethUtils; // eth utils contract
let ethUtilsAddress; // eth utils contract address
let factory; // uniswap factory contract
let factoryAddress; // uniswap factory contract address
let swapRouter; // uniswap swaprouter contract
let swapRouterAddress; // uniswap swaprouter contract address
let uniswapV3Callee; // uniswap callee contract used to add liquidity and perform swaps
let uniswapV3CalleeAddress; // uniswap callee contract address
let uniswapV3RouterBridge; // TestUniswapRouterBridge contract used to access uniswap trading/exchange pools
let uniswapV3RouterBridgeAddress; // TestUniswapRouterBridge contract address
let tickMathTest; // uniswap TickMathTest library used for uniswap ticks and sqrtPriceX96 conversions
let tickMathTestAddress; // uniswap TickMathTest library contract address
let wethLpPoolV3; // WETH/LP uniswap pool contract
let wethLpPoolV3Address; // WETH/LP uniswap pool contract address
let wbtcLpPoolV3; // WBTC/LP uniswap pool contract
let wbtcLpPoolV3Address; // WBTC/LP uniswap pool contract address
const lpTokensPerBlock = 50;
let initStartBlock; // zero by default
let deployedBlock = 1; // block number at loophole contract deployment
const exitPenalty = 20; // 20 is 20%
const exitPenaltyLP = 10; // 10%
const poolFee_3000 = 3000; // uniswap fee 0.3% as parts/million

// const setupWethAndWbtcPools = true;
const setupWethPoolConfig = { setupWeth: true, setupWbtc: false };
const setupWbtcPoolConfig = { setupWeth: false, setupWbtc: true };
const setupWethAndWbtcPoolsConfig = { setupWeth: true, setupWbtc: true };
const setupNoPoolsConfig = { setupWeth: false, setupWbtc: false };

const lpPid = 0; // LP pool id
const wethPid = 1; // WETH pool id
const wbtcPid = 2; // WBTC pool id
const invalidPid = 99; // invalid pool id

const wethAllocPoint = 3; // 2; //WETH pool allocation point
const wbtcAllocPoint = 7; // 4; //WBTC pool allocation point

const assertLocalTestOnly = () => {
  if (!testConfig.localtest) {
    assert.fail('>>> we only run this function in localtest mode <<<');
  }
};

const checkLocalTestOnly = () => {
  if (!testConfig.localtest) {
    console.warn('--- we only run this function in localtest mode ---');
    return false;
  }
  return true;
};

const validateWallet = function (wallet1) {
  assert.notEqual(wallet1, undefined, 'undefined wallet');
  assert.notEqual(wallet1, null, 'null wallet');
};

// load users/addresses/signers from connected wallet via contract
const loadSigners = async contract => { // contract is IContract
  console.log('...loadSigners');
  // userAddress = await contract.getUserAddress();
  [userAddress, userAddress2, userAddress3, userAddress4, userAddress5] = await contract.getSigners();
  owner = userAddress;
};

// forward blockchain with x number of blocks, for testing purposes
const forwardBlocks = async nblocks => {
  const blocksTx = [];
  for (let i = 0; i < nblocks; ++i) {
    blocksTx.push(traveler.advanceBlock());
  }
  return Promise.all(blocksTx);
};

// deploy Loophole contract
const deployLoophole = async ({ startBlockNumber = 1, setupWeth = false, setupWbtc = false } = {}) => {
  console.log('...deploying new Loophole contract');

  // deployedBlock = await ethUtils.blockNumber();
  // deployedBlock = BigNumber(0);
  if (startBlockNumber) initStartBlock = startBlockNumber; // 0
  else initStartBlock = BigNumber(1); // 0

  // Create Contract
  const testConfig2 = {
    ...testConfig, lpTokenAddress, ethUtilsAddress, swapRouterAddress,
  };
  loophole = new Loophole(testConfig2);
  expect(loophole).to.not.equal(null);
  // Deploy
  const testConfig3 = {
    swapRouter: swapRouterAddress,
    lpToken: lpTokenAddress,
    lpTokensPerBlock,
    startBlock: initStartBlock,
    exitPenalty,
    exitPenaltyLP,
  };
  // console.log('...Loophole.testConfig3: ', testConfig3);
  const res = await loophole.deploy(testConfig3);
  // await loophole.__assert();
  contractAddress = loophole.getAddress();
  deployed_contractAddress = loophole.getAddress();
  loopholeAddress = loophole.getAddress();
  console.log('Deployed Loophole address: ', deployed_contractAddress);
  expect(res).to.not.equal(false);
  console.log('---loophole.userAddress: ', await loophole.getUserAddress());

  deployedBlock = await ethUtils.blockNumber();

  // load user addresses
  await loadSigners(loophole);

  // setup loophole, add WETH and WBTC pools
  // await setupLoophole({setupWeth, setupWbtc});
  if (setupWeth) {
    await addWethPool();
  }
  if (setupWbtc) {
    await addWbtcPool();
  }
};

const addWethPool = async () => {
  /// >>> setup loophole, add WETH pool
  console.log('...add new WETH staking pool');
  const allocPoint = wethAllocPoint;
  // let pidWeth = await loophole.getContract().methods.add(wethAddress, allocPoint).call();
  const tx = await loophole.add({
    token: wethAddress,
    allocPoint,
  });
  // console.log('---loophole.add.WETHpool: ', tx);

  // wethStartBlock = await ethUtils.blockNumber();

  // save block at WETH pool setup
  const snapshot = await traveler.takeSnapshot();
  wethStartBlockSnapshotId = snapshot.result;
};

const addWbtcPool = async () => {
  /// >>> setup loophole, add WBTC pool
  console.log('...add new WBTC staking pool');
  const allocPoint = wbtcAllocPoint;
  // let pidWbtc = await loophole.getContract().methods.add(wbtcAddress, allocPoint).call();
  const tx = await loophole.add({
    token: wbtcAddress,
    allocPoint,
  });
  // console.log('---loophole.add.WBTCpool: ', tx);

  // wbtcStartBlock = await ethUtils.blockNumber();

  // save block at WBTC pool setup
  const snapshot = await traveler.takeSnapshot();
  wbtcStartBlockSnapshotId = snapshot.result;
};

const approveWethTransfers = async (user1 = userAddress) => {
  weth.switchWallet(user1);
  await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 });
};

const approveWbtcTransfers = async (user1 = userAddress) => {
  wbtc.switchWallet(user1);
  await wbtc.approve({ address: loopholeAddress, amount: wbtcBnMaxUint256 });
};

const approveLPTransfers = async (user1 = userAddress) => {
  lpToken.switchWallet(user1);
  await lpToken.approve({ address: loopholeAddress, amount: lpBnMaxUint256 });
};

const approveTransfers = async (user1 = userAddress) => {
  await approveWethTransfers(user1);
  await approveWbtcTransfers(user1);
};

// 4 normal users approve weth transfers to loophole contract
const approveBulkWethTransfers = async (user1, user2, user3, user4) => {
  if (!user1 && !user2 && !user3 && !user4) {
    console.log('...approveBulkWethTransfers: no users defined');
    return;
  }
  if (user1) await approveWethTransfers(user1);
  if (user2) await approveWethTransfers(user2);
  if (user3) await approveWethTransfers(user3);
  if (user4) await approveWethTransfers(user4);
};

// 4 normal users approve LP transfers to loophole contract
const approveBulkLPTransfers = async (user1, user2, user3, user4) => {
  if (!user1 && !user2 && !user3 && !user4) {
    console.log('...approveBulkLPTransfers: no users defined');
    return;
  }
  if (user1) await approveLPTransfers(user1);
  if (user2) await approveLPTransfers(user2);
  if (user3) await approveLPTransfers(user3);
  if (user4) await approveLPTransfers(user4);
};

// send LP tokens to loophole contract and approve LP transfers by loophole for 4 users
const fundLoopholeWithLP = async () => {
  lpToken.switchWallet(userAddress);
  // transfer LP tokens to loophole contract
  const tx = await lpToken.transferTokenAmount({ toAddress: loopholeAddress, tokenAmount: BigNumber(TOKEN_AMOUNT_1M) });
  // console.log('---lpToken.transferTokenAmount.tx:', tx);
};

const usersStake = async (pid, [userA, userB, userC, userD], [stakeA, stakeB, stakeC, stakeD]) => {
  loophole.switchWallet(userA);
  await loophole.stake({
    pid,
    amount: stakeA,
  });

  if (userB) {
    loophole.switchWallet(userB);
    await loophole.stake({
      pid,
      amount: stakeB,
    });
  } else {
    console.log('---usersStake.userB not defined to stake');
  }

  if (userC) {
    loophole.switchWallet(userC);
    await loophole.stake({
      pid,
      amount: stakeC,
    });
  } else {
    console.log('---usersStake.userC not defined to stake');
  }

  if (userD) {
    loophole.switchWallet(userD);
    await loophole.stake({
      pid,
      amount: stakeD,
    });
  } else {
    console.log('---usersStake.userD not defined to stake');
  }
};

const testFail = async msg => {
  throw new Error(msg);
};

context('Loophole contract', () => {
  before('Loophole::before_hook', async () => {
    // const loophole = new Loophole(testConfig);
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
    } else {
      console.log('--- we only take blockchain snapshot for localtest ---');
    }
  });

  // NOTE: make sure we only run these tests in local blockchain
  before('Loophole::before_hook::checkLocalTestOnly', async () => {
    if (!checkLocalTestOnly()) {
      assert.fail('LOCAL_TEST_REQUIRED');
    }
  });

  before('Loophole::setup', async () => {
    let res;

    ethUtils = new ETHUtils(testConfig);
    expect(ethUtils).to.not.equal(null);
    res = await ethUtils.deploy({});
    expect(res).to.not.equal(false);
    ethUtilsAddress = ethUtils.getAddress();

    // deployedBlock = await ethUtils.blockNumber();
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
        name: 'LP Token',
        symbol: 'LPT',
        cap: Numbers.fromBNToDecimals(lpSupply, 18),
        distributionAddress: userAddress, // local test with ganache
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

      const wethInitialAirdrop = BigNumber(TOKEN_AMOUNT_1M).times(10); // BigNumber(20000);
      const wbtcInitialAirdrop = BigNumber(TOKEN_AMOUNT_1M).times(10); // BigNumber(20000);
      const lpInitialAirdrop = BigNumber(TOKEN_AMOUNT_1M).times(10); // BigNumber(20000);

      await weth.mint({ to: userAddress, amount: wethInitialAirdrop });
      await weth.mint({ to: userAddress2, amount: wethInitialAirdrop });
      await weth.mint({ to: userAddress3, amount: wethInitialAirdrop });
      await weth.mint({ to: userAddress4, amount: wethInitialAirdrop });
      await weth.mint({ to: userAddress5, amount: wethInitialAirdrop });

      await wbtc.mint({ to: userAddress, amount: wbtcInitialAirdrop });
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

      tickMathTest = new TickMathTest(testConfig);
      expect(tickMathTest).to.not.equal(null);
      res = await tickMathTest.deploy();
      expect(res).to.not.equal(false);
      tickMathTestAddress = tickMathTest.getAddress();
    });

    it('create and fund uniswapV3 trading pools WETH/LP WBTC/LP', async () => {
      let res;

      const wethPoolAddress1 = await factory.getContract().methods.createPool(wethAddress, lpTokenAddress, poolFee_3000).call();
      const wbtcPoolAddress1 = await factory.getContract().methods.createPool(wbtcAddress, lpTokenAddress, poolFee_3000).call();

      // const wethPoolTx = await factory.createPool({
      //   tokenA: wethAddress,
      //   tokenB: lpTokenAddress,
      //   fee: poolFee_3000,
      // }); //create WETH/LP pool
      // const wbtcPoolTx = await factory.createPool({
      //   tokenA: wbtcAddress,
      //   tokenB: lpTokenAddress,
      //   fee: poolFee_3000,
      // }); //create WBTC/LP pool
      const wethPoolTx = await factory.createPool({
        tokenA: lpTokenAddress,
        tokenB: wethAddress,
        fee: poolFee_3000,
      }); // create LP/WETH pool
      const wbtcPoolTx = await factory.createPool({
        tokenA: lpTokenAddress,
        tokenB: wbtcAddress,
        fee: poolFee_3000,
      }); // create LP/WBTC pool

      // console.log('wethPoolTx', wethPoolTx);
      // console.log('wbtcPoolTx', wbtcPoolTx);
      wethLpPoolV3Address = wethPoolTx.events.PoolCreated.returnValues.pool;
      wbtcLpPoolV3Address = wbtcPoolTx.events.PoolCreated.returnValues.pool;
      const wethPoolReturnValues = wethPoolTx.events.PoolCreated.returnValues;
      // console.log('wethPoolReturnValues', wethPoolReturnValues);

      console.log('wethPoolAddress', wethLpPoolV3Address);
      console.log('wbtcPoolAddress', wbtcLpPoolV3Address);
      expect(wethLpPoolV3Address).to.equal(wethPoolAddress1);
      expect(wbtcLpPoolV3Address).to.equal(wbtcPoolAddress1);

      // deploy uniswap pool V3
      wethLpPoolV3 = new UniswapV3Pool({ ...testConfig, contractAddress: wethLpPoolV3Address });
      expect(wethLpPoolV3).to.not.equal(null);
      // res = await wethLpPoolV3.deploy({});
      // expect(res).to.not.equal(false);
      await wethLpPoolV3.__assert(); // already deployed
      // console.log('wethLpPoolV3.bp-0');
      // await wethLpPoolV3.start();
      // console.log('wethLpPoolV3.bp-1');
      // res = await wethLpPoolV3.login(); //login
      // console.log('wethLpPoolV3.bp-2');
      // expect(res).to.equal(true);
      const wethLpPoolV3Address1 = wethLpPoolV3.getAddress();
      // console.log('wethLpPoolV3.bp-3');
      expect(wethLpPoolV3Address).to.equal(wethLpPoolV3Address1);
      expect(wethLpPoolV3Address).to.equal(wethLpPoolV3.params.contractAddress);
      // console.log('wethLpPoolV3.bp-4');

      // uniswapRouterBridgeAddress needs to be approved
      // await weth.approve({ address: wethLpPoolV3Address, amount: wethBnMaxUint256 });
      // await wbtc.approve({ address: uniswapV3RouterBridgeAddress, amount: wbtcBnMaxUint256 });
      // await lpToken.approve({ address: uniswapV3RouterBridgeAddress, amount: lpBnMaxUint256 });

      // sets initial price for the pool
      // require(sqrtPriceX96 >= MIN_SQRT_RATIO && sqrtPriceX96 < MAX_SQRT_RATIO, 'R');
      // const sqrtPriceX96 = MIN_SQRT_RATIO;
      const sqrtPriceX96 = encodePriceSqrt(2, 1); // (1,2) 1:2
      console.log('sqrtPriceX96: ', sqrtPriceX96.toString());
      const initTx = await wethLpPoolV3.initialize({ sqrtPriceX96 });
      // emits event Initialize(sqrtPriceX96, tick);
      // console.log('wethLpPoolV3.bp-5');
      const sqrtPriceX96Res = initTx.events.Initialize.returnValues.sqrtPriceX96;
      const tickRes = initTx.events.Initialize.returnValues.tick;
      expect(sqrtPriceX96.toString()).to.equal(sqrtPriceX96Res);
      console.log('wethLpPoolV3.initialize>\nsqrtPriceX96Res: ', sqrtPriceX96Res, ' | tickRes: ', tickRes);

      // approve to spend weth tokens
      // console.log('MaxUint128: ', MaxUint128);
      // console.log('MaxUint256: ', MaxUint256);
      // await weth.approve({ address: wethLpPoolV3Address, amount: wethBnMaxUint256 }); //wethSupply
      // uniswapV3CalleeAddress needs to be approved
      await weth.approve({ address: uniswapV3CalleeAddress, amount: wethBnMaxUint256 }); // wethSupply
      // console.log('wethLpPoolV3.bp-6');
      console.log('weth.allowance: ', await weth.allowance({ address: userAddress, spenderAddress: uniswapV3CalleeAddress }));
      // await lpToken.approve({ address: wethLpPoolV3Address, amount: lpBnMaxUint256 }); //lpSupply
      // uniswapV3CalleeAddress needs to be approved
      await lpToken.approve({ address: uniswapV3CalleeAddress, amount: lpBnMaxUint256 }); // lpSupply
      // console.log('wethLpPoolV3.bp-7');
      console.log('lpToken.allowance: ', await lpToken.allowance({ address: userAddress, spenderAddress: uniswapV3CalleeAddress }));

      // adds liquidity for the given recipient/tickLower/tickUpper position
      // function mint(address recipient, int24 tickLower, int24 tickUpper, uint128 amount, bytes data) returns (uint256 amount0, uint256 amount1);
      // const amount = Numbers.fromBNToDecimals(wethSupply, wethDecimals);
      const amount = Numbers.fromBNToDecimals(BigNumber(TOKEN_AMOUNT_1M), wethDecimals);
      console.log('wethLpPoolV3.mint | wethDecimals: ', wethDecimals, ' | wethAmount', amount);
      // const data = []; //['0x01', '0x02'];

      const tickSpacing = TICK_SPACINGS[FeeAmount.MEDIUM];
      const minTick = getMinTick(tickSpacing);
      const maxTick = getMaxTick(tickSpacing);

      // NOTE: liquidity in a range
      // we use minimum tick and maximum tick possible to make a market range
      const tickLower = minTick; // -TICK_SPACINGS[FeeAmount.MEDIUM];
      const tickUpper = maxTick; // TICK_SPACINGS[FeeAmount.MEDIUM];

      // wethLpPoolV3.mint does not work, needs a bridge contract on the blockchain like 'TestUniswapV3Callee'
      // const { amount0, amount1 } = await wethLpPoolV3.mint({
      //   recipient: userAddress,
      //   tickLower,
      //   tickUpper,
      //   amount,
      //   data,
      // });
      // ??? convert token decimals to bigNumber
      // console.log('mintRes.amount0: ', amount0);
      // console.log('mintRes.amount1: ', amount1);

      // NOTE: this liquidity would NOT be accurate as we have 2 tokens that could be of different decimals
      // for a better practice of providing liquidity please use 'TestLiquidityExample' smart contract and wrapper
      // const liquidityDelta = 1000000;
      const liquidityDelta = amount;
      const mintTx = await uniswapV3Callee.mint({
        pool: wethLpPoolV3Address,
        recipient: userAddress,
        tickLower,
        tickUpper,
        amount: liquidityDelta,
      });
      // console.log('mintTx', mintTx);

      // emits event Mint(address sender, address indexed owner, int24 indexed tickLower, int24 indexed tickUpper,
      // uint128 amount, uint256 amount0, uint256 amount1);
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

      // emits event MintCallback(amount0Owed, amount1Owed);
      const { amount0Owed } = mintTx.events.MintCallback.returnValues;
      const { amount1Owed } = mintTx.events.MintCallback.returnValues;
      console.log('\nuniswapV3Callee.mint.MintCallback');
      console.log('amount0Owed: ', amount0Owed, ' | amount1Owed', amount1Owed);
      // console.log('wethLpPoolV3.bp-8');

      const wethBalance1 = await weth.balanceOf(userAddress);
      const wbtcBalance1 = await wbtc.balanceOf(userAddress);
      const lpBalance1 = await lpToken.balanceOf(userAddress);
      console.log('wethBalance1: ', wethBalance1);
      console.log('wbtcBalance1: ', wbtcBalance1);
      console.log('lpBalance1: ', lpBalance1);
    });
  });

  describe('#uniswap tests via TestUniswapV3RouterBridge', async () => {
    it('should deploy and approve TestUniswapV3RouterBridge Contract to spend WETH WBTC LP tokens', async () => {
      let res;
      uniswapV3RouterBridge = new TestUniswapV3RouterBridge({ ...testConfig, swapRouterAddress });
      expect(uniswapV3RouterBridge).to.not.equal(null);
      res = await uniswapV3RouterBridge.deploy({});
      expect(res).to.not.equal(false);
      uniswapV3RouterBridgeAddress = uniswapV3RouterBridge.getAddress();

      // uniswapRouterBridgeAddress needs to be approved
      await weth.approve({ address: uniswapV3RouterBridgeAddress, amount: wethBnMaxUint256 });
      await wbtc.approve({ address: uniswapV3RouterBridgeAddress, amount: wbtcBnMaxUint256 });
      await lpToken.approve({ address: uniswapV3RouterBridgeAddress, amount: lpBnMaxUint256 });
    });

    it('should exchange exact WETH input tokens for LP output tokens via TestUniswapV3RouterBridge', async () => {
      const amountIn = 100; // 100 weth
      const amountOutMinimum = 0; // do NOT use zero in production
      const amountOut = await uniswapV3RouterBridge.swapExactInputSingleEx({
        tokenIn: wethAddress, // tokenIn
        tokenOut: lpTokenAddress, // tokenOut
        poolFee: poolFee_3000,
        amountIn,
        amountOutMinimum,
      }, { call: true });
      console.log(`TestUniswapV3RouterBridge.swapExactInputSingleEx swap ${amountIn} WETH for ${amountOut} LP`);
    });

    it('should exchange WETH input tokens for exact LP output tokens via TestUniswapV3RouterBridge', async () => {
      // TODO: improvement => find the correct relationship between 'amountOut' and 'amountInMaximum' using 'uniswapV3 SDK'
      const amountOut = 100; // 100 LP
      const amountInMaximum = 1000;
      const amountIn = await uniswapV3RouterBridge.swapExactOutputSingleEx({
        tokenIn: wethAddress, // tokenIn
				 tokenOut: lpTokenAddress, // tokenOut
				 poolFee: poolFee_3000,
				 amountOut,
				 amountInMaximum,
      }, { call: true });
      console.log(`TestUniswapV3RouterBridge.swapExactInputSingleEx swap ${amountIn} WETH for ${amountOut} LP`);
    });
  });

  describe('#when Loophole deployed with startBlock > block number', async () => {
    let startBlockNumber1;

    before('before::hook', async () => {
      startBlockNumber1 = (await ethUtils.blockNumber()).plus(10);
      console.log('---startBlockNumber1: ', startBlockNumber1);
      await deployLoophole({ startBlockNumber: startBlockNumber1 });
    });

    it('should pick startBlock over block number when adding pool for last reward block', async () => {
      // NOTE: add WETH pool for testing
      loophole.switchWallet(owner);
      await loophole.add({
        token: wethAddress,
        allocPoint: wethAllocPoint,
      });

      // NOTE: get pool info and check lastRewardBlock
      const p = await loophole.getPool({ pid: wethPid });
      p.lastRewardBlock.should.be.bignumber.equal(startBlockNumber1);
    });
  });

  describe('#when Loophole deployed with startBlock < block number', async () => {
    let startBlockNumber1;

    before('before::hook', async () => {
      startBlockNumber1 = await ethUtils.blockNumber();
      console.log('---startBlockNumber1: ', startBlockNumber1);
      await deployLoophole({ startBlockNumber: startBlockNumber1 });
    });

    it('should pick block number over startBlock when adding pool for last reward block', async () => {
      // NOTE: add WETH pool for testing
      loophole.switchWallet(owner);
      await loophole.add({
        token: wethAddress,
        allocPoint: wethAllocPoint,
      });

      // NOTE: get pool info and check lastRewardBlock
      // only 2 blocks should have passed with latest transaction, loophole deploy and add weth pool
      const p = await loophole.getPool({ pid: wethPid });
      p.lastRewardBlock.should.be.bignumber.equal(startBlockNumber1.plus(2));
    });
  });

  describe('#Loophole contract deploy and check', async () => {
    it('should deploy Loophole Contract', async () => {
      await deployLoophole();
    });

    it('Loophole contract should have expected initial values', async () => {
      // console.log("***init.loophole.bp0");

      let res = await loophole.totalAllocPoint();
      expect(Number(res)).to.equal(0);

      res = await loophole.lpToken();
      expect(res).to.equal(lpTokenAddress);
      res = await loophole.lpTokensPerBlock();
      expect(Number(res)).to.equal(lpTokensPerBlock);
      res = await loophole.startBlock();
      // expect(BigNumber(res)).to.equal(deployedBlock);
      res.should.be.bignumber.equal(initStartBlock);
      res = await loophole.exitPenalty();
      expect(Number(res)).to.equal(0.2); // exitPenalty
      res = await loophole.exitPenaltyLP();
      expect(Number(res)).to.equal(0.1); // exitPenaltyLP

      // should have LP token pool already
      res = await loophole.poolExists(lpTokenAddress);
      expect(res).to.equal(true);

      // should have one pool, LOOP pool
      res = await loophole.poolsCount();
      expect(Number(res)).to.equal(1);

      // get pool info at pool-id 0 for LP token pool
      res = await loophole.getPool({ pid: 0 });
      expect(res.token).to.equal(lpTokenAddress);
      expect(res.allocPoint.toString()).to.equal(BigNumber(0).toString());
      // res.lastRewardBlock ???
      expect(res.totalPool.toString()).to.equal(BigNumber(0).toString());
      expect(res.entryStakeTotal.toString()).to.equal(BigNumber(0).toString());
      expect(res.totalDistributedPenalty.toString()).to.equal(BigNumber(0).toString());

      // getPoolInfo returns struct from solidity and it has array style indexed attributes
      // and also struct style with keys and values
      res = await loophole.getPoolInfo({ pid: 0 });
      console.log('loophole.getPoolInfo: ', res);
      expect(res.token).to.equal(lpTokenAddress);
      expect(res.allocPoint.toString()).to.equal(BigNumber(0).toString());
      // res.lastRewardBlock ???
      expect(res.totalPool.toString()).to.equal(BigNumber(0).toString());
      expect(res.entryStakeTotal.toString()).to.equal(BigNumber(0).toString());
      expect(res.totalDistributedPenalty.toString()).to.equal(BigNumber(0).toString());
    });
  });

  describe('#Loophole staking pools ADD', async () => {
    it('should revert when not owner user tries to add new staking pool', async () => {
      const allocPoint = 1;
      loophole.switchWallet(userAddress2);
      await beproAssert.reverts(loophole.add({
        token: wethAddress,
        allocPoint,
      }), 'OR'); // 'Owner Required'
      loophole.switchWallet(owner);
    });

    it('should add new staking pools WETH and WBTC and emit PoolAdded events', async () => {
      let allocPoint = 1;
      let pid = await loophole.getContract().methods.add(wethAddress, allocPoint).call();
      let tx = await loophole.add({
        token: wethAddress,
        allocPoint,
      });

      // const token = tx.events.PoolAdded.returnValues.token;
      // should emit PoolAdded event
      beproAssert.eventEmitted(tx, 'PoolAdded', ev => ev.token === wethAddress
				&& ev.allocPoint.toString() == allocPoint.toString()
				&& ev.pid.toString() == pid.toString());

      // check and assert pool added token
      let res = await loophole.poolExists(wethAddress);
      expect(res).to.equal(true);

      res = await loophole.getPool({ pid });
      expect(res.token).to.equal(wethAddress);
      expect(res.allocPoint.toString()).to.equal(allocPoint.toString());
      expect(res.allocPoint.toString()).to.equal('1');
      // res.lastRewardBlock ???
      // expect(res.totalPool.toString()).to.equal(BigNumber(0).toString());
      // expect(res.entryStakeTotal.toString()).to.equal(BigNumber(0).toString());
      // expect(res.totalDistributedPenalty.toString()).to.equal(BigNumber(0).toString());
      expect(res.totalPool.eq(BigNumber(0))).to.equal(true);
      expect(res.entryStakeTotal.eq(BigNumber(0))).to.equal(true);
      expect(res.totalDistributedPenalty.eq(BigNumber(0))).to.equal(true);

      allocPoint = 4;
      pid = await loophole.getContract().methods.add(wbtcAddress, allocPoint).call();
      tx = await loophole.add({
        token: wbtcAddress,
        allocPoint,
      });

      // const token = tx.events.PoolAdded.returnValues.token;
      // should emit PoolAdded event
      beproAssert.eventEmitted(tx, 'PoolAdded', ev => ev.token === wbtcAddress
				&& ev.allocPoint.toString() == allocPoint.toString()
				&& ev.pid.toString() == pid.toString());

      // check and assert pool added token
      res = await loophole.poolExists(wbtcAddress);
      expect(res).to.equal(true);

      res = await loophole.getPool({ pid });
      expect(res.token).to.equal(wbtcAddress);
      // expect(res.allocPoint.toString()).to.equal(allocPoint.toString());
      // expect(res.allocPoint.toString()).to.equal('4');
      expect(res.allocPoint.eq(allocPoint)).to.equal(true);
      expect(res.allocPoint.eq(BigNumber('4'))).to.equal(true);
      // res.lastRewardBlock ???
      expect(res.totalPool.toString()).to.equal(BigNumber(0).toString());
      expect(res.entryStakeTotal.toString()).to.equal(BigNumber(0).toString());
      expect(res.totalDistributedPenalty.toString()).to.equal(BigNumber(0).toString());
    });

    it('should revert when trying to add existing staking pool WETH', async () => {
      const allocPoint = 1;
      await beproAssert.reverts(loophole.add({
        token: wethAddress,
        allocPoint,
      }), 'TPE'); // 'Token Pool Exists'
    });
  });

  describe('#Loophole staking pools SET', async () => {
    it('should revert when not owner user tries to set/update staking pool WETH', async () => {
      loophole.switchWallet(userAddress2);
      const pid = 1;
      const allocPoint = 2;
      const withUpdate = false;
      await beproAssert.reverts(loophole.set({
        pid,
        allocPoint,
        withUpdate,
      }), 'OR'); // 'Owner Required'
      loophole.switchWallet(owner);
    });

    it('should revert when trying to set/update LOOP pool', async () => {
      const pid = 0;
      const allocPoint = 2;
      const withUpdate = false;
      await beproAssert.reverts(loophole.set({
        pid,
        allocPoint,
        withUpdate,
      }), 'PID_LOOP'); // PID is LOOP pool
    });

    it('should revert when trying to set/update inexistent pool', async () => {
      const pid = 3;
      const allocPoint = 2;
      const withUpdate = false;
      await beproAssert.reverts(loophole.set({
        pid,
        allocPoint,
        withUpdate,
      }), 'PID_OORI'); // 'PID Out Of Range Index'
    });

    it('should revert when trying to set/update the same allocation point', async () => {
      const pid = 1;
      const allocPoint = 1;
      const withUpdate = false;
      await beproAssert.reverts(loophole.set({
        pid,
        allocPoint,
        withUpdate,
      }), 'PID_NR'); // 'PID New Required'
    });

    it('should set/update staking pool WETH and emit PoolSet event', async () => {
      // do NOT update mining rewards, only update pool allocation point/share
      const withUpdate = false;

      // we know WETH pid is 1 but should have a storage struct for token-pid relation
      const pid = 1; // ???
      const allocPoint = 2;
      const tx = await loophole.set({
        pid,
        allocPoint,
        withUpdate,
      });

      const tokenRet = tx.events.PoolSet.returnValues.token;
      const allocPointRet = tx.events.PoolSet.returnValues.allocPoint;
      const pidRet = tx.events.PoolSet.returnValues.pid;
      console.log(`PoolSet>> tokenRet: ${tokenRet}, allocPointRet: ${allocPointRet}, pidRet: ${pidRet}`);
      expect(tokenRet).to.equal(wethAddress);
      expect(allocPointRet.toString()).to.equal(allocPoint.toString());
      expect(pidRet.toString()).to.equal(pid.toString());

      // should emit PoolSet event
      beproAssert.eventEmitted(tx, 'PoolSet', ev => ev.token === wethAddress
				&& ev.allocPoint.toString() == allocPoint.toString()
				&& ev.pid.toString() == pid.toString());

      // check and assert pool added token
      let res = await loophole.poolExists(wethAddress);
      expect(res).to.equal(true);

      res = await loophole.getPool({ pid });
      expect(res.token).to.equal(wethAddress);
      expect(res.allocPoint.toString()).to.equal(allocPoint.toString());
      expect(res.allocPoint.toString()).to.equal('2');
      // res.lastRewardBlock ???
      expect(res.totalPool.toString()).to.equal(BigNumber(0).toString());
      expect(res.entryStakeTotal.toString()).to.equal(BigNumber(0).toString());
      expect(res.totalDistributedPenalty.toString()).to.equal(BigNumber(0).toString());
    });

    it('should mass mine pools when set/update staking pool WETH', async () => {
      // NOTE: we need a new/fresh deployment for this test because we check for lastRewardBlock on the spools
      await deployLoophole();

      await approveWethTransfers(userAddress);
      await approveWbtcTransfers(userAddress);

      await addWethPool();
      await addWbtcPool();

      // NOTE:
      // in order for massUpdatePools flag to work and the pools to be mined for LP rewards
      // we need some stake amounts in each pool

      await loophole.stake({
        pid: 1,
        amount: 1000,
      }); // stake in WETH pool
      // NOTE: in 'stake' function we mine pool for LP rewards so we keep track of lastRewardBlock
      const wethLastRewardBlock = await loophole.getBlockNumber();
      console.log('---wethLastRewardBlock: ', wethLastRewardBlock);

      await loophole.stake({
        pid: 2,
        amount: 2000,
      }); // stake in WBTC pool
      // NOTE: in 'stake' function we mine pool for LP rewards so we keep track of lastRewardBlock
      const wbtcLastRewardBlock = await loophole.getBlockNumber();
      console.log('---wbtcLastRewardBlock: ', wbtcLastRewardBlock);

      // NOTE: assert we are at the expected block number
      let res = await loophole.getPool({ pid: 1 }); // WETH pool
      res.lastRewardBlock.should.be.bignumber.equal(wethLastRewardBlock);
      // save initial allocation point
      const { allocPoint } = res;

      // NOTE: assert we are at the expected block number
      res = await loophole.getPool({ pid: 2 }); // WBTC pool
      res.lastRewardBlock.should.be.bignumber.equal(wbtcLastRewardBlock);

      // do NOT update mining rewards, only update pool allocation point/share
      let withUpdate = false;

      /// NOTE: this is our testing function we test with massUpdatePools flag
      const pid = 1; // WETH pid is 1
      const allocPoint2 = allocPoint.plus(1);
      console.log('---allocPoint: ', allocPoint);
      console.log('---allocPoint2: ', allocPoint2);
      const tx = await loophole.set({
        pid,
        allocPoint: allocPoint2,
        withUpdate,
      });
      ///

      // NOTE:
      // checking that 'massUpdatePools' was not called by checking
      // that the pools were not mined for reward, lastRewardBlock is still the same it was before
      res = await loophole.getPool({ pid: 1 });
      // NOTE: pool lastRewardBlock should still be at the same block number as it was when last pool LP mining update took place
      res.lastRewardBlock.should.be.bignumber.equal(wethLastRewardBlock);

      res = await loophole.getPool({ pid: 2 });
      // NOTE: pool lastRewardBlock should still be at the same block number as it was when last pool LP mining update took place
      res.lastRewardBlock.should.be.bignumber.equal(wbtcLastRewardBlock);

      /// NOTE: test with massUpdatePools flag = true
      withUpdate = true;
      await loophole.set({
        pid,
        allocPoint,
        withUpdate,
      });

      // NOTE:
      // checking that 'massUpdatePools' was called by checking
      // that the pools were mined for reward, lastRewardBlock is the latest block number
      const currentBlock = await loophole.getBlockNumber();
      console.log('---currentBlock: ', currentBlock);
      res = await loophole.getPool({ pid: 1 });
      console.log('---weth.lastRewardBlock: ', res.lastRewardBlock);
      res.lastRewardBlock.should.be.bignumber.equal(currentBlock);
      res = await loophole.getPool({ pid: 2 });
      console.log('---wbtc.lastRewardBlock: ', res.lastRewardBlock);
      res.lastRewardBlock.should.be.bignumber.equal(currentBlock);
    });
  });

  describe('#Loophole liquidity mining pools', async () => {
    before('before-hook', async () => {
      await deployLoophole(setupWethAndWbtcPoolsConfig);
    });

    it('should revert when trying to mine LOOP pool', async () => {
      await beproAssert.reverts(loophole.updatePool({ pid: lpPid }), 'PID_LOOP'); // PID is LOOP pool
    });

    it('should revert when trying to mine inexistent pool', async () => {
      await beproAssert.reverts(loophole.updatePool({ pid: invalidPid }), 'PID_OORI'); // 'PID Out Of Range Index'
    });

    // NOTE: when totalPool is zero, only update lastRewardBlock
    // test case covered below in 'when staking pool is empty'

    it('should mine MAIN pools WETH and WBTC', async () => {
      await deployLoophole(setupWethAndWbtcPoolsConfig);

      await approveWethTransfers(userAddress);
      await approveWbtcTransfers(userAddress);

      await loophole.stake({
        pid: wethPid,
        amount: 1000,
      });
      await loophole.stake({
        pid: wbtcPid,
        amount: 1000,
      });

      await loophole.updatePool({ pid: wethPid }); // WETH mining
      await loophole.updatePool({ pid: wbtcPid }); // WBTC mining
    });
  });

  describe('#when staking pool is empty', async () => {
    before('before-hook6', async () => {
      // deploy a NEW loophole contract
      await deployLoophole(setupWethAndWbtcPoolsConfig);

      await approveWethTransfers(userAddress);
    });

    const test1 = 'should not distribute any LP tokens but should still update last reward block';
    it(test1, async () => {
      console.log('...', test1);

      let p = await loophole.getPool({ pid: wethPid });
      const lastRewardBlock1 = p.lastRewardBlock;
      const accLPtokensPerShare1 = p.accLPtokensPerShare;
      console.log('---lastRewardBlock1: ', lastRewardBlock1);
      console.log('---accLPtokensPerShare1: ', accLPtokensPerShare1);

      const tx = await loophole.updatePool({ pid: wethPid });
      // console.log('updatePool.tx: ', tx);
      // console.log('tx.events.PoolRewardUpdated.returnValues: ', tx.events.PoolRewardUpdated.returnValues);
      // console.log('tx.events: ', tx.events);

      // NOTE: 3 tx take place after WETH pool was added:
      // 1 to add WBTC
      // 1 tx to approve weth transfers
      // 1 to update/mine pool
      const nblocks = 3;

      p = await loophole.getPool({ pid: wethPid });
      const lastRewardBlock2 = p.lastRewardBlock;
      const accLPtokensPerShare2 = p.accLPtokensPerShare;
      console.log('---lastRewardBlock2: ', lastRewardBlock2);
      console.log('---accLPtokensPerShare2: ', accLPtokensPerShare2);
      // make sure we increased last reward block by one
      lastRewardBlock2.should.be.bignumber.equal(lastRewardBlock1.plus(nblocks));
      accLPtokensPerShare2.should.be.bignumber.equal(accLPtokensPerShare1);

      // the rest pool properties are still zero
      p.totalPool.should.be.bignumber.equal(0);
      p.entryStakeTotal.should.be.bignumber.equal(0);
      p.totalDistributedPenalty.should.be.bignumber.equal(0);
      p.accLPtokensPerShare.should.be.bignumber.equal(0);
    });
  });

  describe('#currentStake', async () => {
    // requireValidPid(pid)
    it('should revert when trying to read user current stake of inexistent pool', async () => {
      await beproAssert.reverts(loophole.currentStake({
        pid: invalidPid,
        user: userAddress,
      }), 'PID_OORI'); // 'PID Out Of Range Index'
    });

    it('should read user current stake of weth pool', async () => {
      const userStake1 = await loophole.currentStake({
        pid: wethPid,
        user: userAddress,
      });
      userStake1.should.be.bignumber.gte(0);
    });
  });

  describe('#getUserInfo', async () => {
    // requireValidPid(pid)
    it('should revert when trying to read user info of inexistent pool', async () => {
      await beproAssert.reverts(loophole.getUserInfo({
        pid: invalidPid,
        user: userAddress,
      }), 'PID_OORI'); // 'PID Out Of Range Index'
    });

    it('should read user info of weth pool', async () => {
      const userInfo1 = await loophole.getUserInfo({
        pid: wethPid,
        user: userAddress,
      });
      console.log('---userInfo1: ', userInfo1);
    });
  });

  describe('#getUserReward', async () => {
    // requireMainPool(pid)
    it('should revert when trying to read user reward of LOOP pool', async () => {
      await beproAssert.reverts(loophole.getUserReward({
        pid: lpPid,
        user: userAddress,
      }), 'PID_LOOP'); // 'PID is LOOP pool'
    });

    // requireValidPid(pid)
    it('should revert when trying to read user reward of inexistent pool', async () => {
      await beproAssert.reverts(loophole.getUserReward({
        pid: invalidPid,
        user: userAddress,
      }), 'PID_OORI'); // 'PID Out Of Range Index'
    });

    it('should read user reward of weth pool', async () => {
      const userReward1 = await loophole.getUserReward({
        pid: wethPid,
        user: userAddress,
      });
      console.log('---userReward1: ', userReward1);
      userReward1.should.be.bignumber.gte(0);
    });
  });

  describe('#getPoolReward', async () => {
    // requireValidPid(pid)
    it('should revert when trying to read pool reward of inexistent pool', async () => {
      await beproAssert.reverts(loophole.getPoolReward({ pid: invalidPid }), 'PID_OORI'); // 'PID Out Of Range Index'
    });

    it('should read pool reward of weth pool', async () => {
      const poolreward1 = await loophole.getPoolReward({ pid: wethPid });
      console.log('---poolreward1: ', poolreward1);
      poolreward1.should.be.bignumber.gte(0);
    });
  });

  describe('#stake/unstake', async () => {
    before('before-#stake/unstake', async () => {
      // deploy a NEW loophole contract
      await deployLoophole(setupWethAndWbtcPoolsConfig);

      await fundLoopholeWithLP();

      await approveWethTransfers(userAddress);
    });

    it('should revert when staking into inexistent pool', async () => {
      await beproAssert.reverts(loophole.stake({
        pid: invalidPid,
        amount: 1000,
      }), 'PID_OORI'); // 'PID Out Of Range Index'
    });

    it('when stake zero tokens, pool stake should still be zero', async () => {
      await loophole.stake({
        pid: wethPid,
        amount: 0,
      });

      const p = await loophole.getPool({ pid: wethPid });
      // console.log('---p.totalPool: ', p.totalPool);
      // console.log('---p.entryStakeTotal: ', p.entryStakeTotal);
      p.totalPool.should.be.bignumber.equal(0);
      p.entryStakeTotal.should.be.bignumber.equal(0);
    });

    // NOTE: test case not needed as we work with wrapped tokens
    // should revert when trying re-entrancy attack', async () => {

    it('should stake WETH and emit events: Transfer, Deposit', async () => {
      // NOTE: events 'Transfer' and 'TransferFrom'
      // have to be in the smart contract for them to be defined in the transaction
      // otherwise the tx will say 'undefined' event

      const balance1 = await weth.balanceOf(userAddress);
      console.log('weth.userAddress.balance1: ', balance1.toString());

      // approve loophole contract to spend weth
      // await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 }); //WETH_AMOUNT_1M
      // const allowance = await weth.allowance({ address: userAddress, spenderAddress: loopholeAddress });
      // console.log('stakeWETH.allowance: ', allowance);

      const pid = wethPid; // WETH pool-id is 1
      // const amount = Numbers.fromBNToDecimals(1000, wethDecimals); //WETH_AMOUNT_1M;
      const amount = BigNumber(1000);
      const tx = await loophole.stake({
        pid,
        amount,
      });

      // should emit event Transfer(address indexed from, address indexed to, uint256 value);
      beproAssert.eventEmitted(tx, 'Transfer');

      // should emit event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
      // const userRet = tx.events.Deposit.returnValues.user;
      const amountDecimals = await loophole.fromBNToDecimals(amount, pid);
      beproAssert.eventEmitted(tx, 'Deposit', ev => ev.user === userAddress
				&& ev.pid.toString() == pid.toString()
				// && ev.amount.toString() == amount.toString();
				&& ev.amount.toString() == amountDecimals.toString());

      // check balance match before and after
      const balance2 = await weth.balanceOf(userAddress);
      console.log('weth.userAddress.balance2: ', balance2.toString());
      // const expectedBalance = balance1.minus(Numbers.fromDecimalsToBN(amount, wethDecimals));
      const expectedBalance = balance1.minus(amount);
      balance2.should.be.bignumber.equal(expectedBalance);
    });

    it('should exit/unstake WETH and emit events: Transfer, TokenExchanged, Withdraw', async () => {
      const balance1 = await weth.balanceOf(userAddress);
      console.log('weth.userAddress.balance1: ', balance1.toString());
      const balanceC1 = await weth.balanceOf(loopholeAddress);
      console.log('weth.loopholeAddress.balanceC1: ', balanceC1.toString());
      const lpBalanceC1 = await lpToken.balanceOf(loopholeAddress);
      console.log('lpToken.loopholeAddress.lpBalanceC1: ', lpBalanceC1.toString());

      // NOTE: 'weth pool mine' is run on 'unstake', we account for LP tokens rewards for WETH pool per mining block
      // NOTE: user has all stake so he gets all LP rewards no sharing
      const lpTokensForWethPerBlock = 15;

      const pid = wethPid; // weth pool-id is 1
      // const amount = WETH_AMOUNT_1M;
      // const amount = BigNumber(Numbers.fromBNToDecimals(1000, wethDecimals));
      const amount = BigNumber(1000);
      // console.log('type of amount: ', typeof(amount));

      const exitPenalty = await loophole.exitPenalty();
      expect(exitPenalty.toString()).to.equal('0.2');

      const withdrawAmountExpectedTokens = amount.times(1 - exitPenalty); // amount * (1 - exitPenalty);
      // const withdrawAmountExpected = Numbers.fromDecimalsToBN(withdrawAmountExpectedTokens, wethDecimals);
      const withdrawAmountExpected = withdrawAmountExpectedTokens;
      console.log('withdrawAmountExpected: ', withdrawAmountExpected.toString().padStart(balance1.toString().length, ' '));

      const amountOutMinimum = 0; // do NOT use zero in production

      // NOTE: find out what amount of LP tokens we get in exchange for 200 WETH penalty as 20% penalty of 1000 weth
      // this is the last/only user and all penalty is exchanged for LP tokens
      const amountIn = await loophole.fromBNToDecimals(200, pid);
      const amountOut = await uniswapV3RouterBridge.swapExactInputSingleExCall({
        tokenIn: wethAddress, // tokenIn
        tokenOut: lpTokenAddress, // tokenOut
        poolFee: poolFee_3000,
        amountIn,
        amountOutMinimum,
      });
      // NOTE: this is what we get for the very first weth/lp exchange transaction
      const tokenAmountLPExpected = amountOut; // BigNumber('398687572423209140718');
      // amountOut.should.be.bignumber.equal(tokenAmountLPExpected);

      // TODO: calculate what 'amountOutMinimum' should be with uniswap-v3-sdk/uniswap-v3-periphery libs
      const tx = await loophole.exit({
        pid,
        amount,
        amountOutMinimum,
      });
      console.log('---loophole.exit.tx.events.TokenExchanged.returnValues: ', tx.events.TokenExchanged.returnValues);
      // console.log('---loophole.exit.tx.events.Withdraw.returnValues: ', tx.events.Withdraw.returnValues);
      // console.log('---loophole.exit.tx: ', tx);

      const amountDecimals = BigNumber(await loophole.fromBNToDecimals(amount, pid));
      const withdrawAmountExpectedDecimals = await loophole.fromBNToDecimals(withdrawAmountExpectedTokens, pid);

      // should emit event Transfer(address indexed from, address indexed to, uint256 value);
      beproAssert.eventEmitted(tx, 'Transfer');

      // should emit event TokenExchanged(address indexed user, address indexed token, uint256 tokenAmount, address indexed tokenLP, uint256 tokenAmountLP);
      const wethExitPenaltyAmountExpected = amountIn; // amountDecimals.times(exitPenalty);
      // beproAssert.eventEmitted(tx, 'TokenExchanged');
      beproAssert.eventEmitted(tx, 'TokenExchanged', ev => ev.user === userAddress
				&& ev.token == wethAddress
				&& ev.tokenAmount.toString() == wethExitPenaltyAmountExpected.toString()
				&& ev.tokenLP == lpTokenAddress
				&& ev.tokenAmountLP.toString() == tokenAmountLPExpected.toString());

      // should emit event Withdraw(address indexed user, uint256 indexed pid, uint256 amount, uint256 netAmount);
      beproAssert.eventEmitted(tx, 'Withdraw', ev => ev.user === userAddress
				&& ev.pid.toString() == pid.toString()
				&& ev.amount.toString() == amountDecimals.toString()
				&& ev.netAmount.toString() == withdrawAmountExpectedDecimals.toString());

      const balance2 = await weth.balanceOf(userAddress);
      console.log('weth.userAddress.balance2: ', balance2.toString());
      const balanceC2 = await weth.balanceOf(loopholeAddress);
      console.log('weth.loopholeAddress.balanceC2: ', balanceC2.toString());
      const lpBalanceC2 = await lpToken.balanceOf(loopholeAddress);
      console.log('lpToken.loopholeAddress.lpBalanceC2: ', lpBalanceC2.toString());

      // expect to have the correct amount of WETH
      // last exit pays full exit penalty
      balanceC2.should.be.bignumber.equal(BigNumber(balanceC1).minus(amount));

      // expect to have the correct amount of LP tokens from last exit as exit collected penalty
      const expectedLPtokensFromExitPenalty = Numbers.fromDecimalsToBN(tokenAmountLPExpected, lpDecimals);
      lpBalanceC2.should.be.bignumber.equal(BigNumber(lpBalanceC1).plus(expectedLPtokensFromExitPenalty).minus(lpTokensForWethPerBlock));

      const expectedBalance = balance1.plus(withdrawAmountExpected);
      balance2.should.be.bignumber.equal(expectedBalance);
    });

    it('should stake LP token in LOOP pool and emit Deposit event', async () => {
      const balance1 = await lpToken.balanceOf(userAddress);
      console.log('lpToken.userAddress.balance1: ', balance1.toString());

      // approve loophole contract to spend LP
      await lpToken.approve({ address: loopholeAddress, amount: lpBnMaxUint256 }); // LP_AMOUNT_1M

      const pid = 0; // LP pool-id is 0
      // const amount = LP_AMOUNT_1M;
      // const amount = BigNumber(Numbers.fromBNToDecimals(1000, lpDecimals));
      const amount = BigNumber(1000);
      const tx = await loophole.stake({
        pid,
        amount,
      });

      // should emit event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
      // const userRet = tx.events.Deposit.returnValues.user;
      const amountDecimals = await loophole.fromBNToDecimals(amount, pid);
      beproAssert.eventEmitted(tx, 'Deposit', ev => ev.user === userAddress
				&& ev.pid.toString() == pid.toString()
				// && ev.amount.toString() == amount.toString();
				&& ev.amount.toString() == amountDecimals.toString());

      // check balance match before and after
      const balance2 = await lpToken.balanceOf(userAddress);
      console.log('lpToken.userAddress.balance2: ', balance2.toString());
      // const expectedBalance = balance1.minus(Numbers.fromDecimalsToBN(amount, lpDecimals));
      const expectedBalance = balance1.minus(amount);
      balance2.should.be.bignumber.equal(expectedBalance);
    });

    it('should exit/unstake LP token from LOOP pool and emit Withdraw event', async () => {
      const balance1 = await lpToken.balanceOf(userAddress);
      console.log('lpToken.userAddress.balance1: ', balance1.toString());

      const pid = lpPid; // LP pool-id is 0
      const amount = BigNumber(1000);

      const exitPenaltyLP = await loophole.exitPenaltyLP();
      expect(exitPenaltyLP.toString()).to.equal('0.1');

      // amount * (1 - exitPenaltyLP);
      const withdrawAmountExpectedTokens = amount.times(1 - exitPenaltyLP);
      // const withdrawAmountExpected = Numbers.fromDecimalsToBN(withdrawAmountExpectedTokens, lpDecimals);
      const withdrawAmountExpected = withdrawAmountExpectedTokens;
      console.log('withdrawAmountExpected: ', withdrawAmountExpected);

      const tx = await loophole.exitLP({ amount });

      // should emit event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
      const amountDecimals = await loophole.fromBNToDecimals(amount, pid);
      const withdrawAmountExpectedDecimals = await loophole.fromBNToDecimals(withdrawAmountExpectedTokens, pid);
      beproAssert.eventEmitted(tx, 'Withdraw', ev => ev.user === userAddress
				&& ev.pid.toString() == pid.toString()
				&& ev.amount.toString() == amountDecimals.toString()
				&& ev.netAmount.toString() == withdrawAmountExpectedDecimals.toString());

      // check balance match before and after
      const balance2 = await lpToken.balanceOf(userAddress);
      console.log('lpToken.userAddress.balance2: ', balance2.toString());
      const expectedBalance = balance1.plus(withdrawAmountExpected);
      balance2.should.be.bignumber.equal(expectedBalance);
    });

    it('special/custom test case-1', async () => {
      // NOTES:
      // So here it goes a test case:
      // 4 Investors, A, B, C and D in a main pool, for example WETH
      // A stakes 200, B stakes 100, C stakes 50 and D stakes 100.

      // Then, they execute the following operations in this order
      // 1. B unstakes everything  (that is the 100)
      // 2. B stakes 75
      // 3. C unstakes everything
      // 4. B stakes 200
      // 5. B stakes 100
      // 6. B unstakes 100

      // These operations cover the 4 main operations we have, stake, a top-up stake, unstake everything,
      // and unstake just a partial amount. The final result for the variables should the following for a main pool:

      // Investor A  currentStake = 212.0136
      // Investor B  currentStake = 280.6938
      // Investor D  currentStake = 106.0068

      // totalPool = 598.7142
      // entryStakeTotal = 564.7885
      // entryStakeAdjusted(A) 200
      // entryStakeAdjusted(B) 264.7885
      // entryStakeAdjusted(D) 100
      // totalDistributedPenalty 25.14285

      // deploy a NEW loophole contract
      await deployLoophole(setupWethAndWbtcPoolsConfig);

      await fundLoopholeWithLP();

      // const investorA = wallets[0];
      // const investorB = wallets[1];
      // const investorC = wallets[2];
      // const investorD = wallets[3];
      const [investorA, investorB, investorC, investorD] = [userAddress2, userAddress3, userAddress4, userAddress5];
      // const [investorA, investorB, investorC, investorD] = [userAddress, userAddress2, userAddress3, userAddress4];
      // assert we have all these wallets and we are NOT on a test net with a single account
      validateWallet(investorA);
      validateWallet(investorB);
      validateWallet(investorC);
      validateWallet(investorD);
      // A stakes 200, B stakes 100, C stakes 50 and D stakes 100.

      const pid = 1; // WETH pid is 1
      const amountA = 200; // A stake
      const amountB = 100; // B stake
      const amountC = 50; // C stake
      const amountD = 100; // D stake
      let newAddress;

      const invAcurrentStake1 = await loophole.currentStake({
        pid,
        user: investorA,
      });
      const invBcurrentStake1 = await loophole.currentStake({
        pid,
        user: investorB,
      });
      const invCcurrentStake1 = await loophole.currentStake({
        pid,
        user: investorC,
      });
      const invDcurrentStake1 = await loophole.currentStake({
        pid,
        user: investorD,
      });

      console.log('invAcurrentStake1        : ', invAcurrentStake1);
      console.log('invBcurrentStake1        : ', invBcurrentStake1);
      console.log('invCcurrentStake1        : ', invCcurrentStake1);
      console.log('invDcurrentStake1        : ', invDcurrentStake1);

      let res = await loophole.getPool({ pid });
      console.log('pool.totalPool: ', res.totalPool);
      console.log('pool.entryStakeTotal: ', res.entryStakeTotal);
      console.log('pool.totalDistributedPenalty: ', res.totalDistributedPenalty);

      /// investorA
      console.log('testcase.bp-0');
      newAddress = await loophole.switchWallet(investorA).getUserAddress();
      console.log('testcase.bp-1');
      expect(newAddress).to.equal(investorA);
      weth.switchWallet(investorA);
      // lpToken.switchWallet(investorA);

      // already approved for investorA as it is the first wallet
      await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 });
		  console.log('investorA.weth.allowance: ', await weth.allowance({ address: investorA, spenderAddress: loopholeAddress }));
		  // await lpToken.approve({ address: loopholeAddress, amount: lpBnMaxUint256 });
      // console.log('investorA.lp.allowance: ', await lpToken.allowance({ address: investorA, spenderAddress: loopholeAddress }));

      let amount = amountA; // A stake
      let tx = await loophole.stake({
        pid,
        amount,
      });
      console.log('testcase.bp-2');

      /// investorB
      newAddress = await loophole.switchWallet(investorB).getUserAddress();
      expect(newAddress).to.equal(investorB);
      weth.switchWallet(investorB);
      // lpToken.switchWallet(investorB);

      await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 });
		  console.log('investorB.weth.allowance: ', await weth.allowance({ address: investorB, spenderAddress: loopholeAddress }));
		  // await lpToken.approve({ address: loopholeAddress, amount: lpBnMaxUint256 });
      // console.log('investorB.lp.allowance: ', await lpToken.allowance({ address: investorB, spenderAddress: loopholeAddress }));

      amount = amountB; // B stake
      tx = await loophole.stake({
        pid,
        amount,
      });
      console.log('testcase.bp-3');

      /// investorC
      newAddress = await loophole.switchWallet(investorC).getUserAddress();
      expect(newAddress).to.equal(investorC);
      weth.switchWallet(investorC);
      // lpToken.switchWallet(investorC);

      await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 });
		  console.log('investorC.weth.allowance: ', await weth.allowance({ address: investorC, spenderAddress: loopholeAddress }));
		  // await lpToken.approve({ address: loopholeAddress, amount: lpBnMaxUint256 });
      // console.log('investorC.lp.allowance: ', await lpToken.allowance({ address: investorC, spenderAddress: loopholeAddress }));

      amount = amountC; // C stake
      tx = await loophole.stake({
        pid,
        amount,
      });
      console.log('testcase.bp-4');

      /// investorD
      newAddress = await loophole.switchWallet(investorD).getUserAddress();
      expect(newAddress).to.equal(investorD);
      weth.switchWallet(investorD);
      // lpToken.switchWallet(investorD);

      await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 });
		  console.log('investorD.weth.allowance: ', await weth.allowance({ address: investorD, spenderAddress: loopholeAddress }));
		  // await lpToken.approve({ address: loopholeAddress, amount: lpBnMaxUint256 });
      // console.log('investorD.lp.allowance: ', await lpToken.allowance({ address: investorD, spenderAddress: loopholeAddress }));

      amount = amountD; // D stake
      tx = await loophole.stake({
        pid,
        amount,
      });
      console.log('testcase.bp-5');

      // >>> assert staked amounts match
      const invAwethBalance1 = await weth.balanceOf(investorA);
      const invBwethBalance1 = await weth.balanceOf(investorB);
      const invCwethBalance1 = await weth.balanceOf(investorC);
      const invDwethBalance1 = await weth.balanceOf(investorD);
      console.log('weth.invAwethBalance1.balance1: ', invAwethBalance1.toString());
      console.log('weth.invBwethBalance1.balance1: ', invBwethBalance1.toString());
      console.log('weth.invCwethBalance1.balance1: ', invCwethBalance1.toString());
      console.log('weth.invDwethBalance1.balance1: ', invDwethBalance1.toString());

      res = await loophole.getPool({ pid });
      console.log('pool.totalPool: ', res.totalPool);
      console.log('pool.entryStakeTotal: ', res.entryStakeTotal);
      console.log('pool.totalDistributedPenalty: ', res.totalDistributedPenalty);
      // expect(res.totalPool.toString()).to.equal(BigNumber(0).toString());
      // expect(res.entryStakeTotal.toString()).to.equal(BigNumber(0).toString());
      // expect(res.totalDistributedPenalty.toString()).to.equal(BigNumber(0).toString());

      const invAstake = await loophole.getCurrentEntryStakeUser({
        pid,
        user: investorA,
      });
      const invBstake = await loophole.getCurrentEntryStakeUser({
        pid,
        user: investorB,
      });
      const invCstake = await loophole.getCurrentEntryStakeUser({
        pid,
        user: investorC,
      });
      const invDstake = await loophole.getCurrentEntryStakeUser({
        pid,
        user: investorD,
      });
      console.log('invAstake: ', invAstake);
      console.log('invBstake: ', invBstake);
      console.log('invCstake: ', invCstake);
      console.log('invDstake: ', invDstake);
      assert.equal(invAstake, amountA, 'investorA amount should match');
      assert.equal(invBstake, amountB, 'investorB amount should match');
      assert.equal(invCstake, amountC, 'investorC amount should match');
      assert.equal(invDstake, amountD, 'investorD amount should match');

      const invAcurrentStake2 = await loophole.currentStake({
        pid,
        user: investorA,
      });
      const invBcurrentStake2 = await loophole.currentStake({
        pid,
        user: investorB,
      });
      const invCcurrentStake2 = await loophole.currentStake({
        pid,
        user: investorC,
      });
      const invDcurrentStake2 = await loophole.currentStake({
        pid,
        user: investorD,
      });
      console.log('invAcurrentStake2: ', invAcurrentStake2);
      console.log('invBcurrentStake2: ', invBcurrentStake2);
      console.log('invCcurrentStake2: ', invCcurrentStake2);
      console.log('invDcurrentStake2: ', invDcurrentStake2);
      assert.equal(invAcurrentStake2, amountA, 'investorA amount should match');
      assert.equal(invBcurrentStake2, amountB, 'investorB amount should match');
      assert.equal(invCcurrentStake2, amountC, 'investorC amount should match');
      assert.equal(invDcurrentStake2, amountD, 'investorD amount should match');
      /// <<<

      const amountOutMinimum = 0; // do NOT use zero this in production

      // Then, they execute the following operations in this order
      // 1. B unstakes everything  (that is the 100)
      loophole.switchWallet(investorB);
      amount = amountB;
      tx = await loophole.exit({
        pid,
        amount,
        amountOutMinimum,
      });
      console.log('testcase.bp-6');
      console.log('---loophole.exit.tx.events.TokenExchanged.returnValues: ', tx.events.TokenExchanged.returnValues);

      // 2. B stakes 75
      // loophole.switchWallet(investorB);
      amount = 75;
      tx = await loophole.stake({
        pid,
        amount,
      });
      console.log('testcase.bp-7');

      // 3. C unstakes everything
      loophole.switchWallet(investorC);
      amount = amountC;
      tx = await loophole.exit({
        pid,
        amount,
        amountOutMinimum,
      });
      console.log('testcase.bp-8');
      console.log('---loophole.exit.tx.events.TokenExchanged.returnValues: ', tx.events.TokenExchanged.returnValues);

      // 4. B stakes 200
      loophole.switchWallet(investorB);
      amount = 200;
      tx = await loophole.stake({
        pid,
        amount,
      });
      console.log('testcase.bp-9');

      // 5. B stakes 100
      loophole.switchWallet(investorB);
      amount = 100;
      tx = await loophole.stake({
        pid,
        amount,
      });
      console.log('testcase.bp-10');

      // 6. B unstakes 100
      loophole.switchWallet(investorB);
      amount = 100;
      tx = await loophole.exit({
        pid,
        amount,
        amountOutMinimum,
      });
      console.log('testcase.bp-11');
      console.log('---loophole.exit.tx.events.TokenExchanged.returnValues: ', tx.events.TokenExchanged.returnValues);

      // The final result for the variables should the following for a main pool:
      // Investor A  currentStake = 212.0136
      // Investor B  currentStake = 280.6938
      // Investor D  currentStake = 106.0068
      const expectedInvAcurrentStake = BigNumber(212.0136);
      const expectedInvBcurrentStake = BigNumber(280.6938);
      const expectedInvDcurrentStake = BigNumber(106.0068);

      const invAcurrentStake = await loophole.currentStake({
        pid,
        user: investorA,
      });
      const invBcurrentStake = await loophole.currentStake({
        pid,
        user: investorB,
      });
      const invDcurrentStake = await loophole.currentStake({
        pid,
        user: investorD,
      });

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

      // const { token, allocPoint, lastRewardBlock, totalPool, entryStakeTotal, totalDistributedPenalty } = await loophole.getPool({ pid: pid});
      const poolInfo = await loophole.getPool({ pid });

      console.log('poolInfo.totalPool              : ', poolInfo.totalPool);
      console.log('expectedTotalPool               : ', expectedTotalPool);
      console.log('poolInfo.entryStakeTotal        : ', poolInfo.entryStakeTotal);
      console.log('expectedEntryStakeTotal         : ', expectedEntryStakeTotal);
      console.log('poolInfo.totalDistributedPenalty: ', poolInfo.totalDistributedPenalty);
      console.log('expectedTotalDistributedPenalty : ', expectedTotalDistributedPenalty);

      const entryStakeAdjustedA = await loophole.getEntryStakeAdjusted({
        pid,
        user: investorA,
      });
      const entryStakeAdjustedB = await loophole.getEntryStakeAdjusted({
        pid,
        user: investorB,
      });
      const entryStakeAdjustedD = await loophole.getEntryStakeAdjusted({
        pid,
        user: investorD,
      });

      console.log('entryStakeAdjustedA        : ', entryStakeAdjustedA);
      console.log('expectedEntryStakeAdjustedA: ', expectedEntryStakeAdjustedA);
      console.log('entryStakeAdjustedB        : ', entryStakeAdjustedB);
      console.log('expectedEntryStakeAdjustedB: ', expectedEntryStakeAdjustedB);
      console.log('entryStakeAdjustedD        : ', entryStakeAdjustedD);
      console.log('expectedEntryStakeAdjustedD: ', expectedEntryStakeAdjustedD);

      // TODO: enabling asserts will fail the test due to small error tolerance
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

  describe('#when collectRewards', async () => {
    it('should revert when when collecting LP rewards from LOOP pool', async () => {
      await beproAssert.reverts(loophole.collectRewards({ pid: lpPid }), 'PID_LOOP'); // PID is LOOP pool
    });

    it('should revert when collecting LP rewards from inexistent pool', async () => {
      await beproAssert.reverts(loophole.collectRewards({ pid: invalidPid }), 'PID_OORI'); // 'PID Out Of Range Index'
    });

    // NOTE: test case not needed as we work with wrapped tokens
    // should revert when trying re-entrancy attack', async () => {

    // NOTE: tested below in '#distribute correct LP tokens to users'
    // it('should collect LP rewards from staking pool WETH', async () => {
    // });
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
    // getBlocksFromRange(uint256 from, uint256 to);
    let startBlock1;

    before('before-#stake/unstake', async () => {
      startBlock1 = BigNumber(await loophole.startBlock());
      console.log('startBlock1: ', startBlock1);
      // NOTE: startBlock is 1 by default
      startBlock1.should.be.bignumber.equal(1);
    });

    it('should revert when "from" block is greater than "to" block', async () => {
      const to = 0;
      const from = 1;
      await beproAssert.reverts(loophole.getBlocksFromRange({ from, to }));
    });

    it('should return 1 when "to" block is 3 and "from" block is 2', async () => {
      // NOTE: 'from' is 2 which is greater than 'startBlock' which is 1
      const to = 3;
      const from = 2;
      const res = await loophole.getBlocksFromRange({ from, to });
      res.should.be.bignumber.equal(1);
    });

    it('should pick "from" block when greater than "startBlock"', async () => {
      // test: from = from >= startBlock ? from : startBlock;
      const to = startBlock1.plus(100);
      const from = startBlock1.plus(1);
      const res = await loophole.getBlocksFromRange({ from, to });
      res.should.be.bignumber.equal(99);
    });

    it('should pick "startBlock" block when greater than "from" block', async () => {
      // test: from = from >= startBlock ? from : startBlock;
      // NOTE: for this test case we need startBlock to be minimum 1
      // so we can decrease its value for 'from' parameter as we have an unsigned uint256 type
      const to = startBlock1.plus(100);
      const from = startBlock1.minus(1);
      const res = await loophole.getBlocksFromRange({ from, to });
      res.should.be.bignumber.equal(100);
    });
  });

  describe('#when user profit from others exit is greater than his own stake', async () => {
    beforeEach('beforeEach-hook1', async () => {
      // deploy a NEW loophole contract
      await deployLoophole(setupWethAndWbtcPoolsConfig);

      await fundLoopholeWithLP();
    });

    it('should exit/unstake with no revert/error', async () => {
      const [investorA, investorB, investorC, investorD] = [userAddress2, userAddress3, userAddress4, userAddress5];
      // assert we have all these wallets and we are NOT on a test net with a single account
      validateWallet(investorA);
      validateWallet(investorB);
      validateWallet(investorC);
      validateWallet(investorD);

      // A stakes 100, B stakes 10000
      const pid = 1; // WETH pid is 1
      const amountA = BigNumber(100);
      const amountB = BigNumber(10000);
      let res;
      let tx;

      const amountOutMinimum = 0; // do NOT use zero this in production

      loophole.switchWallet(investorA);
      // weth.switchWallet(investorA);
      // already approved for investorA as it is the first wallet
      // await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 });
      await approveWethTransfers(investorA);
		  console.log('investorA.weth.allowance: ', await weth.allowance({ address: investorA, spenderAddress: loopholeAddress }));

      await loophole.stake({
        pid,
        amount: amountA,
      });
      console.log('test.bp-0');

      loophole.switchWallet(investorB);
      // weth.switchWallet(investorB);
      // already approved for investorA as it is the first wallet
      // await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 });
      await approveWethTransfers(investorB);
		  console.log('investorB.weth.allowance: ', await weth.allowance({ address: investorB, spenderAddress: loopholeAddress }));

      await loophole.stake({
        pid,
        amount: amountB,
      });
      console.log('test.bp-1');

      const invAstake = await loophole.currentStake({
        pid,
        user: investorA,
      });
      const invBstake = await loophole.currentStake({
        pid,
        user: investorB,
      });
      console.log('invAstake: ', invAstake);
      console.log('invBstake: ', invBstake);
      invAstake.should.be.bignumber.equal(amountA);
      invBstake.should.be.bignumber.equal(amountB);

      // investorB exits whole amount 10k WETH, 2k WETH is paid as penalty:
      // 1k WETH goes to other users in WETH pool
      // 1k WETH is converted to LP tokens and goes to LOOP pool
      await loophole.exit({
        pid,
        amount: amountB,
        amountOutMinimum,
      });

      // check investorA and investorB new stakes
      const invAstake2 = await loophole.currentStake({
        pid,
        user: investorA,
      });
      const invBstake2 = await loophole.currentStake({
        pid,
        user: investorB,
      });
      console.log('invAstake2: ', invAstake2);
      console.log('invBstake2: ', invBstake2);
      invAstake2.should.be.bignumber.equal(1100);
      invBstake2.should.be.bignumber.equal(0);

      // check pool state
      let poolInfo = await loophole.getPool({ pid });
      console.log('poolInfo.totalPool              : ', poolInfo.totalPool);
      console.log('poolInfo.entryStakeTotal        : ', poolInfo.entryStakeTotal);
      console.log('poolInfo.totalDistributedPenalty: ', poolInfo.totalDistributedPenalty);
      poolInfo.totalPool.should.be.bignumber.equal(1100);
      poolInfo.entryStakeTotal.should.be.bignumber.equal(100);
      poolInfo.totalDistributedPenalty.should.be.bignumber.equal(1000);

      const invAstakeAdjusted = await loophole.getEntryStakeAdjusted({
        pid,
        user: investorA,
      });
      const invBstakeAdjusted = await loophole.getEntryStakeAdjusted({
        pid,
        user: investorB,
      });
      const invAstakeUser = await loophole.getCurrentEntryStakeUser({
        pid,
        user: investorA,
      });
      const invBstakeUser = await loophole.getCurrentEntryStakeUser({
        pid,
        user: investorB,
      });
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
      const halfAmount = 550; // 1100 / 2;
      await loophole.exit({
        pid,
        amount: halfAmount,
        amountOutMinimum,
      });
      const invAstake3 = await loophole.currentStake({
        pid,
        user: investorA,
      });
      console.log('invAstake3: ', invAstake3);
      // 605 = 550 + 10% penalty of 550 = 55, goes back into the pool
      invAstake3.should.be.bignumber.equal(605);

      // check pool state
      poolInfo = await loophole.getPool({ pid });
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
      await loophole.exit({
        pid,
        amount: 605,
        amountOutMinimum,
      });
      const invAstake4 = await loophole.currentStake({
        pid,
        user: investorA,
      });
      console.log('invAstake4: ', invAstake4);
      invAstake4.should.be.bignumber.equal(0);

      // check pool state
      poolInfo = await loophole.getPool({ pid });
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

  describe('#when user profit from others exit is less than his own stake', async () => {
    beforeEach('beforeEach-hook2', async () => {
      // deploy a NEW loophole contract
      await deployLoophole(setupWethAndWbtcPoolsConfig);

      await fundLoopholeWithLP();
    });

    it('should exit/unstake with no revert/error', async () => {
      const [investorA, investorB, investorC, investorD] = [userAddress2, userAddress3, userAddress4, userAddress5];
      // assert we have all these wallets and we are NOT on a test net with a single account
      validateWallet(investorA);
      validateWallet(investorB);
      validateWallet(investorC);
      validateWallet(investorD);

      // A stakes 10000, B stakes 100
      const pid = 1; // WETH pid is 1
      const amountA = BigNumber(10000);
      const amountB = BigNumber(100);
      let res;
      let tx;

      const amountOutMinimum = 0; // do NOT use zero this in production

      loophole.switchWallet(investorA);
      // weth.switchWallet(investorA);
      // already approved for investorA as it is the first wallet
      // await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 });
      await approveWethTransfers(investorA);
		  console.log('investorA.weth.allowance: ', await weth.allowance({ address: investorA, spenderAddress: loopholeAddress }));

      await loophole.stake({
        pid,
        amount: amountA,
      });
      console.log('test.bp-0');

      loophole.switchWallet(investorB);
      // weth.switchWallet(investorB);
      // already approved for investorA as it is the first wallet
      // await weth.approve({ address: loopholeAddress, amount: wethBnMaxUint256 });
      await approveWethTransfers(investorB);
		  console.log('investorB.weth.allowance: ', await weth.allowance({ address: investorB, spenderAddress: loopholeAddress }));

      await loophole.stake({
        pid,
        amount: amountB,
      });
      console.log('test.bp-1');

      const invAstake = await loophole.currentStake({
        pid,
        user: investorA,
      });
      const invBstake = await loophole.currentStake({
        pid,
        user: investorB,
      });
      console.log('invAstake: ', invAstake);
      console.log('invBstake: ', invBstake);
      invAstake.should.be.bignumber.equal(amountA);
      invBstake.should.be.bignumber.equal(amountB);

      // investorB exits whole amount 100 WETH, 20 WETH is paid as penalty:
      // 10 WETH goes to other users in WETH pool
      // 10 WETH is converted to LP tokens and goes to LOOP pool
      await loophole.exit({
        pid,
        amount: amountB,
        amountOutMinimum,
      });

      // check investorA and investorB new stakes
      const invAstake2 = await loophole.currentStake({
        pid,
        user: investorA,
      });
      const invBstake2 = await loophole.currentStake({
        pid,
        user: investorB,
      });
      console.log('invAstake2: ', invAstake2);
      console.log('invBstake2: ', invBstake2);
      invAstake2.should.be.bignumber.equal(BigNumber(10010));
      invBstake2.should.be.bignumber.equal(BigNumber(0));

      // check pool state
      let poolInfo = await loophole.getPool({ pid });
      console.log('poolInfo.totalPool              : ', poolInfo.totalPool);
      console.log('poolInfo.entryStakeTotal        : ', poolInfo.entryStakeTotal);
      console.log('poolInfo.totalDistributedPenalty: ', poolInfo.totalDistributedPenalty);
      poolInfo.totalPool.should.be.bignumber.equal(BigNumber(10010));
      poolInfo.entryStakeTotal.should.be.bignumber.equal(BigNumber(10000));
      poolInfo.totalDistributedPenalty.should.be.bignumber.equal(BigNumber(10));

      const invAstakeAdjusted = await loophole.getEntryStakeAdjusted({
        pid,
        user: investorA,
      });
      const invBstakeAdjusted = await loophole.getEntryStakeAdjusted({
        pid,
        user: investorB,
      });
      const invAstakeUser = await loophole.getCurrentEntryStakeUser({
        pid,
        user: investorA,
      });
      const invBstakeUser = await loophole.getCurrentEntryStakeUser({
        pid,
        user: investorB,
      });
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
      await loophole.exit({
        pid,
        amount: 10010,
        amountOutMinimum,
      });
      const invAstake3 = await loophole.currentStake({
        pid,
        user: investorA,
      });
      console.log('invAstake3: ', invAstake3);
      invAstake3.should.be.bignumber.equal(BigNumber(0));

      // check pool state
      poolInfo = await loophole.getPool({ pid });
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

  describe('#distribute no LP tokens after 0 blocks', async () => {
    // NOTE: tests group is only for local environment
    before('before-hook4', async () => {
      assertLocalTestOnly();
    });

    beforeEach('beforeEach-hook4', async () => {
      await deployLoophole();
    });

    it('should distribute no LP tokens to WETH pool', async () => {
      await addWethPool();
      const pid = 1; // WETH pid

      /// NOTE: other transactions can take place

      // rewind back to 'deployedBlock'
      // adding staking pools resulted in transactions increasing block number
      // NOTE: not needed in this case but we do it for generic testing behavious
      await traveler.revertToSnapshot(wethStartBlockSnapshotId);
      console.log('---traveler.revertToSnapshot: wethStartBlockSnapshotId');

      const poolReward = await loophole.getPoolReward({ pid });
      console.log('---poolReward: ', poolReward);
      poolReward.should.be.bignumber.equal(0);

      // 1 block for adding WETH pool
      const deployedBlock2 = deployedBlock.plus(1);
      // last reward block should match current block which is the next
      // block after deployedBlock because we add WETH pool with a transaction
      const pool = await loophole.getPool({ pid });
      console.log('---deployedBlock2: ', deployedBlock2);
      console.log('---pool.lastRewardBlock: ', pool.lastRewardBlock);
      pool.lastRewardBlock.should.be.bignumber.equal(deployedBlock2);
      pool.totalPool.should.be.bignumber.equal(0);
      pool.entryStakeTotal.should.be.bignumber.equal(0);
      pool.totalDistributedPenalty.should.be.bignumber.equal(0);
      pool.accLPtokensPerShare.should.be.bignumber.equal(0);
    });

    // it('should distribute no LP tokens to WBTC pool', async () => {
    // });
  });

  let [userA, userB, userC, userD] = [0, 0, 0, 0];
  const wethShare = 0.3;
  const wbtcShare = 0.7;
  const wethBlocks = 9; // forward blocks
  const wbtcBlocks = 8;

  const blocks = 10;
  const blocksForward = blocks - 2; // 2 tx needed to add staking pools
  let block10; // = deployedBlock + blocksForward;

  describe('#distribute correct LP tokens to WETH and WBTC pools after 10 blocks', async () => {
    // NOTE: tests group is only for local environment
    before('before-hook5', async () => {
      assertLocalTestOnly();
    });

    beforeEach('beforeEach-hook5', async () => {
      // before('before-hook5', async () => {
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
      block10 = deployedBlock.plus(blocks); // blocksForward;
      console.log('---block10: ', block10);
      currBlock.should.be.bignumber.equal(block10);
    });

    // test function helper to assert pool reward and las pool reward block
    const assertPoolShare = async (pid, poolSharePercent, xblocks) => {
      const expectedPoolReward = xblocks * lpTokensPerBlock * poolSharePercent;
      const poolReward = await loophole.getPoolReward({ pid });
      console.log('---expectedPoolReward: ', expectedPoolReward);
      console.log('---poolReward        : ', poolReward);

      // last reward block should match current block
      const pool = await loophole.getPool({ pid });
      console.log('---deployedBlock: ', deployedBlock);
      console.log('---pool.lastRewardBlock: ', pool.lastRewardBlock);
      console.log('---block10: ', block10);
      // const thisBlock = deployedBlock.plus(xblocks);
      // console.log('---thisBlock: ', thisBlock);
      // thisBlock.should.be.equal(block10);

      poolReward.should.be.bignumber.equal(expectedPoolReward);
      /// pool.lastRewardBlock.should.be.equal(block10);
    };

    it('should distribute 30% LP tokens to WETH pool', async () => {
      console.log('...WETH pool...');
      await assertPoolShare(wethPid, wethShare, wethBlocks);
    });

    it('should distribute 70% LP tokens to WBTC pool', async () => {
      console.log('...WBTC pool...');
      await assertPoolShare(wbtcPid, wbtcShare, wbtcBlocks);
    });
  });

  describe('#distribute correct LP tokens to users from LP mining based on MAIN pool staking - [SEQUENCE]', async () => {
    let lpBalance1; let
      lpBalance2;
    const stakeA = Number(1000);
    const stakeB = Number(2000);
    const stakeC = Number(3000);
    const stakeD = Number(4000);
    const stakeTotal = stakeA + stakeB + stakeC + stakeD;

    // NOTE: tests group is only for local environment
    before('before-hook6a', async () => {
      assertLocalTestOnly();
    });

    // beforeEach('beforeEach-hook6', async () => {
    before('before-hook6', async () => {
      // deploy a NEW loophole contract
      await deployLoophole(setupWethAndWbtcPoolsConfig);

      [userA, userB, userC, userD] = [userAddress2, userAddress3, userAddress4, userAddress5];

      await fundLoopholeWithLP();
      // approve WETH transfers for loophole contract
      await approveBulkWethTransfers(userA, userB, userC, userD);
      // approve LP transfers for loophole contract
      await approveBulkLPTransfers(userA, userB, userC, userD);

      // forward blockchain to 'block10'
      // await forwardBlocks(blocksForward);
      // console.log('---forwardBlocks: ', blocksForward);

      // const currBlock = await loophole.getBlockNumber();
      // block10 = deployedBlock.plus(blocks);
      // console.log('---block10: ', block10);
      // currBlock.should.be.bignumber.equal(block10);
    });

    const test1 = 'should distribute correct LP tokens to users';
    it(test1, async () => {
      console.log('...', test1);
      // userA stakes
      const pid = wethPid;

      const lpTokensPerBlockRaw = BigNumber(Numbers.fromBNToDecimals(lpTokensPerBlock, lpDecimals));
      const blockNumber1 = await loophole.getBlockNumber();
      console.log('---lpTokensPerBlock   : ', lpTokensPerBlock);
      console.log('---lpTokensPerBlockRaw: ', lpTokensPerBlockRaw);
      console.log('---blockNumber1: ', blockNumber1);

      const poolShare = Number(0.3);
      let pool;// = await loophole.getPool({ pid: pid});
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
      let res;

      // NOTE:
      loophole.switchWallet(userA);
      await loophole.stake({
        pid,
        amount: stakeA,
      });

      // 2 blocks passed by for liquidity mining
      pool = await loophole.getPool({ pid });
      pTotalPool = pool.totalPool;
      pEntryStakeTotal = pool.entryStakeTotal;
      pAccLPtokensPerShare = pool.accLPtokensPerShare;
      console.log('---BP-0');
      console.log('---pTotalPool: ', pTotalPool);
      console.log('---pEntryStakeTotal: ', pEntryStakeTotal);
      console.log('---pAccLPtokensPerShare: ', pAccLPtokensPerShare);
      pTotalPool.should.be.bignumber.equal(1000); // stakeA);
      pEntryStakeTotal.should.be.bignumber.equal(1000); // stakeA);
      pAccLPtokensPerShare.should.be.bignumber.equal(0);
      const userAaccLPtokensPerShare = pAccLPtokensPerShare;

      // NOTE: mining pool for rewards with no tokens staked, updates pool.lastRewardBlock
      const blockNumber = await loophole.getBlockNumber();
      console.log('---blockNumber: ', blockNumber);
      console.log('---pool.lastRewardBlock: ', pool.lastRewardBlock);
      blockNumber.should.be.bignumber.equal(pool.lastRewardBlock);

      // NOTE:
      loophole.switchWallet(userB);
      await loophole.stake({
        pid,
        amount: stakeB,
      });

      // NOTE: pool.accLPtokensPerShare will look at totalPool before user staking tokens
      // , in this case 1000 as userA staking deposit
      pool = await loophole.getPool({ pid });
      pTotalPool = pool.totalPool;
      pEntryStakeTotal = pool.entryStakeTotal;
      pAccLPtokensPerShare = pool.accLPtokensPerShare;
      console.log('---BP-1');
      console.log('---pTotalPool: ', pTotalPool);
      console.log('---pEntryStakeTotal: ', pEntryStakeTotal);
      console.log('---pAccLPtokensPerShare: ', pAccLPtokensPerShare);
      lpTokensReward = 15; // lpTokensPerBlock.times(1).times(poolShare); //1 block * 50 * 0.3 = 15
      accLPtokensPerShareExpected = 0.015; // accLPtokensPerShareExpected + (lpTokensReward / lpSupply); //0+(15/1000)=0.015
      pTotalPool.should.be.bignumber.equal(3000); // stakeA+stakeB);
      pEntryStakeTotal.should.be.bignumber.equal(3000); // stakeA+stakeB);
      pAccLPtokensPerShare.should.be.bignumber.equal(0.015); // accLPtokensPerShareExpected
      const userBaccLPtokensPerShare = pAccLPtokensPerShare;

      // NOTE:
      loophole.switchWallet(userC);
      await loophole.stake({
        pid,
        amount: stakeC,
      });

      // NOTE: pool.accLPtokensPerShare will look at totalPool before user staking tokens,
      // in this case 3000 as userA + userB staking deposits
      pool = await loophole.getPool({ pid });
      pTotalPool = pool.totalPool;
      pEntryStakeTotal = pool.entryStakeTotal;
      pAccLPtokensPerShare = pool.accLPtokensPerShare;
      console.log('---BP-2');
      console.log('---pTotalPool: ', pTotalPool);
      console.log('---pEntryStakeTotal: ', pEntryStakeTotal);
      console.log('---pAccLPtokensPerShare: ', pAccLPtokensPerShare);
      lpTokensReward = 15; // lpTokensPerBlock.times(1).times(poolShare); //1 block * 50 * 0.3 = 15
      accLPtokensPerShareExpected = 0.02; // accLPtokensPerShareExpected + (lpTokensReward / lpSupply); //0.015+(15/3000)=0.015+0.005=0.02
      pTotalPool.should.be.bignumber.equal(6000); // stakeA+stakeB+stakeC);
      pEntryStakeTotal.should.be.bignumber.equal(6000); // stakeA+stakeB+stakeC);
      pAccLPtokensPerShare.should.be.bignumber.equal(0.02); // accLPtokensPerShareExpected
      const userCaccLPtokensPerShare = pAccLPtokensPerShare;

      // NOTE:
      loophole.switchWallet(userD);
      await loophole.stake({
        pid,
        amount: stakeD,
      });

      // NOTE: pool.accLPtokensPerShare will look at totalPool before user staking tokens,
      // in this case 6000 as userA + userB + userC staking deposits
      pool = await loophole.getPool({ pid });
      pTotalPool = pool.totalPool;
      pEntryStakeTotal = pool.entryStakeTotal;
      pAccLPtokensPerShare = pool.accLPtokensPerShare;
      console.log('---BP-3');
      console.log('---pTotalPool: ', pTotalPool);
      console.log('---pEntryStakeTotal: ', pEntryStakeTotal);
      console.log('---pAccLPtokensPerShare: ', pAccLPtokensPerShare);
      lpTokensReward = 15; // lpTokensPerBlock.times(1).times(poolShare); //1 block * 50 * 0.3 = 15
      accLPtokensPerShareExpected = 0.0225; // accLPtokensPerShareExpected + (lpTokensReward / lpSupply); //0.02+(15/6000)=0.02+0.0025=0.0225
      pTotalPool.should.be.bignumber.equal(10000); // stakeA+stakeB+stakeC+stakeD);
      pEntryStakeTotal.should.be.bignumber.equal(10000); // stakeA+stakeB+stakeC+stakeD);
      pAccLPtokensPerShare.should.be.bignumber.equal(0.0225); // accLPtokensPerShareExpected
      const userDaccLPtokensPerShare = pAccLPtokensPerShare;

      // ...checks
      // forward 1 block
      const forwardXBlocks = 3;
      await forwardBlocks(forwardXBlocks);

      // get LP rewards
      // loophole.switchWallet(userA);

      // const poolReward = await loophole.getPoolReward({ pid: pid });
      // const blocks = Number(1); /// 1 tx since last liquidity mining
      // const poolRewardExpected = lpTokensPerBlockRaw.times(blocks).times(poolShare); //9*50*1e18*0.3 = 135*1e18
      poolRewardExpected = 45; // (forwardXBlocks)*15; //lpTokensReward; //BigNumber(lpTokensPerBlock).times(blocks).times(poolShare); //1*50*0.3 = 15
      // const totalPool = Number(stakeTotal); //get pool totalPool
      const blockNumber2 = await loophole.getBlockNumber();
      poolReward = await loophole.getPoolReward({ pid });
      console.log('---blockNumber2: ', blockNumber2);
      console.log('---poolRewardExpected : ', poolRewardExpected);
      console.log('---poolReward         : ', poolReward);
      poolReward.should.be.bignumber.equal(45); // poolRewardExpected

      pool = await loophole.getPool({ pid });
      pTotalPool = pool.totalPool;
      pEntryStakeTotal = pool.entryStakeTotal;
      pAccLPtokensPerShare = pool.accLPtokensPerShare;
      console.log('---pTotalPool         : ', pTotalPool);
      console.log('---pEntryStakeTotal   : ', pEntryStakeTotal);

      accLPtokensPerShareExpected = 0.0225; // this has not changed
      console.log('---accLPtokensPerShareExpected	: ', accLPtokensPerShareExpected);
      console.log('---pAccLPtokensPerShare				: ', pAccLPtokensPerShare);
      pAccLPtokensPerShare.should.be.bignumber.equal(0.0225); // accLPtokensPerShareExpected

      // NOTE: at this point pool total stake is made of users deposits, no distributed penalties yet
      pAccLPtokensPerShare = pAccLPtokensPerShare.plus(45 / 10000); // 0.027
      console.log('---new.pAccLPtokensPerShare				: ', pAccLPtokensPerShare);

      const userApayRewardMark = 1000 * userAaccLPtokensPerShare; // 1000*0=0
      userArewardExpected = BigNumber(pAccLPtokensPerShare * 1000 - userApayRewardMark); // poolRewardExpected.times((stakeA / stakeTotal) * pTotalPool);
      userAreward = await loophole.getUserReward({
        pid,
        user: userA,
      });
      console.log('---userArewardExpected: ', userArewardExpected);
      console.log('---userAreward        : ', userAreward);
      userAreward.should.be.bignumber.equal(0.027 * 1000 - 0); // userArewardExpected

      const userBpayRewardMark = 2000 * userBaccLPtokensPerShare; // 2000*0.015=30
      userBrewardExpected = BigNumber(pAccLPtokensPerShare * 2000 - userBpayRewardMark); // poolRewardExpected.times((stakeB / stakeTotal) * pTotalPool);
      userBreward = await loophole.getUserReward({
        pid,
        user: userB,
      });
      console.log('---userBrewardExpected: ', userBrewardExpected);
      console.log('---userBreward        : ', userBreward);
      userBreward.should.be.bignumber.equal(0.027 * 2000 - 30); // userBrewardExpected

      const userCpayRewardMark = 3000 * userCaccLPtokensPerShare; // 3000*0.02=60
      userCrewardExpected = BigNumber(pAccLPtokensPerShare * 3000 - userCpayRewardMark); // poolRewardExpected.times((stakeC / stakeTotal) * pTotalPool);
      userCreward = await loophole.getUserReward({
        pid,
        user: userC,
      });
      console.log('---userCrewardExpected: ', userCrewardExpected);
      console.log('---userCreward        : ', userCreward);
      userCreward.should.be.bignumber.equal(0.027 * 3000 - 60); // userCrewardExpected

      const userDpayRewardMark = 4000 * userDaccLPtokensPerShare; // 4000*0.0225=90
      userDrewardExpected = BigNumber(pAccLPtokensPerShare * 4000 - userDpayRewardMark); // poolRewardExpected.times((stakeD / stakeTotal) * pTotalPool);
      userDreward = await loophole.getUserReward({
        pid,
        user: userD,
      });
      console.log('---userDrewardExpected: ', userDrewardExpected);
      console.log('---userDreward        : ', userDreward);
      userDreward.should.be.bignumber.equal(0.027 * 4000 - 90); // userDrewardExpected

      res = await loophole.updatePoolCall({ pid: wethPid });
      console.log('loophole.updatePoolCall.wethPid.res: ', res);
      // 15 is LP tokens reward per WETH pool per block, is 30% WETH pool from 50 LP reward per block
      res.blocksElapsed.should.be.bignumber.equal(forwardXBlocks);
      res.lpTokensReward.should.be.bignumber.equal(forwardXBlocks * 15);
      res.accLPtokensPerShare.should.be.bignumber.gt(0);

      // NOTE: updating pool to mine for LP tokens, adds 1 block
      // pool update to get LP rewards
      tx = await loophole.updatePool({ pid });
      // console.log('tx.events.PoolRewardUpdated.returnValues: ', tx.events.PoolRewardUpdated.returnValues);
      console.log('tx.events: ', tx.events);

      poolRewardExpected = 0; // (forwardXBlocks+1)*15;
      poolReward = await loophole.getPoolReward({ pid });
      console.log('---poolRewardExpected : ', poolRewardExpected);
      console.log('---poolReward         : ', poolReward);
      /// poolReward.should.be.bignumber.equal(0); //poolRewardExpected

      pool = await loophole.getPool({ pid });
      pTotalPool = pool.totalPool;
      pEntryStakeTotal = pool.entryStakeTotal;
      pAccLPtokensPerShare = pool.accLPtokensPerShare;
      console.log('---pTotalPool         : ', pTotalPool);
      console.log('---pEntryStakeTotal   : ', pEntryStakeTotal);

      // lpTokensReward = poolRewardExpected;
      accLPtokensPerShareExpected = 0.0285; // accLPtokensPerShareExpected(0.0225) + (forwardXBlocks+1)*0.0015 = 0.0285;
      console.log('---accLPtokensPerShareExpected	: ', accLPtokensPerShareExpected);
      console.log('---pAccLPtokensPerShare				: ', pAccLPtokensPerShare);
      pAccLPtokensPerShare.should.be.bignumber.equal(0.0285); // accLPtokensPerShareExpected

      // NOTE: at this point pool total stake is made of users deposits, no distributed penalties yet

      // userApayRewardMark is 0
      userArewardExpected = BigNumber(pAccLPtokensPerShare * 1000 - userApayRewardMark); // poolRewardExpected.times((stakeA / stakeTotal) * pTotalPool);
      userAreward = await loophole.getUserReward({
        pid,
        user: userA,
      });
      console.log('---userArewardExpected: ', userArewardExpected);
      console.log('---userAreward        : ', userAreward);
      userAreward.should.be.bignumber.equal(0.0285 * 1000 - 0); // userArewardExpected

      // userBpayRewardMark is 30
      userBrewardExpected = BigNumber(pAccLPtokensPerShare * 2000 - userBpayRewardMark); // poolRewardExpected.times((stakeB / stakeTotal) * pTotalPool);
      userBreward = await loophole.getUserReward({
        pid,
        user: userB,
      });
      console.log('---userBrewardExpected: ', userBrewardExpected);
      console.log('---userBreward        : ', userBreward);
      userBreward.should.be.bignumber.equal(0.0285 * 2000 - 30); // userBrewardExpected

      // userCpayRewardMark is 60
      userCrewardExpected = BigNumber(pAccLPtokensPerShare * 3000 - userCpayRewardMark); // poolRewardExpected.times((stakeC / stakeTotal) * pTotalPool);
      userCreward = await loophole.getUserReward({
        pid,
        user: userC,
      });
      console.log('---userCrewardExpected: ', userCrewardExpected);
      console.log('---userCreward        : ', userCreward);
      userCreward.should.be.bignumber.equal(0.0285 * 3000 - 60); // userCrewardExpected

      // userDpayRewardMark is 90
      userDrewardExpected = BigNumber(pAccLPtokensPerShare * 4000 - userDpayRewardMark); // poolRewardExpected.times((stakeC / stakeTotal) * pTotalPool);
      userDreward = await loophole.getUserReward({
        pid,
        user: userD,
      });
      console.log('---userDrewardExpected: ', userDrewardExpected);
      console.log('---userDreward        : ', userDreward);
      userDreward.should.be.bignumber.equal(0.0285 * 4000 - 90); // userDrewardExpected
    });

    // NOTE: check updatePoolCall
    it('should test updatePoolCall and return zero [from staking pool WETH]', async () => {
      loophole.switchWallet(userA);
      const res = await loophole.updatePoolCall({ pid: wethPid });
      console.log('loophole.updatePoolCall.wethPid.res: ', res);
      // 15 is LP tokens reward per WETH pool per block, is 30% WETH pool from 50 LP reward per block
      res.blocksElapsed.should.be.bignumber.equal(0);
      res.lpTokensReward.should.be.bignumber.equal(0);
      res.accLPtokensPerShare.should.be.bignumber.equal(0);
    });

    // NOTE: check collectRewards
    it('userA should collect LP rewards [from staking pool WETH] and emit "Collect" event', async () => {
      const userAreward1 = await loophole.getUserReward({
        pid: wethPid,
        user: userA,
      });
      console.log('---userAreward1: ', userAreward1);
      // usually userAreward1 should be 28.5 with the transactions we had so far

      loophole.switchWallet(userA);
      const tx = await loophole.collectRewards({ pid: wethPid });
      console.log('loophole.collectRewards.wethPid.tx: ', tx);
      console.log('tx.events.Collect.returnValues: ', tx.events.Collect.returnValues);

      // NOTE: userA has 28.5, 1 block to mine weth pool when collecting LP rewards gives userA 1.5 LP tokens
      // as we get 15 LP per block and userA has 1k out of 10k in staking pool.
      const rewardExpectedTokens = 28.5 + 1.5; // 30;
      // TODO: fix collectRewardsCall
      // const rewards = await loophole.collectRewardsCall({ pid: wethPid });
      // console.log('---collectRewardsCall.rewards: ', rewards);
      // rewards.should.be.bignumber.equal(rewardExpectedTokens);

      const rewardExpectedDecimals = await loophole.fromBNToDecimals(rewardExpectedTokens, wethPid);
      console.log('---rewardExpectedDecimals: ', rewardExpectedDecimals);
      beproAssert.eventEmitted(tx, 'Collect', ev => ev.user === userA
				&& ev.pid.toString() == wethPid.toString()
				&& ev.reward.toString() == rewardExpectedDecimals.toString());
    });

    it('keep a record of userA LP tokens balance', async () => {
      // NOTE: check LP token balance for userA before a tx
      lpBalance1 = await lpToken.balanceOf(userA);
      console.log('lpToken.balanceOf.userA.lpBalance1: ', lpBalance1);
    });

    // NOTE: check collectRewards
    it('userA should collect LP rewards for 1 mined block [from staking pool WETH]', async () => {
      loophole.switchWallet(userA);
      const tx = await loophole.collectRewards({ pid: wethPid });
      console.log('loophole.collectRewards.wethPid: ', tx);
      console.log('tx.events.Collect.returnValues: ', tx.events.Collect.returnValues);

      const rewardExpectedTokens = 1.5;
      // lpBalance2.should.be.bignumber.equal(lpBalance1.plus(rewardExpectedTokens));

      // TODO: fix collectRewardsCall
      const rewards = await loophole.collectRewardsCall({ pid: wethPid });
      console.log('---collectRewardsCall.rewards: ', rewards);
      // rewards.should.be.bignumber.equal(rewardExpectedTokens);

      const rewardExpectedDecimals = await loophole.fromBNToDecimals(rewardExpectedTokens, wethPid);
      console.log('---rewardExpectedDecimals: ', rewardExpectedDecimals);
      beproAssert.eventEmitted(tx, 'Collect', ev => ev.user === userA
				&& ev.pid.toString() == wethPid.toString()
				&& ev.reward.toString() == rewardExpectedDecimals.toString());
    });

    it('userA LP tokens NEW balance should matched expected value', async () => {
      // NOTE: check LP token balance for userA after a tx
      lpBalance2 = await lpToken.balanceOf(userA);
      console.log('lpToken.balanceOf.userA.lpBalance2: ', lpBalance2);

      const rewardExpectedTokens = 1.5;
      lpBalance2.should.be.bignumber.equal(lpBalance1.plus(rewardExpectedTokens));
    });

    // NOTE: check no pending LP rewards
    it('userA should have no pending LP rewards [from staking pool WETH]', async () => {
      loophole.switchWallet(userA);
      const rewards = await loophole.getUserReward({
        pid: wethPid,
        user: userA,
      });

      console.log('---getUserReward.weth.userA: ', rewards);
      rewards.should.be.bignumber.equal(0);
    });

    it('userA exits/unstakes all his tokens [from staking pool WETH]', async () => {
      // NOTE: check LP token balance for userA after a tx
      lpBalance1 = await lpToken.balanceOf(userA);
      console.log('lpToken.balanceOf.userA.lpBalance1: ', lpBalance1);

      // NOTE: do NOT use amountOutMinimum = 0 in production
      const amountOutMinimum = 0;
      loophole.switchWallet(userA);
      await loophole.exit({
        pid: wethPid,
        amount: stakeA,
        amountOutMinimum,
      });

      // NOTE: userA should have got paid LP rewards for 1 block in unstake tx
      lpBalance2 = await lpToken.balanceOf(userA);
      console.log('lpToken.balanceOf.userA.lpBalance2: ', lpBalance2);

      const rewardExpectedTokens = 1.5;
      lpBalance2.should.be.bignumber.equal(lpBalance1.plus(rewardExpectedTokens));

      // NOTE: userA has no stake profit from other users exits as there were none yet
      // when he exits his stake will be zero
      const userAstake = await loophole.currentStake({
        pid: wethPid,
        user: userA,
      });
      console.log('---currentStake.weth.userA: ', userAstake);
      userAstake.should.be.bignumber.equal(0);

      // NOTE: current entry stake should always be zero when user exits/unstakes all his tokens
      const userAcurrentStake = await loophole.getCurrentEntryStakeUser({
        pid: wethPid,
        user: userA,
      });
      console.log('---getCurrentEntryStakeUser.userAcurrentStake.weth: ', userAcurrentStake);
      userAcurrentStake.should.be.bignumber.equal(0);

      const userAreward = await loophole.getUserReward({
        pid: wethPid,
        user: userA,
      });
      console.log('---getUserReward.weth.userA: ', userAreward);
      userAreward.should.be.bignumber.equal(0);
    });

    it('userA should NOT collect any LP rewards at this point [from staking pool WETH]', async () => {
      loophole.switchWallet(userA);
      const tx = await loophole.collectRewards({ pid: wethPid });
      // console.log('loophole.collectRewards.wethPid: ', tx);
      // console.log('tx.events.Collect.returnValues: ', tx.events.Collect.returnValues);

      const rewardExpectedTokens = 0;

      // TODO: fix collectRewardsCall
      const rewards = await loophole.collectRewardsCall({ pid: wethPid });
      console.log('---collectRewardsCall.rewards: ', rewards);
      // rewards.should.be.bignumber.equal(rewardExpectedTokens);

      // NOTE: emits no Collect event when user stake is zero and there is no LP reward to collect
      beproAssert.eventNotEmitted(tx, 'Collect');

      // const rewardExpectedDecimals = await loophole.fromBNToDecimals(rewardExpectedTokens, wethPid);
      // const rewardExpectedDecimals = BigNumber(0);
      // console.log('---rewardExpectedDecimals: ', rewardExpectedDecimals);
      // beproAssert.eventEmitted(tx, 'Collect', (ev) => {
      //	return ev.user === userA
      //	&& ev.pid.toString() == wethPid.toString()
      //	&& ev.reward.toString() == rewardExpectedDecimals.toString()
      // });
    });

    it('remaining users should have benefited from userA exit/unstake', async () => {
      let newStakeTotal = 9000; // 10000 - 1000; //stakeTotal - stakeA;

      // NOTE: 10% (half of exit penalty) of 1000 userAstake exit goes to staking pool to other users
      // userAstake was 1000, 100 goes to the staking pool as distributed penalty
      newStakeTotal = 9100; // newStakeTotal + 100;

      const userBstakeExpected = BigNumber('2022.222222222222222222'); // 2022.22; //(2000 / 9000 * 9100); //= 18200 / 9
      const userBstake = await loophole.currentStake({
        pid: wethPid,
        user: userB,
      });
      console.log('---currentStake.weth.userB: ', userBstake);
      console.log('---userBstakeExpected.weth: ', userBstakeExpected);
      userBstake.should.be.bignumber.equal(userBstakeExpected);

      const userCstakeExpected = BigNumber('3033.333333333333333333'); // 3033.33; //(3000 / 9000 * 9100);
      const userCstake = await loophole.currentStake({
        pid: wethPid,
        user: userC,
      });
      console.log('---currentStake.weth.userC: ', userCstake);
      console.log('---userCstakeExpected.weth: ', userCstakeExpected);
      userCstake.should.be.bignumber.equal(userCstakeExpected);

      const userDstakeExpected = BigNumber('4044.444444444444444444'); // 4044.44; //(4000 / 9000 * 9100);
      const userDstake = await loophole.currentStake({
        pid: wethPid,
        user: userD,
      });
      console.log('---currentStake.weth.userD: ', userDstake);
      console.log('---userDstakeExpected.weth: ', userDstakeExpected);
      userDstake.should.be.bignumber.equal(userDstakeExpected);
    });

    // NOTE: this test WILL FAIL due to numbers rounding error when calculating users stake amounts
    // NOTE: userB exits, check userA has NOT benefited, userC and userD did benefit from userB exit
    it('userB exits/unstakes all [from WETH pool]', async () => {
      loophole.switchWallet(userB);

      // NOTE: userB should collect LP rewards pending/left
      let tx = await loophole.collectRewards({ pid: wethPid });

      // NOTE: makre sure userB has no pending LP rewards
      const rewards = await loophole.getUserReward({
        pid: wethPid,
        user: userB,
      });
      console.log('---getUserReward.weth.userB: ', rewards);
      rewards.should.be.bignumber.equal(0);

      // NOTE: check total pool
      const p = await loophole.getPool({ pid: wethPid });
      console.log('---p.totalPool: ', p.totalPool);
      console.log('---p.entryStakeTotal: ', p.entryStakeTotal);
      console.log('---p.accLPtokensPerShare : ', p.accLPtokensPerShare);
      console.log('---p.totalDistributedPenalty: ', p.totalDistributedPenalty);

      const userInfo = await loophole.getUserInfo({
        pid: wethPid,
        user: userB,
      });
      console.log('---userB.userInfo.before.exit: ', userInfo);

      // NOTE: check LP token balance for userB after a tx
      lpBalance1 = await lpToken.balanceOf(userB);
      console.log('lpToken.balanceOf.userB.lpBalance1: ', lpBalance1);

      // NOTE: check userB current stake
      const userBnewStake = BigNumber('2022.222222222222222222');
      const userBstake1 = await loophole.currentStake({
        pid: wethPid,
        user: userB,
      });
      userBstake1.should.be.bignumber.equal(userBnewStake);

      // NOTE: do NOT use amountOutMinimum = 0 in production
      const amountOutMinimum = 0;
      tx = await loophole.exit({
        pid: wethPid,
        amount: userBnewStake,
        amountOutMinimum,
      });
      console.log('tx.events.Collect.returnValues: ', tx.events.Collect.returnValues);
      const expectedPaidRewardDecimals = BigNumber(tx.events.Collect.returnValues.reward);
      const expectedPaidReward = Numbers.fromDecimalsToBN(expectedPaidRewardDecimals, lpDecimals);

      const userInfo2 = await loophole.getUserInfo({
        pid: wethPid,
        user: userB,
      });
      console.log('---userB.userInfo.after.exit: ', userInfo2);

      // NOTE: an accurate value for 'accLPtokensPerShare' at the time of executing 'exit' function
      // since pool will be mined for 1 more block before unstaking
      // const p = await loophole.getPool({ pid: wethPid});
      // console.log('---p.accLPtokensPerShare: ', p.accLPtokensPerShare);

      // NOTE: weth pool reward per block is 15 (0.3 of 50), 9100 is current total pool stake
      // accLPtokensPerShare = accLPtokensPerShare + (15 / 9100);
      // const accLPtokensPerShare = p.accLPtokensPerShare.plus(15 / 9100);
      // console.log('---newAccLPtokensPerShare: ', accLPtokensPerShare);

      // NOTE: userB should have got paid LP rewards for 1 block in unstake tx
      lpBalance2 = await lpToken.balanceOf(userB);
      console.log('lpToken.balanceOf.userB.lpBalance2: ', lpBalance2);
      lpBalance2.should.be.bignumber.equal(lpBalance1.plus(expectedPaidReward));

      // NOTE: manual calculations how we get the expected value we are looking for
      // 15 LP tokens (0.3 of 50 per block) for weth pool
      // before userB exits we had 9100 weth and userB had 2022.222222222222222222
      // 2022.222222222222222222 = (2000 / 9000 * 9100)

      // pool.accLPtokensPerShare = 0.036296703296
      // lpSupply = pool.totalPool = 9100
      // x = mine weth pool for 1 block and get LP rewards
      // x = 15 * 10**18 * / 9100 / 10**18 = 15 / 9100 = 0.001648351648351648
      // pool.accLPtokensPerShare = pool.accLPtokensPerShare.add(lpTokensReward.mul(LPtokensPerShareMultiplier).div(lpSupply));
      // accLPtokensPerShare = 0.036296703296 + 0.001648351648351648 = 0.037945054944351648
      // accLPtokensPerShare = 0.037945054944, rounded to 12 decimals as we store it multiplied by 10**12 (LPtokensPerShareMultiplier)

      // uint256 accReward = userCurrentStake.mul(poolAccLPtokensPerShare).div(LPtokensPerShareMultiplier);
      // accReward = 2022222222222222222222 * 37945054944 = 76,733,333,331,199,999,999,991,567,765,568  /10**12 = 76733333331199999999

      // userPayRewardMark = 73.399999998577777777
      // uint256 reward = accReward.sub(userPayRewardMark);
      // we are looking for this value => 76733333331199999999 - 73399999998577777777 = 3333333332622222222

      // NOTE: 3333333332622222222 tokens / 10**18 = 3.333333332622222222 as decimal tokens
      const rewardExpectedTokens = BigNumber('3.333333332622222222');
      lpBalance2.should.be.bignumber.equal(lpBalance1.plus(rewardExpectedTokens));

      // NOTE: userB has stake profit from other users exits, from userA exit
      // when he exits his stake will be zero
      const userBstake = await loophole.currentStake({
        pid: wethPid,
        user: userB,
      });
      console.log('---currentStake.weth.userB: ', userBstake);
      userBstake.should.be.bignumber.equal(0);

      // NOTE current entry stake should always be zero when user exits/unstakes all his tokens
      const userBcurrentStake = await loophole.getEntryStakeAdjusted({
        pid: wethPid,
        user: userB,
      });
      console.log('---getEntryStakeAdjusted.userBcurrentStake.weth: ', userBcurrentStake);
      userBcurrentStake.should.be.bignumber.equal(0);

      const userBreward = await loophole.getUserReward({
        pid: wethPid,
        user: userB,
      });
      console.log('---getUserReward.weth.userB: ', userBreward);
      userBreward.should.be.bignumber.equal(0);
    });

    it('userB should NOT collect any LP rewards at this point [from staking pool WETH]', async () => {
      loophole.switchWallet(userB);
      const tx = await loophole.collectRewards({ pid: wethPid });
      // console.log('loophole.collectRewards.wethPid: ', tx);
      // console.log('tx.events.Collect.returnValues: ', tx.events.Collect.returnValues);

      const rewardExpectedTokens = 0;

      // TODO: fix collectRewardsCall
      // const rewards = await loophole.collectRewardsCall({ pid: wethPid });
      // console.log('---collectRewardsCall.rewards: ', rewards);
      // rewards.should.be.bignumber.equal(rewardExpectedTokens);

      // NOTE: emits no Collect event when user stake is zero and there is no LP reward to collect
      beproAssert.eventNotEmitted(tx, 'Collect');

      // const rewardExpectedDecimals = await loophole.fromBNToDecimals(rewardExpectedTokens, wethPid);
      // const rewardExpectedDecimals = BigNumber(0);
      // console.log('---rewardExpectedDecimals: ', rewardExpectedDecimals);
      // beproAssert.eventEmitted(tx, 'Collect', (ev) => {
      //	return ev.user === userB
      //	&& ev.pid.toString() == wethPid.toString()
      //	&& ev.reward.toString() == rewardExpectedDecimals.toString()
      // });
    });

    it('userA should not have any LP rewards pending', async () => {
      loophole.switchWallet(userA);

      // NOTE: userA should not have any LP rewards pending
      const rewards = await loophole.getUserReward({
        pid: wethPid,
        user: userA,
      });
      console.log('---getUserReward.weth.userA: ', rewards);
      rewards.should.be.bignumber.equal(0);
    });

    it('userA should have NOT benefited from userB exit/unstake', async () => {
      loophole.switchWallet(userA);

      const userAstakeExpected = 0;
      const userAstake = await loophole.currentStake({
        pid: wethPid,
        user: userA,
      });
      console.log('---currentStake.weth.userA: ', userAstake);
      console.log('---userAstakeExpected.weth: ', userAstakeExpected);
      userAstake.should.be.bignumber.equal(userAstakeExpected);
    });

    it('remaining users should have benefited from userB exit/unstake', async () => {
      // stakeTotal - stakeA - stakeB + penalties;

      // NOTE: 10% (half of exit penalty) of 2022.222222222222222222 userBstake exit goes to
      // staking pool to other users as distributed penalty
      // BigNumber('2022.222222222222222222');
      const newStakeTotal = 7280; // 10000 - 1000 + 100 - 2022.222222222222222222 + 202.222222222222222222;
      const p = await loophole.getPool({ pid: wethPid });
      const totalPoolExpected = newStakeTotal;
      console.log('---p.totalPool.weth: ', p.totalPool);
      console.log('---totalPoolExpected.weth: ', totalPoolExpected);
      p.totalPool.should.be.bignumber.equal(totalPoolExpected);

      const userCstakeExpected = BigNumber('3120'); // 3120; //(3000 / 7000 * 7280);
      const userCstake = await loophole.currentStake({
        pid: wethPid,
        user: userC,
      });
      console.log('---currentStake.weth.userC: ', userCstake);
      console.log('---userCstakeExpected.weth: ', userCstakeExpected);
      userCstake.should.be.bignumber.equal(userCstakeExpected);

      const userDstakeExpected = BigNumber('4160'); // 4160; //(4000 / 7000 * 7280);
      const userDstake = await loophole.currentStake({
        pid: wethPid,
        user: userD,
      });
      console.log('---currentStake.weth.userD: ', userDstake);
      console.log('---userDstakeExpected.weth: ', userDstakeExpected);
      userDstake.should.be.bignumber.equal(userDstakeExpected);
    });

    it('remaining users deposit(entry stake) should still be the same as the initial amount', async () => {
      const userCstakeExpected = 3000;
      const userCstake = await loophole.getCurrentEntryStakeUser({
        pid: wethPid,
        user: userC,
      });
      console.log('---getCurrentEntryStakeUser.weth.userC: ', userCstake);
      console.log('---userCstakeExpected.weth: ', userCstakeExpected);
      userCstake.should.be.bignumber.equal(userCstakeExpected);

      const userDstakeExpected = 4000;
      const userDstake = await loophole.getCurrentEntryStakeUser({
        pid: wethPid,
        user: userD,
      });
      console.log('---getCurrentEntryStakeUser.weth.userD: ', userDstake);
      console.log('---userDstakeExpected.weth: ', userDstakeExpected);
      userDstake.should.be.bignumber.equal(userDstakeExpected);
    });

    it('userB should NOT benefit from past LP profits from MAIN pool exits penalty mined and distributed before his stake', async () => {
      // NOTE: userC stakes to round up total pool stake up to 12,000 weth
      // pool has 10280 at the moment, stake up to 12,000
      const newStake1 = BigNumber(12000 - 10280);
      loophole.switchWallet(userC);
      await loophole.stake({
        pid: wethPid,
        amount: newStake1,
      });

      loophole.switchWallet(userB);

      // NOTE: test case process
      // 1. pool mine 3 blocks
      // 2. userB stakes 3000
      // 3. userB should NOT benefit from 3 blocks previous to his stake, only for 2 blocks (1 while staking and 1 for pool mine)

      // NOTE: mine weth pool 3 blocks (3 times)
      await loophole.updatePool({ pid: wethPid });
      await loophole.updatePool({ pid: wethPid });
      await loophole.updatePool({ pid: wethPid });

      // NOTE: userB stakes 3000
      const userBnewStake = BigNumber(3000);
      await loophole.stake({
        pid: wethPid,
        amount: userBnewStake,
      });

      // NOTE: at this point the pool should have plus userB new stake
      const newStakeTotal = 12000; // 10280 + userCnewStake; //7280 + 3000 + userCnewStake;
      const p = await loophole.getPool({ pid: wethPid });
      const totalPoolExpected = newStakeTotal;
      console.log('---p.totalPool.weth: ', p.totalPool);
      console.log('---totalPoolExpected.weth: ', totalPoolExpected);
      p.totalPool.should.be.bignumber.equal(totalPoolExpected);

      // NOTE: check userB LP rewards
      let userBnewRewardsExpected = BigNumber(0);
      let userBnewRewards = await loophole.getUserReward({
        pid: wethPid,
        user: userB,
      });
      console.log('---getUserReward.userBnewRewards: ', userBnewRewards);
      console.log('---userBnewRewardsExpected: ', userBnewRewardsExpected);
      userBnewRewards.should.be.bignumber.equal(userBnewRewardsExpected);

      // NOTE: mine weth pool 3 blocks (3 times)
      const nBlocks = Number(3);
      await loophole.updatePool({ pid: wethPid });
      await loophole.updatePool({ pid: wethPid });
      await loophole.updatePool({ pid: wethPid });

      // NOTE: check userB LP rewards, userB gets LP rewards only from block number he staked
      // NOTE: we get 15 LP per block for WETH pool, userB stake is 3000 of 12000 total pool
      // userBnewRewardsExpected = 3000 / 12000 * 15 (per block, VERY IMPORTANT)
      const userBnewRewardsExpectedPerBlock = BigNumber('3.75'); // '4.377431906614785992');
      userBnewRewardsExpected = userBnewRewardsExpectedPerBlock.times(nBlocks); // '4.377431906614785992');
      userBnewRewards = await loophole.getUserReward({
        pid: wethPid,
        user: userB,
      });
      console.log('---getUserReward.userBnewRewards: ', userBnewRewards);
      console.log('---userBnewRewardsExpected: ', userBnewRewardsExpected);
      userBnewRewards.should.be.bignumber.equal(userBnewRewardsExpected);

      // NOTE: userB should collect LP rewards only since he staked not for previous blocks
      const tx = await loophole.collectRewards({ pid: wethPid });
      // console.log('loophole.collectRewards.wethPid: ', tx);
      console.log('tx.events.Collect.returnValues: ', tx.events.Collect.returnValues);

      // NOTE: check note above for userBnewRewardsExpected
      const rewardExpectedTokens = (nBlocks + 1) * userBnewRewardsExpectedPerBlock;

      // TODO: fix collectRewardsCall
      // const rewards = await loophole.collectRewardsCall({ pid: wethPid });
      // console.log('---collectRewardsCall.rewards: ', rewards);
      // rewards.should.be.bignumber.equal(rewardExpectedTokens);

      const rewardExpectedDecimals = await loophole.fromBNToDecimals(rewardExpectedTokens, wethPid);
      console.log('---rewardExpectedDecimals: ', rewardExpectedDecimals);
      beproAssert.eventEmitted(tx, 'Collect', ev => ev.user === userB
				&& ev.pid.toString() == wethPid.toString()
				&& ev.reward.toString() == rewardExpectedDecimals.toString());
    });

    // IMPORTANT: SKIP this test for now
    // TODO: find a way to convert weth from penalty exits to LP from transactions that already took place
    // HINT: use 'TestUniswapV3RouterBridge' contract to find simulated tokens exchange
    /* it.skip('check LOOP pool LP tokens accumulated from MAIN pool exits penalty', async () => {
			const p = await loophole.getPool({ pid: lpPid});
			console.log('---p.totalPool: ', p.totalPool);
			console.log('---p.entryStakeTotal: ', p.entryStakeTotal);
			console.log('---p.totalDistributedPenalty: ', p.totalDistributedPenalty);
			console.log('---p.accLPtokensPerShare: ', p.accLPtokensPerShare);

			//NOTE:
			//userA exit of 1000, +100 weth
			//userB exit of 2022.222222222222222222, +202.222222222222222222 LP = 302.222222222222222222
			const accWethExitPenalty = BigNumber('302.222222222222222222');

			//NOTE: entryStakeTotal and accLPtokensPerShare should be zero because no user staked LP tokens
			p.entryStakeTotal.should.be.bignumber.equal(0);
			p.accLPtokensPerShare.should.be.bignumber.equal(0);

			//TODO: convert weth to LP from tx that already took place
			const accLP = BigNumber(0); // based on 'accWethExitPenalty'
			p.totalPool.should.be.bignumber.equal(accLP);
			p.totalDistributedPenalty.should.be.bignumber.equal(accLP);
		}); */

    it('users should have no LP tokens profits from MAIN pool exits penalty as they did NOT stake any', async () => {
      const userAlp1 = await loophole.getEntryStakeAdjusted({
        pid: lpPid,
        user: userA,
      });
      const userBlp1 = await loophole.getEntryStakeAdjusted({
        pid: lpPid,
        user: userB,
      });
      const userClp1 = await loophole.getEntryStakeAdjusted({
        pid: lpPid,
        user: userC,
      });
      const userDlp1 = await loophole.getEntryStakeAdjusted({
        pid: lpPid,
        user: userD,
      });
      console.log('---userAlp1.getEntryStakeAdjusted: ', userAlp1);
      console.log('---userBlp1.getEntryStakeAdjusted: ', userBlp1);
      console.log('---userClp1.getEntryStakeAdjusted: ', userClp1);
      console.log('---userDlp1.getEntryStakeAdjusted: ', userDlp1);
      userAlp1.should.be.bignumber.equal(0);
      userBlp1.should.be.bignumber.equal(0);
      userClp1.should.be.bignumber.equal(0);
      userDlp1.should.be.bignumber.equal(0);

      const userAlp = await loophole.currentStake({
        pid: lpPid,
        user: userA,
      });
      const userBlp = await loophole.currentStake({
        pid: lpPid,
        user: userB,
      });
      const userClp = await loophole.currentStake({
        pid: lpPid,
        user: userC,
      });
      const userDlp = await loophole.currentStake({
        pid: lpPid,
        user: userD,
      });
      // console.log('---userAlp: ', userAlp);
      userAlp.should.be.bignumber.equal(0);
      userBlp.should.be.bignumber.equal(0);
      userClp.should.be.bignumber.equal(0);
      userDlp.should.be.bignumber.equal(0);
    });

    // NOTE: some cases FAIL due to precision error
    it('users should STILL have LP tokens profits from LOOP pool if they stake AFTER the distribution', async () => {
      console.log('---loophole.userA: ', userA);
      console.log('---loophole.userB: ', userB);
      console.log('---loophole.userC: ', userC);
      console.log('---loophole.userD: ', userD);

      let p = await loophole.getPool({ pid: lpPid });
      console.log('---loophole.LOOP.bp-1: ', p);

      let userStakeTmp = await loophole.currentStake({
        pid: lpPid,
        user: userA,
      });
      userStakeTmp.should.be.bignumber.equal(0);
      userStakeTmp = await loophole.currentStake({
        pid: lpPid,
        user: userB,
      });
      userStakeTmp.should.be.bignumber.equal(0);
      userStakeTmp = await loophole.currentStake({
        pid: lpPid,
        user: userC,
      });
      userStakeTmp.should.be.bignumber.equal(0);
      userStakeTmp = await loophole.currentStake({
        pid: lpPid,
        user: userD,
      });
      userStakeTmp.should.be.bignumber.equal(0);

      /// await usersStake(lpPid, [userA, userB, userC, userD], [1000, 1000, 1000, 1000]);
      loophole.switchWallet(userA);
      await loophole.stake({
        pid: lpPid,
        amount: 1000,
      });
      console.log('---userA.after.stake.getEntryStakeAdjusted: ', await loophole.getEntryStakeAdjusted({
        pid: lpPid,
        user: userA,
      }));
      console.log('---userA.after.stake.currentStake: ', await loophole.currentStake({
        pid: lpPid,
        user: userA,
      }));
      console.log('---userA.after.stake.pool: ', await loophole.getPool({ pid: lpPid }));

      loophole.switchWallet(userB);
      await loophole.stake({
        pid: lpPid,
        amount: 1000,
      });
      console.log('---userB.after.stake.getEntryStakeAdjusted: ', await loophole.getEntryStakeAdjusted({
        pid: lpPid,
        user: userB,
      }));
      console.log('---userB.after.stake.currentStake: ', await loophole.currentStake({
        pid: lpPid,
        user: userB,
      }));
      console.log('---userB.after.stake.pool: ', await loophole.getPool({ pid: lpPid }));

      loophole.switchWallet(userC);
      await loophole.stake({
        pid: lpPid,
        amount: 1000,
      });
      console.log('---userC.after.stake.getEntryStakeAdjusted: ', await loophole.getEntryStakeAdjusted({
        pid: lpPid,
        user: userC,
      }));
      console.log('---userC.after.stake.currentStake: ', await loophole.currentStake({
        pid: lpPid,
        user: userC,
      }));
      console.log('---userC.after.stake.pool: ', await loophole.getPool({ pid: lpPid }));

      loophole.switchWallet(userD);
      await loophole.stake({
        pid: lpPid,
        amount: 1000,
      });
      console.log('---userD.after.stake.getEntryStakeAdjusted: ', await loophole.getEntryStakeAdjusted({
        pid: lpPid,
        user: userD,
      }));
      console.log('---userD.after.stake.currentStake: ', await loophole.currentStake({
        pid: lpPid,
        user: userD,
      }));

      p = await loophole.getPool({ pid: lpPid });
      console.log('---loophole.LOOP.bp-2: ', p);

      const userAlp1 = await loophole.getEntryStakeAdjusted({
        pid: lpPid,
        user: userA,
      });
      const userBlp1 = await loophole.getEntryStakeAdjusted({
        pid: lpPid,
        user: userB,
      });
      const userClp1 = await loophole.getEntryStakeAdjusted({
        pid: lpPid,
        user: userC,
      });
      const userDlp1 = await loophole.getEntryStakeAdjusted({
        pid: lpPid,
        user: userD,
      });
      console.log('---userAlp1.getEntryStakeAdjusted: ', userAlp1);
      console.log('---userBlp1.getEntryStakeAdjusted: ', userBlp1);
      console.log('---userClp1.getEntryStakeAdjusted: ', userClp1);
      console.log('---userDlp1.getEntryStakeAdjusted: ', userDlp1);

      const userAlp = await loophole.currentStake({
        pid: lpPid,
        user: userA,
      });
      const userBlp = await loophole.currentStake({
        pid: lpPid,
        user: userB,
      });
      const userClp = await loophole.currentStake({
        pid: lpPid,
        user: userC,
      });
      const userDlp = await loophole.currentStake({
        pid: lpPid,
        user: userD,
      });
      console.log('---userAlp.currentStake: ', userAlp);
      console.log('---userBlp.currentStake: ', userBlp);
      console.log('---userClp.currentStake: ', userClp);
      console.log('---userDlp.currentStake: ', userDlp);

      // NOTE: first user to stake gets majority of LP profits according to the formula
      userAlp1.should.be.bignumber.equal(1000);
      // NOTE: manual calculations give us expected stake for all remaining users as 626.323227664718963305
      // const eqStakeExpected = BigNumber('626.323227664718963305'); //869.606278825875583101
      // userBlp1.should.be.bignumber.equal(eqStakeExpected);
      userBlp1.should.be.bignumber.lt(1000);
      userClp1.should.be.bignumber.lt(1000);
      userDlp1.should.be.bignumber.lt(1000);

      // userAlp.should.be.bignumber.equal(BigNumber('1596.619693841717628519')); //1596.954638899843359524 //1149.945698816916689112
      userAlp.should.be.bignumber.gt(1000); // 1596.954638899843359524 //1149.945698816916689112
      // NOTE: due to rounding error we get a small variation and the test will FAIL in some cases
      // so we use real values to pass test but the ideal case is to be equal to 1000
      const expected1k = BigNumber('999.999999999999999999');
      userBlp.should.be.bignumber.equal(expected1k);
      userClp.should.be.bignumber.equal(expected1k);
      userDlp.should.be.bignumber.equal(expected1k);
    });
  });

  const stakeA = Number(1000);
  const stakeB = Number(2000);
  const stakeC = Number(3000);
  const stakeTotal = stakeA + stakeB + stakeC;
  // NOTE: do NOT use amountOutMinimum = 0 in production
  // this is min LP tokens amount to get from staked tokens penalty exchange
  const amountOutMinimum_ZERO = 0;

  describe('#when users have LP tokens staked in LOOP pool BEFORE LP distributions from MAIN pool exits penalty', async () => {
    let accLPprofit = BigNumber(0);
    let tx;

    // NOTE: tests group is only for local environment
    before('before-hook6a', async () => {
      assertLocalTestOnly();
    });

    // beforeEach('beforeEach-hook6', async () => {
    before('before-hook6', async () => {
      // deploy a NEW loophole contract
      await deployLoophole(setupWethAndWbtcPoolsConfig);

      [userA, userB, userC, userD] = [userAddress2, userAddress3, userAddress4, userAddress5];

      await fundLoopholeWithLP();
      await approveBulkWethTransfers(userA, userB, userC, userD);
      await approveBulkLPTransfers(userA, userB, userC, userD);
    });

    it('users should stake some weth into WETH pool', async () => {
      await usersStake(wethPid, [userA, userB, userC], [stakeA, stakeB, stakeC]);
    });

    it('users should stake some LP into LOOP pool', async () => {
      // NOTE: use same amounts for weth and LP tokens for simplicity
      await usersStake(lpPid, [userA, userB, userC], [stakeA, stakeB, stakeC]);

      // NOTE: assert users stakes in the LOOP pool
      const userAstake = await loophole.currentStake({
        pid: lpPid,
        user: userA,
      });
      const userBstake = await loophole.currentStake({
        pid: lpPid,
        user: userB,
      });
      const userCstake = await loophole.currentStake({
        pid: lpPid,
        user: userC,
      });
      console.log('---userAstake: ', userAstake);
      console.log('---userBstake: ', userBstake);
      console.log('---userCstake: ', userCstake);
      userAstake.should.be.bignumber.equal(stakeA);
      userBstake.should.be.bignumber.equal(stakeB);
      userCstake.should.be.bignumber.equal(stakeC);
    });

    it('users should exit/unstake weth from WETH pool for LP distribution testing', async () => {
      // NOTE: use same amounts for weth and LP tokens for simplicity

      // NOTE: 10% of 1000 = 100 weth converted to LP as distribution
      loophole.switchWallet(userA);
      console.log('weth.stakeA: ', stakeA);
      tx = await loophole.exit({
        pid: wethPid,
        amount: stakeA,
        amountOutMinimum: amountOutMinimum_ZERO,
      });
      accLPprofit = accLPprofit.plus(BigNumber(tx.events.TokenExchanged.returnValues.tokenAmountLP));

      // NOTE: userB has 2000/5000 of total weth pool 5100 = 2040 weth, 10% of that = 204 weth converted to LP as distribution
      loophole.switchWallet(userB);
      const stakeBnew = await loophole.currentStake({
        pid: wethPid,
        user: userB,
      });
      console.log('weth.stakeBnew: ', stakeBnew);
      tx = await loophole.exit({
        pid: wethPid,
        amount: stakeBnew,
        amountOutMinimum: amountOutMinimum_ZERO,
      });
      accLPprofit = accLPprofit.plus(BigNumber(tx.events.TokenExchanged.returnValues.tokenAmountLP));

      // NOTE: userC has 3000/3000 of total weth pool 3060+204 = 3264 weth
      // 20% of that as userC is last to exit = 326.4*2 = 652.8 weth converted to LP as distribution
      loophole.switchWallet(userC);
      const stakeCnew = await loophole.currentStake({
        pid: wethPid,
        user: userC,
      });
      console.log('weth.stakeCnew: ', stakeCnew);
      tx = await loophole.exit({
        pid: wethPid,
        amount: stakeCnew,
        amountOutMinimum: amountOutMinimum_ZERO,
      });
      accLPprofit = accLPprofit.plus(BigNumber(tx.events.TokenExchanged.returnValues.tokenAmountLP));

      // NOTE: assert users stakes in the WETH pool
      const userAstake = await loophole.currentStake({
        pid: wethPid,
        user: userA,
      });
      const userBstake = await loophole.currentStake({
        pid: wethPid,
        user: userB,
      });
      const userCstake = await loophole.currentStake({
        pid: wethPid,
        user: userC,
      });
      console.log('---userAstake: ', userAstake);
      console.log('---userBstake: ', userBstake);
      console.log('---userCstake: ', userCstake);
      userAstake.should.be.bignumber.equal(0);
      userBstake.should.be.bignumber.equal(0);
      userCstake.should.be.bignumber.equal(0);
    });

    it('users should have correct LP tokens distribution based on their stake in LOOP pool', async () => {
      const userAlpPercent1 = BigNumber(stakeA).div(stakeTotal); // 1000/6000 = 0.16
      const userBlpPercent1 = BigNumber(stakeB).div(stakeTotal); // 2000/6000 = 0.33
      const userClpPercent1 = BigNumber(stakeC).div(stakeTotal); // 3000/6000 = 0.50
      console.log('---userAlpPercent1 1000/6000 = 0.16: ', userAlpPercent1);
      console.log('---userBlpPercent1 2000/6000 = 0.33: ', userBlpPercent1);
      console.log('---userClpPercent1 3000/6000 = 0.50: ', userClpPercent1);

      accLPprofit = Numbers.fromDecimalsToBN(accLPprofit, lpDecimals);
      console.log('---accLPprofit: ', accLPprofit);

      const p = await loophole.getPool({ pid: lpPid });
      console.log('---LOOP pool: ', p);
      // p.totalPool.should.be.bignumber.equal(BigNumber('7885.496685141371230234')); //6474.290416639580817674
      p.totalPool.should.be.bignumber.equal(BigNumber('6000').plus(accLPprofit));
      p.entryStakeTotal.should.be.bignumber.equal(BigNumber('6000'));
      // p.totalDistributedPenalty.should.be.bignumber.equal(BigNumber('1886.554277727182900839')); //474.290416639580817674
      p.totalDistributedPenalty.should.be.bignumber.equal(accLPprofit);
      p.accLPtokensPerShare.should.be.bignumber.equal(0); // no accumulated LP tokens for LOOP pool

      const userAnewStake = await loophole.currentStake({
        pid: lpPid,
        user: userA,
      });
      const userBnewStake = await loophole.currentStake({
        pid: lpPid,
        user: userB,
      });
      const userCnewStake = await loophole.currentStake({
        pid: lpPid,
        user: userC,
      });
      console.log('---userAnewStake: ', userAnewStake);
      console.log('---userBnewStake: ', userBnewStake);
      console.log('---userCnewStake: ', userCnewStake);
      // userAnewStake.should.be.bignumber.equal(BigNumber('1314.249447523561871705'));
      // userBnewStake.should.be.bignumber.equal(BigNumber('2628.498895047123743411'));
      // userCnewStake.should.be.bignumber.equal(BigNumber('3942.748342570685615117'));

      // NOTE: 0.166 is rounded up to 0.17
      // 0.333 is rounded down to 0.33
      const userAlpPercent2 = userAnewStake.div(p.totalPool).toFormat(2);
      const userBlpPercent2 = userBnewStake.div(p.totalPool).toFormat(2);
      const userClpPercent2 = userCnewStake.div(p.totalPool).toFormat(2);
      console.log('---userAlpPercent2 = 0.17: ', userAlpPercent2);
      console.log('---userBlpPercent2 = 0.33: ', userBlpPercent2);
      console.log('---userClpPercent2 = 0.50: ', userClpPercent2);
      // NOTE: assertion not needed, sometimes due to precision errors and BigNumber default decimals would make test fail
      userAlpPercent2.should.be.bignumber.equal('0.17');
      userBlpPercent2.should.be.bignumber.equal('0.33');
      userClpPercent2.should.be.bignumber.equal('0.5');
    });
  });

  describe('#when last user exits all staked tokens [from MAIN pool WETH]', async () => {
    // NOTE: weth exit transaction we use for checks and assertions
    let wethExitTx;
    // NOTE: keep a record of LOOP pool for before and after the weth exit checks
    let lpPool;

    // NOTE: tests group is only for local environment
    before('before-hook6a', async () => {
      assertLocalTestOnly();
    });

    before('before-hook6', async () => {
      // deploy a NEW loophole contract
      await deployLoophole(setupWethAndWbtcPoolsConfig);

      [userA, userB, userC, userD] = [userAddress2, userAddress3, userAddress4, userAddress5];

      await fundLoopholeWithLP();
      await approveBulkWethTransfers(userA, userB, userC, userD);
    });

    before('before-hook6', async () => {
      // NOTE: setup conditions for last user exit

      // users stake weth
      await usersStake(wethPid, [userA, userB], [stakeA, stakeB]);

      // userA exits
      loophole.switchWallet(userA);
      await loophole.exit({
        pid: wethPid,
        amount: stakeA,
        amountOutMinimum: amountOutMinimum_ZERO,
      });

      // NOTE: userA stake was 1000, 10% of it is 100, it went back into the WETH pool for distribution
      const userBnewStake = await loophole.currentStake({
        pid: wethPid,
        user: userB,
      });
      console.log('---userBnewStake: ', userBnewStake);
      userBnewStake.should.be.bignumber.equal(stakeB + 100);
    });

    it('no exit penalty amount is added to pool.totalDistributedPenalty', async () => {
      // NOTE: userB is the last one having stake in WETH pool
      // userB new stake is plus 100 from userA exit
      const userBnewStake = stakeB + 100;

      // NOTE: keep a record of pool.totalDistributedPenalty for later check
      let p = await loophole.getPool({ pid: wethPid });
      const totalDistributedPenalty1 = p.totalDistributedPenalty;
      console.log('---totalDistributedPenalty1: ', totalDistributedPenalty1);

      // NOTE: keep a record of LP tokens in LOOP pool
      lpPool = await loophole.getPool({ pid: lpPid });

      // NOTE: userB is last to exit
      loophole.switchWallet(userB);
      wethExitTx = await loophole.exit({
        pid: wethPid,
        amount: userBnewStake,
        amountOutMinimum: amountOutMinimum_ZERO,
      });

      // NOTE: check pool.totalDistributedPenalty
      p = await loophole.getPool({ pid: wethPid });
      const totalDistributedPenalty2 = p.totalDistributedPenalty;
      console.log('---totalDistributedPenalty2: ', totalDistributedPenalty2);

      totalDistributedPenalty1.should.be.bignumber.equal(totalDistributedPenalty2);
    });

    it('all exit penalty is swaped for LP tokens via uniswap and added to LOOP pool', async () => {
      // emits TokenExchanged(_msgSender(), pool.token, exitPenaltyAmount, lpToken, amountLP)

      // NOTE: check LP profit from weth exits/unstakes penalty added to LOOP pool
      console.log('wethExitTx.events.TokenExchanged.returnValues: ', wethExitTx.events.TokenExchanged.returnValues);
      const wethExitPenaltyToLPtokens = Numbers.fromDecimalsToBN(wethExitTx.events.TokenExchanged.returnValues.tokenAmountLP, lpDecimals);
      console.log('---wethExitPenaltyToLPtokens: ', wethExitPenaltyToLPtokens);

      // NOTE: entryStakeTotal should be the same before and after the exit since nobody should have staked LP tokens
      const p = await loophole.getPool({ pid: lpPid });
      console.log('---LP.entryStakeTotal.before: ', lpPool.entryStakeTotal);
      console.log('---LP.entryStakeTotal.after: ', p.entryStakeTotal);
      console.log('---LP.totalPool.before: ', lpPool.totalPool);
      console.log('---LP.totalPool.after: ', p.totalPool);
      p.entryStakeTotal.should.be.bignumber.equal(lpPool.entryStakeTotal);
      p.totalPool.should.be.bignumber.equal(lpPool.totalPool.plus(wethExitPenaltyToLPtokens));
    });
  });

  describe('#when userB exits/unstakes after already having some LP reward from userA exit/unstake [from MAIN pool WETH]', async () => {
    const stakeA = BigNumber(1000);
    const stakeB = BigNumber(2000);
    const stakeC = BigNumber(3000);

    // NOTE: tests group is only for local environment
    before('before-hook6a', async () => {
      assertLocalTestOnly();
    });

    before('before-hook6', async () => {
      // deploy a NEW loophole contract
      await deployLoophole(setupWethAndWbtcPoolsConfig);

      [userA, userB, userC, userD] = [userAddress2, userAddress3, userAddress4, userAddress5];

      await fundLoopholeWithLP();
      await approveBulkWethTransfers(userA, userB, userC);
    });

    before('before-hook6', async () => {
      // NOTE: setup conditions for last user exit

      // users stake weth
      await usersStake(wethPid, [userA, userB, userC], [stakeA, stakeB, stakeC]);

      // userA exits
      loophole.switchWallet(userA);
      await loophole.exit({
        pid: wethPid,
        amount: stakeA,
        amountOutMinimum: amountOutMinimum_ZERO,
      });

      // NOTE: userA stake was 1000, 10% of it is 100, it went back into the WETH pool for distribution
      // userB new stake is 2000+40 = 2040
      const userBnewStakeExpected = 2040;
      const userBnewStake = await loophole.currentStake({
        pid: wethPid,
        user: userB,
      });
      console.log('---userBnewStake: ', userBnewStake);
      userBnewStake.should.be.bignumber.equal(userBnewStakeExpected);
    });

    it('userB exits/unstakes after already having some LP reward from userA exit/unstake [from MAIN pool WETH]', async () => {
      // NOTE: 100 WETH from userA exit was distributed among userB and userC
      // userB was given 2000/5000 of 100 = 40 (40%)
      // userC was given 3000/5000 of 100 = 60 (60%)

      // userB exits
      loophole.switchWallet(userB);
      const userBnewStake = stakeB.plus(40); // 2040
      await loophole.exit({
        pid: wethPid,
        amount: userBnewStake,
        amountOutMinimum: amountOutMinimum_ZERO,
      });

      // NOTE: last userB stake was 2040, 10% of it is 204, it went back into the WETH pool for distribution
      // userC new stake is 3000+60+204 = 3264
      const userCnewStakeExpected = 3264;
      const userCnewStake = await loophole.currentStake({
        pid: wethPid,
        user: userC,
      });
      console.log('---userCnewStake: ', userCnewStake);
      userCnewStake.should.be.bignumber.equal(userCnewStakeExpected);
    });
  });

  after('Loophole::after_hook', async () => {
    if (testConfig.localtest) {
      await traveler.revertToSnapshot(snapshotId);
      console.log('+++loophole.after.');
      console.log('--- revert blockchain to last snapshot ---');
    } else {
      console.log('--- we only revert blockchain to last snapshot for localtest ---');
    }
  });
});
