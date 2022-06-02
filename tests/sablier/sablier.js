/* eslint-disable global-require */

import BigNumber from 'bignumber.js';
import chai from 'chai';
import chaiBigNumber from 'chai-bignumber';
import { chaiPlugin } from '../../src/sablier/dev-utils';
import sablierUtils from './sablier.utils';

chai.should();
chai.use(chaiBigNumber(BigNumber));
chai.use(chaiPlugin);

context('Sablier contract', async () => {
  before('Sablier.before.hook', async () => {
    // console.log('---sablier.before.hook. start');
    await sablierUtils.runBefore();
    // console.log('---sablier.before.hook. end');
  });

  before('Sablier.initConfig.hook', async () => {
    // load wallets and required global variables
    // console.log('---sablier.initConfig.hook. start');
    await sablierUtils.initConfig();
    // console.log('---sablier.initConfig.hook. end');
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
