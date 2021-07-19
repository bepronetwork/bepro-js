//const { dappConstants, mochaContexts } = require("@sablier/dev-utils");
const project_root = process.cwd();
const { dappConstants, mochaContexts } = require(project_root + "/src/sablier/dev-utils");
const BigNumber = require("bignumber.js");
const dayjs = require("dayjs");
const truffleAssert = require("truffle-assertions");
const beproAssert = require(project_root + "/src/utils/beproAssert");
import Numbers from "../../../../build/utils/Numbers";

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
const { contextForStreamDidEnd, contextForStreamDidStartButNotEnd } = mochaContexts;

let sender;
let recipient;
let deposit;
let streamId;
let tokenDecimals;

function runTests(_this) {
  describe("when not paused", () => {
    describe("when the stream did not start", () => {
      const streamedAmount = FIVE_UNITS_CTOKEN.toString(10);

      it("reverts", async () => {
        await truffleAssert.reverts(
          _this.sablier.withdrawFromStream({ streamId, amount: streamedAmount }), //this.opts);
          "amount exceeds the available balance",
        );
      });
    });

    contextForStreamDidStartButNotEnd(() => {
      const streamedAmount = FIVE_UNITS_CTOKEN.toString(10);

      it("withdraws from the stream", async () => {
        const senderBalance = await _this.cToken.balanceOf(sender);
        const recipientBalance = await _this.cToken.balanceOf(recipient);
        const sablierBalance = await _this.cToken.balanceOf(_this.sablier.getAddress());
        await _this.sablier.withdrawFromStream({ streamId, amount: streamedAmount });
        const newSenderBalance = await _this.cToken.balanceOf(sender);
        const newRecipientBalance = await _this.cToken.balanceOf(recipient);
        const newSablierBalance = await _this.cToken.balanceOf(_this.sablier.getAddress());

        const sum = new BigNumber(senderBalance).plus(recipientBalance).plus(sablierBalance);
        const newSum = new BigNumber(newSenderBalance).plus(newRecipientBalance).plus(newSablierBalance);
        sum.should.be.bignumber.equal(newSum);
      });

      it("pays the interest to the sender of the stream", async () => {
        const balance = await _this.cToken.balanceOf(sender);
        const { senderInterest } = await _this.sablier.interestOf({ streamId, amount: streamedAmount });
        await _this.sablier.withdrawFromStream({ streamId, amount: streamedAmount });
        const newBalance = await _this.cToken.balanceOf(sender);
        newBalance.should.be.bignumber.equal(new BigNumber(balance).plus(senderInterest));
      });

      it("transfers the tokens and pays the interest to the recipient of the stream", async () => {
        const balance = await _this.cToken.balanceOf(recipient);
        const { senderInterest, sablierInterest } = await _this.sablier.interestOf({ streamId, amount: streamedAmount });
        await _this.sablier.withdrawFromStream({ streamId, amount: streamedAmount });
        const netWithdrawalAmount = new BigNumber(streamedAmount).minus(senderInterest).minus(sablierInterest);
        const newBalance = await _this.cToken.balanceOf(recipient);
        newBalance.should.be.bignumber.equal(new BigNumber(balance).plus(netWithdrawalAmount));
      });

      it("pays the interest to the sablier contract", async () => {
        const earnings = await _this.sablier.getEarnings({ tokenAddress: _this.cToken.getAddress() });
        const balance = await _this.cToken.balanceOf(_this.sablier.getAddress());
        const { sablierInterest } = await _this.sablier.interestOf({ streamId, amount: streamedAmount });
        await _this.sablier.withdrawFromStream({ streamId, amount: streamedAmount });
        const newEarnings = await _this.sablier.getEarnings({ tokenAddress: _this.cToken.getAddress() });
        const newBalance = await _this.cToken.balanceOf(_this.sablier.getAddress());
        // The sender and the recipient's interests are included in `amount`,
        // so we don't subtract them again
        // newEarnings.should.tolerateTheBlockTimeVariation(new BigNumber(earnings).plus(sablierInterest), STANDARD_SCALE_INTEREST);
		newBalance.should.tolerateTheBlockTimeVariation(
          new BigNumber(balance).minus(streamedAmount).plus(sablierInterest),
          STANDARD_SCALE_INTEREST,
        );
      });

      it("emits a withdrawfromstream event", async () => {
        const result = await _this.sablier.withdrawFromStream({ streamId, amount: streamedAmount });
        //truffleAssert.eventEmitted(result, "WithdrawFromStream");
		beproAssert.eventEmitted(result, "WithdrawFromStream");
      });

      it("emits a payinterest event", async () => {
        const result = await _this.sablier.withdrawFromStream({ streamId, amount: streamedAmount });
        //truffleAssert.eventEmitted(result, "PayInterest");
		beproAssert.eventEmitted(result, "PayInterest");
      });

      it("decreases the stream balance", async () => {
        const balance = await _this.sablier.balanceOf({ streamId, who: recipient });
        await _this.sablier.withdrawFromStream({ streamId, amount: streamedAmount });
        const newBalance = await _this.sablier.balanceOf({ streamId, who: recipient });
        // Intuitively, one may say we don't have to tolerate the block time variation here.
        // However, the Sablier balance for the recipient can only go up from the bottom
        // low of `balance` - `amount`, due to uncontrollable runtime costs.
        newBalance.should.tolerateTheBlockTimeVariation(new BigNumber(balance).minus(streamedAmount), STANDARD_SCALE_CTOKEN);
      });
    });

    contextForStreamDidEnd(() => {
      const streamedAmount = STANDARD_SALARY_CTOKEN.toString(10);

      it("withdraws from the stream", async () => {
        const senderBalance = await _this.cToken.balanceOf(sender);
        const recipientBalance = await _this.cToken.balanceOf(recipient);
        const sablierBalance = await _this.cToken.balanceOf(_this.sablier.getAddress());
        await _this.sablier.withdrawFromStream({ streamId, amount: streamedAmount });
        const newSenderBalance = await _this.cToken.balanceOf(sender);
        const newRecipientBalance = await _this.cToken.balanceOf(recipient);
        const newSablierBalance = await _this.cToken.balanceOf(_this.sablier.getAddress());

        const sum = new BigNumber(senderBalance).plus(recipientBalance).plus(sablierBalance);
        const newSum = new BigNumber(newSenderBalance).plus(newRecipientBalance).plus(newSablierBalance);
        sum.should.be.bignumber.equal(newSum);
      });

      it("pays the interest to the sender of the stream", async () => {
        const balance = _this.cToken.toTokens(await _this.cToken.balanceOf(sender));
        let { senderInterest } = await _this.sablier.interestOf({ streamId, amount: streamedAmount });
        senderInterest = Numbers.toSmartContractDecimals(senderInterest, await _this.sablier.getTokenDecimalsFromStream({ streamId }));
		await _this.sablier.withdrawFromStream({ streamId, amount: streamedAmount });
        const newBalance = _this.cToken.toTokens(await _this.cToken.balanceOf(sender));
        //TODO
		newBalance.should.be.bignumber.equal(new BigNumber(balance).plus(senderInterest));
      });

      it("transfers the tokens and pays the interest to the recipient of the stream", async () => {
        const balance = _this.cToken.toTokens(await _this.cToken.balanceOf(recipient));
        const { senderInterest, sablierInterest } = await _this.sablier.interestOf({ streamId, amount: streamedAmount });
        await _this.sablier.withdrawFromStream({ streamId, amount: streamedAmount });
        let netWithdrawalAmount = new BigNumber(streamedAmount).minus(senderInterest).minus(sablierInterest);
        netWithdrawalAmount = Numbers.toSmartContractDecimals(netWithdrawalAmount, tokenDecimals);
		const newBalance = _this.cToken.toTokens(await _this.cToken.balanceOf(recipient));
        //TODO
		newBalance.should.be.bignumber.equal(new BigNumber(balance).plus(netWithdrawalAmount));
      });

      it("pays the interest to the sablier contract", async () => {
        const earnings = await _this.sablier.getEarnings({ tokenAddress: _this.cToken.getAddress() });
        const balance = await _this.cToken.balanceOf(_this.sablier.getAddress());
        const { sablierInterest } = await _this.sablier.interestOf({ streamId, amount: streamedAmount });
        await _this.sablier.withdrawFromStream({ streamId, amount: streamedAmount });
        const newEarnings = await _this.sablier.getEarnings({ tokenAddress: _this.cToken.getAddress() });
        const newBalance = await _this.cToken.balanceOf(_this.sablier.getAddress());
        // The sender and the recipient's interests are included in `amount`,
        // so we don't subtract them again
        newEarnings.should.tolerateTheBlockTimeVariation(new BigNumber(earnings).plus(sablierInterest), STANDARD_SCALE_INTEREST);
        newBalance.should.tolerateTheBlockTimeVariation(
          new BigNumber(balance).minus(streamedAmount).plus(sablierInterest),
          STANDARD_SCALE_INTEREST,
        );
      });

      it("emits a withdrawfromstream event", async () => {
        const result = await _this.sablier.withdrawFromStream({ streamId, amount: streamedAmount });
        //truffleAssert.eventEmitted(result, "WithdrawFromStream");
		beproAssert.eventEmitted(result, "WithdrawFromStream");
      });

      it("emits a payinterest event", async () => {
        const result = await _this.sablier.withdrawFromStream({ streamId, amount: streamedAmount });
        //truffleAssert.eventEmitted(result, "PayInterest");
		beproAssert.eventEmitted(result, "PayInterest");
      });

      it("deletes the stream objects", async () => {
        await _this.sablier.withdrawFromStream({ streamId, amount: streamedAmount });
        await truffleAssert.reverts(_this.sablier.getStream({ streamId }), "stream does not exist");
        await truffleAssert.reverts(_this.sablier.getCompoundingStream({ streamId }), "stream does not exist");
      });
    });
  });

  describe("when paused", () => {
    const streamedAmount = FIVE_UNITS_CTOKEN.toString(10);

    beforeEach(async () => {
      // Note that `sender` coincides with the owner of the contract
      await _this.sablier.pause(); //({ from: this.sender });
    });

    it("reverts", async () => {
      await truffleAssert.reverts(
        _this.sablier.withdrawFromStream({ streamId, amount: streamedAmount }), //, this.opts),
        "Pausable: paused",
      );
    });
	
	afterEach(async () => {
      // Note that `sender` coincides with the owner of the contract
      await _this.sablier.unpause(); //({ from: this.sender });
    });
  });
}

