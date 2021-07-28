const truffleAssert = require("truffle-assertions");

function shouldBehaveLikeGetEarnings(_this) { //alice) {
  const alice = _this.alice;
  const sender = alice;
  //const opts = { from: sender };

  /*describe("when the ctoken is not whitelisted", () => { //function() {
    it("reverts", async () => { //async function() {
      await truffleAssert.reverts(_this.sablier.getEarnings({ tokenAddress: _this.token.getAddress() }), "token is not cToken");
    });
  });*/
}

module.exports = shouldBehaveLikeGetEarnings;
