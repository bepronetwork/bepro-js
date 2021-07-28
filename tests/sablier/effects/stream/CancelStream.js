//const { dappConstants, mochaContexts } = require("@sablier/dev-utils");
const project_root = process.cwd();
const { dappConstants, mochaContexts } = require(project_root + "/src/sablier/dev-utils");
const BigNumber = require("bignumber.js");
const dayjs = require("dayjs");
const truffleAssert = require("truffle-assertions");
const beproAssert = require(project_root + "/src/utils/beproAssert");

const { FIVE_UNITS, STANDARD_SALARY, STANDARD_SCALE, STANDARD_TIME_OFFSET, STANDARD_TIME_DELTA } = dappConstants;
const { contextForStreamDidEnd, contextForStreamDidStartButNotEnd } = mochaContexts;

let streamId;
let recipient;
let deposit;
let sender;

function runTests(_this) {
  describe("when the stream did not start", () => {
    it("cancels the stream", async () => {
      await _this.sablier.cancelStream({ streamId });
      await truffleAssert.reverts(_this.sablier.getStream({ streamId }), "stream does not exist");
    });

    it("transfers all tokens to the sender of the stream", async () => {
      const balance = await _this.token.balanceOf(sender);
      await _this.sablier.cancelStream({ streamId });
      const newBalance = await _this.token.balanceOf(sender);
      newBalance.should.be.bignumber.equal(new BigNumber(balance).plus(deposit));
    });

    it("emits a cancel event", async () => {
      const result = await _this.sablier.cancelStream({ streamId });
      //truffleAssert.eventEmitted(result, "CancelStream");
	  beproAssert.eventEmitted(result, "CancelStream");
    });
  });

  contextForStreamDidStartButNotEnd(() => {
    const streamedAmount = FIVE_UNITS.toString(10);

    it("cancels the stream", async () => {
      await _this.sablier.cancelStream({ streamId });
      await truffleAssert.reverts(_this.sablier.getStream({ streamId }), "stream does not exist");
    });

    it("transfers the tokens to the sender of the stream", async () => {
      const balance = await _this.token.balanceOf(sender);
      await _this.sablier.cancelStream({ streamId });
      const newBalance = await _this.token.balanceOf(sender);
      const tolerateByAddition = false;
      newBalance.should.tolerateTheBlockTimeVariation(
        new BigNumber(balance).minus(streamedAmount).plus(deposit),
        STANDARD_SCALE,
        tolerateByAddition,
      );
    });

    it("transfers the tokens to the recipient of the stream", async () => {
      const balance = await _this.token.balanceOf(recipient);
      await _this.sablier.cancelStream({ streamId });
      const newBalance = await _this.token.balanceOf(recipient);
      newBalance.should.tolerateTheBlockTimeVariation(new BigNumber(balance).plus(streamedAmount), STANDARD_SCALE);
    });

    it("emits a cancel event", async () => {
      const result = await _this.sablier.cancelStream({ streamId });
      //truffleAssert.eventEmitted(result, "CancelStream");
	  beproAssert.eventEmitted(result, "CancelStream");
    });
  });

  contextForStreamDidEnd(() => {
    const streamedAmount = STANDARD_SALARY.toString(10);

    it("cancels the stream", async () => {
      await _this.sablier.cancelStream({ streamId });
      await truffleAssert.reverts(_this.sablier.getStream({ streamId }), "stream does not exist");
    });

    it("transfers nothing to the sender of the stream", async () => {
      const balance = await _this.token.balanceOf(sender);
      await _this.sablier.cancelStream({ streamId });
      const newBalance = await _this.token.balanceOf(recipient);
      newBalance.should.be.bignumber.equal(balance);
    });

    it("transfers all tokens to the recipient of the stream", async () => {
      const balance = await _this.token.balanceOf(recipient);
	  await _this.sablier.cancelStream({ streamId });
      const newBalance = await _this.token.balanceOf(recipient);
      newBalance.should.be.bignumber.equal(new BigNumber(balance).plus(streamedAmount));
    });

    it("emits a cancel event", async () => {
      const result = await _this.sablier.cancelStream({ streamId });
      //truffleAssert.eventEmitted(result, "CancelStream");
	  beproAssert.eventEmitted(result, "CancelStream");
    });
  });
}

function shouldBehaveLikeERC1620CancelStream(_this) { //alice, bob, eve) {
  const alice = _this.alice;
  const bob = _this.bob;
  const eve = _this.eve;
  const now = new BigNumber(dayjs().unix());

  describe("when the stream exists", () => {
    const startTime = now.plus(STANDARD_TIME_OFFSET);
    const stopTime = startTime.plus(STANDARD_TIME_DELTA);
	
    beforeEach(async () => {
      sender = alice;
      recipient = bob;
      deposit = STANDARD_SALARY.toString(10);
      //const opts = { from: this.sender };
      await _this.token.approve({ address: _this.sablier.getAddress(), amount: deposit });
      const result = await _this.sablier.createStream({
        recipient,
        deposit,
        tokenAddress: _this.token.getAddress(),
        startTime,
        stopTime,
      });
	  streamId = Number(result.events.CreateStream.returnValues.streamId);
	  console.log('---CancelStream.streamId: ', streamId);
    });

    describe("when the caller is the sender of the stream", () => {
      beforeEach(() => {
        //this.opts = { from: this.sender };
      });

      runTests(_this);
    });

    /*describe("when the caller is the recipient of the stream", () => {
      beforeEach(() => {
        this.opts = { from: this.recipient };
      });

      runTests(_this);
    });*/

    /*describe("when the caller is not the sender or the recipient of the stream", () => {
      const opts = { from: eve };

      it("reverts", async () => {
        await truffleAssert.reverts(
          _this.sablier.cancelStream({ streamId }),
          "caller is not the sender or the recipient of the stream",
        );
      });
    });*/
  });

  describe("when the stream does not exist", () => {
    const recipient = bob;
    //const opts = { from: recipient };

    it("reverts", async () => {
      const streamId = new BigNumber(419863);
      await truffleAssert.reverts(_this.sablier.cancelStream({ streamId }), "stream does not exist");
    });
  });
}

module.exports = shouldBehaveLikeERC1620CancelStream;