function shouldBehaveLikeWithdrawFromCompoundingStream(_this) { //alice, bob) {
  const alice = _this.alice;
  const bob = _this.bob;
  const deposit = STANDARD_SALARY_CTOKEN.toString(10);
  const now = new BigNumber(dayjs().unix());
  const startTime = now.plus(STANDARD_TIME_OFFSET);
  const stopTime = startTime.plus(STANDARD_TIME_DELTA);

  beforeEach(async () => {
    sender = alice;
    recipient = bob;
    //this.opts = { from: this.sender };
    //await this.cTokenManager.whitelistCToken(this.cToken.address, this.opts);
    await _this.cToken.approve({ address: _this.sablier.getAddress(), amount: deposit });
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
	  console.log('---WithdrawFromCompoundingStream.streamId.bp0: ', streamId);
      await _this.token.approve({ address: _this.cToken.getAddress(), amount: STANDARD_SUPPLY_AMOUNT.toString(10) });
      await _this.cToken.supplyUnderlying(STANDARD_SUPPLY_AMOUNT.toString(10));
	  tokenDecimals = await _this.sablier.getTokenDecimalsFromStream({ streamId });
	  console.log('---WithdrawFromCompoundingStream.tokenDecimals: ', tokenDecimals);
    });

    describe("when the sablier fee is not zero and is not 100", () => {
      beforeEach(async () => {
        await _this.sablier.updateFee({ feePercentage: new BigNumber(STANDARD_SABLIER_FEE) });
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
	  console.log('---WithdrawFromCompoundingStream.streamId.bp1: ', streamId);
      await _this.token.approve({ address: _this.cToken.getAddress(), amount: STANDARD_SUPPLY_AMOUNT.toString(10) });
      await _this.cToken.supplyUnderlying(STANDARD_SUPPLY_AMOUNT.toString(10));
    });

    describe("when the sablier fee is not zero and is not 100", () => {
      beforeEach(async () => {
        await _this.sablier.updateFee({ feePercentage: new BigNumber(STANDARD_SABLIER_FEE) });
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
	  console.log('---WithdrawFromCompoundingStream.streamId.bp2: ', streamId);
      await _this.token.approve({ address: _this.cToken.getAddress(), amount: STANDARD_SUPPLY_AMOUNT.toString(10) });
      await _this.cToken.supplyUnderlying(STANDARD_SUPPLY_AMOUNT.toString(10));
    });

    describe("when the sablier fee is not zero and is not 100", () => {
      beforeEach(async () => {
        await _this.sablier.updateFee({ feePercentage: new BigNumber(STANDARD_SABLIER_FEE) });
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

module.exports = shouldBehaveLikeWithdrawFromCompoundingStream;
