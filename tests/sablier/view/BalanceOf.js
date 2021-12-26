import { expect, assert } from 'chai';
import Numbers from '../../../build/utils/Numbers';

const BigNumber = require('bignumber.js');
const dayjs = require('dayjs');
const truffleAssert = require('truffle-assertions');
const { dappConstants, devConstants, mochaContexts } = require('../../../src/sablier/dev-utils');

const {
  FIVE_UNITS, STANDARD_SALARY, STANDARD_SCALE, STANDARD_TIME_OFFSET, STANDARD_TIME_DELTA,
} = dappConstants;
const { contextForStreamDidEnd, contextForStreamDidStartButNotEnd } = mochaContexts;

const sablierUtils = require('../sablier.utils');

context('sablier.BalanceOf.context', async () => {
  let sender;// = _this.alice;
  // const opts = { from: sender };
  let alice;// = _this.alice;
  let bob;// = _this.bob;
  let carol;// = _this.carol;
  let recipient;// = bob;
  let now;// = new BigNumber(dayjs().unix());
  let startTime;// = now.plus(STANDARD_TIME_OFFSET);
  let stopTime;// = startTime.plus(STANDARD_TIME_DELTA);

  before('sablier.BalanceOf.before', async () => {
    await sablierUtils.initConfig();
    sender = _this.alice;
    alice = _this.alice;
    bob = _this.bob;
    carol = _this.carol;
    recipient = _this.bob;
    now = new BigNumber(dayjs().unix());
    startTime = now.plus(STANDARD_TIME_OFFSET);
    stopTime = startTime.plus(STANDARD_TIME_DELTA);
	  _this.now = now;
  });

  describe('when the stream exists', () => {
    let streamId;
	  const deposit = STANDARD_SALARY.toString(10);
    /// const startTime = now.plus(STANDARD_TIME_OFFSET);
    /// const stopTime = startTime.plus(STANDARD_TIME_DELTA);

    beforeEach(async () => {
	    await _this.token.approve({ address: _this.sablier.getAddress(), amount: deposit });
	    const result = await _this.sablier.createStream({
        recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime,
      });
      // streamId = Number(result.logs[0].args.streamId);
	    streamId = Number(result.events.CreateStream.returnValues.streamId);
	    // console.log('---BalanceOf.streamId: ', streamId);
    });

    describe('when the stream did not start', () => {
      it('returns the whole deposit for the sender of the stream', async () => {
        const balance = await _this.sablier.balanceOf({ streamId, who: sender });
        // console.log('---sablier.balanceOf.balance: ', balance);
		    balance.should.be.bignumber.equal(deposit);
      });

      it('returns 0 for the recipient of the stream', async () => {
        const balance = await _this.sablier.balanceOf({ streamId, who: recipient });
        balance.should.be.bignumber.equal(0);
      });

      it('returns 0 for anyone else', async () => {
        const balance = await _this.sablier.balanceOf({ streamId, who: carol });
        balance.should.be.bignumber.equal(0);
      });
    });

    contextForStreamDidStartButNotEnd(() => {
      const streamedAmount = FIVE_UNITS.toString(10);

      it('returns the pro rata balance for the sender of the stream', async () => {
        const balance = await _this.sablier.balanceOf({ streamId, who: sender });
		    // console.log('---sablier.balanceOf.balance: ', balance);
        balance.should.be.bignumber.equal(STANDARD_SALARY.minus(streamedAmount));
		    const tolerateByAddition = false;
        balance.should.tolerateTheBlockTimeVariation(
          STANDARD_SALARY.minus(streamedAmount),
          STANDARD_SCALE,
          tolerateByAddition,
        );
      });

      it('returns the pro rata balance for the recipient of the stream', async () => {
        const balance = await _this.sablier.balanceOf({ streamId, who: recipient });
        balance.should.tolerateTheBlockTimeVariation(streamedAmount, STANDARD_SCALE);
      });

      it('returns 0 for anyone else', async () => {
	      const balance = await _this.sablier.balanceOf({ streamId, who: carol });
        balance.should.be.bignumber.equal(0);
      });
    });

    contextForStreamDidEnd(() => {
      it('returns 0 for the sender of the stream', async () => {
        const balance = await _this.sablier.balanceOf({ streamId, who: sender });
        balance.should.be.bignumber.equal(0);
      });

      it('returns the whole deposit for the recipient of the stream', async () => {
        const balance = await _this.sablier.balanceOf({ streamId, who: recipient });
        balance.should.be.bignumber.equal(STANDARD_SALARY);
      });

      it('returns 0 for anyone else', async () => {
        const balance = await _this.sablier.balanceOf({ streamId, who: carol });
        balance.should.be.bignumber.equal(0);
      });
    });
  });

  describe('when the stream does not exist', () => {
    it('reverts', async () => {
      const streamId = new BigNumber(419863);
      await truffleAssert.reverts(_this.sablier.balanceOf({ streamId, who: sender }), 'stream does not exist');
    });
  });
});
