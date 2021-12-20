/* eslint-disable func-names */
/* global afterEach, beforeEach, describe */
const BigNumber = require('bignumber.js');
const dayjs = require('dayjs');
const traveler = require('ganache-time-traveler');

const devConstants = require('./constants');

const { STANDARD_TIME_OFFSET, STANDARD_TIME_DELTA } = devConstants;

// import Numbers from '../../utils/Numbers';

function contextForStreamDidStartButNotEnd(functions) {
  let now;// = new BigNumber(dayjs().unix());

  describe('when the stream did start but not end', () => {
    beforeEach('contextForStreamDidStartButNotEnd.beforeEach', async () => {
      now = BigNumber(_this.now);
      await traveler.advanceBlockAndSetTime(
        now
          .plus(STANDARD_TIME_OFFSET)
          .plus(5)
          .toNumber(),
      );
    });

    functions();

    afterEach('contextForStreamDidStartButNotEnd.afterEach', async () => {
      await traveler.advanceBlockAndSetTime(now.toNumber());
    });
  });
}

function contextForStreamDidEnd(functions) {
  let now;// = new BigNumber(dayjs().unix());

  describe('when the stream did end', () => {
    beforeEach('contextForStreamDidEnd.beforeEach', async () => {
      now = BigNumber(_this.now);
      await traveler.advanceBlockAndSetTime(
        now
          .plus(STANDARD_TIME_OFFSET)
          .plus(STANDARD_TIME_DELTA)
          .plus(5)
          .toNumber(),
      );
    });

    functions();

    afterEach('contextForStreamDidEnd.afterEach', async () => {
      await traveler.advanceBlockAndSetTime(now.toNumber());
    });
  });
}

module.exports = {
  contextForStreamDidStartButNotEnd,
  contextForStreamDidEnd,
};
