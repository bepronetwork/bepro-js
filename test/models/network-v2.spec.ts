import {Network_v2} from '../../src/models/network-v2';
import {ERC20, fromSmartContractDecimals, toSmartContractDecimals, Web3Connection} from '../../src';
import {
  defaultWeb3Connection,
  erc20Deployer,
  getPrivateKeyFromFile,
  hasTxBlockNumber,
  increaseTime, modelExtensionDeployer,
} from '../utils';
import {expect} from 'chai';
import {AMOUNT_1M} from '../utils/constants';
import {nativeZeroAddress} from '../../src/utils/constants';
import {Account} from 'web3-core';
import {BountyToken} from '../../src/models/bounty-token';

describe(`NetworkV2`, () => {
  let network: Network_v2;
  let web3Connection: Web3Connection;
  let networkToken: ERC20;
  let bountyTransactional: ERC20;
  let rewardToken: ERC20;
  let bountyToken: BountyToken;
  let Admin: Account;
  let Alice: Account;
  let Bob: Account;

  const cap = toSmartContractDecimals(AMOUNT_1M);
  const newCouncilAmount = 105000;

  before(async () => {
    web3Connection = await defaultWeb3Connection(true, true);
    Admin = web3Connection.eth.accounts.privateKeyToAccount(getPrivateKeyFromFile());
    Alice = web3Connection.eth.accounts.privateKeyToAccount(getPrivateKeyFromFile(1));
    Bob = web3Connection.eth.accounts.privateKeyToAccount(getPrivateKeyFromFile(2));
  })

  it(`Deploys needed Contracts`, async () => {
    const settlerReceipt = await erc20Deployer(`settler`, `#`, cap, web3Connection);
    const transactionalReceipt = await erc20Deployer(`transactional`, `$`, cap, web3Connection);
    const rewardReceipt = await erc20Deployer(`reward`, `&`, cap, web3Connection);
    const nftReceipt = await modelExtensionDeployer(web3Connection, BountyToken, [`bounty`, `~`]);

    networkToken = new ERC20(web3Connection, settlerReceipt.contractAddress);
    bountyTransactional = new ERC20(web3Connection, transactionalReceipt.contractAddress);
    rewardToken = new ERC20(web3Connection, rewardReceipt.contractAddress);
    bountyToken = new BountyToken(web3Connection, nftReceipt.contractAddress);

    await networkToken.loadContract();
    await bountyTransactional.loadContract();
    await bountyToken.loadContract();
    await rewardToken.loadContract();

    await bountyTransactional.transferTokenAmount(Alice.address, 10000);
    await bountyTransactional.transferTokenAmount(Bob.address, 10000);
  });

  it(`Deploys Network_V2`, async () => {
    const _network = new Network_v2(web3Connection);
    _network.loadAbi();
    const receipt = await _network.deployJsonAbi(networkToken.contractAddress!, bountyToken.contractAddress!, `//`)
    expect(receipt.contractAddress).to.exist;
    network = new Network_v2(web3Connection, receipt.contractAddress);
    await network.loadContract();
  });

  describe(`Owner`, () => {
    it(`changeCouncilAmount()`, async () => {
      await hasTxBlockNumber(network.changeCouncilAmount(newCouncilAmount));
      expect(await network.councilAmount()).to.eq(newCouncilAmount);
    });

    it(`changeDraftTime()`, async () => {
      await hasTxBlockNumber(network.changeDraftTime(61));
      expect(await network.draftTime()).to.eq(61000);
    });

    it(`changeDisputableTime()`, async () => {
      await hasTxBlockNumber(network.changeDisputableTime(61));
      expect(await network.disputableTime()).to.eq(61000);
    });

    it(`changePercentageNeededForDispute()`, async () => {
      await hasTxBlockNumber(network.changePercentageNeededForDispute(10000));
      expect(await network.percentageNeededForDispute()).to.eq(1);
    });

    it(`changeMergeCreatorFeeShare()`, async () => {
      await hasTxBlockNumber(network.changeMergeCreatorFeeShare(10000));
      expect(await network.mergeCreatorFeeShare()).to.eq(1);
    });

    it(`changeOracleExchangeRate()`, async () => {
      await hasTxBlockNumber(network.changeOracleExchangeRate(20000));
      expect(await network.oracleExchangeRate()).to.eq(2);
    });
  });

  describe(`Public`, () => {
    let bountyId: number;
    let prId: number;

    before(async () => {
      await hasTxBlockNumber(networkToken.approve(network.contractAddress!, AMOUNT_1M));
      await hasTxBlockNumber(bountyTransactional.approve(network.contractAddress!, AMOUNT_1M));
      await hasTxBlockNumber(bountyToken.setDispatcher(network.contractAddress!))
    });

    describe(`Oracle actions`, () => {
      it(`Locks NT and receives Network Stake Token`, async () => {
        await hasTxBlockNumber(networkToken.approve(network.contractAddress!, AMOUNT_1M));
        await hasTxBlockNumber(network.lock(205000));
        expect(await network.getOraclesOf(Admin.address)).to.be.eq(205000 * 2); // we made a 1:2
        expect(await networkToken.getTokenAmount(Admin.address)).to.be.eq(AMOUNT_1M - 205000);
      });

      it(`Delegates to Alice`, async () => {
        await hasTxBlockNumber(network.delegateOracles(103000, Alice.address));
        expect(await network.getOraclesOf(Admin.address)).to.be.eq((205000 * 2) - 103000);
        expect(await network.getOraclesOf(Alice.address)).to.be.eq(103000);
      });

      it(`Takes back from Alice`, async () => {
        await hasTxBlockNumber(network.unlock(103000, Alice.address));
        expect(await network.getOraclesOf(Alice.address)).to.be.eq(0);
        expect(await network.getOraclesOf(Admin.address)).to.be.eq(205000 * 2);
      })

      it(`Unlocks NST and receives Network Token`, async () => {
        await hasTxBlockNumber(network.unlock(200000, Admin.address)); // because 2:1
        expect(await network.getOraclesOf(Admin.address)).to.be.eq((105000 * 2));
        expect(await networkToken.getTokenAmount(Admin.address)).to.be.eq(AMOUNT_1M - 105000);
      });
    });

    describe(`Bounties`, () => {
      it(`Opens`, async () => {
        const receipt = await network.openBounty(1000, bountyTransactional.contractAddress!,
                                                 nativeZeroAddress, 0, 0,
                                                 'c1', 'Title', '//', 'master');

        const events = await network.getBountyCreatedEvents({fromBlock: receipt.blockNumber, filter: {creator: Admin.address}});

        expect(events.length).to.be.eq(1);
        expect(events[0].returnValues.cid).to.be.eq('c1');
        expect((await network.getBountiesOfAddress(Admin.address)).length).to.be.eq(1);

        bountyId = events[0].returnValues.id;
      });

      it(`Updates bounty amount`, async () => {
        await hasTxBlockNumber(network.updateBountyAmount(bountyId, 1001));
        expect((await network.getBounty(bountyId)).tokenAmount)
          .to.be.eq(toSmartContractDecimals(1001, bountyTransactional.decimals));
      });

      it(`Supports bounty`, async () => {
        web3Connection.switchToAccount(Alice.privateKey);
        await hasTxBlockNumber(bountyTransactional.approve(network.contractAddress!, AMOUNT_1M));
        await hasTxBlockNumber(network.supportBounty(bountyId, 1));

        expect((await network.getBounty(bountyId)).tokenAmount)
          .to.be.eq(toSmartContractDecimals(1002, bountyTransactional.decimals));

        expect(await bountyTransactional.getTokenAmount(Alice.address)).to.be.eq(10000 - 1);
      });

      it(`Retracts support from bounty`, async () => {
        await hasTxBlockNumber(network.retractSupportFromBounty(bountyId, 0));

        expect((await network.getBounty(bountyId)).tokenAmount)
          .to.be.eq(toSmartContractDecimals(1001, bountyTransactional.decimals));
      })

      it(`Cancels bounty`, async () => {
        web3Connection.switchToAccount(Admin.privateKey);
        const receipt = await network.cancelBounty(bountyId);
        const events = await network.getBountyCanceledEvents({fromBlock: receipt.blockNumber, filter: {id: bountyId}});
        expect(events.length).to.be.eq(1);
        expect(await bountyTransactional.getTokenAmount(Alice.address)).to.be.eq(10000)
      })
    });

    describe(`Funding`, async () => {
      it(`Opens Request Funding`, async () => {
        await hasTxBlockNumber(rewardToken.approve(network.contractAddress!, AMOUNT_1M), 'Should have approved rewardToken');

        const receipt = await network.openBounty(0, bountyTransactional.contractAddress!,
                                                 rewardToken.contractAddress!, 1000, 1000,
                                                 'c2', 'Title 2', '//', 'master');

        const events = await network.getBountyCreatedEvents({fromBlock: receipt.blockNumber, filter: {creator: Admin.address}});
        bountyId = events[0].returnValues.id;

        expect(await network.getBounty(bountyId)).property('rewardToken').to.be.eq(rewardToken.contractAddress!);
      });

      it(`Fund 50-50`, async () => {
        expect((await network.getBounty(bountyId)).funded).to.be.false;

        web3Connection.switchToAccount(Alice.privateKey);
        await bountyTransactional.approve(network.contractAddress!, AMOUNT_1M);
        await hasTxBlockNumber(network.fundBounty(bountyId, 500));

        web3Connection.switchToAccount(Bob.privateKey);
        await bountyTransactional.approve(network.contractAddress!, AMOUNT_1M);
        await hasTxBlockNumber(network.fundBounty(bountyId, 500));

        expect((await network.getBounty(bountyId)).funded).to.be.true;
      });

      it(`Retracts Bobs funding`, async () => {
        await hasTxBlockNumber(network.retractFunds(bountyId, [1]));
        expect((await network.getBounty(bountyId)).funded).to.be.false;
      });

      it(`Cancels funding`, async () => {
        web3Connection.switchToAccount(Admin.privateKey);
        await hasTxBlockNumber(network.cancelFundRequest(bountyId));
        expect(await bountyTransactional.getTokenAmount(Alice.address)).to.be.eq(10000);
        expect(await bountyTransactional.getTokenAmount(Bob.address)).to.be.eq(10000);
      })
    });

    describe(`Happy path`, () => {

      it(`Creates a bounty`,async () => {
        await rewardToken.approve(network.contractAddress!, AMOUNT_1M);
        await network.openBounty(0, bountyTransactional.contractAddress!,
                                 rewardToken.contractAddress!, 1000, 10000,
                                 'c3', 'Title 3', '//', 'master');

        bountyId = await network.cidBountyId('c3');

        web3Connection.switchToAccount(Alice.privateKey);
        await bountyTransactional.approve(network.contractAddress!, AMOUNT_1M);
        await hasTxBlockNumber(network.fundBounty(bountyId, 10000));

        web3Connection.switchToAccount(Admin.privateKey);
        await increaseTime(62, web3Connection.Web3);
        await network.lock(await network.councilAmount());
      });

      it(`Creates a PR and sets PR as ready`, async () => {
        const receipt = await network.createPullRequest(bountyId, '//', 'master',
                                                        'c3','//', 'feat-1', 1);

        const events = await network.getBountyPullRequestCreatedEvents({fromBlock: receipt.blockNumber, filter: {id: bountyId}})
        expect(events.length).to.be.eq(1);
        prId = events[0].returnValues.pullRequestId;

        await hasTxBlockNumber(network.markPullRequestReadyForReview(bountyId, prId));
        expect((await network.getBounty(bountyId)).pullRequests[0].ready).to.be.true;
      });

      it(`Creates a Proposal`, async () => {
        await hasTxBlockNumber(network.createBountyProposal(bountyId, prId, [Alice.address, Bob.address], [51, 49]));
        expect((await network.getBounty(bountyId)).proposals.length).to.be.eq(1);
      });

      it(`Disputes a Proposal`, async () => {
        await hasTxBlockNumber(network.disputeBountyProposal(bountyId, 0));
        expect(+(await network.getBounty(bountyId)).proposals[0].disputeWeight).to.be.greaterThan(0);
      });

      it(`Refuses as owner`, async () => {
        await hasTxBlockNumber(network.refuseBountyProposal(bountyId, 0));
        expect((await network.getBounty(bountyId)).proposals[0].refusedByBountyOwner).to.be.true;
      });

      it(`Creates Proposal and closes Bounty`, async () => {
        await hasTxBlockNumber(network.createBountyProposal(bountyId, prId, [Alice.address, Bob.address], [51, 49]), `Should create proposal`);
        await increaseTime(62, web3Connection.Web3);
        const bounty = await network.getBounty(bountyId);
        expect(bounty.proposals.length).to.be.eq(2);

        await hasTxBlockNumber(network.closeBounty(bountyId, 1), `Should have closed bounty`);

        const bountyTokenAmount = fromSmartContractDecimals(bounty.tokenAmount, bountyTransactional.decimals);
        const mergerAmount = bountyTokenAmount / 100 * await network.mergeCreatorFeeShare();
        const proposerAmount = (bountyTokenAmount - mergerAmount) / 100 * await network.proposerFeeShare();
        const bountyAmount = bountyTokenAmount - mergerAmount - proposerAmount;
        const AliceAmount = bountyAmount / 100 * 51;
        const BobAmount = bountyAmount / 100 * 49;

        expect(await rewardToken.getTokenAmount(Alice.address)).to.be.eq(1000);
        expect(await bountyTransactional.getTokenAmount(Alice.address)).to.be.eq(+Number(AliceAmount).toFixed(2));
        expect(await bountyTransactional.getTokenAmount(Bob.address)).to.be.eq(+Number(BobAmount + 10000).toFixed(2));
      });
    });
  });
});
