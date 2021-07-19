//const { dappConstants } = require("@sablier/dev-utils");
const project_root = process.cwd();
const { dappConstants } = require(project_root + "/src/sablier/dev-utils");
const BigNumber = require("bignumber.js");
const dayjs = require("dayjs");
const truffleAssert = require("truffle-assertions");

const { STANDARD_SALARY, STANDARD_TIME_OFFSET, STANDARD_TIME_DELTA } = dappConstants;

function shouldBehaveLikeGetCompoundingStream(_this) { //alice, bob) {
  const alice = _this.alice;
  const bob = _this.bob;
  const sender = alice;
  //const opts = { from: sender };
  const now = new BigNumber(dayjs().unix());

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
	  console.log('---GetCompoundingStream.streamId: ', streamId);
    });

    it("reverts", async () => {
      await truffleAssert.reverts(
        _this.sablier.getCompoundingStream({ streamId }),
        "compounding stream does not exist",
      );
    });
  });

  describe("when the stream does not exist", () => {
    it("reverts", async () => {
      const streamId = new BigNumber(419863);
      await truffleAssert.reverts(_this.sablier.getCompoundingStream({ streamId }), "stream does not exist");
    });
  });
}

module.exports = shouldBehaveLikeGetCompoundingStream;
