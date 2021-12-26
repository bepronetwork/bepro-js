// const { devConstants } = require("@sablier/dev-utils");
// const project_root = process.cwd();
import { expect, assert } from 'chai';
import { mochaAsync, mochaContextAsync } from '../utils';
import { ERC20Contract, Sablier, ETHUtils } from '../../build';
import CERC20Mock from '../../build/models/mocks/CERC20Mock';
import ERC20Mock from '../../build/models/mocks/ERC20Mock';

const traveler = require('ganache-time-traveler');
const { dappConstants, devConstants } = require('../../src/sablier/dev-utils');
// import Numbers from "../../build/utils/Numbers";

// import beproAssert from '../../build/utils/beproAssert';

// const truffleAssert = require("truffle-assertions");
// const BigNumber = require("bignumber.js");

const { INITIAL_EXCHANGE_RATE, STANDARD_SALARY } = dappConstants;
const { STANDARD_SABLIER_FEE } = dappConstants;

// const lockSeconds = 30; // lock tokens for x amount of seconds
// let endDate = moment().add(lockSeconds, "seconds");
const testConfig = {
  test: true,
  localtest: true, // ganache local blockchain
};

// let _this = {};
// const web3Conn = new Web3Connection(testConfig);
global.web3 = undefined;// = web3Conn.web3;
// const web3 = web3Conn.web3;
// console.log('---sablier.web3', web3Conn);

// NOTE:
// we use arrow functions in unit testing across several file,
// we need a global object simulating 'this' context since we loose it with arrow functions
global._this = {};

let snapshotId;

let erc20Contract;
let sablier;
let userAddress;
let contractAddress;
let deployed_contractAddress;

const deployEthUtils = async () => {
  const ethUtils = new ETHUtils(testConfig);
  expect(ethUtils).to.not.equal(null);
  const res = await ethUtils.deploy({});
  expect(res).to.not.equal(false);
  _this.ethUtils = ethUtils;
};

// initialize wallets and any other required data before any hook function
const initConfig = async () => {
  // console.log('...initConfig.start');
  // _this = {};
  const token = new ERC20Mock(testConfig);
  expect(token).to.not.equal(null);
  // console.log('---sablier.initConfig.bp0');
  const res = await token.deploy();
  // console.log('---sablier.initConfig.bp1');
  await token.__assert();
  // console.log('---sablier.initConfig.bp2');

  [_this.alice, _this.bob, _this.carol, _this.eve] = await token.getSigners();
  _this.userAddress = _this.alice;
  // console.log('---sablier.initConfig.bp3');

  if (!_this.ethUtils) {
    console.log('...sablier.deployEthUtils...');
    await deployEthUtils();
  }

  // if (testConfig.localtest) {
  //	/// set global web3 object for ganache time traveler testing
  //	web3 = token.web3Connection.web3;
  // }
  // console.log('...initConfig.end');
};

const runBefore = async () => {
  const token = new ERC20Mock(testConfig);

  if (testConfig.localtest) {
    /// set global web3 object for ganache time traveler testing
    web3 = token.web3Connection.web3;
    console.log('---sablier.before.web3: ', (web3 != null));
    ///

    /// take blockchain snapshot
    const snapshot = await traveler.takeSnapshot();
    snapshotId = snapshot.result;
    console.log('+++sablier.before.');
    console.log('--- take blockchain snapshot ---');
    ///
  } else {
    console.log('--- we only take blockchain snapshot for localtest ---');
  }
};

const runBeforeEach = async () => {
  console.log('---sablier.beforeEach.hook---');

  await initConfig();
  userAddress = _this.userAddress;

  _this.token = new ERC20Mock(testConfig);
  expect(_this.token).to.not.equal(null);
  // console.log('---sablier.before hook.bp0');
  let res = await _this.token.deploy();
  // console.log('---sablier.before hook.bp1');
  await _this.token.__assert();
  // console.log('---sablier.before hook.bp2');

  _this.token.switchWallet(_this.alice);
  await _this.token.mint({ to: userAddress, amount: STANDARD_SALARY.multipliedBy(3).toString(10) });

  sablier = new Sablier(testConfig);

  res = await sablier.deploy();
  await sablier.__assert();
  contractAddress = sablier.getAddress();
  deployed_contractAddress = sablier.getAddress();
  // console.log("Deployed Sablier address: " + deployed_contractAddress);
  expect(res).to.not.equal(false);

  _this.sablier = sablier;

  const cTokenDecimals = 8;
  const testConfig2 = { ...testConfig, tokenAddress: _this.token.getAddress() };
  _this.cToken = new CERC20Mock(testConfig2);
  // console.log('---cToken.bp0.devConstants.INITIAL_EXCHANGE_RATE: ', devConstants.INITIAL_EXCHANGE_RATE.toString(10));
  expect(_this.cToken).to.not.equal(null);
  res = await _this.cToken.deploy({
    // underlying: _this.token.getAddress(),
    initialExchangeRate: devConstants.INITIAL_EXCHANGE_RATE.toString(10),
    decimals: cTokenDecimals,
  });
  // console.log('---cToken.decimals: ', _this.cToken.getDecimals());
  // BigNumber(cTokenDecimals).should.be.bignumber.equal(_this.cToken.getDecimals());
  // console.log('---cToken.bp1');
  await _this.cToken.__assert();
  // console.log('---cToken.bp2');
  await _this.token.approve({ address: _this.cToken.getAddress(), amount: STANDARD_SALARY.toString(10) });
  // console.log('---cToken.bp3.devConstants.STANDARD_SALARY: ', devConstants.STANDARD_SALARY.toString(10));
  await _this.cToken.mint({ mintAmount: STANDARD_SALARY.toString(10) }); // devConstants.STANDARD_SALARY.toString(10));
  // console.log('---cToken.bp4');

  // this.nonStandardERC20Token = await NonStandardERC20.new(opts);
  // this.nonStandardERC20Token.nonStandardMint(alice, STANDARD_SALARY.toString(10), opts);

  // this.cTokenManager = await CTokenManager.new(opts);
  // this.sablier = await Sablier.new(this.cTokenManager.address, opts);
};

const runAfter = async () => {
  _this = {};

  if (testConfig.localtest) {
    await traveler.revertToSnapshot(snapshotId);
    console.log('+++sablier.after.');
    console.log('--- revert blockchain to initial snapshot ---');
  } else {
    console.log('--- we only revert blockchain to initial snapshot for localtest ---');
  }
};

module.exports = {
  initConfig,
  runBefore,
  runBeforeEach,
  runAfter,
};
