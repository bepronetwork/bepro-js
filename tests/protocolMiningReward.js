import { expect, assert } from 'chai';
import web3abi from 'web3-eth-abi';
import { mochaAsync } from './utils';
import {
  ERC20Contract, ETHUtils, ERC20Mock, ProtocolMiningReward,
} from '../build';
import Numbers from '../build/utils/Numbers';
import beproAssert from '../build/utils/beproAssert';
// const truffleAssert = require("truffle-assertions");

// const { chaiPlugin } = require("../../../src/sablier/dev-utils");
const traveler = require('ganache-time-traveler');

const BigNumber = require('bignumber.js');
const chai = require('chai');
const chaiBigNumber = require('chai-bignumber');

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
const transferTokenAmountRaw = Numbers.fromBNToDecimals(transferTokenAmount, 18);

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
  console.log('---userAddress:  ', userAddress);
  console.log('---userAddress2: ', userAddress2);
  console.log('---userAddress3: ', userAddress3);
};

// deploy MarketplaceRealFvr contract
const deployProtocolMiningReward = async ({ rewardTokenAddress1, rewardTokenAmount1 } = {}) => {
  console.log('...deploying new ProtocolMiningReward contract');

  // Create Contract
  protocolMiningReward = new ProtocolMiningReward(testConfig);
  expect(protocolMiningReward).to.not.equal(null);
  // Deploy
  const testConfig2 = {
    ...testConfig,
    rewardTokenAddress: rewardTokenAddress1,
    rewardTokenAmount: rewardTokenAmount1,
  };
  // console.log('...ProtocolMiningReward.testConfig2: ', testConfig2);
  const res = await protocolMiningReward.deploy(testConfig2);
  // await protocolMiningReward.__assert();

  const contractAddress = protocolMiningReward.getAddress();
  expect(res).to.not.equal(false);
  expect(contractAddress).to.equal(res.contractAddress);
  console.log(`Deployed ProtocolMiningReward address: ${contractAddress}`);
  protocolMiningRewardAddress = contractAddress;

  console.log('---protocolMiningReward.userAddress: ', await protocolMiningReward.getUserAddress());

  // deployedBlock = await ethUtils.blockNumber();

  // load user addresses
  await loadSigners(protocolMiningReward);
};

