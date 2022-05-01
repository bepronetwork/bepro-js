import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import Numbers from '../../../../build/utils/Numbers';
import { dappConstants } from '../../../../src/sablier/dev-utils';
import beproAssert from '../../../../build/utils/beproAssert';
import sablierUtils from '../../sablier.utils';

const {
  STANDARD_RATE_PER_SECOND,
  STANDARD_SALARY,
  STANDARD_TIME_OFFSET,
  STANDARD_TIME_DELTA,
  ZERO_ADDRESS,
} = dappConstants;

context('sablier.CreateStream.context', async () => {
  // let alice;// = _this.alice;
  // let bob;// = _this.bob;
  let sender;// = alice;
  let recipient; // = bob;
  // const opts = { from: sender };
  let now;// = new BigNumber(dayjs().unix());
  let startTime;// = now.plus(STANDARD_TIME_OFFSET);
  let stopTime;// = startTime.plus(STANDARD_TIME_DELTA);
  const decimals = 18; // sablier token decimals, 18 for ERC20 standard

  before('sablier.CreateStream.before', async () => {
    await sablierUtils.initConfig();
    // alice = _this.alice;
    // bob = _this.bob;
    sender = _this.alice;
    recipient = _this.bob;
    now = new BigNumber(dayjs().unix());
    startTime = now.plus(STANDARD_TIME_OFFSET);
    stopTime = startTime.plus(STANDARD_TIME_DELTA);
    _this.now = now;
  });

  describe('when not paused', () => {
    describe('when the recipient is valid', () => {
      // const recipient = bob;

      describe('when the token contract is erc20 compliant', () => {
        describe('when the sablier contract has enough allowance', () => {
          beforeEach(async () => {
            await _this.token.approve({ address: _this.sablier.getAddress(), amount: STANDARD_SALARY.toString(10) });
          });

          describe('when the sender has enough tokens', () => {
            describe('when the deposit is valid', () => {
              const deposit = STANDARD_SALARY.toString(10);
              const dappRatePerSecondExpected = STANDARD_RATE_PER_SECOND;

              describe('when the start time is after block.timestamp', () => {
                describe('when the stop time is after the start time', () => {
                  /// const startTime = now.plus(STANDARD_TIME_OFFSET);
                  /// const stopTime = startTime.plus(STANDARD_TIME_DELTA);

                  it('creates the stream', async () => {
                    const result = await _this.sablier.createStream({
                      recipient,
                      deposit,
                      tokenAddress: _this.token.getAddress(),
                      startTime,
                      stopTime,
                    });
                    const streamId = Number(result.events.CreateStream.returnValues.streamId);
                    // console.log('---CreateStream.streamId: ', streamId);
                    const streamObject = await _this.sablier.getStream({ streamId });
                    streamObject.sender.should.be.equal(sender);
                    streamObject.recipient.should.be.equal(recipient);
                    streamObject.deposit.should.be.bignumber.equal(deposit);
                    streamObject.tokenAddress.should.be.equal(_this.token.getAddress());
                    streamObject.startTime.should.be.bignumber.equal(startTime);
                    streamObject.stopTime.should.be.bignumber.equal(stopTime);
                    streamObject.remainingBalance.should.be.bignumber.equal(deposit);
                    streamObject.ratePerSecond.should.be.bignumber.equal(dappRatePerSecondExpected);
                  });

                  it('transfers the tokens to the contract', async () => {
                    const balance = await _this.token.balanceOf(sender);
                    await _this.sablier.createStream({
                      recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime,
                    });
                    const newBalance = await _this.token.balanceOf(sender);
                    // console.log('balance1: ', balance.toString());
                    // console.log('newBalance: ', newBalance.toString());
                    // const stdSalaryDecimals = Numbers.fromBNToDecimals(STANDARD_SALARY, decimals);
                    const newBalanceExpected = BigNumber(balance).minus(STANDARD_SALARY); // stdSalaryDecimals);
                    // console.log('newBalanceExpected: ', newBalanceExpected.toString());
                    newBalance.should.be.bignumber.equal(newBalanceExpected);
                  });

                  it('increases the stream next stream id', async () => {
                    const nextStreamId = await _this.sablier.nextStreamId();
                    await _this.sablier.createStream({
                      recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime,
                    });
                    const newNextStreamId = await _this.sablier.nextStreamId();
                    newNextStreamId.should.be.bignumber.equal((new BigNumber(nextStreamId)).plus(1));
                  });

                  it('emits a stream event', async () => {
                    const result = await _this.sablier.createStream({
                      recipient,
                      deposit,
                      tokenAddress: _this.token.getAddress(),
                      startTime,
                      stopTime,
                    });
                    beproAssert.eventEmitted(result, 'CreateStream');
                  });
                });

                describe('when the stop time is not after the start time', () => {
                  let eachStartTime;
                  let eachStopTime;

                  beforeEach(async () => {
                    eachStartTime = now.plus(STANDARD_TIME_OFFSET);
                    eachStopTime = eachStartTime;
                  });

                  it('reverts', async () => {
                    await beproAssert.reverts(
                      () => _this.sablier.createStream({
                        recipient,
                        deposit,
                        tokenAddress: _this.token.getAddress(),
                        startTime: eachStartTime,
                        stopTime: eachStopTime,
                      }),
                      'stop time before the start time',
                    );
                  });
                });
              });

              describe('when the start time is not after block.timestamp', () => {
                let eachStartTime;
                let eachStopTime;

                beforeEach(async () => {
                  eachStartTime = now.minus(STANDARD_TIME_OFFSET);
                  eachStopTime = eachStartTime.plus(STANDARD_TIME_DELTA);
                });

                it('reverts', async () => {
                  await beproAssert.reverts(
                    () => _this.sablier.createStream({
                      recipient,
                      deposit,
                      tokenAddress: _this.token.getAddress(),
                      startTime: eachStartTime,
                      stopTime: eachStopTime,
                    }),
                    'start time before block.timestamp',
                  );
                });
              });
            });

            describe('when the deposit is not valid', () => {
              /// const startTime = now.plus(STANDARD_TIME_OFFSET);
              /// const stopTime = startTime.plus(STANDARD_TIME_DELTA);

              describe('when the deposit is zero', () => {
                const deposit = new BigNumber(0).toString(10);

                it('reverts', async () => {
                  await beproAssert.reverts(
                    () => _this.sablier.createStream({
                      recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime,
                    }),
                    'deposit is zero',
                  );
                });
              });

              describe('when the deposit is smaller than the time delta', () => {
                // const deposit = STANDARD_TIME_DELTA.minus(1).toString(10);
                const deposit = Numbers.fromDecimalsToBN(STANDARD_TIME_DELTA.minus(1), decimals);

                it('reverts', async () => {
                  // console.log('---sablier.CreateStream...bp0. deposit: ', deposit);
                  await beproAssert.reverts(
                    () => _this.sablier.createStream({
                      recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime,
                    }),
                    'deposit smaller than time delta',
                  );
                });
              });

              describe('when the deposit is not a multiple of the time delta', () => {
                const deposit = STANDARD_SALARY.plus(5).toString(10);

                it('reverts', async () => {
                  await beproAssert.reverts(
                    () => _this.sablier.createStream({
                      recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime,
                    }),
                    'deposit not multiple of time delta',
                  );
                });
              });
            });
          });

          describe('when the sender does not have enough tokens', () => {
            const deposit = STANDARD_SALARY.multipliedBy(2).toString(10);
            /// const startTime = now.plus(STANDARD_TIME_OFFSET);
            /// const stopTime = startTime.plus(STANDARD_TIME_DELTA);

            it('reverts', async () => {
              await beproAssert.reverts(
                () => _this.sablier.createStream({
                  recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime,
                }),
                beproAssert.ErrorType.REVERT,
              );
            });
          });
        });

        describe('when the sablier contract does not have enough allowance', () => {
          let eachStartTime;
          let eachStopTime;

          beforeEach(async () => {
            eachStartTime = now.plus(STANDARD_TIME_OFFSET);
            eachStopTime = eachStartTime.plus(STANDARD_TIME_DELTA);
            await _this.token.approve({
              address: _this.sablier.getAddress(),
              amount: STANDARD_SALARY.minus(5).toString(10),
            });
          });

          describe('when the sender has enough tokens', () => {
            const deposit = STANDARD_SALARY.toString(10);

            it('reverts', async () => {
              await beproAssert.reverts(
                () => _this.sablier.createStream({
                  recipient,
                  deposit,
                  tokenAddress: _this.token.getAddress(),
                  startTime: eachStartTime,
                  stopTime: eachStopTime,
                }),
                beproAssert.ErrorType.REVERT,
              );
            });
          });

          describe('when the sender does not have enough tokens', () => {
            const deposit = STANDARD_SALARY.multipliedBy(2).toString(10);

            it('reverts', async () => {
              await beproAssert.reverts(
                () => _this.sablier.createStream({
                  recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime,
                }),
                beproAssert.ErrorType.REVERT,
              );
            });
          });
        });
      });

      describe('when the token contract is not erc20', () => {
        const deposit = STANDARD_SALARY.toString(10);
        let eachStartTime;
        let eachStopTime;

        beforeEach(async () => {
          eachStartTime = now.plus(STANDARD_TIME_OFFSET);
          eachStopTime = eachStartTime.plus(STANDARD_TIME_DELTA);
        });

        /* describe("when the token contract is non-compliant", () => {
          beforeEach(async () => {
            await _this.nonStandardERC20Token.nonStandardApprove(
              _this.sablier.getAddress(),
              STANDARD_SALARY.toString(10),
            );
          });

          it("reverts", async () => {
            await beproAssert.reverts(
              () => _this.sablier.createStream({
                recipient,
                deposit,
                tokenAddress: _this.nonStandardERC20Token.getAddress(),
                startTime: eachStartTime,
                stopTime: eachStopTime,
              }),
              beproAssert.ErrorType.REVERT,
            );
          });
        }); */

        describe('when the token contract is the zero address', () => {
          it('reverts', async () => {
            await beproAssert.reverts(
              () => _this.sablier.createStream({
                recipient,
                deposit,
                tokenAddress: ZERO_ADDRESS,
                startTime: eachStartTime,
                stopTime: eachStopTime,
              }),
              beproAssert.ErrorType.REVERT,
            );
          });
        });
      });
    });

    describe('when the recipient is the caller itself', () => {
      // const recipient = sender;
      const deposit = STANDARD_SALARY.toString(10);
      /// const startTime = now.plus(STANDARD_TIME_OFFSET);
      /// const stopTime = startTime.plus(STANDARD_TIME_DELTA);

      it('reverts', async () => {
        recipient = sender;
        await beproAssert.reverts(
          () => _this.sablier.createStream({
            recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime,
          }),
          'stream to the caller',
        );
      });
    });

    describe('when the recipient is the contract itself', () => {
      const deposit = STANDARD_SALARY.toString(10);
      /// const startTime = now.plus(STANDARD_TIME_OFFSET);
      /// const stopTime = startTime.plus(STANDARD_TIME_DELTA);

      it('reverts', async () => {
        await beproAssert.reverts(
          () => _this.sablier.createStream({
            recipient: _this.sablier.getAddress(),
            deposit,
            tokenAddress: _this.token.getAddress(),
            startTime,
            stopTime,
          }),
          'stream to the contract itself',
        );
      });
    });

    describe('when the recipient is the zero address', () => {
      const deposit = STANDARD_SALARY.toString(10);
      /// const startTime = now.plus(STANDARD_TIME_OFFSET);
      /// const stopTime = startTime.plus(STANDARD_TIME_DELTA);

      it('reverts', async () => {
        await beproAssert.reverts(
          () => _this.sablier.createStream({
            recipient: ZERO_ADDRESS,
            deposit,
            tokenAddress: _this.token.getAddress(),
            startTime,
            stopTime,
          }),
          'stream to the zero address',
        );
      });
    });
  });

  describe('when paused', () => {
    // const recipient = bob;
    const deposit = STANDARD_SALARY.toString(10);
    /// const startTime = now.plus(STANDARD_TIME_OFFSET);
    /// const stopTime = startTime.plus(STANDARD_TIME_DELTA);

    beforeEach(async () => {
      // Note that `sender` coincides with the owner of the contract
      await _this.sablier.pause();
      recipient = _this.bob;
    });

    it('reverts', async () => {
      await beproAssert.reverts(
        () => _this.sablier.createStream({
          recipient, deposit, tokenAddress: _this.token.getAddress(), startTime, stopTime,
        }),
        'Pausable: paused',
      );
    });
  });
});
