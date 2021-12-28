import BigNumber from 'bignumber.js';
// import dayjs from 'dayjs';
import traveler from 'ganache-time-traveler';

import devConstants from './constants';

const { STANDARD_TIME_OFFSET, STANDARD_TIME_DELTA } = devConstants;

export const contextForStreamDidStartButNotEnd = functions => {
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
};

export const contextForStreamDidEnd = functions => {
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
};
