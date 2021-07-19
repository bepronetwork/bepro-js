//const { dappConstants, mochaContexts } = require("@sablier/dev-utils");
const project_root = process.cwd();
const { dappConstants, mochaContexts } = require(project_root + "/src/sablier/dev-utils");
const BigNumber = require("bignumber.js");
const dayjs = require("dayjs");
const truffleAssert = require("truffle-assertions");
const beproAssert = require(project_root + "/src/utils/beproAssert");

const { contextForStreamDidEnd, contextForStreamDidStartButNotEnd } = mochaContexts;

const {
  FIVE_UNITS_CTOKEN,
  STANDARD_RECIPIENT_SHARE_PERCENTAGE,
  STANDARD_SABLIER_FEE,
  STANDARD_SALARY_CTOKEN,
  STANDARD_SCALE_CTOKEN,
  STANDARD_SCALE_INTEREST,
  STANDARD_SENDER_SHARE_PERCENTAGE,
  STANDARD_SUPPLY_AMOUNT,
  STANDARD_TIME_OFFSET,
  STANDARD_TIME_DELTA,
} = dappConstants;

let sender;
let recipient;
let deposit;
let streamId;

function runTests(_this) {
  describe("when there were no withdrawals", () => {
    describe("when the stream did not start", () => {
      it("cancels the stream", async () => {
        await _this.sablier.cancelStream({ streamId });
        await truffleAssert.reverts(_this.sablier.getStream({ streamId }), "stream does not exist");
        await truffleAssert.reverts(_this.sablier.getCompoundingStream({ streamId }), "stream does not exist");
      });
    });

    contextForStreamDidStartButNotEnd(() => {
      const recipientBalance = FIVE_UNITS_CTOKEN.toString(10);

      it("cancels the stream", async () => {
        await _this.sablier.cancelStream({ streamId });
        await truffleAssert.reverts(_this.sablier.getStream({ streamId }), "stream does not exist");
        await truffleAssert.reverts(_this.sablier.getCompoundingStream({ streamId }), "stream does not exist");
      });

      it("transfers the tokens and pays the interest to the sender of the stream", async () => {
        const balance = await _this.cToken.balanceOf(sender);
        const { senderInterest } = await _this.sablier.interestOf({ streamId, amount: recipientBalance });
	    await _this.sablier.cancelStream({ streamId });
        const newBalance = await _this.cToken.balanceOf(sender);
        const tolerateByAddition = false;
        newBalance.should.tolerateTheBlockTimeVariation(
          balance
            .minus(recipientBalance)
            .plus(deposit)
            .plus(senderInterest),
          STANDARD_SCALE_CTOKEN,
          tolerateByAddition,
        );
      });

      it("transfers the tokens and pays the interest to the recipient of the stream", async () => {
        const balance = await _this.cToken.balanceOf(recipient);
        const { senderInterest, sablierInterest } = await _this.sablier.interestOf({ streamId, amount: recipientBalance });
        await _this.sablier.cancelStream({ streamId });
        const netWithdrawalAmount = new BigNumber(recipientBalance).minus(senderInterest).minus(sablierInterest);
        const newBalance = await _this.cToken.balanceOf(recipient,);
        newBalance.should.tolerateTheBlockTimeVariation(balance.plus(netWithdrawalAmount), STANDARD_SCALE_CTOKEN);
      });

      it("pays the interest to the sablier contract", async () => {
        const earnings = await _this.sablier.getEarnings({ tokenAddress: _this.cToken.getAddress() });
        const balance = await _this.cToken.balanceOf(_this.sablier.getAddress());
        const { remainingBalance } = await _this.sablier.getStream({ streamId });
        const { sablierInterest } = await _this.sablier.interestOf({ streamId, amount: recipientBalance });
        await _this.sablier.cancelStream({ streamId });
        const newEarnings = await _this.sablier.getEarnings({ tokenAddress: _this.cToken.getAddress() });
        const newBalance = await _this.cToken.balanceOf(_this.sablier.getAddress());
        newEarnings.should.tolerateTheBlockTimeVariation(earnings.plus(sablierInterest), STANDARD_SCALE_INTEREST);
        // The sender and the recipient's interests are included in `stream.remainingBalance`,
        // so we don't subtract them again
        newBalance.should.tolerateTheBlockTimeVariation(
          balance.minus(remainingBalance).plus(sablierInterest),
          STANDARD_SCALE_INTEREST,
        );
      });

      it("emits a cancelstream event", async () => {
        const result = await _this.sablier.cancelStream({ streamId });
        //truffleAssert.eventEmitted(result, "CancelStream");
		beproAssert.eventEmitted(result, "CancelStream");
      });

      it("emits a payinterest event", async () => {
        const result = await _this.sablier.cancelStream({ streamId });
        //truffleAssert.eventEmitted(result, "PayInterest");
		beproAssert.eventEmitted(result, "PayInterest");
      });
    });

    contextForStreamDidEnd(() => {
      const recipientBalance = STANDARD_SALARY_CTOKEN.toString(10);

      it("cancels the stream", async () => {
        await _this.sablier.cancelStream({ streamId });
        await truffleAssert.reverts(_this.sablier.getStream({ streamId }), "stream does not exist");
        await truffleAssert.reverts(_this.sablier.getCompoundingStream({ streamId }), "stream does not exist");
      });

      it("transfers the tokens and pays the interest to the sender of the stream", async () => {
        const balance = await _this.cToken.balanceOf(sender);
        const { senderInterest } = await _this.sablier.interestOf({ streamId, amount: recipientBalance });
        await _this.sablier.cancelStream({ streamId });
        const newBalance = await _this.cToken.balanceOf(sender);
        newBalance.should.be.bignumber.equal(balance.plus(senderInterest));
      });

      it("transfers the tokens and pays the interest to the recipient of the stream", async () => {
        const balance = await _this.cToken.balanceOf(recipient);
        const { senderInterest, sablierInterest } = await _this.sablier.interestOf({ streamId, amount: recipientBalance });
        await _this.sablier.cancelStream({ streamId });
        const netWithdrawalAmount = new BigNumber(recipientBalance).minus(senderInterest).minus(sablierInterest);
	    const newBalance = await _this.cToken.balanceOf(recipient);
        newBalance.should.be.bignumber.equal(balance.plus(netWithdrawalAmount));
      });

      it("pays the interest to the sablier contract", async () => {
        const earnings = await _this.sablier.getEarnings({ tokenAddress: _this.cToken.getAddress() });
        const balance = await _this.cToken.balanceOf(_this.sablier.getAddress());
        const stream = await _this.sablier.getStream({ streamId });
        const { sablierInterest } = await _this.sablier.interestOf({ streamId, amount: recipientBalance });
        await _this.sablier.cancelStream({ streamId });
        const newEarnings = await _this.sablier.getEarnings({ tokenAddress: _this.cToken.getAddress() });
        const newBalance = await _this.cToken.balanceOf(_this.sablier.getAddress());
        // The sender and the recipient's interests are included in `stream.remainingBalance`,
        // so we don't subtract them again
        newEarnings.should.tolerateTheBlockTimeVariation(earnings.plus(sablierInterest), STANDARD_SCALE_INTEREST);
        newBalance.should.tolerateTheBlockTimeVariation(
          balance.minus(stream.remainingBalance).plus(sablierInterest),
          STANDARD_SCALE_INTEREST,
        );
      });

      it("emits a cancelstream event", async () => {
        const result = await _this.sablier.cancelStream({ streamId });
        //truffleAssert.eventEmitted(result, "CancelStream");
		beproAssert.eventEmitted(result, "CancelStream");
      });

      it("emits a payinterest event", async () => {
        const result = await _this.sablier.cancelStream({ streamId });
        //truffleAssert.eventEmitted(result, "PayInterest");
		beproAssert.eventEmitted(result, "PayInterest");
      });
    });
  });

  describe("when there were withdrawals", () => {
    contextForStreamDidStartButNotEnd(() => {
      beforeEach(async () => {
        const streamedAmount = FIVE_UNITS_CTOKEN.toString(10);
        await _this.sablier.withdrawFromStream({ streamId, amount: streamedAmount });
      });

      it("cancels the stream", async () => {
        await _this.sablier.cancelStream({ streamId });
        await truffleAssert.reverts(_this.sablier.getStream({ streamId }), "stream does not exist");
        await truffleAssert.reverts(_this.sablier.getCompoundingStream({ streamId }), "stream does not exist");
      });
    });
  });
}

