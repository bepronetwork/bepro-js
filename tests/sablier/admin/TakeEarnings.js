/* eslint-disable no-await-in-loop */
//const { dappConstants, mochaContexts } = require("./sablier/dev-utils");
const project_root = process.cwd();
const { dappConstants, devConstants, mochaContexts } = require(project_root + "/src/sablier/dev-utils");
const BigNumber = require("bignumber.js");
const dayjs = require("dayjs");
const truffleAssert = require("truffle-assertions");
const beproAssert = require(project_root + "/src/utils/beproAssert");

const {
  FIVE_UNITS_CTOKEN,
  STANDARD_RECIPIENT_SHARE_PERCENTAGE,
  STANDARD_SALARY_CTOKEN,
  STANDARD_SABLIER_FEE,
  STANDARD_SENDER_SHARE_PERCENTAGE,
  STANDARD_SUPPLY_AMOUNT,
  STANDARD_TIME_DELTA,
  STANDARD_TIME_OFFSET,
} = dappConstants;
const { contextForStreamDidStartButNotEnd } = mochaContexts;

function shouldBehaveLikeTakeEarnings(_this) { //alice, bob, eve) {
//const shouldBehaveLikeTakeEarnings = (_this) => {
  const alice = _this.alice;
  const bob = _this.bob;
  const eve = _this.eve;
  //const admin = alice;

  describe("when the caller is the admin", () => {
    //const opts = { from: admin };
	console.log('---shouldBehaveLikeTakeEarnings.web3: ', (web3 != null));

    beforeEach(async () => {
      await _this.sablier.updateFee({ feePercentage: STANDARD_SABLIER_FEE });
    });

    describe("when the cToken is whitelisted", () => {
      beforeEach(async () => {
        //await this.cTokenManager.whitelistCToken(this.cToken.address, opts);
      });

      describe("when the amount does not exceed the available balance", () => {
        console.log('---TakeEarnings.bp0');
		let streamId;
        const recipient = bob;
        const deposit = STANDARD_SALARY_CTOKEN.toString(10);
        const senderSharePercentage = STANDARD_SENDER_SHARE_PERCENTAGE;
        const recipientSharePercentage = STANDARD_RECIPIENT_SHARE_PERCENTAGE;
        const now = new BigNumber(dayjs().unix());
        const startTime = now.plus(STANDARD_TIME_OFFSET);
        const stopTime = startTime.plus(STANDARD_TIME_DELTA);
		console.log('---TakeEarnings.bp1');
		console.log('---TakeEarnings.now      : ', now);
		console.log('---TakeEarnings.startTime: ', startTime);
		console.log('---TakeEarnings.stopTime : ', stopTime);
		
        beforeEach(async () => {
		  console.log('---TakeEarnings.beforeEach.bp0.deposit: ', deposit);
		  await _this.cToken.approve({ address: _this.sablier.getAddress(), amount: deposit });
		   const allowance = await _this.cToken.allowance({ address: _this.userAddress, spenderAddress: _this.sablier.getAddress() });
		   console.log('---TakeEarnings.beforeEach.cToken.allowance: ', allowance);
		  console.log('---TakeEarnings.beforeEach.bp1');
          const result = await _this.sablier.createCompoundingStream({
            recipient,
            deposit,
            tokenAddress: _this.cToken.getAddress(),
            startTime,
            stopTime,
            senderSharePercentage,
            recipientSharePercentage,
          });
		   //const res = await beproAssert.createTransactionResult(_this.sablier.getWeb3Contract(), result.transactionHash);
		   //console.log('---TakeEarnings.result.beproAssert\n', res);
		   //const res2 = await truffleAssert.createTransactionResult(_this.sablier.getWeb3Contract(), result.transactionHash);
		   //console.log('---TakeEarnings.result.truffleAssert\n', res2);
		  //console.log('---TakeEarnings.result.bp0\n', result);
		  //console.log('---TakeEarnings.result.bp2\n', result.events.CreateCompoundingStream.returnValues);
          //streamId = Number(result.logs[0].args.streamId);
		  streamId = Number(result.events.CreateStream.returnValues.streamId);
		  console.log('---TakeEarnings.result.streamId:', streamId);
          await _this.token.approve({ address: _this.cToken.getAddress(), amount: STANDARD_SUPPLY_AMOUNT.toString(10) });
          await _this.cToken.supplyUnderlying(STANDARD_SUPPLY_AMOUNT.toString(10));
        });
		
		describe("when the amount is not zero", () => {
          const amount = FIVE_UNITS_CTOKEN.toString(10);

		  contextForStreamDidStartButNotEnd(() => {
            it("takes the earnings", async () => {
			  /*let precision = '1e' + 8;
			  let test = 17640000253575;
			  let p1 = (test / precision);
			  let p2 = p1 + 1;
			  console.log('...take the earnings.TEST.precision: ', precision, ' >> ', p1);
			  console.log('...take the earnings.TEST.p2: ', p2);
			  let f0 = parseFloat('17640000253575');
			  let f1 = Number(parseFloat(test).toPrecision(8)); // truncates to first 8 digits from the left
			  let f2 = f1 + 1;
			  console.log('...take the earnings.TEST.f0: ', f0);
	          console.log('...take the earnings.TEST.f1: ', f1);
			  console.log('...take the earnings.TEST.f2: ', f2);
			  let f3 = f0.toFixed(8); //string
			  let f4 = Number(f0.toFixed(8)); //number
			  let f5 = f3 + 1;
			  let f6 = f4 + 1;
	          console.log('...take the earnings.TEST.f3: ', f3);
			  console.log('...take the earnings.TEST.f4: ', f4);
			  console.log('...take the earnings.TEST.f5: ', f5);
			  console.log('...take the earnings.TEST.f6: ', f6);
			  */
			  const balance0 = await _this.cToken.balanceOf(_this.userAddress);
			  console.log('---take the earnings.bp0.balance0: ', balance0);
			  console.log('---take the earnings.bp0. streamId | amount: ', streamId, ' | ', amount);
              await _this.sablier.withdrawFromStream({ streamId, amount });
			  console.log('---take the earnings.bp1');
              const balance = await _this.cToken.balanceOf(_this.userAddress); //balanceOf(admin);
			  console.log('---take the earnings.bp2.balance: ', balance);
              const earningsAmount = await _this.sablier.getEarnings({ tokenAddress: _this.cToken.getAddress() });
			  console.log('---take the earnings.bp3.earningsAmount: ', earningsAmount);
              await _this.sablier.takeEarnings({ tokenAddress: _this.cToken.getAddress(), amount: earningsAmount });
			  console.log('---take the earnings.bp4');
              const newBalance = await _this.cToken.balanceOf(_this.userAddress); //balanceOf(admin);
			  console.log('---take the earnings.bp5.newBalance: ', newBalance);
              balance.should.be.bignumber.equal((new BigNumber(newBalance)).minus(earningsAmount));
			  console.log('---take the earnings.bp6');
            });
          });
        });
		
        describe("when the amount is zero", () => {
          const amount = new BigNumber(0).toString(10);
		  console.log('---TakeEarnings.bp3.amount: ', amount);
		  
          it("reverts", async () => {
            await truffleAssert.reverts(_this.sablier.takeEarnings({ tokenAddress: _this.cToken.getAddress(), amount }), "amount is zero");
          });
        });
      });

      describe("when the amount exceeds the available balance", () => {
        const amount = new BigNumber(8123101);

        it("reverts", async () => {
          await truffleAssert.reverts(
            _this.sablier.takeEarnings({ tokenAddress: _this.cToken.getAddress(), amount }),
            "amount exceeds the available balance",
          );
        });
      });
    });

    /*describe("when the cToken is not whitelisted", function() {
      const amount = new BigNumber(8123101);

      it("reverts", async function() {
        await truffleAssert.reverts(
          this.sablier.takeEarnings(this.cToken.address, amount, opts),
          "cToken is not whitelisted",
        );
      });
    });*/
  });
  
  describe("when the stream does not exist", () => {
    it("reverts", async () => {
      const streamId = new BigNumber(419863);
      await truffleAssert.reverts(_this.sablier.getStream({ streamId }), "stream does not exist");
    });
  });
  
  /*describe("when the caller is not the admin", function() {
    const opts = { from: eve };
    const amount = new BigNumber(8123101);

    it("reverts", async function() {
      await truffleAssert.reverts(
        this.sablier.takeEarnings(this.cToken.address, amount, opts),
        truffleAssert.ErrorType.REVERT,
      );
    });
  });*/
}

module.exports = shouldBehaveLikeTakeEarnings;
