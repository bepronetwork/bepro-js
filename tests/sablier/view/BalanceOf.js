//const { devConstants, mochaContexts } = require("@sablier/dev-utils");
const project_root = process.cwd();
const { dappConstants, devConstants, mochaContexts } = require(project_root + "/src/sablier/dev-utils");
const BigNumber = require("bignumber.js");
const dayjs = require("dayjs");
const truffleAssert = require("truffle-assertions");
import Numbers from "../../../build/utils/Numbers";

const { FIVE_UNITS, STANDARD_SALARY, STANDARD_SCALE, STANDARD_TIME_OFFSET, STANDARD_TIME_DELTA } = dappConstants;
const { contextForStreamDidEnd, contextForStreamDidStartButNotEnd } = mochaContexts;

import { expect, assert } from "chai";

function shouldBehaveLikeBalanceOf(_this) { //alice, bob, carol) {
  const sender = _this.alice;
  //const opts = { from: sender };
  const now = new BigNumber(dayjs().unix());
  
  describe("when the stream exists", () => { //function() {
    const alice = _this.alice;
	const bob = _this.bob;
	const carol = _this.carol;
	
	console.log('---sablier.BalanceOf. alice: ', alice);
	
	let streamId;
    const recipient = bob;
	console.log('---sablier.BalanceOf. recipient: ', recipient);
    const deposit = STANDARD_SALARY.toString(10);
    const startTime = now.plus(STANDARD_TIME_OFFSET);
    const stopTime = startTime.plus(STANDARD_TIME_DELTA);
	console.log('---sablier.BalanceOf.startTime: ', startTime);
	
    beforeEach(async () => { //async function() {
	  console.log('---sablier.balanceOf.beforeEach.bp0');
      await _this.token.approve({ address: _this.sablier.getAddress(), amount: deposit });
	  console.log('---sablier.balanceOf.beforeEach.bp1');
      const result = await _this.sablier.createStream({ recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime });
      // streamId = Number(result.logs[0].args.streamId);
	  streamId = Number(result.events.CreateStream.returnValues.streamId);
	  console.log('---BalanceOf.streamId: ', streamId);
    });

    describe("when the stream did not start", () => { //function() {
      it("returns the whole deposit for the sender of the stream", async () => { //async function() {
        //console.log('---sablier.balanceOf.sender: ', sender);
		const balance = await _this.sablier.balanceOf({ streamId, who: sender });
        //console.log('---sablier.balanceOf.balance: ', balance);
		balance.should.be.bignumber.equal(deposit);
      });

      it("returns 0 for the recipient of the stream", async () => { //async function() {
        const balance = await _this.sablier.balanceOf({ streamId, who: recipient });
        balance.should.be.bignumber.equal(new BigNumber(0));
      });

      it("returns 0 for anyone else", async () => { //async function() {
        const balance = await _this.sablier.balanceOf({ streamId, who: carol });
        balance.should.be.bignumber.equal(new BigNumber(0));
      });
    });

    contextForStreamDidStartButNotEnd( () => {
      const streamedAmount = FIVE_UNITS.toString(10);
	  
      it("returns the pro rata balance for the sender of the stream", async () => {
        const balance = await _this.sablier.balanceOf({ streamId, who: sender });
		//console.log('---sablier.balanceOf.balance: ', balance);
        //expect(balance.toString()).to.equal(STANDARD_SALARY.minus(streamedAmount).toString());
		/*const tolerateByAddition = false;
        balance.should.tolerateTheBlockTimeVariation(
          STANDARD_SALARY.minus(streamedAmount),
          STANDARD_SCALE,
          tolerateByAddition,
        );*/
		const decimals = 18;
		const devStreamedAmount = devConstants.FIVE_UNITS.toString(10);
		expect(Numbers.toSmartContractDecimals(balance, decimals).toString()).to.equal(
		  Numbers.fromExponential(devConstants.STANDARD_SALARY.minus(devStreamedAmount)).toString());
      });

      it("returns the pro rata balance for the recipient of the stream", async () => {
        const balance = await _this.sablier.balanceOf({ streamId, who: recipient });
        balance.should.tolerateTheBlockTimeVariation(streamedAmount, STANDARD_SCALE);
      });

      it("returns 0 for anyone else", async () => {
	    const balance = await _this.sablier.balanceOf({ streamId, who: carol });
        balance.should.be.bignumber.equal(new BigNumber(0));
      });
    });

    contextForStreamDidEnd( () => {
      it("returns 0 for the sender of the stream", async () => {
        const balance = await _this.sablier.balanceOf({ streamId, who: sender });
        balance.should.be.bignumber.equal(new BigNumber(0));
      });

      it("returns the whole deposit for the recipient of the stream", async () => {
        const balance = await _this.sablier.balanceOf({ streamId, who: recipient });
        balance.should.be.bignumber.equal(STANDARD_SALARY);
      });

      it("returns 0 for anyone else", async () => {
        const balance = await _this.sablier.balanceOf({ streamId, who: carol });
        balance.should.be.bignumber.equal(new BigNumber(0));
      });
    });
  });

  describe("when the stream does not exist", () => {
    it("reverts", async () => {
      const streamId = new BigNumber(419863);
      await truffleAssert.reverts(_this.sablier.balanceOf({ streamId, who: sender }), "stream does not exist");
    });
  });
}

module.exports = shouldBehaveLikeBalanceOf;
