import { expect, assert } from 'chai';
import web3abi from 'web3-eth-abi';
import web3utils from 'web3-utils';
import { mochaAsync } from './utils';
import {
  ERC20Contract, ETHUtils, ERC20Mock, TimeLockProtocolMiningReward,
} from '../build';
import Numbers from '../build/utils/Numbers';
import beproAssert from '../build/utils/beproAssert';

// const { chaiPlugin } = require("../../../src/sablier/dev-utils");
// const traveler = require('ganache-time-traveler');
import traveler from 'ganache-time-traveler';

import BigNumber from 'bignumber.js';
import chai from 'chai';
import chaiBigNumber from 'chai-bignumber';

chai.should();
chai.use(chaiBigNumber(BigNumber));
// chai.use(chaiPlugin);

const testConfig = {
  test: true,
  localtest: true, // ganache local blockchain
};

// global web3 object is needed for ganache-time-traveler to work
global.web3 = undefined; // = web3Conn.web3;

let snapshotId;

let ethUtils;
let erc20Token;
let erc20RewardToken;
let protocolMiningReward;
// let ethUtilsAddress;
let erc20TokenAddress;
let erc20RewardTokenAddress;
let protocolMiningRewardAddress;

// let owner;
let userAddress;
let userAddress2;
let userAddress3;

// let deployedBlock;

const TOKEN_AMOUNT_1K = 1000; // 1 thousand token amount
// const TOKEN_AMOUNT_1M = 1000000; // 1 million token amount
const TOKEN_AMOUNT_1B = 1000000000; // 1 billion token amount

const erc20TokenSupply = BigNumber(TOKEN_AMOUNT_1B).multipliedBy(10);

const rewardTokenAmount = BigNumber(1000);
const rewardTokenAmountRaw = Numbers.fromBNToDecimals(rewardTokenAmount, 18);
const transferTokenAmount = BigNumber(TOKEN_AMOUNT_1K);
const transferTokenAmountRaw = BigNumber(Numbers.fromBNToDecimals(transferTokenAmount, 18));

const minDelay = 5 * 60; // 5 minutes
let proposers; // array of propsers
let executors; // array of executors
let proposer; // proposer only
let executor; // executor only

// encode function signature with parameters as call data bytes for solidity functions
const encodeFuncSigWithParams = (funcSig, typesArray, valuesArray) => {
  const callData = web3abi.encodeFunctionSignature(funcSig)
    + web3abi.encodeParameters(typesArray, valuesArray).slice(2); // remove "0x" prefix
  return callData;
};

const checkLocalTestOnly = () => {
  if (!testConfig.localtest) {
    console.warn('--- we only run this function in localtest mode ---');
    return false;
  }
  return true;
};

// load users/addresses/signers from connected wallet via contract
const loadSigners = async contract => { // contract is IContract
  console.log('...loadSigners');
  // userAddress = await contract.getUserAddress();
  [ userAddress, userAddress2, userAddress3 ] = await contract.getAccounts();
  // owner = userAddress;
};

// forward blockchain with x number of blocks, for testing purposes
// const forwardBlocks = async nblocks => Promise.all([ ...new Array(nblocks) ].map(() => traveler.advanceBlock()));

// forward blockchain time by x given seconds, for testing purposes
const forwardTime = async delay => {
  // const block = await web3.eth.getBlock('latest');
  // const forwardTime = block['timestamp'] + delay;
  await traveler.advanceTimeAndBlock(delay);
};

// deploy TimeLockProtocolMiningReward contract
const deployProtocolMiningReward = async (
  {
    minDelay, proposers, executors, rewardTokenAddress, rewardTokenAmount,
  } = {},
) => {
  console.log('...deploying new TimeLockProtocolMiningReward contract');

  // Create Contract
  protocolMiningReward = new TimeLockProtocolMiningReward(testConfig);
  expect(protocolMiningReward).to.not.equal(null);
  // Deploy
  const testConfig2 = {
    ...testConfig,
    minDelay,
    proposers,
    executors,
    rewardTokenAddress,
    rewardTokenAmount,
  };
  // console.log('...TimeLockProtocolMiningReward.testConfig2: ', testConfig2);
  const res = await protocolMiningReward.deploy(testConfig2);
  // await protocolMiningReward.__assert();

  const contractAddress = protocolMiningReward.getAddress();
  expect(res).to.not.equal(false);
  expect(contractAddress).to.equal(res.contractAddress);
  console.log(`Deployed TimeLockProtocolMiningReward address: ${contractAddress}`);
  protocolMiningRewardAddress = contractAddress;

  console.log('---TimeLockProtocolMiningReward.userAddress: ', await protocolMiningReward.getUserAddress());

  // deployedBlock = await ethUtils.blockNumber();

  // load user addresses
  await loadSigners(protocolMiningReward);
};

