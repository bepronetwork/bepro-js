const { dappConstants } = require("../../../src/sablier/dev-utils");
const BigNumber = require("bignumber.js");
const dayjs = require("dayjs");
const truffleAssert = require("truffle-assertions");

const { STANDARD_SALARY, STANDARD_TIME_OFFSET, STANDARD_TIME_DELTA } = dappConstants;

const sablierUtils = require("../sablier.utils");



context("sablier.GetCompoundingStream.context", async () => {

  let alice;// = _this.alice;
  let bob; // = _this.bob;
  let sender;// = alice;
  let recipient;// = _this.bob;
  //const opts = { from: sender };
  let now;// = new BigNumber(dayjs().unix());
  let startTime;// = now.plus(STANDARD_TIME_OFFSET);
  let stopTime;// = startTime.plus(STANDARD_TIME_DELTA);

  before("sablier.GetCompoundingStream.before", async () => {
    await sablierUtils.initConfig();
    alice = _this.alice;
    bob = _this.bob;
    sender = _this.alice;
    recipient = _this.bob;
    now = new BigNumber(dayjs().unix());
    startTime = now.plus(STANDARD_TIME_OFFSET);
    stopTime = startTime.plus(STANDARD_TIME_DELTA);
    _this.now = now;
  });
  
  describe("when the stream exists but is not compounding", () => {
    let streamId;
    const deposit = STANDARD_SALARY.toString(10);
    
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
});
