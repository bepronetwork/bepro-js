// const project_root = process.cwd();
// const { dappConstants, devConstants } = require("../../src/sablier/dev-utils");

// const truffleAssert = require("truffle-assertions");
const traveler = require('ganache-time-traveler');
const BigNumber = require('bignumber.js');

const chai = require('chai');
const chaiBigNumber = require('chai-bignumber');
const { chaiPlugin } = require('../../src/sablier/dev-utils');

chai.should();
chai.use(chaiBigNumber(BigNumber));
chai.use(chaiPlugin);

// const { INITIAL_EXCHANGE_RATE, STANDARD_SALARY } = dappConstants;
// const { STANDARD_SABLIER_FEE } = dappConstants;

const sablierUtils = require('./sablier.utils');

context('Sablier contract', async () => {
  before('Sablier.before.hook', async () => {
    console.log('---sablier.before.hook. start');
    await sablierUtils.runBefore();
    console.log('---sablier.before.hook. end');
  });

  before('Sablier.initConfig.hook', async () => {
    // load wallets and required global variables
    console.log('---sablier.initConfig.hook. start');
    await sablierUtils.initConfig();
    console.log('---sablier.initConfig.hook. end');
  });

  beforeEach('Sablier.beforeEach.hook', async () => {
    // console.log('---sablier.beforeEach.hook. start');
    await sablierUtils.runBeforeEach();
    // console.log('---sablier.beforeEach.hook. end');
  });

  require('./sablier.init');
  require('./sablier.behavior');

  after('Sablier.after.hook', async () => {
    await sablierUtils.runAfter();
  });
});
