//const { devConstants } = require("@sablier/dev-utils");
const project_root = process.cwd();
const { dappConstants } = require(project_root + "/src/sablier/dev-utils");

const BigNumber = require("bignumber.js");
const truffleAssert = require("truffle-assertions");

const { STANDARD_SABLIER_FEE } = dappConstants;
import { expect, assert } from "chai";

function shouldBehaveLikeUpdateFee(_this) { //alice, eve) {
	console.log('---sablier.BalanceOf. alice: ', _this.alice);
  //const admin = alice;
  
  describe("when the caller is the admin", () => {//function() {
    //const opts = { from: admin };

    describe("when the fee is a valid percentage", () => {//function() {
	  console.log('---sablier.BalanceOf.bp1 alice: ', _this.alice);
	  const newFee = STANDARD_SABLIER_FEE;

      it("updates the fee", async () => {//async function() {
        await _this.sablier.updateFee({ feePercentage: newFee }); //, opts);
		const result = await _this.sablier.fee();
		console.log('---updates the fee.result: ' + result);
		// The new fee is a mantissa
		result.should.be.bignumber.equal(newFee); //.multipliedBy(1e16));
		//expect((new BigNumber(result)).toString()).to.equal(newFee.multipliedBy(1e16).toString());
      });
    });

    describe("when the fee is not a valid percentage", () => {//function() {
      it("reverts", async () => {//async function() {
        const newFee = new BigNumber(110);
		await truffleAssert.reverts(_this.sablier.updateFee({ feePercentage: newFee }), "fee percentage higher than 100%");
      });
    });
  });

  /*describe("when the caller is not the admin", async () => {//function() {
    const opts = { from: eve };
    const newFee = STANDARD_SABLIER_FEE;

    it("reverts", async function() {
      await truffleAssert.reverts(this.sablier.updateFee(newFee, opts), truffleAssert.ErrorType.REVERT);
    });
  });*/
}

module.exports = shouldBehaveLikeUpdateFee;
