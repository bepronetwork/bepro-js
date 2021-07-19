//const { devConstants } = require("@sablier/dev-utils");
const project_root = process.cwd();
const { devConstants } = require(project_root + "/src/sablier/dev-utils");

const truffleAssert = require("truffle-assertions");

const shouldBehaveLikeUpdateFee = require("./admin/UpdateFee");
const shouldBehaveLikeTakeEarnings = require("./admin/TakeEarnings");

const shouldBehaveLikeDeltaOf = require("./view/DeltaOf");
const shouldBehaveLikeBalanceOf = require("./view/BalanceOf");
const shouldBehaveLikeGetStream = require("./view/GetStream");
const shouldBehaveLikeGetCompoundingStream = require("./view/GetCompoundingStream");
const shouldBehaveLikeInterestOf = require("./view/InterestOf");
const shouldBehaveLikeGetEarnings = require("./view/GetEarnings");
const shouldBehaveLikeIsCompoundingStream = require("./view/IsCompoundingStream");

const shouldBehaveLikeERC1620CreateStream = require("./effects/stream/CreateStream");
const shouldBehaveLikeCreateCompoundingStream = require("./effects/compoundingStream/CreateCompoundingStream");
const shouldBehaveLikeERC1620WithdrawFromStream = require("./effects/stream/WithdrawFromStream");
// eslint-disable-next-line max-len
const shouldBehaveLikeWithdrawFromCompoundingStream = require("./effects/compoundingStream/WithdrawFromCompoundingStream");
const shouldBehaveLikeERC1620CancelStream = require("./effects/stream/CancelStream");
const shouldBehaveLikeCancelCompoundingStream = require("./effects/compoundingStream/CancelCompoundingStream");

//const Sablier = artifacts.require("./Sablier.sol");
//const { ZERO_ADDRESS } = devConstants;

function shouldBehaveLikeSablier(_this) { //alice, bob, carol, eve) {
//const shouldBehaveLikeSablier = (_this) => {
  /*describe("initialization", function() {
    it("reverts when the cTokenManager contract is the zero address", async function() {
      const opts = { from: alice };
      await truffleAssert.reverts(Sablier.new(ZERO_ADDRESS, opts), "cTokenManager contract is the zero address");
    });
  });*/
  //const sablier = _this.sablier;
  //const erc20Contract = _this.erc20Contract;
  
  describe("admin functions", () => {
    describe("updateFee", () => {
      shouldBehaveLikeUpdateFee(_this); //alice, eve);
    });

    describe("takeEarnings", () => {
      shouldBehaveLikeTakeEarnings(_this); //alice, bob, eve);
    });
  });

  describe("view functions", () => { //function() {
    describe("getStream", () => { //function() {
      shouldBehaveLikeGetStream(_this); //alice);
    });

    describe("deltaOf", () => { //function() {
      shouldBehaveLikeDeltaOf(_this); //alice, bob);
    });

    describe("balanceOf", () => { //function() {
      shouldBehaveLikeBalanceOf(_this); //alice, bob, carol);
    });

    describe("isCompoundingStream", () => { //function() {
      shouldBehaveLikeIsCompoundingStream(_this); //alice, bob);
    });

    describe("getCompoundingStream", () => { //function() {
      shouldBehaveLikeGetCompoundingStream(_this); //alice, bob);
    });

    describe("interestOf", () => { //function() {
      shouldBehaveLikeInterestOf(_this); //alice, bob);
    });

    describe("getEarnings", () => { //function() {
      shouldBehaveLikeGetEarnings(_this); //alice);
    });
  });

  describe("effects & interactions functions", () => { //function() {
    describe("createStream", () => { //function() {
      shouldBehaveLikeERC1620CreateStream(_this); //alice, bob);
    });

    describe("createCompoundingStream", () => { //function() {
      shouldBehaveLikeCreateCompoundingStream(_this); //alice, bob);
    });

    describe("withdrawFromStream", () => { //function() {
      shouldBehaveLikeERC1620WithdrawFromStream(_this); //alice, bob, eve);
    });

    describe("withdrawFromCompoundingStream", () => { //function() {
      shouldBehaveLikeWithdrawFromCompoundingStream(_this); //alice, bob, eve);
    });

    describe("cancelStream", () => { //function() {
      shouldBehaveLikeERC1620CancelStream(_this); //alice, bob, eve);
    });

    describe("cancelCompoundingStream", () => { //function() {
      shouldBehaveLikeCancelCompoundingStream(_this); //alice, bob, eve);
    });
  });
}

module.exports = shouldBehaveLikeSablier;
