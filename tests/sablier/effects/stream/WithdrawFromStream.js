//const { dappConstants, mochaContexts } = require("@sablier/dev-utils");
const project_root = process.cwd();
const { dappConstants, mochaContexts } = require(project_root + "/src/sablier/dev-utils");
const BigNumber = require("bignumber.js");
const dayjs = require("dayjs");
const truffleAssert = require("truffle-assertions");
const beproAssert = require(project_root + "/src/utils/beproAssert");

const { contextForStreamDidEnd, contextForStreamDidStartButNotEnd } = mochaContexts;
const { FIVE_UNITS, STANDARD_SALARY, STANDARD_SCALE, STANDARD_TIME_OFFSET, STANDARD_TIME_DELTA } = dappConstants;

let streamId;
let recipient;
let deposit;
let sender;

function runTests(_this) {
  describe("when not paused", () => {
    describe("when the withdrawal amount is higher than 0", () => {
      describe("when the stream did not start", () => {
        const withdrawalAmount = FIVE_UNITS.toString(10);

        it("reverts", async () => {
          await truffleAssert.reverts(
            _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount }),
            "amount exceeds the available balance",
          );
        });
      });

      contextForStreamDidStartButNotEnd(() => {
        describe("when the withdrawal amount does not exceed the available balance", () => {
          const withdrawalAmount = FIVE_UNITS.toString(10);

          it("withdraws from the stream", async () => {
            const balance = await _this.token.balanceOf(recipient);
            await _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount });
            const newBalance = await _this.token.balanceOf(recipient);
            newBalance.should.be.bignumber.equal(new BigNumber(balance).plus(FIVE_UNITS));
          });

          it("emits a withdrawfromstream event", async () => {
            const result = await _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount });
            //truffleAssert.eventEmitted(result, "WithdrawFromStream");
			beproAssert.eventEmitted(result, "WithdrawFromStream");
          });

          it("decreases the stream balance", async () => {
            const balance = await _this.sablier.balanceOf({ streamId, who: recipient });
            await _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount });
            const newBalance = await _this.sablier.balanceOf({ streamId, who: recipient });
            // Intuitively, one may say we don't have to tolerate the block time variation here.
            // However, the Sablier balance for the recipient can only go up from the bottom
            // low of `balance` - `amount`, due to uncontrollable runtime costs.
            newBalance.should.tolerateTheBlockTimeVariation(new BigNumber(balance).minus(withdrawalAmount), STANDARD_SCALE);
          });
        });

        describe("when the withdrawal amount exceeds the available balance", () => {
          const withdrawalAmount = FIVE_UNITS.multipliedBy(2).toString(10);

          it("reverts", async () => {
            await truffleAssert.reverts(
              _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount }),
              "amount exceeds the available balance",
            );
          });
        });
      });

      contextForStreamDidEnd(() => {
        describe("when the withdrawal amount does not exceed the available balance", () => {
          describe("when the balance is not withdrawn in full", () => {
            const withdrawalAmount = STANDARD_SALARY.dividedBy(2).toString(10);

            it("withdraws from the stream", async () => {
              const balance = await _this.token.balanceOf(recipient);
              await _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount });
              const newBalance = await _this.token.balanceOf(recipient);
              newBalance.should.be.bignumber.equal(new BigNumber(balance).plus(withdrawalAmount));
            });

            it("emits a withdrawfromstream event", async () => {
              const result = await _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount });
              //truffleAssert.eventEmitted(result, "WithdrawFromStream");
			  beproAssert.eventEmitted(result, "WithdrawFromStream");
            });

            it("decreases the stream balance", async () => {
              const balance = await _this.sablier.balanceOf({ streamId, who: recipient });
              await _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount });
              const newBalance = await _this.sablier.balanceOf({ streamId, who: recipient });
              newBalance.should.be.bignumber.equal(new BigNumber(balance).minus(withdrawalAmount));
            });
          });

          describe("when the balance is withdrawn in full", () => {
            const withdrawalAmount = STANDARD_SALARY.toString(10);

            it("withdraws from the stream", async () => {
              const balance = await _this.token.balanceOf(recipient);
              await _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount });
              const newBalance = await _this.token.balanceOf(recipient);
              newBalance.should.be.bignumber.equal(new BigNumber(balance).plus(withdrawalAmount));
            });

            it("emits a withdrawfromstream event", async () => {
              const result = await _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount });
              //truffleAssert.eventEmitted(result, "WithdrawFromStream");
			  beproAssert.eventEmitted(result, "WithdrawFromStream");
            });

            it("deletes the stream object", async () => {
              await _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount });
              await truffleAssert.reverts(_this.sablier.getStream({ streamId }), "stream does not exist");
            });
          });
        });

        describe("when the withdrawal amount exceeds the available balance", () => {
          const withdrawalAmount = STANDARD_SALARY.plus(FIVE_UNITS).toString(10);

          it("reverts", async () => {
            await truffleAssert.reverts(
              _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount }),
              "amount exceeds the available balance",
            );
          });
        });
      });
    });

    describe("when the withdrawal amount is zero", () => {
      const withdrawalAmount = new BigNumber(0).toString(10);

      it("reverts", async () => {
        await truffleAssert.reverts(
          _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount }),
          "amount is zero",
        );
      });
    });
  });

  describe("when paused", () => {
    const withdrawalAmount = FIVE_UNITS.toString(10);

    beforeEach(async () => {
      // Note that `sender` coincides with the owner of the contract
      await _this.sablier.pause(); //({ from: _this.sender });
    });

    it("reverts", async () => {
      await truffleAssert.reverts(
        _this.sablier.withdrawFromStream({ streamId, amount: withdrawalAmount }),
        "Pausable: paused",
      );
    });
	
	afterEach(async () => {
      // Note that `sender` coincides with the owner of the contract
      await _this.sablier.unpause(); //({ from: _this.sender });
    });
  });
}