function shouldBehaveLikeCancelCompoundingStream(_this) { //alice, bob) {
  const alice = _this.alice;
  const bob = _this.bob;
  const now = new BigNumber(dayjs().unix());
  const startTime = now.plus(STANDARD_TIME_OFFSET);
  const stopTime = startTime.plus(STANDARD_TIME_DELTA);

  beforeEach(async () => {
    sender = alice;
    recipient = bob;
    deposit = STANDARD_SALARY_CTOKEN.toString(10);
    //this.opts = { from: this.sender };
    //await this.cTokenManager.whitelistCToken(this.cToken.address, { from: alice });
    await _this.cToken.approve({ address: _this.sablier.getAddress(), amount: deposit }); //{ from: alice });
  });

  describe("when the sender's interest share is not zero and the recipient's interest share is not zero", () => {
    const senderSharePercentage = STANDARD_SENDER_SHARE_PERCENTAGE;
    const recipientSharePercentage = STANDARD_RECIPIENT_SHARE_PERCENTAGE;

    beforeEach(async () => {
      const result = await _this.sablier.createCompoundingStream({
        recipient,
        deposit,
        tokenAddress: _this.cToken.getAddress(),
        startTime,
        stopTime,
        senderSharePercentage,
        recipientSharePercentage,
	  });
      streamId = Number(result.events.CreateStream.returnValues.streamId);
	  console.log('---CancelCompoundingStream.streamId.bp0: ', streamId);
      await _this.token.approve({ address: _this.cToken.getAddress(), amount: STANDARD_SUPPLY_AMOUNT.toString(10) }); //, this.opts);
      await _this.cToken.supplyUnderlying(STANDARD_SUPPLY_AMOUNT.toString(10));
    });

    describe("when the sablier fee is not zero and is not 100", () => {
      beforeEach(async () => {
        await _this.sablier.updateFee({ feePercentage: STANDARD_SABLIER_FEE });
      });

      runTests(_this);
    });

    describe("when the sablier fee is 0", () => {
      beforeEach(async () => {
        await _this.sablier.updateFee({ feePercentage: new BigNumber(0) });
      });

      runTests(_this);
    });

    describe("when the sablier fee is 100", () => {
      beforeEach(async () => {
        await _this.sablier.updateFee({ feePercentage: new BigNumber(100) });
      });

      runTests(_this);
    });
  });

  describe("when the sender's interest share is zero", () => {
    const senderSharePercentage = new BigNumber(0);
    const recipientSharePercentage = new BigNumber(100);

    beforeEach(async () => {
      const result = await _this.sablier.createCompoundingStream({
        recipient,
        deposit,
        tokenAddress: _this.cToken.getAddress(),
        startTime,
        stopTime,
        senderSharePercentage,
        recipientSharePercentage,
      });
      streamId = Number(result.events.CreateStream.returnValues.streamId);
	  console.log('---CancelCompoundingStream.streamId.bp1: ', streamId);
      await _this.token.approve({ address: _this.cToken.getAddress(), amount: STANDARD_SUPPLY_AMOUNT.toString(10) }); //, this.opts);
      await _this.cToken.supplyUnderlying(STANDARD_SUPPLY_AMOUNT.toString(10));
    });

    describe("when the sablier fee is not zero and is not 100", () => {
      beforeEach(async () => {
        await _this.sablier.updateFee({ feePercentage: STANDARD_SABLIER_FEE });
      });

      runTests(_this);
    });

    describe("when the sablier fee is 0", () => {
      beforeEach(async () => {
        await _this.sablier.updateFee({ feePercentage: new BigNumber(0) });
      });

      runTests(_this);
    });

    describe("when the sablier fee is 100", () => {
      beforeEach(async () => {
        await _this.sablier.updateFee({ feePercentage: new BigNumber(100) });
      });

      runTests(_this);
    });
  });

  describe("when the recipient's interest share is zero", () => {
    const senderSharePercentage = new BigNumber(100);
    const recipientSharePercentage = new BigNumber(0);

    beforeEach(async () => {
      const result = await _this.sablier.createCompoundingStream({
        recipient,
        deposit,
        tokenAddress: _this.cToken.getAddress(),
        startTime,
        stopTime,
        senderSharePercentage,
        recipientSharePercentage,
      });
      streamId = Number(result.events.CreateStream.returnValues.streamId);
	  console.log('---CancelCompoundingStream.streamId.bp2: ', streamId);
      await _this.token.approve({ address: _this.cToken.getAddress(), amount: STANDARD_SUPPLY_AMOUNT.toString(10) }); //, this.opts);
      await _this.cToken.supplyUnderlying(STANDARD_SUPPLY_AMOUNT.toString(10));
    });

    describe("when the sablier fee is not zero and is not 100", () => {
      beforeEach(async () => {
        await _this.sablier.updateFee({ feePercentage: STANDARD_SABLIER_FEE });
      });

      runTests(_this);
    });

    describe("when the sablier fee is 0", () => {
      beforeEach(async () => {
        await _this.sablier.updateFee({ feePercentage: new BigNumber(0) });
      });

      runTests(_this);
    });

    describe("when the sablier fee is 100", () => {
      beforeEach(async () => {
        await _this.sablier.updateFee({ feePercentage: new BigNumber(100) });
      });

      runTests(_this);
    });
  });
}

module.exports = shouldBehaveLikeCancelCompoundingStream;
