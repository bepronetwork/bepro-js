import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { dappConstants, mochaContexts } from '../../../../src/sablier/dev-utils';
import beproAssert from '../../../../build/utils/beproAssert';
import sablierUtils from '../../sablier.utils';

const {
  FIVE_UNITS, STANDARD_SALARY, STANDARD_SCALE, STANDARD_TIME_OFFSET, STANDARD_TIME_DELTA,
} = dappConstants;
const { contextForStreamDidEnd, contextForStreamDidStartButNotEnd } = mochaContexts;

let streamId;
let recipient;
let deposit;
let sender;

function runTests(from) {
  describe('when the stream did not start', () => {
    it('cancels the stream', async () => {
      await _this.sablier.cancelStream({ streamId }, { from });
      await beproAssert.reverts(
        () => _this.sablier.getStream({ streamId }),
        'stream does not exist',
      );
    });

    it('transfers all tokens to the sender of the stream', async () => {
      const balance = await _this.token.balanceOf(sender);
      await _this.sablier.cancelStream({ streamId }, { from });
      const newBalance = await _this.token.balanceOf(sender);
      newBalance.should.be.bignumber.equal(BigNumber(balance).plus(deposit));
    });

    it('emits a cancel event', async () => {
      const result = await _this.sablier.cancelStream({ streamId }, { from });
      beproAssert.eventEmitted(result, 'CancelStream');
    });
  });

  contextForStreamDidStartButNotEnd(() => {
    const streamedAmount = FIVE_UNITS.toString(10);

    it('cancels the stream', async () => {
      await _this.sablier.cancelStream({ streamId }, { from });
      await beproAssert.reverts(
        () => _this.sablier.getStream({ streamId }),
        'stream does not exist',
      );
    });

    it('transfers the tokens to the sender of the stream', async () => {
      const balance = await _this.token.balanceOf(sender);
      await _this.sablier.cancelStream({ streamId }, { from });
      const newBalance = await _this.token.balanceOf(sender);
      const tolerateByAddition = false;
      newBalance.should.tolerateTheBlockTimeVariation(
        new BigNumber(balance).minus(streamedAmount).plus(deposit),
        STANDARD_SCALE,
        tolerateByAddition,
      );
    });

    it('transfers the tokens to the recipient of the stream', async () => {
      const balance = await _this.token.balanceOf(recipient);
      await _this.sablier.cancelStream({ streamId }, { from });
      const newBalance = await _this.token.balanceOf(recipient);
      newBalance.should.tolerateTheBlockTimeVariation(new BigNumber(balance).plus(streamedAmount), STANDARD_SCALE);
    });

    it('emits a cancel event', async () => {
      const result = await _this.sablier.cancelStream({ streamId }, { from });
      beproAssert.eventEmitted(result, 'CancelStream');
    });
  });

  contextForStreamDidEnd(() => {
    const streamedAmount = STANDARD_SALARY.toString(10);

    it('cancels the stream', async () => {
      await _this.sablier.cancelStream({ streamId }, { from });
      await beproAssert.reverts(
        () => _this.sablier.getStream({ streamId }),
        'stream does not exist',
      );
    });

    it('transfers nothing to the sender of the stream', async () => {
      const balance = await _this.token.balanceOf(sender);
      await _this.sablier.cancelStream({ streamId }, { from });
      const newBalance = await _this.token.balanceOf(recipient);
      newBalance.should.be.bignumber.equal(balance);
    });

    it('transfers all tokens to the recipient of the stream', async () => {
      const balance = await _this.token.balanceOf(recipient);
      await _this.sablier.cancelStream({ streamId }, { from });
      const newBalance = await _this.token.balanceOf(recipient);
      newBalance.should.be.bignumber.equal(new BigNumber(balance).plus(streamedAmount));
    });

    it('emits a cancel event', async () => {
      const result = await _this.sablier.cancelStream({ streamId }, { from });
      beproAssert.eventEmitted(result, 'CancelStream');
    });
  });
}

context('sablier.CancelStream.context', async () => {
  // let alice;// = _this.alice;
  // let bob;// = _this.bob;
  // let eve;// = _this.eve;
  let now;// = new BigNumber(dayjs().unix());
  let startTime;// = now.plus(STANDARD_TIME_OFFSET);
  let stopTime;// = startTime.plus(STANDARD_TIME_DELTA);

  before('sablier.CancelStream.before', async () => {
    await sablierUtils.initConfig();
    // alice = _this.alice;
    // bob = _this.bob;
    // eve = _this.eve;
    sender = _this.alice;
    recipient = _this.bob;
    now = new BigNumber(dayjs().unix());
    startTime = now.plus(STANDARD_TIME_OFFSET);
    stopTime = startTime.plus(STANDARD_TIME_DELTA);
    _this.now = now;
  });

  describe('when the stream exists', () => {
    // const startTime = now.plus(STANDARD_TIME_OFFSET);
    // const stopTime = startTime.plus(STANDARD_TIME_DELTA);

    beforeEach(async () => {
      /// sender = _this.alice;
      /// recipient = _this.bob;
      deposit = STANDARD_SALARY.toString(10);
      // const opts = { from: this.sender };
      await _this.token.approve({ address: _this.sablier.getAddress(), amount: deposit });
      const result = await _this.sablier.createStream({
        recipient,
        deposit,
        tokenAddress: _this.token.getAddress(),
        startTime,
        stopTime,
      });
      streamId = Number(result.events.CreateStream.returnValues.streamId);
      // console.log('---CancelStream.streamId: ', streamId);
    });

    describe('when the caller is the sender of the stream', () => {
      runTests(sender);
    });

    describe('when the caller is the recipient of the stream', () => {
      runTests(recipient);
    });

    describe('when the caller is not the sender or the recipient of the stream', () => {
      // const opts = { from: eve };

      it('reverts', async () => {
        await beproAssert.reverts(
          () => _this.sablier.cancelStream(
            { streamId },
            { from: _this.eve },
          ),
          'caller is not the sender or the recipient of the stream',
        );
      });
    });
  });

  describe('when the stream does not exist', () => {
    // const recipient = bob;
    // const opts = { from: recipient };

    it('reverts', async () => {
      await beproAssert.reverts(
        () => _this.sablier.cancelStream(
          { streamId: new BigNumber(419863) },
          { from: _this.bob },
        ),
        'stream does not exist',
      );
    });
  });
});
