import {describe, it} from 'mocha';
import {expect} from 'chai';
import Network from '@models/network';
import {defaultWeb3Connection, erc20Deployer, newWeb3Account} from '../utils';
import Web3Connection from '@base/web3-connection';
import {toSmartContractDecimals} from '@utils/numbers';

describe.only(`Network`, () => {
  let network: Network;
  let web3Connection: Web3Connection;
  let networkContractAddress = process.env.NETWORK_ADDRESS;
  let settlerToken = process.env.NETWORK_SETTLER_TOKEN;
  let transactionToken = process.env.NETWORK_TRANSACTION_TOKEN;

  let accountAddress = ``
  const cap = toSmartContractDecimals(1000000) as number;
  const newCouncilAmount = 100001;

  before(() => {
    web3Connection = defaultWeb3Connection();
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
        await deployer.start();
        const receipt = await deployer.deployJsonAbi(settlerToken!, transactionToken!, deployer.connection.Account.address);
        expect(receipt.contractAddress).to.not.be.empty;
        networkContractAddress = receipt.contractAddress;
      });

      after(() => {
        console.table({networkContractAddress, settlerToken, transactionToken});
      })
    });
  }

  describe(`Methods`, () => {
    before(async () => {
      network = new Network(web3Connection, networkContractAddress);
      await network.start();
      accountAddress = web3Connection.Account.address;
    });

    it(`Addresses must match`, async () => {
      const _settler = await network.getSettlerTokenAddress();
      const _transaction = await network.getTransactionTokenAddress();

      expect(_settler).to.be.eq(settlerToken);
      expect(_transaction).to.be.eq(transactionToken);
    });

    it(`Approves settler and transactional`, async () => {
      const settler = await network.approveSettlerERC20Token();
      expect(settler.blockHash, `settler hash`).to.not.be.empty;

      const approvedSettler = await network.isApprovedSettlerToken(accountAddress, 1);
      expect(approvedSettler, `isApproved settler`).to.not.be.true;

      const transactional = await network.approveTransactionalERC20Token();
      expect(transactional.blockHash, `transactional hash`).to.not.be.empty;

      const approvedTransactional = await network.isApprovedTransactionalToken(accountAddress, 1);
      expect(approvedTransactional, `isApproved settler`).to.not.be.true;
    });

    describe(`Oracles`, () => {
      it(`Change amount needed for council`, async () => {
        const amount = toSmartContractDecimals(newCouncilAmount, network.settlerToken.decimals) as string;
        const change = await network.changeCouncilAmount(amount);
        expect(change.blockHash).to.not.be.empty;
      });

      it(`Change redeem time`, async () => {
        const change = await network.changeRedeemTime(60);
        expect(change.blockHash).to.not.be.empty;

        const redeemTime = await network.redeemTime();
        expect(redeemTime).to.be.eq(60);
      });

      it(`Changes disputable time`, async () => {
        const change = await network.changeDisputableTime(60);
        expect(change.blockHash).to.not.be.empty;

        const disputableTime = await network.disputableTime();
        expect(disputableTime).to.be.eq(60);
      })

      it(`Locks and locked`, async () => {
        const lock = await network.lock(newCouncilAmount + 1);
        expect(lock.blockHash, `lock hash`).to.not.be.empty;

        const locked = await network.getOraclesByAddress(accountAddress);
        expect(locked, `locked amount`).to.be.greaterThan(0);

        const isCouncil = await network.isCouncil(accountAddress);
        expect(isCouncil, `is council`).to.be.true;

        const beproStaked = await network.getBEPROStaked();
        expect(beproStaked, `bepro staked`).to.be.greaterThan(0);
      });

      it(`Delegates and delegated`, async () => {
        const receiver = newWeb3Account(web3Connection).address;
        const delegate = await network.delegateOracles(1, receiver);
        expect(delegate.blockHash, `delegate hash`).to.not.be.empty;

        const delegated = await network.getOraclesSummary(receiver);
        expect(delegated.oraclesDelegatedByOthers).to.eq(1);

        const undelegate = await network.unlock(1, receiver);
        expect(undelegate.blockHash, `undelegate hash`).to.not.be.empty;

        const summary = await network.getOraclesSummary(receiver);
        expect(summary.oraclesDelegatedByOthers).to.eq(delegated.oraclesDelegatedByOthers - 1);
      });

      it(`Unlocks and unlocked`, async () => {
        const amount = await network.getOraclesByAddress(accountAddress);
        expect(amount).to.be.greaterThan(0);

        const unlock = await network.unlock(newCouncilAmount + 1, accountAddress);
        expect(unlock.blockHash, `unlock hash`).to.not.be.empty;

        const unlocked = await network.getOraclesByAddress(accountAddress);
        expect(unlocked).to.be.eq(0);

        const isCouncil = await network.isCouncil(accountAddress);
        expect(isCouncil, `is council`).to.be.false;
      });
    });

    describe(`Issues`, () => {

      it(`Opens, updates, and redeems an issue`, async () => {
        const cid = `1/1`;
        const openIssue = await network.openIssue(cid, 1);
        expect(openIssue.blockHash, `open issue hash`).to.not.be.empty;

        let issue = await network.getIssueByCID(cid);
        expect(issue.creationDate, `creation date`).to.not.be.empty;

        const updateIssue = await network.updateIssue(issue._id, 2);
        expect(updateIssue.blockHash, `update issue hash`).to.not.be.empty;

        issue = await network.getIssueById(issue._id);
        expect(issue.tokensStaked, `issue tokens staked`).to.eq(2);

        const issueInDraft = await network.isIssueInDraft(issue._id);
        expect(issueInDraft).to.be.true;

        const redeemIssue = await network.redeemIssue(issue._id);
        expect(redeemIssue.blockHash, `redeem issue`).to.not.be.empty;
      });

      it(`Opens, disputes, proposes, and closes an issue`, async (done) => {
        const cid = `1/2`;
        let issue = await network.openIssue(cid, 1);
        expect(issue.blockHash, `open issue hash`).to.not.be.empty;

        setTimeout(async () => {
          issue = await network.getIssueByCID(cid);
          const inDraft = await network.isIssueInDraft(issue._id);
          expect(inDraft, `in draft`).to.be.false;

          const recognize = await network.recognizeAsFinished(issue._id);
          expect(recognize.blockHash, `recognize hash`).to.not.be.empty;

          const proposal = await network.proposeIssueMerge(issue._id, [accountAddress], [1]);
          expect(proposal.blockHash, `proposal hash`).to.not.be.empty;

          await network.lock(1);
          const dispute = await network.disputeMerge(issue._id, 1);
          expect(dispute.blockHash, `dispute blockhash`).to.not.be.empty;

          const disputed = await network.isMergeDisputed(1, 1);
          expect(disputed, `disputed`).to.be.true;

          await network.proposeIssueMerge(issue._id, [accountAddress], [1]);

          setTimeout(async () => {
            const mergeInDraft = await network.isMergeInDraft(issue._id, 2);
            expect(mergeInDraft, `merge in draft`).to.be.false;

            const closed = await network.closeIssue(issue._id, 2);
            expect(closed.blockHash, `closed hash`).to.not.be.empty;

            done();
          }, 62 * 1000);
        }, 62 * 1000);
      }).timeout(3 * 60 * 1000); // 3 mins timeout because of disputable time + draft merge
    })

  });
})
