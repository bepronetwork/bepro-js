import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { dappConstants, mochaContexts } from '../../../src/sablier/dev-utils';
import sablierUtils from '../sablier.utils';
import beproAssert from '../../../build/utils/beproAssert';

const { STANDARD_SALARY, STANDARD_TIME_OFFSET, STANDARD_TIME_DELTA } = dappConstants;
const { contextForStreamDidEnd, contextForStreamDidStartButNotEnd } = mochaContexts;

context('sablier.DeltaOf.context', () => {
  // let sender;// = _this.alice;
  let recipient;// = _this.bob;
  // const opts = { from: sender };
  let now;// = new BigNumber(dayjs().unix());
  let startTime;// = now.plus(STANDARD_TIME_OFFSET);
  let stopTime;// = startTime.plus(STANDARD_TIME_DELTA);

  before('sablier.DeltaOf.before', async () => {
    await sablierUtils.initConfig();
    // sender = _this.alice;
    recipient = _this.bob;
    now = new BigNumber(dayjs().unix());
    startTime = now.plus(STANDARD_TIME_OFFSET);
    stopTime = startTime.plus(STANDARD_TIME_DELTA);
    _this.now = now;
  });

  describe('when the stream exists', () => {
    let streamId;
    const deposit = STANDARD_SALARY.toString(10);
    // const startTime = now.plus(STANDARD_TIME_OFFSET);
    // const stopTime = startTime.plus(STANDARD_TIME_DELTA);

    beforeEach(async () => {
      await _this.token.approve({ address: _this.sablier.getAddress(), amount: deposit });
      const result = await _this.sablier.createStream({
        recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime,
      });
      // console.log('---DeltaOf.streamId.bp0: ', result); //.events[0].returnValues);
      // streamId = Number(result.logs[0].args.streamId);
      streamId = Number(result.events.CreateStream.returnValues.streamId);
      // console.log('---DeltaOf.streamId: ', streamId);
    });

    describe('when the stream did not start', () => {
      it('returns 0', async () => {
        const delta = await _this.sablier.deltaOf({ streamId });
        delta.should.be.bignumber.equal(0);
      });
    });

    contextForStreamDidStartButNotEnd(() => {
      it('returns the time the number of seconds that passed since the start time', async () => {
        const delta = await _this.sablier.deltaOf({ streamId });
        delta.should.bignumber.satisfy(
          // num => num.isEqualTo(new BigNumber(5)) || num.isEqualTo(new BigNumber(5).plus(1)),
          num => BigNumber(num).isEqualTo(BigNumber(5)) || BigNumber(num).isEqualTo(BigNumber(5).plus(1)),
        );
      });
    });

    contextForStreamDidEnd(() => {
      it('returns the difference between the stop time and the start time', async () => {
        const delta = await _this.sablier.deltaOf({ streamId });
        delta.should.be.bignumber.equal(stopTime.minus(startTime));
      });
    });
  });

  describe('when the stream does not exist', () => {
    it('reverts', async () => {
      const streamId = new BigNumber(419863);
      await beproAssert.reverts(
        () => _this.sablier.deltaOf({ streamId }),
        'stream does not exist',
      );
    });
  });
});
