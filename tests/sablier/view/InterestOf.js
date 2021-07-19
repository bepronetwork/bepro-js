//const { dappConstants } = require("@sablier/dev-utils");
const project_root = process.cwd();
const { dappConstants } = require(project_root + "/src/sablier/dev-utils");
const BigNumber = require("bignumber.js");
const dayjs = require("dayjs");
const truffleAssert = require("truffle-assertions");

const { STANDARD_SALARY, STANDARD_TIME_OFFSET, STANDARD_TIME_DELTA } = dappConstants;

function shouldBehaveLikeInterestOf(_this) { //alice, bob) {
  const alice = _this.alice;
  const bob = _this.bob;
  const sender = alice;
  const deposit = STANDARD_SALARY.toString(10);
  //const opts = { from: sender };
  const now = new BigNumber(dayjs().unix());

  describe("when the compounding stream does not exist", () => {
    let streamId;
    const recipient = bob;
    const startTime = now.plus(STANDARD_TIME_OFFSET);
    const stopTime = startTime.plus(STANDARD_TIME_DELTA);

    beforeEach(async () => {
      await _this.token.approve({ address: _this.sablier.getAddress(), amount: deposit });
      const result = await _this.sablier.createStream({ recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime });
      //streamId = Number(result.logs[0].args.streamId);
	  streamId = Number(result.events.CreateStream.returnValues.streamId);
	  console.log('---InterestOf.streamId: ', streamId);
    });

    it("returns 0", async () => {
	const result = await _this.sablier.interestOf({ streamId, amount: deposit });
      result.senderInterest.should.be.bignumber.equal(new BigNumber(0));
      result.recipientInterest.should.be.bignumber.equal(new BigNumber(0));
      result.sablierInterest.should.be.bignumber.equal(new BigNumber(0));
    });
  });

  describe("when the stream does not exist", () => {
    it("reverts", async () => {
      const streamId = new BigNumber(419863);
      await truffleAssert.reverts(_this.sablier.interestOf({ streamId, amount: deposit }), "stream does not exist");
    });
  });
}

module.exports = shouldBehaveLikeInterestOf;
