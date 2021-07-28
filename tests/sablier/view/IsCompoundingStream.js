//const { dappConstants } = require("@sablier/dev-utils");
const project_root = process.cwd();
const { dappConstants } = require(project_root + "/src/sablier/dev-utils");
const BigNumber = require("bignumber.js");
const dayjs = require("dayjs");
const truffleAssert = require("truffle-assertions");

const {
  STANDARD_RECIPIENT_SHARE_PERCENTAGE,
  STANDARD_SALARY,
  STANDARD_SALARY_CTOKEN,
  STANDARD_SENDER_SHARE_PERCENTAGE,
  STANDARD_TIME_OFFSET,
  STANDARD_TIME_DELTA,
} = dappConstants;

function shouldBehaveLikeIsCompoundingStream(_this) { //alice, bob) {
  const alice = _this.alice;
  const bob = _this.bob;
  const sender = _this.alice;
  //const opts = { from: sender };
  const now = new BigNumber(dayjs().unix());

  describe("when the compounding stream exists", () => {
    let streamId;
    const recipient = bob;
    const deposit = STANDARD_SALARY_CTOKEN.toString(10);
    const startTime = now.plus(STANDARD_TIME_OFFSET);
    const stopTime = startTime.plus(STANDARD_TIME_DELTA);
    const senderSharePercentage = STANDARD_SENDER_SHARE_PERCENTAGE;
    const recipientSharePercentage = STANDARD_RECIPIENT_SHARE_PERCENTAGE;

    beforeEach(async () => {
      //await this.cTokenManager.whitelistCToken(this.cToken.address);
      await _this.cToken.approve({ address: _this.sablier.getAddress(), amount: deposit });
      const result = await _this.sablier.createCompoundingStream({
        recipient,
        deposit,
        tokenAddress: _this.cToken.getAddress(),
        startTime,
        stopTime,
        senderSharePercentage,
        recipientSharePercentage,
      });
      //streamId = Number(result.logs[0].args.streamId);
	  streamId = Number(result.events.CreateStream.returnValues.streamId);
	  console.log('---IsCompoundingStream.streamId.bp0: ', streamId);
    });

    it("returns true", async () => {
      const result = await _this.sablier.isCompoundingStream({ streamId });
      result.should.be.equal(true);
    });
  });

  describe("when the stream exists but is not compounding", () => {
    let streamId;
    const recipient = bob;
    const deposit = STANDARD_SALARY.toString(10);
    const startTime = now.plus(STANDARD_TIME_OFFSET);
    const stopTime = startTime.plus(STANDARD_TIME_DELTA);

    beforeEach(async () => {
	  await _this.token.approve({ address: _this.sablier.getAddress(), amount: deposit });
      const result = await _this.sablier.createStream({ recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime });
      //streamId = Number(result.logs[0].args.streamId);
	  streamId = Number(result.events.CreateStream.returnValues.streamId);
	  console.log('---IsCompoundingStream.streamId.bp1: ', streamId);
    });

    it("returns false", async () => {
      const result = await _this.sablier.isCompoundingStream({ streamId });
      result.should.be.equal(false);
    });
  });

  describe("when the stream does not exist", () => {
    it("reverts", async () => {
      const streamId = new BigNumber(419863);
      await truffleAssert.reverts(_this.sablier.getCompoundingStream({ streamId }), "stream does not exist");
    });
  });
}

module.exports = shouldBehaveLikeIsCompoundingStream;
