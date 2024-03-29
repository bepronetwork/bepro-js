import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { dappConstants, mochaContexts } from '../../../../src/sablier/dev-utils';
import beproAssert from '../../../../build/utils/beproAssert';
import sablierUtils from '../../sablier.utils';

const { contextForStreamDidEnd, contextForStreamDidStartButNotEnd } = mochaContexts;
const {
  FIVE_UNITS, STANDARD_SALARY, STANDARD_SCALE, STANDARD_TIME_OFFSET, STANDARD_TIME_DELTA,
} = dappConstants;

let streamId;
let recipient;
let deposit;
let sender;

function runTests(from) {
  describe('when not paused', () => {
    describe('when the withdrawal amount is higher than 0', () => {
      describe('when the stream did not start', () => {
        const withdrawalAmount = FIVE_UNITS.toString(10);

        it('reverts', async () => {
          await beproAssert.reverts(
            () => _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount }, { from }),
            'amount exceeds the available balance',
          );
        });
      });

      contextForStreamDidStartButNotEnd(() => {
        describe('when the withdrawal amount does not exceed the available balance', () => {
          const withdrawalAmount = FIVE_UNITS.toString(10);

          it('withdraws from the stream', async () => {
            const balance = await _this.token.balanceOf(recipient);
            await _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount }, { from });
            const newBalance = await _this.token.balanceOf(recipient);
            newBalance.should.be.bignumber.equal(new BigNumber(balance).plus(FIVE_UNITS));
          });

          it('emits a withdrawfromstream event', async () => {
            const result = await _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount }, { from });
            beproAssert.eventEmitted(result, 'WithdrawFromStream');
          });

          it('decreases the stream balance', async () => {
            const balance = await _this.sablier.balanceOf({ streamId, who: recipient });
            await _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount }, { from });
            const newBalance = await _this.sablier.balanceOf({ streamId, who: recipient });
            // Intuitively, one may say we don't have to tolerate the block time variation here.
            // However, the Sablier balance for the recipient can only go up from the bottom
            // low of `balance` - `amount`, due to uncontrollable runtime costs.
            newBalance.should.tolerateTheBlockTimeVariation(
              new BigNumber(balance).minus(withdrawalAmount),
              STANDARD_SCALE,
            );
          });
        });

        describe('when the withdrawal amount exceeds the available balance', () => {
          const withdrawalAmount = FIVE_UNITS.multipliedBy(2).toString(10);

          it('reverts', async () => {
            await beproAssert.reverts(
              () => _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount }, { from }),
              'amount exceeds the available balance',
            );
          });
        });
      });

      contextForStreamDidEnd(() => {
        describe('when the withdrawal amount does not exceed the available balance', () => {
          describe('when the balance is not withdrawn in full', () => {
            const withdrawalAmount = STANDARD_SALARY.dividedBy(2).toString(10);

            it('withdraws from the stream', async () => {
              const balance = await _this.token.balanceOf(recipient);
              await _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount }, { from });
              const newBalance = await _this.token.balanceOf(recipient);
              newBalance.should.be.bignumber.equal(new BigNumber(balance).plus(withdrawalAmount));
            });

            it('emits a withdrawfromstream event', async () => {
              const result = await _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount }, { from });
              beproAssert.eventEmitted(result, 'WithdrawFromStream');
            });

            it('decreases the stream balance', async () => {
              const balance = await _this.sablier.balanceOf({ streamId, who: recipient });
              await _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount }, { from });
              const newBalance = await _this.sablier.balanceOf({ streamId, who: recipient });
              newBalance.should.be.bignumber.equal(new BigNumber(balance).minus(withdrawalAmount));
            });
          });

          describe('when the balance is withdrawn in full', () => {
            const withdrawalAmount = STANDARD_SALARY.toString(10);

            it('withdraws from the stream', async () => {
              const balance = await _this.token.balanceOf(recipient);
              await _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount }, { from });
              const newBalance = await _this.token.balanceOf(recipient);
              newBalance.should.be.bignumber.equal(new BigNumber(balance).plus(withdrawalAmount));
            });

            it('emits a withdrawfromstream event', async () => {
              const result = await _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount }, { from });
              beproAssert.eventEmitted(result, 'WithdrawFromStream');
            });

            it('deletes the stream object', async () => {
              await _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount }, { from });
              await beproAssert.reverts(
                () => _this.sablier.getStream({ streamId }),
                'stream does not exist',
              );
            });
          });
        });

        describe('when the withdrawal amount exceeds the available balance', () => {
          const withdrawalAmount = STANDARD_SALARY.plus(FIVE_UNITS).toString(10);

          it('reverts', async () => {
            await beproAssert.reverts(
              () => _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount }, { from }),
              'amount exceeds the available balance',
            );
          });
        });
      });
    });

    describe('when the withdrawal amount is zero', () => {
      const withdrawalAmount = new BigNumber(0).toString(10);

      it('reverts', async () => {
        await beproAssert.reverts(
          () => _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount }, { from }),
          'amount is zero',
        );
      });
    });
  });

  describe('when paused', () => {
    const withdrawalAmount = FIVE_UNITS.toString(10);

    beforeEach(async () => {
      // Note that `sender` coincides with the owner of the contract
      await _this.sablier.pause({ from: sender });
    });

    it('reverts', async () => {
      await beproAssert.reverts(
        () => _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount }, { from }),
        'Pausable: paused',
      );
    });
  });
}

context('sablier.WithdrawFromStream.context', () => {
  let alice;// = _this.alice;
  let bob;// = _this.bob;
  // let eve;// = _this.eve;
  let now;// = new BigNumber(dayjs().unix());
  let startTime;// = now.plus(STANDARD_TIME_OFFSET);
  let stopTime;// = startTime.plus(STANDARD_TIME_DELTA);

  before('sablier.WithdrawFromStream.before', async () => {
    await sablierUtils.initConfig();
    alice = _this.alice;
    bob = _this.bob;
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

    beforeEach('sablier.WithdrawFromStream.beforeEach', async () => {
      sender = alice;
      recipient = bob;
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
      // console.log('---WithdrawFromStream.streamId: ', streamId);
    });

    describe('when the caller is the sender of the stream', () => {
      runTests(sender);
    });

    describe('when the caller is the recipient of the stream', () => {
      runTests(recipient);
    });

    describe('when the caller is not the sender or the recipient of the stream', () => {
      it('reverts', async () => {
        await beproAssert.reverts(
          () => _this.sablier.withdrawFromStream(
            { streamId, amount: FIVE_UNITS },
            { from: _this.eve },
          ),
          'caller is not the sender or the recipient of the stream',
        );
      });
    });
  });

  describe('when the stream does not exist', () => {
    it('reverts', async () => {
      await beproAssert.reverts(
        () => _this.sablier.withdrawFromStream(
          {
            amount: FIVE_UNITS,
            streamId: new BigNumber(419863),
          },
          { from: _this.bob },
        ),
        'stream does not exist',
      );
    });
  });
});