context('ProtocolMiningReward', async () => {
  before('ProtocolMiningReward::before_hook', async () => {
    // const loophole = new Loophole(testConfig);
    const token = new ERC20Mock(testConfig);

    if (testConfig.localtest) {
      /// set global web3 object for ganache time traveler testing
      web3 = token.web3Connection.web3;
      console.log('---ProtocolMiningReward.before.web3: ', (web3 != null));
      ///

      /// take blockchain snapshot
      const snapshot = await traveler.takeSnapshot();
      snapshotId = snapshot.result;
      console.log('+++ProtocolMiningReward.before.');
      console.log('--- take blockchain snapshot ---');
      ///
    }
    else {
      console.log('--- we only take blockchain snapshot for localtest ---');
    }
  });

  // NOTE: make sure we only run these tests in local blockchain
  before('ProtocolMiningReward::before_hook::checkLocalTestOnly', async () => {
    if (!checkLocalTestOnly()) {
      assert.fail('LOCAL_TEST_REQUIRED');
    }
  });

  before('ProtocolMiningReward::setup', async () => {
    ethUtils = new ETHUtils(testConfig);
    expect(ethUtils).to.not.equal(null);
    const res = await ethUtils.deploy({});
    expect(res).to.not.equal(false);
    // ethUtilsAddress = ethUtils.getAddress();
    // deployedBlock = await ethUtils.blockNumber();

    // load user addresses
    await loadSigners(ethUtils);
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

  it('ProtocolMiningReward deployed contract should have expected initial values', mochaAsync(async () => {
    await deployProtocolMiningReward({
      rewardTokenAddress1: erc20RewardToken.getAddress(),
      rewardTokenAmount1: rewardTokenAmountRaw,
    });

    const rewardToken = await protocolMiningReward.rewardToken();
    const rewardAmount = await protocolMiningReward.rewardAmount();
    rewardToken.should.be.equal(erc20RewardToken.getAddress());
    rewardAmount.should.be.bignumber.equal(rewardTokenAmountRaw);
  }));

  it('should deploy the ProtocolMiningReward contract', mochaAsync(async () => {
    await deployProtocolMiningReward({
      rewardTokenAddress1: erc20RewardToken.getAddress(),
      rewardTokenAmount1: rewardTokenAmountRaw,
    });

    await erc20RewardToken.transferTokenAmount({ toAddress: protocolMiningRewardAddress, tokenAmount: TOKEN_AMOUNT_1B });
    const newBalance = await erc20RewardToken.balanceOf(protocolMiningRewardAddress);
    newBalance.should.be.bignumber.equal(TOKEN_AMOUNT_1B);
  }));

  it(
    'encodeERC20Transfer/decodeERC20Transfer tests',
    mochaAsync(async () => {
      // generate cryptographically strong pseudo-random HEX strings from a given byte size.
      // web3.utils.randomHex(4)
      // > "0x6892ffc6"

      // web3.eth.abi.encodeFunctionSignature('myMethod(uint256,string)')
      // web3.eth.abi.encodeParameters(['uint256','string'], ['2345675643', 'Hello!%']);
      // web3.eth.abi.encodeEventSignature('myEvent(uint256,bytes32)')

      // web3.eth.abi.encodeParameter('bytes32', '0xdf3234');
      // > "0xdf32340000000000000000000000000000000000000000000000000000000000"

      // web3.eth.abi.encodeParameter('bytes', '0xdf3234');
      // > "0x0000000000000000000000000000000000000000000000000000000000000020"
      //   "0000000000000000000000000000000000000000000000000000000000000003df"
      //   "32340000000000000000000000000000000000000000000000000000000000"

      // web3.eth.abi.encodeParameter('bytes32[]', ['0xdf3234', '0xfdfd']);
      // > "000000000000000000000000000000000000000000000000000000000000002000"
      //   "00000000000000000000000000000000000000000000000000000000000002df32"
      //   "340000000000000000000000000000000000000000000000000000000000fdfd00"
      //   "0000000000000000000000000000000000000000000000000000000000"

      const tokenAmount = BigNumber(100);

      const encodedFuncSigWeb3 = web3abi.encodeFunctionSignature('transfer(address,uint256)');
      let encodedParamsWeb3 = web3abi.encodeParameters([ 'address', 'uint256' ], [ userAddress2, tokenAmount ]);
      encodedParamsWeb3 = encodedParamsWeb3.slice(2);
      const encodedFuncWeb3 = encodedFuncSigWeb3 + encodedParamsWeb3;
      console.log('---encodedFuncWeb3: ', encodedFuncWeb3);
      // expect(encodedFuncSol).to.equal(encodedFuncWeb3);

      const encodedFuncSigSol = await ethUtils.getFunctionSelector('transfer(address,uint256)');
      console.log('---encodedFuncSigSol: ', encodedFuncSigSol);
      expect(encodedFuncSigSol).to.equal(encodedFuncSigWeb3);
    }),
  );

  let target;
  let funcSelector;
  let funcSelector2;
  let callData; // encoded function call data
  let callData2; // encoded function call data

  let targets; // target contract addresses
  let values; // eth values for calls
  let funcSelectors; // target contract function selectors to call
  let callDatas; // encoded function call datas

  let callParam; // encoded parameters data
  let callParam2; // encoded parameters data
  let callParams; // encoded parameters datas

  it(
    'loading data...',
    mochaAsync(async () => {
      target = erc20Token.getAddress();
      funcSelector = web3abi.encodeFunctionSignature('transfer(address,uint256)');
      funcSelector2 = web3abi.encodeFunctionSignature('transferFrom(address,address,uint256)');
      callData = encodeFuncSigWithParams(
        'transfer(address,uint256)',
        [ 'address', 'uint256' ],
        [ userAddress2, transferTokenAmountRaw ],
      );
      callData2 = encodeFuncSigWithParams(
        'transferFrom(address,address,uint256)',
        [ 'address', 'address', 'uint256' ],
        [ userAddress2, userAddress3, transferTokenAmountRaw ],
      );

      targets = [ erc20Token.getAddress(), erc20Token.getAddress() ];
      values = [ 0, 0 ];
      funcSelectors = [ funcSelector, funcSelector2 ];
      callDatas = [ callData, callData2 ];

      callParam = web3abi.encodeParameters([ 'address', 'uint256' ], [ userAddress2, transferTokenAmountRaw ]);
      callParam2 = web3abi.encodeParameters([ 'address', 'address', 'uint256' ], [ userAddress2, userAddress3, transferTokenAmountRaw ]);
      callParams = [ callParam, callParam2 ];
    }),
  );

  it(
    'user trying to approveCall should revert',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.approveCall({
          target,
          funcSelector,
          rewardTokenAmount,
        }, { from: userAddress2 }),
        'OR',
      );
    }),
  );

  // Reward token not allowed ??, owner's choice, skip test for now
  // it.skip('reward token should not be approved',
  //  mochaAsync(async () => {
  //    const target = erc20RewardToken.getAddress();
  //
  //    await beproAssert.revertsFn(
  //      () => protocolMiningReward.approveCall({
  //        target,
  //        funcSelector,
  //        rewardTokenAmount,
  //      }),
  //      'Reward token not allowed',
  //    );
  //  }),
  // );

  it(
    'owner should approveCall',
    mochaAsync(async () => {
      await protocolMiningReward.approveCall({
        target,
        funcSelector,
        rewardTokenAmount,
      });

      // check approved call
      const callHash = await protocolMiningReward.hashOperation({ target, funcSelector });
      const approved = await protocolMiningReward.callApproved({ callHash });
      approved.should.be.equal(true);

      const callsCount = await protocolMiningReward.callsCount();
      callsCount.should.be.bignumber.equal(1);
    }),
  );

  it(
    'should update already approved call',
    mochaAsync(async () => {
      // following attributes have to be different than previous so we can check if call is being updated
      let rewardTokenAmount = BigNumber(10500);

      // approve a call first so we can update it after
      await protocolMiningReward.approveCall({
        target,
        funcSelector,
        rewardTokenAmount,
      });

      const callHash = await protocolMiningReward.hashOperation({ target, funcSelector });
      const c = await protocolMiningReward.callsRewardTokenAmount({ callHash });
      c.should.be.bignumber.equal(10500);

      // leave the call as it was before the test
      rewardTokenAmount = BigNumber(1000);

      await protocolMiningReward.approveCall({
        target,
        funcSelector,
        rewardTokenAmount,
      });

      const c2 = await protocolMiningReward.callsRewardTokenAmount({ callHash });
      c2.should.be.bignumber.equal(1000);
    }),
  );

  // approveCallData
  it(
    'user trying to approveCallData should revert',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.approveCallData({
          target,
          callData,
          rewardTokenAmount,
        }, { from: userAddress2 }),
        'OR',
      );
    }),
  );

  it(
    'owner should approveCallData',
    mochaAsync(async () => {
      await protocolMiningReward.approveCallData({
        target,
        callData,
        rewardTokenAmount,
      });

      // check approved call
      const callHash = await protocolMiningReward.hashOperationData({ target, callData });
      const approved = await protocolMiningReward.callApproved({ callHash });
      approved.should.be.equal(true);
    }),
  );

  it(
    'should update already approved callData',
    mochaAsync(async () => {
      // following attributes have to be different than previous so we can check if call is being updated
      let rewardTokenAmount = BigNumber(10500);

      await protocolMiningReward.approveCallData({
        target,
        callData,
        rewardTokenAmount,
      });

      const callHash = await protocolMiningReward.hashOperationData({ target, callData });
      const c = await protocolMiningReward.callsRewardTokenAmount({ callHash });
      c.should.be.bignumber.equal(10500);

      // leave the call as it was before the test
      rewardTokenAmount = BigNumber(1000);

      await protocolMiningReward.approveCallData({
        target,
        callData,
        rewardTokenAmount,
      });

      const c2 = await protocolMiningReward.callsRewardTokenAmount({ callHash });
      c2.should.be.bignumber.equal(1000);
    }),
  );

  // approveBatch
  it(
    'user trying to approveBatch should revert',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.approveBatch({
          targets,
          funcSelectors,
          rewardTokenAmount,
        }, { from: userAddress2 }),
        'OR',
      );
    }),
  );

  it(
    'owner should approveBatch',
    mochaAsync(async () => {
      await protocolMiningReward.approveBatch({
        targets,
        funcSelectors,
        rewardTokenAmount,
      });

      // check approved call
      const callHash = await protocolMiningReward.hashOperationBatch({ targets, funcSelectors });
      const approved = await protocolMiningReward.callApproved({ callHash });
      approved.should.be.equal(true);
    }),
  );

  it(
    'should update already approved batch',
    mochaAsync(async () => {
      // following attributes have to be different than previous so we can check if call is being updated
      let rewardTokenAmount = BigNumber(10500);

      await protocolMiningReward.approveBatch({
        targets,
        funcSelectors,
        rewardTokenAmount,
      });

      const callHash = await protocolMiningReward.hashOperationBatch({ targets, funcSelectors });
      const c = await protocolMiningReward.callsRewardTokenAmount({ callHash });
      c.should.be.bignumber.equal(10500);

      // leave the call as it was before the test
      rewardTokenAmount = BigNumber(1000);

      await protocolMiningReward.approveBatch({
        targets,
        funcSelectors,
        rewardTokenAmount,
      });

      const c2 = await protocolMiningReward.callsRewardTokenAmount({ callHash });
      c2.should.be.bignumber.equal(1000);
    }),
  );

  // approveBatchData
  it(
    'user trying to approveBatchData should revert',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.approveBatchData({
          targets,
          callDatas,
          rewardTokenAmount,
        }, { from: userAddress2 }),
        'OR',
      );
    }),
  );

  it(
    'owner should approveBatchData',
    mochaAsync(async () => {
      await protocolMiningReward.approveBatchData({
        targets,
        callDatas,
        rewardTokenAmount,
      });

      // check approved call
      const callHash = await protocolMiningReward.hashOperationBatchData({ targets, callDatas });
      const approved = await protocolMiningReward.callApproved({ callHash });
      approved.should.be.equal(true);
    }),
  );

  it(
    'should update already approved batchData',
    mochaAsync(async () => {
      // following attributes have to be different than previous so we can check if call is being updated
      let rewardTokenAmount = BigNumber(10500);

      await protocolMiningReward.approveBatchData({
        targets,
        callDatas,
        rewardTokenAmount,
      });

      const callHash = await protocolMiningReward.hashOperationBatchData({ targets, callDatas });
      const c = await protocolMiningReward.callsRewardTokenAmount({ callHash });
      c.should.be.bignumber.equal(10500);

      // leave the call as it was before the test
      rewardTokenAmount = BigNumber(1000);

      await protocolMiningReward.approveBatchData({
        targets,
        callDatas,
        rewardTokenAmount,
      });

      const c2 = await protocolMiningReward.callsRewardTokenAmount({ callHash });
      c2.should.be.bignumber.equal(1000);
    }),
  );

  // user trying to disapproveCall should revert
  it(
    'user trying to disapproveCall should revert',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.disapproveCall({
          target,
          funcSelector,
        }, { from: userAddress2 }),
        'OR', // Owner Required
      );
    }),
  );

  // owner should disapproveCall
  it(
    'owner should disapproveCall',
    mochaAsync(async () => {
      await protocolMiningReward.disapproveCall({
        target,
        funcSelector,
      });

      // check call disapproved
      const callHash = await protocolMiningReward.hashOperation({ target, funcSelector });
      const approved = await protocolMiningReward.callApproved({ callHash });
      approved.should.be.equal(false);
    }),
  );

  // only approved call can be disapproved
  it(
    'only approved call can be disapproved',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.disapproveCall({
          target,
          funcSelector,
        }),
        'Function call must be approved',
      );
    }),
  );

  // disapproveCallData
  it(
    'user trying to disapproveCallData should revert',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.disapproveCallData({
          target,
          callData,
        }, { from: userAddress2 }),
        'OR', // Owner Required
      );
    }),
  );

  it(
    'owner should disapproveCallData',
    mochaAsync(async () => {
      await protocolMiningReward.disapproveCallData({
        target,
        callData,
      });

      // check call disapproved
      const callHash = await protocolMiningReward.hashOperationData({ target, callData });
      const approved = await protocolMiningReward.callApproved({ callHash });
      approved.should.be.equal(false);
    }),
  );

  it(
    'only approved callData can be disapproved',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.disapproveCallData({
          target,
          callData,
        }),
        'Function call must be approved',
      );
    }),
  );

  // disapproveBatch
  it(
    'user trying to disapproveBatch should revert',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.disapproveBatch({
          targets,
          funcSelectors,
        }, { from: userAddress2 }),
        'OR', // Owner Required
      );
    }),
  );

  it(
    'owner should disapproveBatch',
    mochaAsync(async () => {
      await protocolMiningReward.disapproveBatch({
        targets,
        funcSelectors,
      });

      // check call disapproved
      const callHash = await protocolMiningReward.hashOperationBatch({ targets, funcSelectors });
      const approved = await protocolMiningReward.callApproved({ callHash });
      approved.should.be.equal(false);
    }),
  );

  it(
    'only approved batch can be disapproved',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.disapproveBatch({
          targets,
          funcSelectors,
        }),
        'Function call must be approved',
      );
    }),
  );

  // disapproveBatchData
  it(
    'user trying to disapproveBatchData should revert',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.disapproveBatchData({
          targets,
          callDatas,
        }, { from: userAddress2 }),
        'OR', // Owner Required
      );
    }),
  );

  it(
    'owner should disapproveBatchData',
    mochaAsync(async () => {
      await protocolMiningReward.disapproveBatchData({
        targets,
        callDatas,
      });

      // check call disapproved
      const callHash = await protocolMiningReward.hashOperationBatchData({ targets, callDatas });
      const approved = await protocolMiningReward.callApproved({ callHash });
      approved.should.be.equal(false);
    }),
  );

  it(
    'only approved batchData can be disapproved',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.disapproveBatchData({
          targets,
          callDatas,
        }),
        'Function call must be approved',
      );
    }),
  );

  // disapproveAll
  it(
    'user trying to disapproveAll should revert',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.disapproveAll({ from: userAddress2 }),
        'OR', // Owner Required
      );
    }),
  );

  it(
    'owner should disapproveAll',
    mochaAsync(async () => {
      // approve some calls
      await protocolMiningReward.approveCall({
        target,
        funcSelector,
        rewardTokenAmount,
      });

      await protocolMiningReward.approveBatchData({
        targets,
        callDatas,
        rewardTokenAmount,
      });

      const count = await protocolMiningReward.callsCount();
      count.should.be.bignumber.equal(2);

      // disapprove all calls
      await protocolMiningReward.disapproveAll();
      // for(let i=count-1; i>=0; --i) { // WORKS
      //  console.log('---removeCallHash.before: ', i);
      //  let callHash = await protocolMiningReward.getCallHashByIndex(i);
      //  await protocolMiningReward.removeCallHash({ callHash });
      //  console.log('---removeCallHash.after: ', i);
      // }

      // check all calls disapproved
      const count2 = await protocolMiningReward.callsCount();
      count2.should.be.bignumber.equal(0);
    }),
  );

  it(
    'trying to execute disapproved call should revert',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.execute({
          target,
          funcSelector,
          callParam,
        }),
        'Function call not approved',
      );
    }),
  );

  it(
    'trying to executeData disapproved call should revert',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.executeData({
          target,
          callData,
        }),
        'Function call not approved',
      );
    }),
  );

  it(
    'trying to executeBatch call with different length arrays input should revert',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.executeBatch({
          targets: [ erc20Token.getAddress() ],
          values: [ 0, 0 ],
          funcSelectors,
          callParams,
        }),
        'Length mismatch',
      );

      await beproAssert.revertsFn(
        () => protocolMiningReward.executeBatch({
          targets,
          values: [ 0 ],
          funcSelectors,
          callParams,
        }),
        'Length mismatch',
      );

      await beproAssert.revertsFn(
        () => protocolMiningReward.executeBatch({
          targets,
          values: [ 0, 0 ],
          funcSelectors: [ funcSelector ],
          callParams,
        }),
        'Length mismatch',
      );

      await beproAssert.revertsFn(
        () => protocolMiningReward.executeBatch({
          targets,
          values: [ 0, 0 ],
          funcSelectors,
          callParams: [ '0x' ],
        }),
        'Length mismatch',
      );
    }),
  );

  it(
    'trying to executeBatch disapproved call should revert',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.executeBatch({
          targets,
          values: [ 0, 0 ],
          funcSelectors,
          callParams,
        }),
        'Function call not approved',
      );
    }),
  );

  it(
    'trying to executeBatchData call with different length arrays input should revert',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.executeBatchData({
          targets: [ erc20Token.getAddress() ],
          values: [ 0, 0 ],
          callDatas,
        }),
        'Length mismatch',
      );

      await beproAssert.revertsFn(
        () => protocolMiningReward.executeBatchData({
          targets,
          values: [ 0 ],
          callDatas,
        }),
        'Length mismatch',
      );

      await beproAssert.revertsFn(
        () => protocolMiningReward.executeBatchData({
          targets,
          values: [ 0, 0 ],
          callDatas: [ '0x' ],
        }),
        'Length mismatch',
      );
    }),
  );

  it(
    'trying to executeBatchData disapproved call should revert',
    mochaAsync(async () => {
      await beproAssert.revertsFn(
        () => protocolMiningReward.executeBatchData({
          targets,
          values: [ 0, 0 ],
          callDatas,
        }),
        'Function call not approved',
      );
    }),
  );

  it(
    'get call hash by index on invalid index should revert',
    mochaAsync(async () => {
      const id = 1000; // out of range index

      await beproAssert.revertsFn(
        () => protocolMiningReward.getCallHashByIndex(id),
        'ID_OORI',
      );
    }),
  );

  it(
    'should execute approved call and get token rewards',
    mochaAsync(async () => {
      // transfer ERC20 tokens to contract so it can send them via approved call
      await erc20Token.transferTokenAmount({ toAddress: protocolMiningReward.getAddress(), tokenAmount: transferTokenAmount });
      const newBalance = await erc20Token.balanceOf(protocolMiningReward.getAddress());
      newBalance.should.be.bignumber.equal(transferTokenAmount);

      // approve call first
      await protocolMiningReward.approveCall({
        target,
        funcSelector,
        rewardTokenAmount: rewardTokenAmountRaw,
      });

      const contractTokenBalance1 = await erc20Token.balanceOf(protocolMiningReward.getAddress());
      const user2TokenBalance1 = await erc20Token.balanceOf(userAddress2);
      const rewardTokenBalance1 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      const user1RewardBalance1 = await erc20RewardToken.balanceOf(userAddress);

      // console.log('---protocolMiningReward.execute.before');
      await protocolMiningReward.execute({
        target,
        funcSelector,
        callParam,
      });
      // console.log('---protocolMiningReward.execute.after');

      const contractTokenBalance2 = await erc20Token.balanceOf(protocolMiningReward.getAddress());
      contractTokenBalance2.should.be.bignumber.equal(contractTokenBalance1.minus(transferTokenAmount));

      const user2TokenBalance2 = await erc20Token.balanceOf(userAddress2);
      user2TokenBalance2.should.be.bignumber.equal(user2TokenBalance1.plus(transferTokenAmount));

      const rewardTokenBalance2 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      rewardTokenBalance2.should.be.bignumber.equal(rewardTokenBalance1.minus(rewardTokenAmount));

      const user1RewardBalance2 = await erc20RewardToken.balanceOf(userAddress);
      user1RewardBalance2.should.be.bignumber.equal(user1RewardBalance1.plus(rewardTokenAmount));

      // disapprove call
      await protocolMiningReward.disapproveCall({
        target,
        funcSelector,
      });
    }),
  );

  it(
    'should executeData approved call with strict given params only and get token rewards',
    mochaAsync(async () => {
      // transfer ERC20 tokens to contract so it can send them via approved call
      await erc20Token.transferTokenAmount({ toAddress: protocolMiningReward.getAddress(), tokenAmount: transferTokenAmount });
      const newBalance = await erc20Token.balanceOf(protocolMiningReward.getAddress());
      newBalance.should.be.bignumber.equal(transferTokenAmount);

      // approve call first
      await protocolMiningReward.approveCallData({
        target,
        callData,
        rewardTokenAmount: rewardTokenAmountRaw,
      });

      /// sub TEST case: using userAddress3 instead of userAddress2 will make call fail
      const callDataFail = encodeFuncSigWithParams(
        'transfer(address,uint256)',
        [ 'address', 'uint256' ],
        [ userAddress3, transferTokenAmountRaw ],
      );
      // console.log('---callDataFails: ', callDataFail);

      // trying to execute function with different params than approved should fail
      await beproAssert.revertsFn(
        () => protocolMiningReward.executeData({
          target,
          callData: callDataFail,
        }),
        'Function call not approved',
      );
      ///

      /// sub TEST case: trying to execute function that will fail should revert
      const callDataFail2 = encodeFuncSigWithParams(
        'transfer(address,uint256)',
        [ 'address', 'uint256' ],
        [ userAddress2, BigNumber(transferTokenAmountRaw).plus(100) ],
      );
      // console.log('---callData: ', callData);

      // approve call first
      await protocolMiningReward.approveCallData({
        target,
        callData: callDataFail2,
        rewardTokenAmount: rewardTokenAmountRaw,
      });

      await beproAssert.revertsFn(
        () => protocolMiningReward.executeData({
          target,
          callData: callDataFail2,
        }),
        'CF',
      );
      ///

      const contractTokenBalance1 = await erc20Token.balanceOf(protocolMiningReward.getAddress());
      const user2TokenBalance1 = await erc20Token.balanceOf(userAddress2);
      const rewardTokenBalance1 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      const user1RewardBalance1 = await erc20RewardToken.balanceOf(userAddress);

      await protocolMiningReward.executeData({
        target,
        callData,
      });

      const contractTokenBalance2 = await erc20Token.balanceOf(protocolMiningReward.getAddress());
      contractTokenBalance2.should.be.bignumber.equal(contractTokenBalance1.minus(transferTokenAmount));

      const user2TokenBalance2 = await erc20Token.balanceOf(userAddress2);
      user2TokenBalance2.should.be.bignumber.equal(user2TokenBalance1.plus(transferTokenAmount));

      const rewardTokenBalance2 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      rewardTokenBalance2.should.be.bignumber.equal(rewardTokenBalance1.minus(rewardTokenAmount));

      const user1RewardBalance2 = await erc20RewardToken.balanceOf(userAddress);
      user1RewardBalance2.should.be.bignumber.equal(user1RewardBalance1.plus(rewardTokenAmount));

      // disapprove call
      await protocolMiningReward.disapproveCallData({
        target,
        callData,
      });
      await protocolMiningReward.disapproveCallData({
        target,
        callData: callDataFail2,
      });
    }),
  );

  it(
    'should executeBatch approved call and get token rewards (with transferFrom)',
    mochaAsync(async () => {
      // NOTES:
      // GOAL: userAddress wants to send erc20 tokens to userAddress2 via RewardMiningProtocol contract and get reward tokens
      // STEPS to do for achieving this:
      // 1. userAddress approves contract to 'transferFrom' token on his behalf
      // 2. call transferFrom function from RewardMiningProtocol contract
      // -takes sender tokens with ERC20 'transferFrom' function
      // 3. RewardMiningProtocol contract calls target contract function sending erc20 tokens to userAddress2
      // and rewards sender (userAddress) with reward tokens for this tx

      // approve contract to transfer ERC20 tokens so it can send them via approved call
      await erc20Token.approve({ address: protocolMiningReward.getAddress(), amount: transferTokenAmount });
      const newBalance = await erc20Token.allowance({ address: userAddress, spenderAddress: protocolMiningReward.getAddress() });
      newBalance.should.be.bignumber.equal(transferTokenAmount);

      const targets = [ erc20Token.getAddress(), erc20Token.getAddress() ];
      const values = [ 0, 0 ]; // eth values, zero in our case, we only transfer tokens
      const funcSelectors = [
        web3abi.encodeFunctionSignature('transferFrom(address,address,uint256)'),
        web3abi.encodeFunctionSignature('transfer(address,uint256)'),
      ];

      // encoded callData for function 'transferFrom(address from, address to, uint256 amount)'
      const callParams1 = web3abi.encodeParameters(
        [ 'address', 'address', 'uint256' ],
        [ userAddress, protocolMiningReward.getAddress(), transferTokenAmountRaw ],
      );
      // encoded callData for function 'transfer(address to, uint256 amount)'
      const callParams2 = web3abi.encodeParameters(
        [ 'address', 'uint256' ],
        [ userAddress2, transferTokenAmountRaw ],
      );
      const callParams = [ callParams1, callParams2 ];

      // approve call first
      await protocolMiningReward.approveBatch({
        targets,
        funcSelectors,
        rewardTokenAmount: rewardTokenAmountRaw,
      });

      /// sub TEST case: executing call with different function selectors than approved should revert
      const funcSelectorsFail = [
        web3abi.encodeFunctionSignature('transferFrom(address,address,uint256)'),
        web3abi.encodeFunctionSignature('transfer2(address,uint256)'),
      ];

      await beproAssert.revertsFn(
        () => protocolMiningReward.executeBatch({
          targets,
          values,
          funcSelectors: funcSelectorsFail,
          callParams,
        }),
        'Function call not approved',
      );
      ///

      /// sub TEST case: executing call with one function call that fails should revert the tx
      const callParams2Fail = web3.eth.abi.encodeParameters(
        [ 'address', 'uint256' ],
        [ userAddress2, BigNumber(transferTokenAmountRaw).plus(1) ],
      );
      const callParamsFail = [ callParams1, callParams2Fail ];

      await beproAssert.revertsFn(
        () => protocolMiningReward.executeBatch({
          targets,
          values,
          funcSelectors,
          callParams: callParamsFail,
        }),
        'CF1',
      );
      ///

      const contractTokenBalance1 = await erc20Token.balanceOf(protocolMiningReward.getAddress());
      const user1TokenBalance1 = await erc20Token.balanceOf(userAddress);
      const user2TokenBalance1 = await erc20Token.balanceOf(userAddress2);
      const rewardTokenBalance1 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      const user1RewardBalance1 = await erc20RewardToken.balanceOf(userAddress);

      await protocolMiningReward.executeBatch({
        targets,
        values,
        funcSelectors,
        callParams,
      });

      // contract should have no tokens left affter the tx
      const contractTokenBalance2 = await erc20Token.balanceOf(protocolMiningReward.getAddress());
      contractTokenBalance2.should.be.bignumber.equal(contractTokenBalance1);

      const user1TokenBalance2 = await erc20Token.balanceOf(userAddress);
      user1TokenBalance2.should.be.bignumber.equal(user1TokenBalance1.minus(transferTokenAmount));

      const user2TokenBalance2 = await erc20Token.balanceOf(userAddress2);
      user2TokenBalance2.should.be.bignumber.equal(user2TokenBalance1.plus(transferTokenAmount));

      const rewardTokenBalance2 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      rewardTokenBalance2.should.be.bignumber.equal(rewardTokenBalance1.minus(rewardTokenAmount));

      const user1RewardBalance2 = await erc20RewardToken.balanceOf(userAddress);
      user1RewardBalance2.should.be.bignumber.equal(user1RewardBalance1.plus(rewardTokenAmount));
    }),
  );

  it(
    'should executeBatchData approved call with strict given params only and get token rewards',
    mochaAsync(async () => {
      // NOTE: approve protocolMiningReward contract to transferFrom userAddress
      await erc20Token.approve({ address: protocolMiningReward.getAddress(), amount: transferTokenAmount });
      const newBalance = await erc20Token.allowance({ address: userAddress, spenderAddress: protocolMiningReward.getAddress() });
      newBalance.should.be.bignumber.equal(transferTokenAmount);

      // encoded callData for function 'transferFrom(address from, address to, uint256 amount)'
      const callData1 = encodeFuncSigWithParams(
        'transferFrom(address,address,uint256)',
        [ 'address', 'address', 'uint256' ],
        [ userAddress, protocolMiningReward.getAddress(), transferTokenAmountRaw ],
      );
      // encoded callData for function 'transfer(address to, uint256 amount)'
      const callData2 = encodeFuncSigWithParams(
        'transfer(address,uint256)',
        [ 'address', 'uint256' ],
        [ userAddress2, transferTokenAmountRaw ],
      );
      const callDatas = [ callData1, callData2 ];
      // console.log('---callDatas: ', callDatas);

      // approve call first
      await protocolMiningReward.approveBatchData({
        targets,
        callDatas,
        rewardTokenAmount: rewardTokenAmountRaw,
      });

      /// sub TEST case: executing call with different callData than approved should revert
      const callDataFail = encodeFuncSigWithParams(
        'transfer2(address,uint256)',
        [ 'address', 'uint256' ],
        [ userAddress2, transferTokenAmountRaw ],
      );
      const callDatasFail = [ callData1, callDataFail ];

      await beproAssert.revertsFn(
        () => protocolMiningReward.executeBatchData({
          targets,
          values,
          callDatas: callDatasFail,
        }),
        'Function call not approved',
      );
      ///

      /// sub TEST case: executing callData with one function call that fails should revert the tx
      const transferTokenAmountRawFail = Numbers.fromBNToDecimals(transferTokenAmount.plus(1), 18);
      const callData2Fail = encodeFuncSigWithParams(
        'transfer(address,uint256)',
        [ 'address', 'uint256' ],
        [ userAddress2, transferTokenAmountRawFail ],
      );
      // console.log('---callData2Fail: ', callData2Fail);
      const callDatasFail2 = [ callData1, callData2Fail ];

      // approve batch call
      await protocolMiningReward.approveBatchData({
        targets,
        callDatas: callDatasFail2,
        rewardTokenAmount: rewardTokenAmountRaw,
      });

      await beproAssert.revertsFn(
        () => protocolMiningReward.executeBatchData({
          targets,
          values,
          callDatas: callDatasFail2,
        }),
        'CF1',
      );
      ///

      const contractTokenBalance1 = await erc20Token.balanceOf(protocolMiningReward.getAddress());
      const user1TokenBalance1 = await erc20Token.balanceOf(userAddress);
      const user2TokenBalance1 = await erc20Token.balanceOf(userAddress2);
      const rewardTokenBalance1 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      const user1RewardBalance1 = await erc20RewardToken.balanceOf(userAddress);

      // console.log('---protocolMiningReward.executeBatchData.before');
      await protocolMiningReward.executeBatchData({
        targets,
        values: [ 0, 0 ],
        callDatas,
      });
      // console.log('---protocolMiningReward.executeBatchData.after');

      // contract should have no tokens left affter the tx
      const contractTokenBalance2 = await erc20Token.balanceOf(protocolMiningReward.getAddress());
      contractTokenBalance2.should.be.bignumber.equal(contractTokenBalance1);

      const user1TokenBalance2 = await erc20Token.balanceOf(userAddress);
      user1TokenBalance2.should.be.bignumber.equal(user1TokenBalance1.minus(transferTokenAmount));

      const user2TokenBalance2 = await erc20Token.balanceOf(userAddress2);
      user2TokenBalance2.should.be.bignumber.equal(user2TokenBalance1.plus(transferTokenAmount));

      const rewardTokenBalance2 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      rewardTokenBalance2.should.be.bignumber.equal(rewardTokenBalance1.minus(rewardTokenAmount));

      const user1RewardBalance2 = await erc20RewardToken.balanceOf(userAddress);
      user1RewardBalance2.should.be.bignumber.equal(user1RewardBalance1.plus(rewardTokenAmount));

      // disapprove call
      await protocolMiningReward.disapproveBatchData({
        targets,
        callDatas,
      });
    }),
  );

  /// PRE-REQUISITE:
  /// contract we send eth to, should NOT allow to receive ETH for this test case to pass
  it(
    'sending ETH value to non-receiving contract address should revert',
    mochaAsync(async () => {
      const ethvalue = '1';
      const ethvalueWei = web3.utils.toWei(ethvalue, 'ether');

      // console.log('---protocolMiningReward.approveCallData.before');
      await protocolMiningReward.approveCallData({
        target: erc20Token.getAddress(),
        callData: '0x',
        rewardTokenAmount: rewardTokenAmountRaw,
      });
      // console.log('---protocolMiningReward.approveCallData.after');

      // console.log('---protocolMiningReward.sendTransaction.before');
      // send eth to contract OR send eth to approved function call
      // const sendTx = await web3.eth.sendTransaction({
      //  from: userAddress,
      //  to: protocolMiningReward.getAddress(),
      //  value: ethvalueWei,
      // });
      // console.log('---protocolMiningReward.sendTransaction.after');

      await beproAssert.revertsFn(
        () => protocolMiningReward.executeData(
          {
            target: erc20Token.getAddress(),
            callData: '0x',
          },
          { from: userAddress, value: ethvalueWei },
        ),
      );
    }),
  );

  it(
    'send ETH value and get reward tokens',
    mochaAsync(async () => {
      const ethvalue = '1';
      const ethvalueWei = web3.utils.toWei(ethvalue, 'ether');

      // console.log('---protocolMiningReward.approveCallData.before');
      // sending eth value needs 'callData' to be null ("0x" or "0x0")
      await protocolMiningReward.approveCallData({
        target: userAddress2,
        callData: '0x',
        rewardTokenAmount: rewardTokenAmountRaw,
      });
      // console.log('---protocolMiningReward.approveCallData.after');

      // const user1Balance1 = web3.utils.fromWei(await web3.eth.getBalance(userAddress));
      // console.log('---protocolMiningReward.user1Balance1: ', user1Balance1);

      const contractBalance1 = web3.utils.fromWei(await web3.eth.getBalance(protocolMiningReward.getAddress()));
      contractBalance1.should.be.bignumber.equal(BigNumber(0));

      const user2Balance1 = web3.utils.fromWei(await web3.eth.getBalance(userAddress2));
      const rewardTokenBalance1 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      const user1RewardBalance1 = await erc20RewardToken.balanceOf(userAddress);

      // console.log('---protocolMiningReward.executeData.before');
      await protocolMiningReward.executeData({
        target: userAddress2,
        callData: '0x',
      }, { from: userAddress, value: ethvalueWei });
      // console.log('---protocolMiningReward.executeData.after');

      const contractBalance2 = web3.utils.fromWei(await web3.eth.getBalance(protocolMiningReward.getAddress()));
      contractBalance2.should.be.bignumber.equal(BigNumber(0));

      const user2Balance2 = web3.utils.fromWei(await web3.eth.getBalance(userAddress2));
      user2Balance2.should.be.bignumber.equal(BigNumber(user2Balance1).plus(ethvalue));

      const rewardTokenBalance2 = await erc20RewardToken.balanceOf(protocolMiningReward.getAddress());
      rewardTokenBalance2.should.be.bignumber.equal(rewardTokenBalance1.minus(rewardTokenAmount));

      const user1RewardBalance2 = await erc20RewardToken.balanceOf(userAddress);
      user1RewardBalance2.should.be.bignumber.equal(user1RewardBalance1.plus(rewardTokenAmount));
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
