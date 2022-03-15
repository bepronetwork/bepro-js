import {describe, it} from 'mocha';
import {expect} from 'chai';
import {Network} from '@models/network';
import {defaultWeb3Connection, erc20Deployer, increaseTime, newWeb3Account, outputDeploy,} from '../utils/';
import {Web3Connection} from '@base/web3-connection';
import {toSmartContractDecimals} from '@utils/numbers';
import {NetworkIssue} from '@interfaces/network-issue';
import {OraclesSummary} from '@interfaces/oracles-summary';

describe(`Network`, () => {
  let network: Network;
  let web3Connection: Web3Connection;
  let networkContractAddress!: string;
  let settlerToken!: string;
  let transactionToken!: string;

  let accountAddress = ``
  const cap = toSmartContractDecimals(10000000) as number;
  const newCouncilAmount = '100002';

  before(async () => {
    web3Connection = await defaultWeb3Connection(true, true);
  })

  if (!networkContractAddress) {
    describe(`Needs Network deploy`, () => {
      if (!settlerToken)
        it(`Deploys SettlerToken`, async () => {
          const receipt = await erc20Deployer(`Settler`, `$settler`, cap, web3Connection);
          expect(receipt.contractAddress).to.not.be.empty;
          settlerToken = receipt.contractAddress;
        });

      if (!transactionToken)
        it(`Deploys TransactionalToken`, async () => {
          const receipt = await erc20Deployer(`Transactional`, `$transactional`, cap, web3Connection);
          expect(receipt.contractAddress).to.not.be.empty;
          transactionToken = receipt.contractAddress;
        });

      it(`Deploys a Network Contract`, async () => {
        const deployer = new Network(web3Connection);
        await deployer.loadAbi();
        const receipt = await deployer.deployJsonAbi(settlerToken!, transactionToken!, deployer.connection.Account.address);
        expect(receipt.contractAddress).to.not.be.empty;
        networkContractAddress = receipt.contractAddress;
      });

      after(() => {
        outputDeploy([[`Network`, networkContractAddress!], [`ERC20`, settlerToken!]])
      });
    });
  }

  describe(`Methods`, () => {
    before(async () => {
      network = new Network(web3Connection, networkContractAddress);
      await network.loadContract();
      accountAddress = web3Connection.Account.address;
    });

    it(`Addresses must match`, async () => {
      const _settler = await network.getSettlerTokenAddress();
      const _transaction = await network.getTransactionTokenAddress();

      expect(_settler).to.be.eq(settlerToken);
      expect(_transaction).to.be.eq(transactionToken);
    });

    it(`Approves settler`, async () => {
      const settler = await network.approveSettlerERC20Token();
      expect(settler.blockHash, `settler hash`).to.not.be.empty;

      const approvedSettler = await network.isApprovedSettlerToken(+newCouncilAmount);
      expect(approvedSettler, `isApproved settler`).to.be.true;

      const events = await network.settlerToken.contract.self.getPastEvents(`Approval`, {fromBlock: settler.blockNumber});

      expect(events[0].returnValues['spender']).to.be.eq(networkContractAddress);
      expect(events[0].returnValues['owner']).to.be.eq(accountAddress);
      expect(events[0].returnValues['value']).to.be.eq(cap);
    });

    it(`Approves transactional`, async () => {
      const transactional = await network.approveTransactionalERC20Token();
      expect(transactional.blockHash, `transactional hash`).to.not.be.empty;

      const approvedTransactional = await network.isApprovedTransactionalToken(1);
      expect(approvedTransactional, `isApproved settler`).to.be.true;
    })

    describe(`Oracles`, () => {


      it(`Change amount needed for council`, async () => {
        const change = await network.changeCouncilAmount(newCouncilAmount);
        expect(change.blockHash).to.not.be.empty;
      });

      it(`Change redeem time`, async () => {
        const change = await network.changeRedeemTime(60);
        expect(change.blockHash).to.not.be.empty;

        const redeemTime = await network.redeemTime();
        expect(redeemTime).to.be.eq(60);
      });

      it(`Changes disputable time`, async () => {
        const change = await network.changeDisputableTime(120);
        expect(change.blockHash).to.not.be.empty;

        // const disputableTime = await network.disputableTime();
        // expect(disputableTime).to.be.eq(120);
      })

      describe(`Locks`, async () => {
        it (`Locked`, async () => {
          const lock = await network.lock(+newCouncilAmount);
          expect(lock.transactionHash, `lock hash`).to.not.be.empty;
        })

        it(`assert locked`, async () => {
          expect(await network.isCouncil(accountAddress), `is council`).to.be.true;
        })

        it(`Check bepro staked`, async () => {
          expect(await network.getBEPROStaked(), `bepro staked`).to.be.greaterThan(0);
        });

      });

      describe('delegation', () => {
        let receiver: string;
        let delegated: OraclesSummary;

        before(() => {
          receiver = newWeb3Account(web3Connection).address;
        });

        it(`Delegates`, async () => {
          const delegate = await network.delegateOracles(1, receiver);
          expect(delegate.blockHash, `delegate hash`).to.not.be.empty;
        });

        it(`asserts delegation`, async () => {
          delegated = await network.getOraclesSummary(receiver);
          expect(delegated.oraclesDelegatedByOthers).to.eq(1);
        })

        it(`Takes back the oracles`, async () => {
          const undelegate = await network.unlock(1, receiver);
          expect(undelegate.blockHash, `undelegate hash`).to.not.be.empty;
        })

        it (`asserts take back`, async () => {
          const summary = await network.getOraclesSummary(receiver);
          expect(summary.oraclesDelegatedByOthers).to.eq(delegated.oraclesDelegatedByOthers - 1);
        });

      });

      describe(`Unlock`, () => {
        it (`unlocks`, async () => {
          const amount = await network.getOraclesByAddress(accountAddress);
          const unlock = await network.unlock(amount, accountAddress);
          expect(unlock.blockHash, `unlock hash`).to.not.be.empty;
        });

        it(`Asserts that unlocked`, async () => {
          const isCouncil = await network.isCouncil(accountAddress);
          expect(isCouncil, `is council`).to.be.false;
        })
      })
    });

    describe(`Issues`, () => {

      describe(`Opens, updates, and redeems an issue`, () => {
        let cid: string;
        let issue: NetworkIssue;

        before(() => {
          cid = web3Connection.Web3.utils.randomHex(4)
        });

        it(`Opens issue`, async () => {
          const openIssue = await network.openIssue(cid, 10000)
          expect(openIssue.blockHash, `open issue hash`).to.not.be.empty;

          issue = await network.getIssueByCID(cid);
          expect(issue.creationDate, `creation date`).to.be.greaterThan(0);
        })

        it(`Updates issue`, async () => {
          const updateIssue = await network.updateIssue(issue._id, 2);
          expect(updateIssue.blockHash, `update issue hash`).to.not.be.empty;

          issue = await network.getIssueById(issue._id);
          expect(issue.tokensStaked, `issue tokens staked`).to.eq(2);
        })

        it(`Redeems issue`, async () => {
          const redeemIssue = await network.redeemIssue(issue._id);
          expect(redeemIssue.blockHash, `redeem issue`).to.not.be.empty;
        });
      });

      describe(`Opens, disputes, proposes, and closes an issue`, function () {
        let cid: string;
        let issue: NetworkIssue;
        this.timeout(3 * 60 * 1000);

        before(() => {
          cid = web3Connection.Web3.utils.randomHex(4);
        });

        it(`Opens issue`, async () => {
          const receipt = await network.openIssue(cid, 1);
          expect(receipt.blockHash, `open issue hash`).to.not.be.empty;
        })

        describe(`after redeemTime()`, () => {
          before(async () => {
            issue = await network.getIssueByCID(cid);
            await increaseTime(61, web3Connection.Web3)
          });

          it(`Recognizes as finished`, async () => {
            const recognize = await network.recognizeAsFinished(issue._id);
            expect(recognize.blockHash, `recognize hash`).to.not.be.empty;
          });

          it(`Proposes issue merge`, async () => {
            await network.lock(+newCouncilAmount+1);
            const proposal = await network.proposeIssueMerge(issue._id, [accountAddress], [1]);
            expect(proposal.blockHash, `proposal hash`).to.not.be.empty;
          });

          it(`Disputes issue merge`, async () => {
            await network.lock(1);
            const dispute = await network.disputeMerge(issue._id, 0);
            expect(dispute.blockHash, `dispute blockhash`).to.not.be.empty;
          });

          it(`Asserts merge dispute`, async () => {
            const disputed = await network.isMergeDisputed(issue._id, 0);
            expect(disputed, `disputed`).to.be.true;
          });
        })

        describe(`after disputableTime()`, () => {
          before(async () => {
            await network.proposeIssueMerge(issue._id, [accountAddress], [1])
            await increaseTime(61, web3Connection.Web3);
          });

          it(`Closes issue`, async () => {
            const closed = await network.closeIssue(issue._id, 1);
            expect(closed.blockHash, `closed hash`).to.not.be.empty;
          });
        });
      });
    });
  });
});
