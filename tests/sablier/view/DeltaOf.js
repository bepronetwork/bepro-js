//const { dappConstants, mochaContexts } = require("@sablier/dev-utils");
const project_root = process.cwd();
const { dappConstants, mochaContexts } = require(project_root + "/src/sablier/dev-utils");
const BigNumber = require("bignumber.js");
const dayjs = require("dayjs");
const truffleAssert = require("truffle-assertions");

const { STANDARD_SALARY, STANDARD_TIME_OFFSET, STANDARD_TIME_DELTA } = dappConstants;
const { contextForStreamDidEnd, contextForStreamDidStartButNotEnd } = mochaContexts;

import { expect, assert } from "chai";

function shouldBehaveLikeDeltaOf(_this) { //alice, bob) {
  //const sender = alice;
  //const opts = { from: sender };
  const now = new BigNumber(dayjs().unix());

  describe("when the stream exists", () => { //function() {
    let streamId;
    const recipient = _this.bob;
    const deposit = STANDARD_SALARY.toString(10);
    const startTime = now.plus(STANDARD_TIME_OFFSET);
    const stopTime = startTime.plus(STANDARD_TIME_DELTA);

    beforeEach(async () => { //async function() {
      await _this.token.approve({ address: _this.sablier.getAddress(), amount: deposit });
	  console.log('---DeltaOf.bp0');
      const result = await _this.sablier.createStream({ recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime });
      //console.log('---DeltaOf.streamId.bp0: ', result); //.events[0].returnValues);
	  // streamId = Number(result.logs[0].args.streamId);
	  streamId = Number(result.events.CreateStream.returnValues.streamId);
	  console.log('---DeltaOf.streamId: ', streamId);
    });

    describe("when the stream did not start", () => { //function() {
      it("returns 0", async () => { //async function() {
        const delta = await _this.sablier.deltaOf({ streamId });
        delta.should.be.bignumber.equal(new BigNumber(0));
		//expect(delta).to.equal((0).toString());
      });
    });

    contextForStreamDidStartButNotEnd(() => {
      it("returns the time the number of seconds that passed since the start time", async () => {
        const delta = await _this.sablier.deltaOf({ streamId });
        console.log('---DeltaOf.bp2');
		delta.should.bignumber.satisfy(function(num) {
          //return num.isEqualTo(new BigNumber(5)) || num.isEqualTo(new BigNumber(5).plus(1));
		  return new BigNumber(num).isEqualTo(new BigNumber(5)) || new BigNumber(num).isEqualTo(new BigNumber(5).plus(1));
        });
		console.log('---DeltaOf.bp3');
      });
    });

    contextForStreamDidEnd(() => {
      it("returns the difference between the stop time and the start time", async () => {
        const delta = await _this.sablier.deltaOf({ streamId });
        delta.should.be.bignumber.equal(stopTime.minus(startTime));
      });
    });
  });

  describe("when the stream does not exist", () => {
    it("reverts", async () => {
      const streamId = new BigNumber(419863);
      await truffleAssert.reverts(_this.sablier.deltaOf({ streamId }), "stream does not exist");
    });
  });
}

module.exports = shouldBehaveLikeDeltaOf;
