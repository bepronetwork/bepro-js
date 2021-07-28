/* eslint-disable func-names */
/* global afterEach, beforeEach, describe */
const BigNumber = require('bignumber.js');
const dayjs = require('dayjs');
const traveler = require('ganache-time-traveler');

const devConstants = require('./constants');

const { STANDARD_TIME_OFFSET, STANDARD_TIME_DELTA } = devConstants;

function contextForStreamDidStartButNotEnd(functions) {
// const contextForStreamDidStartButNotEnd = (functions) => {
  const now = new BigNumber(dayjs().unix());

  describe('when the stream did start but not end', () => {
    // console.log('---mochaContexts.bp2');
    beforeEach('contextForStreamDidStartButNotEnd.beforeEach', async () => {
      // console.log('---mochaContexts.bp3');      // console.log('---mochaContexts.now', now.toString());
      await traveler.advanceBlockAndSetTime(
        now
          .plus(STANDARD_TIME_OFFSET)
          .plus(5)
          .toNumber(),
      ); // console.log('---mochaContexts.bp4');
    });

    functions();
    // console.log('---mochaContexts.bp5');

    afterEach('contextForStreamDidStartButNotEnd.afterEach', async () => { // console.log('---mochaContexts.bp6');
      await traveler.advanceBlockAndSetTime(now.toNumber()); // console.log('---mochaContexts.bp7');
    });
    // console.log('---mochaContexts.bp8');
  });
}

function contextForStreamDidEnd(functions) {
  const now = new BigNumber(dayjs().unix());

  describe('when the stream did end', () => {
    beforeEach(async () => {
      await traveler.advanceBlockAndSetTime(
        now
          .plus(STANDARD_TIME_OFFSET)
          .plus(STANDARD_TIME_DELTA)
          .plus(5)
          .toNumber(),
      );
    });

    functions();

    afterEach(async () => {
      await traveler.advanceBlockAndSetTime(now.toNumber());
    });
  });
}

module.exports = {
  contextForStreamDidStartButNotEnd,
  contextForStreamDidEnd,
};