context('TimeLockProtocolMiningReward', async () => {
  before('TimeLockProtocolMiningReward::before_hook', async () => {
    // const loophole = new Loophole(testConfig);
    const token = new ERC20Mock(testConfig);

    if (testConfig.localtest) {
      /// set global web3 object for ganache time traveler testing
      web3 = token.web3Connection.web3;
      console.log('---TimeLockProtocolMiningReward.before.web3: ', (web3 != null));
      ///

      /// take blockchain snapshot
      const snapshot = await traveler.takeSnapshot();
      snapshotId = snapshot.result;
      console.log('+++TimeLockProtocolMiningReward.before.');
      console.log('--- take blockchain snapshot ---');
      ///
    }
    else {
      console.log('--- we only take blockchain snapshot for localtest ---');
    }
  });

  // NOTE: make sure we only run these tests in local blockchain
  before('TimeLockProtocolMiningReward::before_hook::checkLocalTestOnly', async () => {
    if (!checkLocalTestOnly()) {
      assert.fail('LOCAL_TEST_REQUIRED');
    }
  });

  before('TimeLockProtocolMiningReward::setup', async () => {
    ethUtils = new ETHUtils(testConfig);
    expect(ethUtils).to.not.equal(null);
    const res = await ethUtils.deploy({});
    expect(res).to.not.equal(false);
    // ethUtilsAddress = ethUtils.getAddress();
    // deployedBlock = await ethUtils.blockNumber();

    // load user addresses
    await loadSigners(ethUtils);

    proposers = [ userAddress, userAddress2 ];
    executors = [ userAddress, userAddress3 ];
    proposer = userAddress2;
    executor = userAddress3;
  });

  it('should deploy an ERC20 token', mochaAsync(async () => {
    /* Create Contract */
    erc20Token = new ERC20Contract(testConfig);
    expect(erc20Token).to.not.equal(null);
    const res = await erc20Token.deploy({
      name: 'test',
      symbol: 'B.E.P.R.O',
      cap: Numbers.fromBNToDecimals(erc20TokenSupply, 18),
      distributionAddress: userAddress, // local test with ganache
    });
    expect(res).to.not.equal(false);
    erc20TokenAddress = erc20Token.getAddress();
    expect(erc20TokenAddress).to.equal(res.contractAddress);
    console.log(`Deployed ERC20Contract address: ${erc20TokenAddress}`);
  }));

  it('should deploy an ERC20 Reward token', mochaAsync(async () => {
    /* Create Contract */
    erc20RewardToken = new ERC20Contract(testConfig);
    expect(erc20RewardToken).to.not.equal(null);
    const res = await erc20RewardToken.deploy({
      name: 'RewardToken',
      symbol: 'RWT',
      cap: Numbers.fromBNToDecimals(erc20TokenSupply, 18),
      distributionAddress: userAddress, // local test with ganache
    });
    expect(res).to.not.equal(false);
    erc20RewardTokenAddress = erc20RewardToken.getAddress();
    expect(erc20RewardTokenAddress).to.equal(res.contractAddress);
    console.log(`Deployed ERC20Contract address: ${erc20RewardTokenAddress}`);
  }));

  it('TimeLockProtocolMiningReward deployed contract should have expected initial values', mochaAsync(async () => {
    await deployProtocolMiningReward({
      minDelay,
      proposers,
      executors,
      rewardTokenAddress: erc20RewardToken.getAddress(),
      rewardTokenAmount: rewardTokenAmountRaw,
    });

    const rewardToken = await protocolMiningReward.rewardToken();
    const rewardAmount = await protocolMiningReward.rewardAmount();
    const minDelayRead = await protocolMiningReward.getMinDelay();
    rewardToken.should.be.equal(erc20RewardToken.getAddress());
    rewardAmount.should.be.bignumber.equal(rewardTokenAmountRaw);
    minDelayRead.should.be.bignumber.equal(minDelay);
  }));

  it('should deploy the TimeLockProtocolMiningReward contract', mochaAsync(async () => {
    await deployProtocolMiningReward({
      minDelay,
      proposers,
      executors,
      rewardTokenAddress: erc20RewardToken.getAddress(),
      rewardTokenAmount: rewardTokenAmountRaw,
    });

    await erc20RewardToken.transferTokenAmount({ toAddress: protocolMiningRewardAddress, tokenAmount: TOKEN_AMOUNT_1B });
    const newBalance = await erc20RewardToken.balanceOf(protocolMiningRewardAddress);
    newBalance.should.be.bignumber.equal(TOKEN_AMOUNT_1B);
  }));

  let target;
  let value;
  let data; // encoded function call data
  let data2; // encoded function call data
  let predecessor;
  let saltId = BigNumber(0); // counter increasing with each tx
  let salt; // bytes32 encoded salt id
  const delay = minDelay;

  let targets; // target contract addresses
  let values; // eth values for calls
  let datas; // encoded function call datas

  const getNextSalt = () => {
    let saltHex = web3utils.numberToHex(saltId);
    saltHex = web3utils.leftPad(saltHex, 64);
    // console.log('---getNextSalt.saltHex:', saltHex);
    salt = web3abi.encodeParameter('bytes32', saltHex);
    saltId = saltId.plus(1);
    console.log('---getNextSalt:', salt);
    return salt;
  };

  it(
    'loading data...',
    mochaAsync(async () => {
      target = erc20Token.getAddress();
      value = 0;
      data = encodeFuncSigWithParams(
        'transfer(address,uint256)',
        [ 'address', 'uint256' ],
        [ userAddress2, transferTokenAmountRaw ],
      );
      data2 = encodeFuncSigWithParams(
        'transferFrom(address,address,uint256)',
        [ 'address', 'address', 'uint256' ],
        [ userAddress2, userAddress3, transferTokenAmountRaw ],
      );
      predecessor = web3abi.encodeParameters([ 'bytes32' ], [ '0x' ]);
      getNextSalt();
      console.log('---predecessor: ', predecessor);
      console.log('---salt: ', salt);
      console.log('---saltId: ', saltId);

      targets = [ erc20Token.getAddress(), erc20Token.getAddress() ];
      values = [ 0, 0 ];
      datas = [ data, data2 ];

      console.log(
        '---loading data: ',
        '\ntargets: ',
        targets,
        '\nvalues: ',
        values,
        '\ndatas: ',
        datas,
        '\npredecessor: ',
        predecessor,
        '\nsalt: ',
        salt,
        '\ndelay: ',
        delay,
        '\nrewardTokenAmount: ',
        rewardTokenAmount,
      );
    }),
  );

  /// isOperation isOperationPending isOperationReady isOperationDone test
  it(
    'scheduled call operation status test',
    mochaAsync(async () => {
      getNextSalt();

      // test sending zero eth to protocolMiningReward contract
      const target = protocolMiningReward.getAddress();
      const value = 0;
      const data = '0x';
      
      const id = await protocolMiningReward.hashOperation({
        target, value, data, predecessor, salt,
      });
      
      // NOTE: at this point there should be no operation scheduled
      let isOperation = await protocolMiningReward.isOperation({ id });
      let isOperationPending = await protocolMiningReward.isOperationPending({ id });
      let isOperationReady = await protocolMiningReward.isOperationReady({ id });
      let isOperationDone = await protocolMiningReward.isOperationDone({ id });
      isOperation.should.be.equal(false);
      isOperationPending.should.be.equal(false);
      isOperationReady.should.be.equal(false);
      isOperationDone.should.be.equal(false);

      // schedule call
      await protocolMiningReward.schedule({
        target, value, data, predecessor, salt, delay, rewardTokenAmount,
      });
      
      // NOTE: after scheduling the call, it should be operation and operation pending
      isOperation = await protocolMiningReward.isOperation({ id });
      isOperationPending = await protocolMiningReward.isOperationPending({ id });
      isOperationReady = await protocolMiningReward.isOperationReady({ id });
      isOperationDone = await protocolMiningReward.isOperationDone({ id });
      isOperation.should.be.equal(true);
      isOperationPending.should.be.equal(true);
      isOperationReady.should.be.equal(false);
      isOperationDone.should.be.equal(false);

      // const tm1 = await ethUtils.blockTimestamp();
      // console.log(`---tm1: ${tm1}`);
      await forwardTime(delay);
      // const tm2 = await ethUtils.blockTimestamp();
      // console.log(`---tm2: ${tm2}`);

      // NOTE: after reaching execution time, operation should also be ready
      isOperation = await protocolMiningReward.isOperation({ id });
      isOperationPending = await protocolMiningReward.isOperationPending({ id });
      isOperationReady = await protocolMiningReward.isOperationReady({ id });
      isOperationDone = await protocolMiningReward.isOperationDone({ id });
      isOperation.should.be.equal(true);
      isOperationPending.should.be.equal(true);
      isOperationReady.should.be.equal(true);
      isOperationDone.should.be.equal(false);

      // execute scheduled call
      const tx = await protocolMiningReward.execute({
        target, value, data, predecessor, salt,
      }, { from: executor });
      
      // NOTE: executed call should be operation done
      isOperation = await protocolMiningReward.isOperation({ id });
      isOperationPending = await protocolMiningReward.isOperationPending({ id });
      isOperationReady = await protocolMiningReward.isOperationReady({ id });
      isOperationDone = await protocolMiningReward.isOperationDone({ id });
      isOperation.should.be.equal(true);
      isOperationPending.should.be.equal(false);
      isOperationReady.should.be.equal(false);
      isOperationDone.should.be.equal(true);
    }),
  );

  /// schedule
  it(
    'should revert when schedule call with insufficient delay',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.schedule({
          target, value, data, predecessor, salt, delay: (minDelay - 1), rewardTokenAmount,
        }),
        'TimelockController: insufficient delay',
      );
    }),
  );

  it(
    'not-proposer trying to schedule call should revert',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.schedule({
          target, value, data, predecessor, salt, delay, rewardTokenAmount,
        }, { from: executor }),
        'TimelockController: sender requires permission',
      );
    }),
  );

  it(
    'proposer should schedule call successfully and emit CallScheduled event',
    mochaAsync(async () => {
      const tx = await protocolMiningReward.schedule({
        target, value, data, predecessor, salt, delay, rewardTokenAmount,
      });
      const id = tx.events.CallScheduled.returnValues.id;

      //const id = await protocolMiningReward.hashOperation({
      //  target, value, data, predecessor, salt,
      //});
      const callTimestamp = await protocolMiningReward.getTimestamp({ id });
      const expectedTimestamp = (await ethUtils.blockTimestamp()).plus(minDelay);
      callTimestamp.should.be.bignumber.equal(expectedTimestamp);

      const tokenAmount = await protocolMiningReward.callsRewardTokenAmount({ id });
      tokenAmount.should.be.bignumber.equal(rewardTokenAmount);

      const isOperation = await protocolMiningReward.isOperation({ id });
      isOperation.should.be.equal(true);

      // event CallScheduled(bytes32 indexed id, uint256 indexed index, address target, uint256 value
      // , bytes data, bytes32 predecessor, uint256 delay);
      beproAssert.eventEmitted(tx, 'CallScheduled', ev => ev.id === id
        && ev.index.toString() === '0'
        && ev.target === target
        && ev.value.toString() === value.toString()
        && ev.data === data
        && ev.predecessor === predecessor
        && ev.delay.toString() === delay.toString());
    }),
  );

  it(
    'schedule call with the same properties and salt should revert',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.schedule({
          target, value, data, predecessor, salt, delay, rewardTokenAmount,
        }),
        'TimelockController: operation already scheduled',
      );
    }),
  );

  it(
    'proposer should successfully schedule another call with the same properties'
    + ' but new salt and emit CallScheduled event',
    mochaAsync(async () => {
      const nextSalt = getNextSalt();

      const tx = await protocolMiningReward.schedule({
        target, value, data, predecessor, salt: nextSalt, delay, rewardTokenAmount,
      });
      const id = tx.events.CallScheduled.returnValues.id;

      // scheduled call should have expected timestamp and properties
      //const id = await protocolMiningReward.hashOperation({
      //  target, value, data, predecessor, salt: nextSalt,
      //});
      const callTimestamp = await protocolMiningReward.getTimestamp({ id });
      const expectedTimestamp = (await ethUtils.blockTimestamp()).plus(minDelay);
      callTimestamp.should.be.bignumber.equal(expectedTimestamp);

      const tokenAmount = await protocolMiningReward.callsRewardTokenAmount({ id });
      tokenAmount.should.be.bignumber.equal(rewardTokenAmount);

      const isOperation = await protocolMiningReward.isOperation({ id });
      isOperation.should.be.equal(true);

      // event CallScheduled(bytes32 indexed id, uint256 indexed index, address target, uint256 value
      // , bytes data, bytes32 predecessor, uint256 delay);
      beproAssert.eventEmitted(tx, 'CallScheduled', ev => ev.id === id
        && ev.index.toString() === '0'
        && ev.target === target
        && ev.value.toString() === value.toString()
        && ev.data === data
        && ev.predecessor === predecessor
        && ev.delay.toString() === delay.toString());
    }),
  );

  /// scheduleBatch
  it(
    'should revert when scheduleBatch call with different arrays length',
    mochaAsync(async () => {
      // targets and values arrays length mismatch
      const targets = [ erc20Token.getAddress() ];
      let values = [ 0, 0 ];
      await beproAssert.revertsFn(
        () => protocolMiningReward.scheduleBatch({
          targets, values, datas, predecessor, salt, delay, rewardTokenAmount,
        }),
        'TimelockController: length mismatch',
      );

      // targets and datas arrays length mismatch
      values = [ 0 ];
      await beproAssert.revertsFn(
        () => protocolMiningReward.scheduleBatch({
          targets, values, datas, predecessor, salt, delay, rewardTokenAmount,
        }),
        'TimelockController: length mismatch',
      );
    }),
  );

  it(
    'should revert when scheduleBatch call with insufficient delay',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.scheduleBatch({
          targets, values, datas, predecessor, salt, delay: (minDelay - 1), rewardTokenAmount,
        }),
        'TimelockController: insufficient delay',
      );
    }),
  );

  it(
    'not-proposer trying to scheduleBatch call should revert',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.scheduleBatch({
          targets, values, datas, predecessor, salt, delay, rewardTokenAmount,
        }, { from: executor }),
        'TimelockController: sender requires permission',
      );
    }),
  );

  it(
    'proposer should scheduleBatch call successfully and emit CallScheduled events',
    mochaAsync(async () => {
      const tx = await protocolMiningReward.scheduleBatch({
        targets, values, datas, predecessor, salt, delay, rewardTokenAmount,
      });
      const id = tx.events.CallScheduled[0].returnValues.id;

      const callTimestamp = await protocolMiningReward.getTimestamp({ id });
      const expectedTimestamp = (await ethUtils.blockTimestamp()).plus(minDelay);
      callTimestamp.should.be.bignumber.equal(expectedTimestamp);

      const tokenAmount = await protocolMiningReward.callsRewardTokenAmount({ id });
      tokenAmount.should.be.bignumber.equal(rewardTokenAmount);

      const isOperation = await protocolMiningReward.isOperation({ id });
      isOperation.should.be.equal(true);

      // event CallScheduled(bytes32 indexed id, uint256 indexed index, address target, uint256 value
      // , bytes data, bytes32 predecessor, uint256 delay);
      beproAssert.eventEmitted(tx, 'CallScheduled', ev => ev.id === id
        && ev.index.toString() === '0'
        && ev.target === targets[0]
        && ev.value.toString() === values[0].toString()
        && ev.data === datas[0]
        && ev.predecessor === predecessor
        && ev.delay.toString() === delay.toString());

      beproAssert.eventEmitted(tx, 'CallScheduled', ev => ev.id === id
        && ev.index.toString() === '1'
        && ev.target === targets[1]
        && ev.value.toString() === values[1].toString()
        && ev.data === datas[1]
        && ev.predecessor === predecessor
        && ev.delay.toString() === delay.toString());
    }),
  );

  it(
    'scheduleBatch call with the same properties and salt should revert',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.scheduleBatch({
          targets, values, datas, predecessor, salt, delay, rewardTokenAmount,
        }),
        'TimelockController: operation already scheduled',
      );
    }),
  );

  it(
    'proposer should successfully scheduleBatch another call with the same properties'
    + ' but new salt and emit CallScheduled events',
    mochaAsync(async () => {
      const nextSalt = getNextSalt();

      const tx = await protocolMiningReward.scheduleBatch({
        targets, values, datas, predecessor, salt: nextSalt, delay, rewardTokenAmount,
      });
      const id = tx.events.CallScheduled[0].returnValues.id;

      const callTimestamp = await protocolMiningReward.getTimestamp({ id });
      const expectedTimestamp = (await ethUtils.blockTimestamp()).plus(minDelay);
      callTimestamp.should.be.bignumber.equal(expectedTimestamp);

      const tokenAmount = await protocolMiningReward.callsRewardTokenAmount({ id });
      tokenAmount.should.be.bignumber.equal(rewardTokenAmount);

      const isOperation = await protocolMiningReward.isOperation({ id });
      isOperation.should.be.equal(true);

      // event CallScheduled(bytes32 indexed id, uint256 indexed index, address target, uint256 value
      // , bytes data, bytes32 predecessor, uint256 delay);
      beproAssert.eventEmitted(tx, 'CallScheduled', ev => ev.id === id
        && ev.index.toString() === '0'
        && ev.target === targets[0]
        && ev.value.toString() === values[0].toString()
        && ev.data === datas[0]
        && ev.predecessor === predecessor
        && ev.delay.toString() === delay.toString());

      beproAssert.eventEmitted(tx, 'CallScheduled', ev => ev.id === id
        && ev.index.toString() === '1'
        && ev.target === targets[1]
        && ev.value.toString() === values[1].toString()
        && ev.data === datas[1]
        && ev.predecessor === predecessor
        && ev.delay.toString() === delay.toString());
    }),
  );

  /// execute
  it(
    'executing scheduled call before its time should revert',
    mochaAsync(async () => {
      getNextSalt();

      // schedule call send zero eth to protocolMiningReward contract
      const target = protocolMiningReward.getAddress();
      const value = 0;
      const data = '0x';

      await protocolMiningReward.schedule({
        target, value, data, predecessor, salt, delay, rewardTokenAmount,
      });

      await beproAssert.revertsFn(
        () => protocolMiningReward.execute({
          target, value, data, predecessor, salt,
        }),
        'TimelockController: operation is not ready',
      );
    }),
  );

  it(
    'not-executor trying to execute scheduled call should revert',
    mochaAsync(async () => {
      getNextSalt();

      await protocolMiningReward.schedule({
        target, value, data, predecessor, salt, delay, rewardTokenAmount,
      });

      await beproAssert.revertsFn(
        () => protocolMiningReward.execute({
          target, value, data, predecessor, salt,
        }, { from: proposer }),
        'TimelockController: sender requires permission',
      );
    }),
  );

  it(
    'executor should execute scheduled call with NO predecessor dependency'
    + ', emit CallExecuted event and get reward tokens',
    mochaAsync(async () => {
    // NOTE: NO predecessor dependency means scheduled call does NOT need
    // to wait for given predecessor call to be executed first
      getNextSalt();

      // transfer ERC20 tokens to contract so it can send them via scheduled call
      await erc20Token.transferTokenAmount({ toAddress: protocolMiningReward.getAddress(), tokenAmount: transferTokenAmount });
      const newBalance = await erc20Token.balanceOf(protocolMiningReward.getAddress());
      newBalance.should.be.bignumber.equal(transferTokenAmount);

      const tx1 = await protocolMiningReward.schedule({
        target, value, data, predecessor, salt, delay, rewardTokenAmount: rewardTokenAmountRaw,
      });
      const id = tx1.events.CallScheduled.returnValues.id;

      // do blockchain travel forward in time to execute scheduled call
      await forwardTime(delay);
      //

      const contractTokenBalance1 = await erc20Token.balanceOf(protocolMiningReward.getAddress());
      const user2TokenBalance1 = await erc20Token.balanceOf(userAddress2);
      const rewardTokenBalance1 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      const user1RewardBalance1 = await erc20RewardToken.balanceOf(userAddress);

      // userAddress is executor
      const tx = await protocolMiningReward.execute(
        {
          target, value, data, predecessor, salt,
        },
        { from: userAddress },
      );

      // executed call should be operation done
      const operationDone = await protocolMiningReward.isOperationDone({ id });
      operationDone.should.be.equal(true);

      // event CallExecuted(bytes32 indexed id, uint256 indexed index
      // , address target, uint256 value, bytes data);
      beproAssert.eventEmitted(tx, 'CallExecuted', ev => ev.id === id
        && ev.index.toString() === '0'
        && ev.target === target
        && ev.value.toString() === value.toString()
        && ev.data === data);

      // check sender has got reward tokens for the executed call
      const contractTokenBalance2 = await erc20Token.balanceOf(protocolMiningReward.getAddress());
      contractTokenBalance2.should.be.bignumber.equal(contractTokenBalance1.minus(transferTokenAmount));

      const user2TokenBalance2 = await erc20Token.balanceOf(userAddress2);
      user2TokenBalance2.should.be.bignumber.equal(user2TokenBalance1.plus(transferTokenAmount));

      const rewardTokenBalance2 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      rewardTokenBalance2.should.be.bignumber.equal(rewardTokenBalance1.minus(rewardTokenAmount));

      const user1RewardBalance2 = await erc20RewardToken.balanceOf(userAddress);
      user1RewardBalance2.should.be.bignumber.equal(user1RewardBalance1.plus(rewardTokenAmount));
    }),
  );

  it(
    'executor trying to execute scheduled call with NO predecessor dependency'
    + 'should revert when underlying transaction reverted',
    mochaAsync(async () => {
    // NOTE: NO predecessor dependency means scheduled call does NOT need
    // to wait for given predecessor call to be executed first
      getNextSalt();

      const target = erc20Token.getAddress();
      const value = 0;
      const data = data2; // calling 'transferFrom' function without allowance will fail
      const ethvalueWei = web3utils.toWei('1', 'ether');

      const tx = await protocolMiningReward.schedule({
        target, value, data, predecessor, salt, delay, rewardTokenAmount,
      });
      const id = tx.events.CallScheduled.returnValues.id;
      
      // do blockchain travel forward in time to execute scheduled call
      await forwardTime(delay);
      //

      const rewardTokenBalance1 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      const user1RewardBalance1 = await erc20RewardToken.balanceOf(executor);

      await beproAssert.revertsFn(
        () => protocolMiningReward.execute(
          {
            target, value, data, predecessor, salt,
          },
          { value: ethvalueWei, from: executor },
        ),
        'TimelockController: underlying transaction reverted',
      );

      // call should still be operation ready but not done
      const operationReady = await protocolMiningReward.isOperationReady({ id });
      operationReady.should.be.equal(true);
      const operationDone = await protocolMiningReward.isOperationDone({ id });
      operationDone.should.be.equal(false);

      // check no reward tokens are given as reward since scheduled call reverted
      const rewardTokenBalance2 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      rewardTokenBalance2.should.be.bignumber.equal(rewardTokenBalance1);

      const user1RewardBalance2 = await erc20RewardToken.balanceOf(executor);
      user1RewardBalance2.should.be.bignumber.equal(user1RewardBalance1);
    }),
  );

  /// execute scheduled call with predecessor
  it(
    'executor should execute scheduled call WITH predecessor dependency'
    + ', emit CallExecuted event and get reward tokens',
    mochaAsync(async () => {
    // NOTE: WITH predecessor dependency means scheduled call needs
    // to wait for given predecessor call to be executed first
      getNextSalt();

      const data2 = encodeFuncSigWithParams(
        'transferFrom(address,address,uint256)',
        [ 'address', 'address', 'uint256' ],
        [ userAddress, protocolMiningReward.getAddress(), transferTokenAmountRaw ],
      );

      // approve contract to transfer ERC20 tokens so it can send them via approved call
      await erc20Token.approve({ address: protocolMiningReward.getAddress(), amount: transferTokenAmount });
      const newBalance = await erc20Token.allowance({ address: userAddress, spenderAddress: protocolMiningReward.getAddress() });
      newBalance.should.be.bignumber.equal(transferTokenAmount);

      const call1 = {
        target, value, data: data2, predecessor, salt,
      };
      // schedule 'transferFrom' call
      const tx1 = await protocolMiningReward.schedule({
        ...call1, delay, rewardTokenAmount: rewardTokenAmountRaw,
      });

      //const id1 = await protocolMiningReward.hashOperation(call1);
      const id1 = tx1.events.CallScheduled.returnValues.id;

      const call2 = {
        target, value, data, predecessor: id1, salt,
      };
      // schedule 'transfer' call
      const tx2 = await protocolMiningReward.schedule({
        ...call2, delay, rewardTokenAmount: rewardTokenAmountRaw,
      });

      //const id2 = await protocolMiningReward.hashOperation(call2);
      const id2 = tx2.events.CallScheduled.returnValues.id;

      // do blockchain travel forward in time to execute scheduled call
      await forwardTime(delay);
      //

      /// NOTE: reverts if predecessor scheduled call was not executed first
      await beproAssert.revertsFn(
        () => protocolMiningReward.execute(
          call2,
          { from: userAddress },
        ),
        'TimelockController: missing dependency',
      );

      /// NOTE: execute predecessor scheduled call first
      await protocolMiningReward.execute(call1);

      // executed call should be operation done
      const operationDone1 = await protocolMiningReward.isOperationDone({ id: id1 });
      operationDone1.should.be.equal(true);

      const contractTokenBalance1 = await erc20Token.balanceOf(protocolMiningReward.getAddress());
      const user2TokenBalance1 = await erc20Token.balanceOf(userAddress2);
      const rewardTokenBalance1 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      const user1RewardBalance1 = await erc20RewardToken.balanceOf(userAddress);

      /// NOTE: execute scheduled call after predecessor was executed
      // userAddress is executor
      const tx = await protocolMiningReward.execute(
        call2,
        { from: userAddress },
      );

      // executed call should be operation done
      const operationDone2 = await protocolMiningReward.isOperationDone({ id: id2 });
      operationDone2.should.be.equal(true);

      // event CallExecuted(bytes32 indexed id, uint256 indexed index
      // , address target, uint256 value, bytes data);
      beproAssert.eventEmitted(tx, 'CallExecuted', ev => ev.id === id2
        && ev.index.toString() === '0'
        && ev.target === target
        && ev.value.toString() === value.toString()
        && ev.data === data);

      // check sender has got reward tokens for the executed call
      const contractTokenBalance2 = await erc20Token.balanceOf(protocolMiningReward.getAddress());
      contractTokenBalance2.should.be.bignumber.equal(contractTokenBalance1.minus(transferTokenAmount));

      const user2TokenBalance2 = await erc20Token.balanceOf(userAddress2);
      user2TokenBalance2.should.be.bignumber.equal(user2TokenBalance1.plus(transferTokenAmount));

      const rewardTokenBalance2 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      rewardTokenBalance2.should.be.bignumber.equal(rewardTokenBalance1.minus(rewardTokenAmount));

      const user1RewardBalance2 = await erc20RewardToken.balanceOf(userAddress);
      user1RewardBalance2.should.be.bignumber.equal(user1RewardBalance1.plus(rewardTokenAmount));
    }),
  );

  /// executeBatch
  it(
    'should revert when executeBatch call with different arrays length',
    mochaAsync(async () => {
      // targets and values arrays length mismatch
      const targets = [ erc20Token.getAddress() ];
      let values = [ 0, 0 ];

      await beproAssert.revertsFn(
        () => protocolMiningReward.executeBatch({
          targets, values, datas, predecessor, salt, delay, rewardTokenAmount,
        }),
        'TimelockController: length mismatch',
      );

      // targets and datas arrays length mismatch
      values = [ 0 ];

      await beproAssert.revertsFn(
        () => protocolMiningReward.executeBatch({
          targets, values, datas, predecessor, salt, delay, rewardTokenAmount,
        }),
        'TimelockController: length mismatch',
      );
    }),
  );

  it(
    'executeBatch scheduled batch calls before its time should revert',
    mochaAsync(async () => {
      getNextSalt();

      // schedule call send zero eth to protocolMiningReward contract
      const targets = [ protocolMiningReward.getAddress(), protocolMiningReward.getAddress() ];
      const values = [ 0, 0 ];
      const datas = [ '0x', '0x' ];

      await protocolMiningReward.scheduleBatch({
        targets, values, datas, predecessor, salt, delay, rewardTokenAmount,
      });

      await beproAssert.revertsFn(
        () => protocolMiningReward.executeBatch({
          targets, values, datas, predecessor, salt,
        }),
        'TimelockController: operation is not ready',
      );
    }),
  );

  it(
    'not-executor trying to executeBatch scheduled batch calls should revert',
    mochaAsync(async () => {
      getNextSalt();

      await protocolMiningReward.scheduleBatch({
        targets, values, datas, predecessor, salt, delay, rewardTokenAmount,
      });

      await beproAssert.revertsFn(
        () => protocolMiningReward.executeBatch(
          {
            targets, values, datas, predecessor, salt,
          },
          { from: proposer },
        ),
        'TimelockController: sender requires permission',
      );
    }),
  );

  it(
    'executor should executeBatch scheduled batch calls with NO predecessor dependency'
    + ', emit CallExecuted events and get reward tokens',
    mochaAsync(async () => {
    // NOTE: NO predecessor dependency means scheduled call does NOT need
    // to wait for given predecessor call to be executed first
      getNextSalt();

      const datas = [ data, data ];

      // transfer ERC20 tokens to contract so it can send them via scheduled call
      await erc20Token.transferTokenAmount({
        toAddress: protocolMiningReward.getAddress(),
        tokenAmount: transferTokenAmount.times(2),
      });
      const newBalance = await erc20Token.balanceOf(protocolMiningReward.getAddress());
      newBalance.should.be.bignumber.equal(transferTokenAmount.times(2));

      const call1 = {
        targets, values, datas, predecessor, salt,
      };
      const tx1 = await protocolMiningReward.scheduleBatch({
        ...call1, delay, rewardTokenAmount: rewardTokenAmountRaw,
      });

      const id = tx1.events.CallScheduled[0].returnValues.id;

      // do blockchain travel forward in time to execute scheduled call
      await forwardTime(delay);
      //

      const contractTokenBalance1 = await erc20Token.balanceOf(protocolMiningReward.getAddress());
      const user2TokenBalance1 = await erc20Token.balanceOf(userAddress2);
      const rewardTokenBalance1 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      const user1RewardBalance1 = await erc20RewardToken.balanceOf(userAddress);

      // userAddress is executor
      const tx = await protocolMiningReward.executeBatch(
        call1,
        { from: userAddress },
      );

      // executed call should be operation done
      const operationDone = await protocolMiningReward.isOperationDone({ id });
      operationDone.should.be.equal(true);

      // event CallExecuted(bytes32 indexed id, uint256 indexed index
      // , address target, uint256 value, bytes data);
      beproAssert.eventEmitted(tx, 'CallExecuted', ev => ev.id === id
        && ev.index.toString() === '0'
        && ev.target === targets[0]
        && ev.value.toString() === values[0].toString()
        && ev.data === datas[0]);

      beproAssert.eventEmitted(tx, 'CallExecuted', ev => ev.id === id
        && ev.index.toString() === '1'
        && ev.target === targets[1]
        && ev.value.toString() === values[1].toString()
        && ev.data === datas[1]);

      // check sender has got reward tokens for the executed call
      const contractTokenBalance2 = await erc20Token.balanceOf(protocolMiningReward.getAddress());
      contractTokenBalance2.should.be.bignumber.equal(contractTokenBalance1.minus(transferTokenAmount.times(2)));

      const user2TokenBalance2 = await erc20Token.balanceOf(userAddress2);
      user2TokenBalance2.should.be.bignumber.equal(user2TokenBalance1.plus(transferTokenAmount.times(2)));

      const rewardTokenBalance2 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      rewardTokenBalance2.should.be.bignumber.equal(rewardTokenBalance1.minus(rewardTokenAmount));

      const user1RewardBalance2 = await erc20RewardToken.balanceOf(userAddress);
      user1RewardBalance2.should.be.bignumber.equal(user1RewardBalance1.plus(rewardTokenAmount));
    }),
  );

  it(
    'executor trying to executeBatch scheduled batch calls with NO predecessor dependency'
    + 'should revert when underlying transaction reverted',
    mochaAsync(async () => {
    // NOTE: NO predecessor dependency means scheduled call does NOT need
    // to wait for given predecessor call to be executed first
      getNextSalt();

      // calling 'transferFrom' function without allowance will fail
      const datas = [ data2, data2 ];
      const ethvalueWei = web3utils.toWei('1', 'ether');

      const call1 = {
        targets, values, datas, predecessor, salt,
      };
      const tx1 = await protocolMiningReward.scheduleBatch({
        ...call1, delay, rewardTokenAmount,
      });

      const id = tx1.events.CallScheduled[0].returnValues.id;

      // do blockchain travel forward in time to execute scheduled call
      await forwardTime(delay);
      //

      const rewardTokenBalance1 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      const user1RewardBalance1 = await erc20RewardToken.balanceOf(executor);

      await beproAssert.revertsFn(
        () => protocolMiningReward.executeBatch(
          call1,
          { value: ethvalueWei, from: executor },
        ),
        'TimelockController: underlying transaction reverted',
      );

      // call should still be operation ready but not done
      const operationReady = await protocolMiningReward.isOperationReady({ id });
      operationReady.should.be.equal(true);
      const operationDone = await protocolMiningReward.isOperationDone({ id });
      operationDone.should.be.equal(false);

      // check no reward tokens are given as reward since scheduled call reverted
      const rewardTokenBalance2 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      rewardTokenBalance2.should.be.bignumber.equal(rewardTokenBalance1);

      const user1RewardBalance2 = await erc20RewardToken.balanceOf(executor);
      user1RewardBalance2.should.be.bignumber.equal(user1RewardBalance1);
    }),
  );

  /// executeBatch scheduled batch calls with predecessor
  it(
    'executor should executeBatch scheduled batch calls WITH predecessor dependency'
    + ', emit CallExecuted events and get reward tokens',
    mochaAsync(async () => {
    // NOTE: WITH predecessor dependency means scheduled call needs
    // to wait for given predecessor call to be executed first
      getNextSalt();

      // predecessor as scheduled batch calls
      const data1 = encodeFuncSigWithParams(
        'transferFrom(address,address,uint256)',
        [ 'address', 'address', 'uint256' ],
        [ userAddress, protocolMiningReward.getAddress(), transferTokenAmountRaw ],
      );
      const datas1 = [ data1, data1 ];

      // executeBatch call
      const data2 = encodeFuncSigWithParams(
        'transfer(address,uint256)',
        [ 'address', 'uint256' ],
        [ userAddress2, transferTokenAmountRaw ],
      );
      const datas2 = [ data2, data2 ];

      // approve contract to transfer ERC20 tokens so it can send them via approved call
      await erc20Token.approve({ address: protocolMiningReward.getAddress(), amount: transferTokenAmount.times(2) });
      const newBalance = await erc20Token.allowance({ address: userAddress, spenderAddress: protocolMiningReward.getAddress() });
      newBalance.should.be.bignumber.equal(transferTokenAmount.times(2));

      const call1 = {
        targets, values, datas: datas1, predecessor, salt,
      };
      // schedule 'transferFrom' call
      const tx1 = await protocolMiningReward.scheduleBatch({
        ...call1, delay, rewardTokenAmount: rewardTokenAmountRaw,
      });

      const id1 = tx1.events.CallScheduled[0].returnValues.id;

      const call2 = {
        targets, values, datas: datas2, predecessor: id1, salt,
      };
      // schedule 'transferFrom' batch calls
      const tx12 = await protocolMiningReward.scheduleBatch({
        ...call2, delay, rewardTokenAmount: rewardTokenAmountRaw,
      });

      const id2 = tx12.events.CallScheduled[0].returnValues.id;

      // do blockchain travel forward in time to execute scheduled call
      await forwardTime(delay);
      //

      /// NOTE: reverts if predecessor scheduled call was not executed first
      await beproAssert.revertsFn(
        () => protocolMiningReward.executeBatch(
          call2,
          { from: userAddress },
        ),
        'TimelockController: missing dependency',
      );

      const user1TokenBalance1 = await erc20Token.balanceOf(userAddress);
      const user2TokenBalance1 = await erc20Token.balanceOf(userAddress2);
      const rewardTokenBalance1 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      const user1RewardBalance1 = await erc20RewardToken.balanceOf(userAddress);

      /// NOTE: execute predecessor scheduled call first
      // userAddress is executor
      const tx = await protocolMiningReward.executeBatch(
        call1,
        { from: userAddress },
      );

      // executed call should be operation done
      const operationDone1 = await protocolMiningReward.isOperationDone({ id: id1 });
      operationDone1.should.be.equal(true);

      // event CallExecuted(bytes32 indexed id, uint256 indexed index
      // , address target, uint256 value, bytes data);
      beproAssert.eventEmitted(tx, 'CallExecuted', ev => ev.id === id1
        && ev.index.toString() === '0'
        && ev.target === targets[0]
        && ev.value.toString() === values[0].toString()
        && ev.data === datas1[0]);

      beproAssert.eventEmitted(tx, 'CallExecuted', ev => ev.id === id1
        && ev.index.toString() === '1'
        && ev.target === targets[1]
        && ev.value.toString() === values[1].toString()
        && ev.data === datas1[1]);

      /// NOTE: executeBatch scheduled batch calls after predecessor was executed
      // userAddress is executor
      const tx2 = await protocolMiningReward.executeBatch(
        call2,
        { from: userAddress },
      );

      // executed call should be operation done
      const operationDone2 = await protocolMiningReward.isOperationDone({ id: id2 });
      operationDone2.should.be.equal(true);

      // event CallExecuted(bytes32 indexed id, uint256 indexed index
      // , address target, uint256 value, bytes data);
      beproAssert.eventEmitted(tx2, 'CallExecuted', ev => ev.id === id2
        && ev.index.toString() === '0'
        && ev.target === targets[0]
        && ev.value.toString() === values[0].toString()
        && ev.data === datas2[0]);

      beproAssert.eventEmitted(tx2, 'CallExecuted', ev => ev.id === id2
        && ev.index.toString() === '1'
        && ev.target === targets[1]
        && ev.value.toString() === values[1].toString()
        && ev.data === datas2[1]);

      const user1TokenBalance2 = await erc20Token.balanceOf(userAddress);
      user1TokenBalance2.should.be.bignumber.equal(user1TokenBalance1.minus(transferTokenAmount.times(2)));

      const user2TokenBalance2 = await erc20Token.balanceOf(userAddress2);
      user2TokenBalance2.should.be.bignumber.equal(user2TokenBalance1.plus(transferTokenAmount.times(2)));

      const rewardTokenBalance2 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      rewardTokenBalance2.should.be.bignumber.equal(rewardTokenBalance1.minus(rewardTokenAmount.times(2)));

      const user1RewardBalance2 = await erc20RewardToken.balanceOf(userAddress);
      user1RewardBalance2.should.be.bignumber.equal(user1RewardBalance1.plus(rewardTokenAmount.times(2)));
    }),
  );

  // cancel
  it(
    'not-proposer trying to cancel scheduled call should revert',
    mochaAsync(async () => {
      getNextSalt();

      const tx = await protocolMiningReward.schedule({
        target, value, data, predecessor, salt, delay, rewardTokenAmount,
      });
      const id = tx.events.CallScheduled.returnValues.id;
      
      await beproAssert.revertsFn(
        () => protocolMiningReward.cancel({ id }, { from: executor }),
        'TimelockController: sender requires permission',
      );
    }),
  );

  it(
    'proposer should cancel pending scheduled call and emit Cancelled event',
    mochaAsync(async () => {
      getNextSalt();

      const tx1 = await protocolMiningReward.schedule({
        target, value, data, predecessor, salt, delay, rewardTokenAmount,
      });
      const id = tx1.events.CallScheduled.returnValues.id;
      
      // cancel scheduled call
      const tx = await protocolMiningReward.cancel({ id });

      const callTimestamp = await protocolMiningReward.getTimestamp({ id });
      callTimestamp.should.be.bignumber.equal(0);

      const isOperation = await protocolMiningReward.isOperation({ id });
      isOperation.should.be.equal(false);

      const tokenAmount = await protocolMiningReward.callsRewardTokenAmount({ id });
      tokenAmount.should.be.bignumber.equal(0);

      // event Cancelled(bytes32 indexed id);
      beproAssert.eventEmitted(tx, 'Cancelled', ev => ev.id === id);
    }),
  );

  it(
    'proposer trying to cancel already cancelled call should revert',
    mochaAsync(async () => {
      const id = await protocolMiningReward.hashOperation({
        target, value, data, predecessor, salt,
      });

      await beproAssert.revertsFn(
        () => protocolMiningReward.cancel({ id }),
        'TimelockController: operation cannot be cancelled',
      );
    }),
  );

  it(
    'proposer trying to cancel already executed/done scheduled call should revert',
    mochaAsync(async () => {
      getNextSalt();

      /// NOTE: send eth to protocolMiningReward contract to test 'execute' function
      const target = protocolMiningReward.getAddress();
      const data = '0x';
      const ethvalue = '1';
      const ethvalueWei = web3utils.toWei(ethvalue, 'ether');
      const value = ethvalueWei;

      const tx1 = await protocolMiningReward.schedule({
        target, value, data, predecessor, salt, delay, rewardTokenAmount,
      });
      const id = tx1.events.CallScheduled.returnValues.id;
      
      // do blockchain travel forward in time to execute scheduled call
      await forwardTime(delay);
      //

      // execute scheduled call
      await protocolMiningReward.execute({
        target, value, data, predecessor, salt,
      }, { value });

      await beproAssert.revertsFn(
        () => protocolMiningReward.cancel({ id }),
        'TimelockController: operation cannot be cancelled',
      );
    }),
  );

  /// updateDelay
  it(
    'not-timelock trying to updateDelay should revert',
    mochaAsync(async () => {
      const newDelay = minDelay + 60; // 1 more minute for min delay

      await beproAssert.revertsFn(
        () => protocolMiningReward.updateDelay({ newDelay }),
        'TimelockController: caller must be timelock',
      );

      await beproAssert.revertsFn(
        () => protocolMiningReward.updateDelay({ newDelay }, { from: proposer }),
        'TimelockController: caller must be timelock',
      );

      await beproAssert.revertsFn(
        () => protocolMiningReward.updateDelay({ newDelay }, { from: executor }),
        'TimelockController: caller must be timelock',
      );
    }),
  );

  // NOTE: the caller must be the timelock itself. This can only be achieved by scheduling and later executing
  // an operation where the timelock is the target and the data is the ABI-encoded call to this function.
  it(
    'proposer schedules call for timelock contract itself to call updateDelay function and emit MinDelayChange event',
    mochaAsync(async () => {
      getNextSalt();

      const newDelay = minDelay + 60; // 1 more minute for min delay
      const target = protocolMiningReward.getAddress();
      const data = encodeFuncSigWithParams(
        'updateDelay(uint256)',
        [ 'uint256' ],
        [ newDelay ],
      );

      // schedule call
      await protocolMiningReward.schedule({
        target, value, data, predecessor, salt, delay, rewardTokenAmount,
      });

      // do blockchain travel forward in time to execute scheduled call
      await forwardTime(delay);
      //

      // execute scheduled call
      const tx = await protocolMiningReward.execute({
        target, value, data, predecessor, salt,
      }, { value });
      
      // event MinDelayChange(uint256 oldDuration, uint256 newDuration);
      beproAssert.eventEmitted(tx, 'MinDelayChange', ev => ev.oldDuration === minDelay.toString()
        && ev.newDuration === newDelay.toString());

      // check new delay was updated
      const newDelayRead = await protocolMiningReward.getMinDelay();
      newDelayRead.should.be.bignumber.equal(newDelay);
    }),
  );

  after('ProtocolMiningReward::after_hook', async () => {
    if (testConfig.localtest) {
      await traveler.revertToSnapshot(snapshotId);
      console.log('+++ProtocolMiningReward.after.');
      console.log('--- revert blockchain to last snapshot ---');
    }
    else {
      console.log('--- we only revert blockchain to last snapshot for localtest ---');
    }
  });
});
