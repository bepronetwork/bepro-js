const BigNumber = require("bignumber.js");
const truffleAssert = require("truffle-assertions");

function shouldBehaveLikeGetStream(_this) { //alice) {
  //const sender = alice;
  //const opts = { from: sender };

  describe("when the stream does not exist", () => {
    it("reverts", async () => {
      const streamId = new BigNumber(419863);
      await truffleAssert.reverts(_this.sablier.getStream({ streamId }), "stream does not exist");
    });
  });
}

module.exports = shouldBehaveLikeGetStream;
