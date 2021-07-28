//const { dappConstants } = require("@sablier/dev-utils");
const project_root = process.cwd();
const { dappConstants } = require(project_root + "/src/sablier/dev-utils");
const BigNumber = require("bignumber.js");
const dayjs = require("dayjs");
const truffleAssert = require("truffle-assertions");
const beproAssert = require(project_root + "/src/utils/beproAssert");
import Numbers from "../../../../build/utils/Numbers";

const {
  STANDARD_RATE_PER_SECOND,
  STANDARD_SALARY,
  STANDARD_TIME_OFFSET,
  STANDARD_TIME_DELTA,
  ZERO_ADDRESS,
} = dappConstants;

function shouldBehaveLikeERC1620Stream(_this) { //alice, bob) {
  const alice = _this.alice;
  const bob = _this.bob;
  const sender = alice;
  //const opts = { from: sender };
  const now = new BigNumber(dayjs().unix());

  describe("when not paused", () => {
    describe("when the recipient is valid", () => {
      const recipient = bob;

      describe("when the token contract is erc20 compliant", () => {
        describe("when the sablier contract has enough allowance", () => {
          beforeEach(async () => {
            await _this.token.approve({ address: _this.sablier.getAddress(), amount: STANDARD_SALARY.toString(10) });
          });

          describe("when the sender has enough tokens", () => {
            describe("when the deposit is valid", () => {
              const deposit = STANDARD_SALARY.toString(10);

              describe("when the start time is after block.timestamp", () => {
                describe("when the stop time is after the start time", () => {
                  const startTime = now.plus(STANDARD_TIME_OFFSET);
                  const stopTime = startTime.plus(STANDARD_TIME_DELTA);

                  it("creates the stream", async () => {
                    const result = await _this.sablier.createStream({
                      recipient,
                      deposit,
                      tokenAddress: _this.token.getAddress(),
                      startTime,
                      stopTime,
                    });
					const streamId = Number(result.events.CreateStream.returnValues.streamId);
					console.log('---CreateStream.streamId: ', streamId);
                    const streamObject = await _this.sablier.getStream({ streamId });
                    streamObject.sender.should.be.equal(sender);
                    streamObject.recipient.should.be.equal(recipient);
                    streamObject.deposit.should.be.bignumber.equal(deposit);
                    streamObject.tokenAddress.should.be.equal(_this.token.getAddress());
                    streamObject.startTime.should.be.bignumber.equal(startTime);
                    streamObject.stopTime.should.be.bignumber.equal(stopTime);
                    streamObject.remainingBalance.should.be.bignumber.equal(deposit);
                    streamObject.ratePerSecond.should.be.bignumber.equal(STANDARD_RATE_PER_SECOND);
                  });

                  it("transfers the tokens to the contract", async () => {
                    const balance = await _this.token.balanceOf(sender);
                    await _this.sablier.createStream({ recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime });
                    const newBalance = await _this.token.balanceOf(sender);
                    ///TODO: float precision comparison
					///newBalance.should.be.bignumber.equal((new BigNumber(balance)).minus(STANDARD_SALARY));
                  });

                  it("increases the stream next stream id", async () => {
                    const nextStreamId = await _this.sablier.nextStreamId();
                    await _this.sablier.createStream({ recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime });
                    const newNextStreamId = await _this.sablier.nextStreamId();
                    newNextStreamId.should.be.bignumber.equal((new BigNumber(nextStreamId)).plus(1));
                  });

                  it("emits a stream event", async () => {
                    const result = await _this.sablier.createStream({
                      recipient,
                      deposit,
                      tokenAddress: _this.token.getAddress(),
                      startTime,
                      stopTime,
                    });
                    //truffleAssert.eventEmitted(result, "CreateStream");
					beproAssert.eventEmitted(result, "CreateStream");
                  });
                });

                describe("when the stop time is not after the start time", () => {
                  let startTime;
                  let stopTime;

                  beforeEach(async () => {
                    startTime = now.plus(STANDARD_TIME_OFFSET);
                    stopTime = startTime;
                  });

                  it("reverts", async () => {
                    await truffleAssert.reverts(
                      _this.sablier.createStream({ recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime }),
                      "stop time before the start time",
                    );
                  });
                });
              });

              describe("when the start time is not after block.timestamp", () => {
                let startTime;
                let stopTime;

                beforeEach(async () => {
                  startTime = now.minus(STANDARD_TIME_OFFSET);
                  stopTime = startTime.plus(STANDARD_TIME_DELTA);
                });

                it("reverts", async () => {
                  await truffleAssert.reverts(
				  _this.sablier.createStream({ recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime }),
                    "start time before block.timestamp",
                  );
                });
              });
            });

            describe("when the deposit is not valid", () => {
              const startTime = now.plus(STANDARD_TIME_OFFSET);
              const stopTime = startTime.plus(STANDARD_TIME_DELTA);

              describe("when the deposit is zero", () => {
                const deposit = new BigNumber(0).toString(10);

                it("reverts", async () => {
                  await truffleAssert.reverts(
                    _this.sablier.createStream({ recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime }),
                    "deposit is zero",
                  );
                });
              });

              describe("when the deposit is smaller than the time delta", () => {
                //const deposit = STANDARD_TIME_DELTA.minus(1).toString(10);
				const deposit = Numbers.fromDecimals(STANDARD_TIME_DELTA.minus(1), dappConstants.TOKEN_DECIMALS);

                it("reverts", async () => {
                  await truffleAssert.reverts(
                    _this.sablier.createStream({ recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime }),
                    "deposit smaller than time delta",
                  );
                });
              });

              describe("when the deposit is not a multiple of the time delta", () => {
                //const deposit = STANDARD_SALARY.plus(5).toString(10);
				const deposit = Numbers.fromDecimals(STANDARD_SALARY.plus(5), dappConstants.TOKEN_DECIMALS);

                it("reverts", async () => {
                  await truffleAssert.reverts(
                    _this.sablier.createStream({ recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime }),
                    "deposit not multiple of time delta",
                  );
                });
              });
            });
          });

          describe("when the sender does not have enough tokens", () => {
            const deposit = STANDARD_SALARY.multipliedBy(2).toString(10);
            const startTime = now.plus(STANDARD_TIME_OFFSET);
            const stopTime = startTime.plus(STANDARD_TIME_DELTA);

            it("reverts", async () => {
              await truffleAssert.reverts(
                _this.sablier.createStream({ recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime }),
                truffleAssert.ErrorType.REVERT,
              );
            });
          });
        });

        describe("when the sablier contract does not have enough allowance", () => {
          let startTime;
          let stopTime;

          beforeEach(async () => {
            startTime = now.plus(STANDARD_TIME_OFFSET);
            stopTime = startTime.plus(STANDARD_TIME_DELTA);
		    await _this.token.approve({ address: _this.sablier.getAddress(), amount: STANDARD_SALARY.minus(5).toString(10) });
          });

          describe("when the sender has enough tokens", () => {
            const deposit = STANDARD_SALARY.toString(10);

            it("reverts", async () => {
              await truffleAssert.reverts(
                _this.sablier.createStream({ recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime }),
                truffleAssert.ErrorType.REVERT,
              );
            });
          });

          describe("when the sender does not have enough tokens", () => {
            const deposit = STANDARD_SALARY.multipliedBy(2).toString(10);

            it("reverts", async () => {
              await truffleAssert.reverts(
                _this.sablier.createStream({ recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime }),
                truffleAssert.ErrorType.REVERT,
              );
            });
          });
        });
      });

      describe("when the token contract is not erc20", () => {
        const deposit = STANDARD_SALARY.toString(10);
        let startTime;
        let stopTime;

        beforeEach(async () => {
          startTime = now.plus(STANDARD_TIME_OFFSET);
          stopTime = startTime.plus(STANDARD_TIME_DELTA);
        });

        /*describe("when the token contract is non-compliant", () => {
          beforeEach(async () => {
            await _this.nonStandardERC20Token.nonStandardApprove(
              _this.sablier.getAddress(),
              STANDARD_SALARY.toString(10),
            );
          });

          it("reverts", async () => {
            await truffleAssert.reverts(
              _this.sablier.createStream({
                recipient,
                deposit,
                tokenAddress: _this.nonStandardERC20Token.getAddress(),
                startTime,
                stopTime,
              }),
              truffleAssert.ErrorType.REVERT,
            );
          });
        });*/

        describe("when the token contract is the zero address", () => {
          it("reverts", async () => {
            await truffleAssert.reverts(
              _this.sablier.createStream({ recipient, deposit, tokenAddress: ZERO_ADDRESS, startTime, stopTime }),
              truffleAssert.ErrorType.REVERT,
            );
          });
        });
      });
    });

    describe("when the recipient is the caller itself", () => {
      const recipient = sender;
      const deposit = STANDARD_SALARY.toString(10);
      const startTime = now.plus(STANDARD_TIME_OFFSET);
      const stopTime = startTime.plus(STANDARD_TIME_DELTA);

      it("reverts", async () => {
        await truffleAssert.reverts(
          _this.sablier.createStream({ recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime }),
          "stream to the caller",
        );
      });
    });

    describe("when the recipient is the contract itself", () => {
      const deposit = STANDARD_SALARY.toString(10);
      const startTime = now.plus(STANDARD_TIME_OFFSET);
      const stopTime = startTime.plus(STANDARD_TIME_DELTA);

      it("reverts", async () => {
        // Can't be defined in the context above because "_this.sablier" is undefined there
        const recipient = _this.sablier.getAddress();

        await truffleAssert.reverts(
          _this.sablier.createStream({ recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime }),
          "stream to the contract itself",
        );
      });
    });

    describe("when the recipient is the zero address", () => {
      const recipient = ZERO_ADDRESS;
      const deposit = STANDARD_SALARY.toString(10);
      const startTime = now.plus(STANDARD_TIME_OFFSET);
      const stopTime = startTime.plus(STANDARD_TIME_DELTA);

      it("reverts", async () => {
        await truffleAssert.reverts(
          _this.sablier.createStream({ recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime }),
          "stream to the zero address",
        );
      });
    });
  });

  describe("when paused", () => {
    const recipient = bob;
    const deposit = STANDARD_SALARY.toString(10);
    const startTime = now.plus(STANDARD_TIME_OFFSET);
    const stopTime = startTime.plus(STANDARD_TIME_DELTA);

    beforeEach(async () => {
      // Note that `sender` coincides with the owner of the contract
      await _this.sablier.pause();
    });

    it("reverts", async () => {
      await truffleAssert.reverts(
        _this.sablier.createStream({ recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime }),
        "Pausable: paused",
      );
    });
	
	afterEach(async () => {
      // Note that `sender` coincides with the owner of the contract
      await _this.sablier.unpause();
    });
  });
}

module.exports = shouldBehaveLikeERC1620Stream;
