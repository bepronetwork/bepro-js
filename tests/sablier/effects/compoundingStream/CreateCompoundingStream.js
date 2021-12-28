import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';
import truffleAssert from 'truffle-assertions';
import { dappConstants } from '../../../../src/sablier/dev-utils';
import beproAssert from '../../../../build/utils/beproAssert';
import sablierUtils from '../../sablier.utils';

const {
  ONE_PERCENT_MANTISSA,
  STANDARD_RATE_PER_SECOND_CTOKEN,
  STANDARD_RECIPIENT_SHARE_PERCENTAGE,
  STANDARD_SALARY_CTOKEN,
  STANDARD_SENDER_SHARE_PERCENTAGE,
  STANDARD_TIME_DELTA,
  STANDARD_TIME_OFFSET,
} = dappConstants;

/**
 * We do not tests all the logical branches as in `CreateStream.js`, because these are unit tests.
 * The `createCompoundingStream` method uses `createStream`, so if that fails with non-compliant erc20
 * or insufficient allowances, this must fail too.
 */
context('sablier.CreateCompoundingStream.context', async () => {
// function shouldBehaveLikeCreateCompoundingStream(_this) { //alice, bob) {
  // let alice;// = _this.alice;
  // let bob;// = _this.bob;
  let sender;// = alice;
  let recipient;// = bob;
  const deposit = STANDARD_SALARY_CTOKEN.toString(10);
  // const opts = { from: sender };
  let now;// = new BigNumber(dayjs().unix());
  let startTime;// = now.plus(STANDARD_TIME_OFFSET);
  let stopTime;// = startTime.plus(STANDARD_TIME_DELTA);

  before('sablier.CreateCompoundingStream.before', async () => {
    await sablierUtils.initConfig();
    // alice = _this.alice;
    // bob = _this.bob;
    sender = _this.alice;
    recipient = _this.bob;
    now = new BigNumber(dayjs().unix());
    startTime = now.plus(STANDARD_TIME_OFFSET);
    stopTime = startTime.plus(STANDARD_TIME_DELTA);
    _this.now = now;
  });

  describe('when not paused', () => {
    describe('when the cToken is whitelisted', () => {
      beforeEach(async () => {
        // await _this.cTokenManager.whitelistCToken(_this.cToken.getAddress(), opts);
        await _this.cToken.approve({ address: _this.sablier.getAddress(), amount: deposit });
      });

      describe('when interest shares are valid', () => {
        const senderSharePercentage = STANDARD_SENDER_SHARE_PERCENTAGE;
        const recipientSharePercentage = STANDARD_RECIPIENT_SHARE_PERCENTAGE;

        it('creates the compounding stream', async () => {
          await _this.sablier.isPaused();
          // console.log('---sablier.CreateCompoundingStream.isPaused: ', paused);

          const result = await _this.sablier.createCompoundingStream({
            recipient,
            deposit,
            tokenAddress: _this.cToken.getAddress(),
            startTime,
            stopTime,
            senderSharePercentage,
            recipientSharePercentage,
          });
          const exchangeRateInitial = new BigNumber(await _this.cToken.exchangeRateCurrent());

          const streamId = Number(result.events.CreateStream.returnValues.streamId);
          // console.log('---CreateCompoundingStream.streamId: ', streamId);
          const compoundingStreamObject = await _this.sablier.getCompoundingStream({ streamId });
          compoundingStreamObject.sender.should.be.equal(sender);
          compoundingStreamObject.recipient.should.be.equal(recipient);
          compoundingStreamObject.deposit.should.be.bignumber.equal(deposit);
          compoundingStreamObject.tokenAddress.should.be.equal(_this.cToken.getAddress());
          compoundingStreamObject.startTime.should.be.bignumber.equal(startTime);
          compoundingStreamObject.stopTime.should.be.bignumber.equal(stopTime);
          compoundingStreamObject.remainingBalance.should.be.bignumber.equal(deposit);
          compoundingStreamObject.ratePerSecond.should.be.bignumber.equal(STANDARD_RATE_PER_SECOND_CTOKEN);
          compoundingStreamObject.exchangeRateInitial.should.be.bignumber.equal(exchangeRateInitial);
          compoundingStreamObject.senderSharePercentage.should.be.bignumber.equal(
            senderSharePercentage.multipliedBy(ONE_PERCENT_MANTISSA),
          );
          compoundingStreamObject.recipientSharePercentage.should.be.bignumber.equal(
            recipientSharePercentage.multipliedBy(ONE_PERCENT_MANTISSA),
          );
        });

        it('transfers the tokens to the contract', async () => {
          const balance = await _this.cToken.balanceOf(sender);
          await _this.sablier.createCompoundingStream({
            recipient,
            deposit,
            tokenAddress: _this.cToken.getAddress(),
            startTime,
            stopTime,
            senderSharePercentage,
            recipientSharePercentage,
          });
          const newBalance = await _this.cToken.balanceOf(sender);
          newBalance.should.be.bignumber.equal(new BigNumber(balance).minus(STANDARD_SALARY_CTOKEN));
        });

        it('emits a createcompoundingstream event', async () => {
          const result = await _this.sablier.createCompoundingStream({
            recipient,
            deposit,
            tokenAddress: _this.cToken.getAddress(),
            startTime,
            stopTime,
            senderSharePercentage,
            recipientSharePercentage,
          });
          beproAssert.eventEmitted(result, 'CreateCompoundingStream');
        });
      });

      describe('when interest shares are not valid', () => {
        const senderSharePercentage = new BigNumber(40);
        const recipientSharePercentage = new BigNumber(140);

        it('reverts', async () => {
          await truffleAssert.reverts(
            _this.sablier.createCompoundingStream({
              recipient,
              deposit,
              tokenAddress: _this.cToken.getAddress(),
              startTime,
              stopTime,
              senderSharePercentage,
              recipientSharePercentage,
            }),
            'shares do not sum up to 100',
          );
        });
      });
    });

    /* describe("when the cToken is not whitelisted", () => {
      const senderSharePercentage = STANDARD_SENDER_SHARE_PERCENTAGE;
      const recipientSharePercentage = STANDARD_RECIPIENT_SHARE_PERCENTAGE;

      it("reverts", async () => {
        await truffleAssert.reverts(
          _this.sablier.createCompoundingStream({
            recipient,
            deposit,
            tokenAddress: _this.cToken.getAddress(),
            startTime,
            stopTime,
            senderSharePercentage,
            recipientSharePercentage,
          }),
          "cToken is not whitelisted",
        );
      });
    }); */
  });

  describe('when paused', () => {
    const senderSharePercentage = STANDARD_SENDER_SHARE_PERCENTAGE;
    const recipientSharePercentage = STANDARD_RECIPIENT_SHARE_PERCENTAGE;

    beforeEach(async () => {
      // Note that `sender` coincides with the owner of the contract
      await _this.sablier.pause();
    });

    it('reverts', async () => {
      await truffleAssert.reverts(
        _this.sablier.createCompoundingStream({
          recipient,
          deposit,
          tokenAddress: _this.cToken.getAddress(),
          startTime,
          stopTime,
          senderSharePercentage,
          recipientSharePercentage,
        }),
        'Pausable: paused',
      );
    });
  });
});