function shouldBehaveLikeERC1620WithdrawFromStream(_this) { //alice, bob, eve) {
  const alice = _this.alice;
  const bob = _this.bob;
  const eve = _this.eve;
  const now = new BigNumber(dayjs().unix());

  describe("when the stream exists", () => {
    const startTime = now.plus(STANDARD_TIME_OFFSET);
    const stopTime = startTime.plus(STANDARD_TIME_DELTA);

    beforeEach(async () => {
      sender = alice;
      recipient = bob;
      deposit = STANDARD_SALARY.toString(10);
      //const opts = { from: this.sender };
      await _this.token.approve({ address: _this.sablier.getAddress(), amount: deposit });
      const result = await _this.sablier.createStream({
        recipient,
        deposit,
        tokenAddress: _this.token.getAddress(),
        startTime,
        stopTime,
      });
	  streamId = Number(result.events.CreateStream.returnValues.streamId);
	  console.log('---WithdrawFromStream.streamId: ', streamId);
    });

    describe("when the caller is the sender of the stream", () => {
      beforeEach(() => {
        //this.opts = { from: this.sender };
      });

      runTests(_this);
    });

    /*describe("when the caller is the recipient of the stream", () => {
      beforeEach(() => {
        this.opts = { from: this.recipient };
      });

      runTests();
    });*/

    /*describe("when the caller is not the sender or the recipient of the stream", () => {
      const opts = { from: eve };

      it("reverts", async () => {
        await truffleAssert.reverts(
          this.sablier.withdrawFromStream(this.streamId, FIVE_UNITS, opts),
          "caller is not the sender or the recipient of the stream",
        );
      });
    });*/
  });

  describe("when the stream does not exist", () => {
    const recipient = bob;
    //const opts = { from: recipient };

    it("reverts", async () => {
      const streamId = new BigNumber(419863);
      await truffleAssert.reverts(_this.sablier.withdrawFromStream({ streamId, amount: FIVE_UNITS }), "stream does not exist");
    });
  });
}

module.exports = shouldBehaveLikeERC1620WithdrawFromStream;
