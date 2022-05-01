/* eslint-disable global-require */

context('sablier.behavior.context', () => {
  /* describe("initialization", function() {
    it("reverts when the cTokenManager contract is the zero address", async function() {
      const opts = { from: alice };
      await beproAssert.reverts(
        () => Sablier.new(ZERO_ADDRESS, opts),
        "cTokenManager contract is the zero address",
      );
    });
  }); */

  describe('admin functions', () => {
    require('./admin/UpdateFee');
    require('./admin/TakeEarnings');
  });

  describe('view functions', () => {
    require('./view/GetStream');
    require('./view/DeltaOf');
    require('./view/BalanceOf');
    require('./view/IsCompoundingStream');
    require('./view/GetCompoundingStream');
    require('./view/InterestOf');
    require('./view/GetEarnings');
  });

  describe('effects & interactions functions', () => {
    require('./effects/stream/CreateStream');
    require('./effects/compoundingStream/CreateCompoundingStream');
    require('./effects/stream/WithdrawFromStream');
    require('./effects/compoundingStream/WithdrawFromCompoundingStream');
    require('./effects/stream/CancelStream');
    require('./effects/compoundingStream/CancelCompoundingStream');
  });
});
