const { dappConstants } = require("../../../src/sablier/dev-utils");
const BigNumber = require("bignumber.js");
const dayjs = require("dayjs");
const truffleAssert = require("truffle-assertions");

const { STANDARD_SALARY, STANDARD_TIME_OFFSET, STANDARD_TIME_DELTA } = dappConstants;

const sablierUtils = require("../sablier.utils");



context("sablier.InterestOf.context", async () => {

  let alice;// = _this.alice;
  let bob;// = _this.bob;
  let sender;// = alice;
  let recipient;// = _this.bob;
  const deposit = STANDARD_SALARY.toString(10);
  //const opts = { from: sender };
  let now;// = new BigNumber(dayjs().unix());
  let startTime;// = now.plus(STANDARD_TIME_OFFSET);
  let stopTime;// = startTime.plus(STANDARD_TIME_DELTA);

  before("sablier.InterestOf.before", async () => {
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
  
  describe("when the compounding stream does not exist", () => {
    let streamId;
    
    beforeEach(async () => {
      await _this.token.approve({ address: _this.sablier.getAddress(), amount: deposit });
      const result = await _this.sablier.createStream({ recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime });
      //streamId = Number(result.logs[0].args.streamId);
	    streamId = Number(result.events.CreateStream.returnValues.streamId);
	    //console.log('---InterestOf.streamId: ', streamId);
    });

    it("returns 0", async () => {
	    const result = await _this.sablier.interestOf({ streamId, amount: deposit });
      result.senderInterest.should.be.bignumber.equal(0);
      result.recipientInterest.should.be.bignumber.equal(0);
      result.sablierInterest.should.be.bignumber.equal(0);
    });
  });

  describe("when the stream does not exist", () => {
    it("reverts", async () => {
      const streamId = new BigNumber(419863);
      await truffleAssert.reverts(_this.sablier.interestOf({ streamId, amount: deposit }), "stream does not exist");
    });
  });
});
