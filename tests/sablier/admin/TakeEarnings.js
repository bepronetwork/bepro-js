import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { dappConstants, mochaContexts } from '../../../src/sablier/dev-utils';
import beproAssert from '../../../build/utils/beproAssert';
import sablierUtils from '../sablier.utils';

const {
  FIVE_UNITS_CTOKEN,
  STANDARD_RECIPIENT_SHARE_PERCENTAGE,
  STANDARD_SALARY_CTOKEN,
  STANDARD_SABLIER_FEE,
  STANDARD_SENDER_SHARE_PERCENTAGE,
  STANDARD_SUPPLY_AMOUNT,
  STANDARD_TIME_DELTA,
  STANDARD_TIME_OFFSET,
} = dappConstants;
const { contextForStreamDidStartButNotEnd } = mochaContexts;

context('sablier.TakeEarnings.context', async () => {
  let alice;// = _this.alice;
  // let bob;// = _this.bob;
  // let eve;// = _this.eve;
  let admin;// = alice;
  let recipient;// = _this.bob;
  let now;// = new BigNumber(dayjs().unix());
  let startTime;// = now.plus(STANDARD_TIME_OFFSET);
  let stopTime;// = startTime.plus(STANDARD_TIME_DELTA);

  before('sablier.TakeEarnings.before', async () => {
    await sablierUtils.initConfig();
    alice = _this.alice;
    // bob = _this.bob;
    // eve = _this.eve;
    admin = alice;
    recipient = _this.bob;
    now = new BigNumber(dayjs().unix());
    startTime = now.plus(STANDARD_TIME_OFFSET);
    stopTime = startTime.plus(STANDARD_TIME_DELTA);
    _this.now = now;
  });

  describe('when the caller is the admin', () => {
    // const opts = { from: admin };

    beforeEach(async () => {
      await _this.sablier.updateFee({ feePercentage: STANDARD_SABLIER_FEE });
    });

    describe('when the cToken is whitelisted', () => {
      // beforeEach(async () => {
      // await this.cTokenManager.whitelistCToken(this.cToken.address, opts);
      // });

      describe('when the amount does not exceed the available balance', () => {
        let streamId;
        const deposit = STANDARD_SALARY_CTOKEN.toString(10);
        const senderSharePercentage = STANDARD_SENDER_SHARE_PERCENTAGE;
        const recipientSharePercentage = STANDARD_RECIPIENT_SHARE_PERCENTAGE;
        // const now = new BigNumber(dayjs().unix());
        // const startTime = now.plus(STANDARD_TIME_OFFSET);
        // const stopTime = startTime.plus(STANDARD_TIME_DELTA);

        beforeEach(async () => {
          await _this.cToken.approve({ address: _this.sablier.getAddress(), amount: deposit });
          await _this.cToken.allowance({
            address: _this.userAddress,
            spenderAddress: _this.sablier.getAddress(),
          });
          const result = await _this.sablier.createCompoundingStream({
            recipient,
            deposit,
            tokenAddress: _this.cToken.getAddress(),
            startTime,
            stopTime,
            senderSharePercentage,
            recipientSharePercentage,
          });
          // const res = await beproAssert.createTransactionResult(_this.sablier.getContract(), result.transactionHash);
          // console.log('---TakeEarnings.result.beproAssert\n', res);
          // const res2 = await beproAssert.createTransactionResult(_this.sablier.getContract(), result.transactionHash);
          // console.log('---TakeEarnings.result.beproAssert\n', res2);
          // streamId = Number(result.logs[0].args.streamId);
          streamId = Number(result.events.CreateStream.returnValues.streamId);
          // console.log('---TakeEarnings.result.streamId:', streamId);
          await _this.token.approve({
            address: _this.cToken.getAddress(),
            amount: STANDARD_SUPPLY_AMOUNT.toString(10),
          });
          await _this.cToken.supplyUnderlying({
            supplyAmount: STANDARD_SUPPLY_AMOUNT.toString(10),
          });
        });

        describe('when the amount is not zero', () => {
          const amount = FIVE_UNITS_CTOKEN.toString(10);

          contextForStreamDidStartButNotEnd(() => {
            it('takes the earnings', async () => {
              await _this.cToken.balanceOf(_this.userAddress);
              await _this.sablier.withdrawFromStream({ streamId, amount });
              const balance = await _this.cToken.balanceOf(admin);
              const earningsAmount = await _this.sablier.getEarnings({ tokenAddress: _this.cToken.getAddress() });
              await _this.sablier.takeEarnings({ tokenAddress: _this.cToken.getAddress(), amount: earningsAmount });
              const newBalance = await _this.cToken.balanceOf(admin);
              balance.should.be.bignumber.equal(BigNumber(newBalance).minus(earningsAmount));
            });
          });
        });

        describe('when the amount is zero', () => {
          const amount = new BigNumber(0).toString(10);

          it('reverts', async () => {
            await beproAssert.reverts(
              () => _this.sablier.takeEarnings({ tokenAddress: _this.cToken.getAddress(), amount }),
              'amount is zero',
            );
          });
        });
      });

      describe('when the amount exceeds the available balance', () => {
        const amount = new BigNumber(8123101);

        it('reverts', async () => {
          await beproAssert.reverts(
            () => _this.sablier.takeEarnings({ tokenAddress: _this.cToken.getAddress(), amount }),
            'amount exceeds the available balance',
          );
        });
      });
    });

    /* describe("when the cToken is not whitelisted", function() {
      const amount = new BigNumber(8123101);

      it("reverts", async function() {
        await beproAssert.reverts(
          () => this.sablier.takeEarnings(this.cToken.address, amount, opts),
          "cToken is not whitelisted",
        );
      });
    }); */
  });

  describe('when the stream does not exist', () => {
    it('reverts', async () => {
      const streamId = new BigNumber(419863);
      await beproAssert.reverts(
        () => _this.sablier.getStream({ streamId }),
        'stream does not exist',
      );
    });
  });

  describe('when the caller is not the admin', () => {
    const amount = new BigNumber(8123101);

    it('reverts', async () => {
      await beproAssert.reverts(
        () => _this.sablier.takeEarnings(
          { amount, tokenAddress: _this.cToken.getAddress() },
          { from: _this.eve },
        ),
        beproAssert.ErrorType.REVERT,
      );
    });
  });
});
