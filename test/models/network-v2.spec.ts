import {Network_v2} from '../../src/models/network-v2';
import {ERC20, toSmartContractDecimals, Web3Connection} from '../../src';
import {
  defaultWeb3Connection,
  erc20Deployer,
  getPrivateKeyFromFile,
  hasTxBlockNumber,
  increaseTime,
} from '../utils';
import {expect} from 'chai';
import {AMOUNT_1M} from '../utils/constants';
import {nativeZeroAddress} from '../../src/utils/constants';
import {Account} from 'web3-core';
import {BountyToken} from '../../src/models/bounty-token';

describe.skip(`NetworkV2`, () => {
  let network: Network_v2;
  let web3Connection: Web3Connection;
  let networkToken: ERC20;
  let bountyTransactional: ERC20;
  let rewardToken: ERC20;
  let bountyToken: BountyToken;
  let Admin: Account;
  let Alice: Account;
  let Bob: Account;

  const cap = toSmartContractDecimals(AMOUNT_1M) as number;
  const newCouncilAmount = 105000;

  before(async () => {
    web3Connection = await defaultWeb3Connection(true, true);
    Admin = web3Connection.eth.accounts.privateKeyToAccount(getPrivateKeyFromFile());
    Alice = web3Connection.eth.accounts.privateKeyToAccount(getPrivateKeyFromFile(1));
    Bob = web3Connection.eth.accounts.privateKeyToAccount(getPrivateKeyFromFile(2));
  })

  it(`Deploys needed ERC20`, async () => {
    const settlerReceipt = await erc20Deployer(`settler`, `#`, cap, web3Connection);
    const transactionalReceipt = await erc20Deployer(`transactional`, `$`, cap, web3Connection);
    const rewardReceipt = await erc20Deployer(`reward`, `&`, cap, web3Connection);
    const nftReceipt = await erc20Deployer(`bounty`, `~`, cap, web3Connection);

    networkToken = new ERC20(web3Connection, settlerReceipt.contractAddress);
    bountyTransactional = new ERC20(web3Connection, transactionalReceipt.contractAddress);
    rewardToken = new ERC20(web3Connection, rewardReceipt.contractAddress);
    bountyToken = new BountyToken(web3Connection, nftReceipt.contractAddress);

    await networkToken.loadContract();
    await bountyTransactional.loadContract();
    await bountyToken.loadContract();

    await bountyTransactional.transferTokenAmount(Alice.address, 10000);
    await bountyTransactional.transferTokenAmount(Bob.address, 10000);
  });

  it(`Deploys Network_V2`, async () => {
    const _network = new Network_v2(web3Connection);
    _network.loadAbi();
    const receipt = await _network.deployJsonAbi(networkToken.contractAddress!, bountyToken.contractAddress!, `BountyNFT`, `%BBT`, `//`)
    expect(receipt.contractAddress).to.exist;
    network = new Network_v2(web3Connection, receipt.contractAddress);
    await network.loadContract();
  });

  describe(`Methods`, () => {
    describe(`Owner`, () => {
      it(`changeCouncilAmount()`, async () => {
        await hasTxBlockNumber(network.changeCouncilAmount(newCouncilAmount));
        expect(await network.councilAmount()).to.eq(newCouncilAmount);
      });

      it(`changeDraftTime()`, async () => {
        await hasTxBlockNumber(network.changeDraftTime(61000));
        expect(await network.draftTime()).to.eq(61000);
      });

      it(`changeDisputableTime()`, async () => {
        await hasTxBlockNumber(network.changeDisputableTime(61000));
        expect(await network.disputableTime()).to.eq(61000);
      });

      it(`changePercentageNeededForDispute()`, async () => {
        await hasTxBlockNumber(network.changePercentageNeededForDispute(10000));
        expect(await network.percentageNeededForDispute()).to.eq(10000);
      });

      it(`changeMergeCreatorFeeShare()`, async () => {
        await hasTxBlockNumber(network.changeMergeCreatorFeeShare(10000));
        expect(await network.mergeCreatorFeeShare()).to.eq(10000);
      });

      it(`changeOracleExchangeRate()`, async () => {
        await hasTxBlockNumber(network.changeOracleExchangeRate(20000));
        expect(await network.oracleExchangeRate()).to.eq(20000);
      });
    });

    describe(`Public`, () => {
      let bountyId: number;

      before(async () => {
        await hasTxBlockNumber(networkToken.approve(network.contractAddress!, AMOUNT_1M));
        await hasTxBlockNumber(bountyTransactional.approve(network.contractAddress!, AMOUNT_1M));
      });

      describe(`Oracle actions`, () => {
        it(`Locks NT and receives Network Stake Token`, async () => {
          await hasTxBlockNumber(network.lock(205000));
          expect(await network.getOraclesOf(Admin.address)).to.be.eq(205000);
          expect(await networkToken.getTokenAmount(Admin.address)).to.be.eq(AMOUNT_1M - 205000);
        });

        it(`Delegates to Alice`, async () => {
          await hasTxBlockNumber(network.delegateOracles(103000, Alice.address));
          expect(await network.getOraclesOf(Alice.address)).to.be.eq(103000);
        });

        it(`Takes back from Alice`, async () => {
          await hasTxBlockNumber(network.unlock(103000, Alice.address));
          expect(await network.getOraclesOf(Alice.address)).to.be.eq(0);
        })

        it(`Unlocks NST and receives Network Token`, async () => {
          await hasTxBlockNumber(network.unlock(100000, Admin.address));
          expect(await network.getOraclesOf(Admin.address)).to.be.eq(105000);
          expect(await networkToken.getTokenAmount(Admin.address)).to.be.eq(AMOUNT_1M - 105000);
        });
      });

      describe(`Bounties`, () => {
        it(`Opens`, async () => {
          const receipt = await network.openBounty(1000, bountyTransactional.contractAddress!,
                                                   nativeZeroAddress, 0, 0,
                                                   'c1', 'Title', '//', 'master');

          const events = await network.getBountyCreatedEvents({fromBlock: receipt.blockNumber, filter: {cid: 'c1'}});
          expect(events.length).to.be.eq(1);
          expect(events[0].returnValues.cid).to.be.eq('c1');
          expect((await network.getBountiesOfAddress(Admin.address)).length).to.be.eq(1);

          bountyId = events[0].returnValues.id;
        });

        it(`Updates bounty amount`, async () => {
          await hasTxBlockNumber(network.updateBountyAmount(bountyId, 1001));
          expect((await network.getBounty(bountyId)).bounty.tokenAmount).to.be.eq(1001);
        });

        it(`Supports bounty`, async () => {
          web3Connection.switchToAccount(Alice.privateKey);
          await hasTxBlockNumber(network.supportBounty(bountyId, 1));
          expect((await network.getBounty(bountyId)).bounty.tokenAmount).to.be.eq(1002);
          expect(await networkToken.getTokenAmount(Alice.address)).to.be.eq(10000 - 1);
        });

        it(`Retracts support from bounty`, async () => {
          await hasTxBlockNumber(network.retractSupportFromBounty(bountyId, 0));
          expect((await network.getBounty(bountyId)).bounty.tokenAmount).to.be.eq(1001);
        })

        it(`Cancels bounty`, async () => {
          web3Connection.switchToAccount(Admin.privateKey);
          const receipt = await network.cancelBounty(bountyId);
          const events = await network.getBountyCanceledEvents({fromBlock: receipt.blockNumber, filter: {id: bountyId}});
          expect(events.length).to.be.eq(1);
          expect(await bountyTransactional.getTokenAmount(Alice.address)).to.be.eq(10000)
        })

        describe(`Funding`, async () => {
          it(`Opens Request Funding`, async () => {
            const receipt = await network.openBounty(0, bountyTransactional.contractAddress!,
                                                     rewardToken.contractAddress!, 1000, 1000,
                                                     'c2', 'Title 2', '//', 'master');
            const events = await network.getBountyCreatedEvents({fromBlock: receipt.blockNumber, filter: {cid: 'c2'}});
            bountyId = events[0].returnValues.id;

            expect(await network.isBountyFundingRequest(bountyId)).to.be.true;
          });

          it(`Fund 50-50`, async () => {
            expect(await network.isBountyFunded(bountyId)).to.be.false;

            web3Connection.switchToAccount(Alice.privateKey);
            await hasTxBlockNumber(network.fundBounty(bountyId, 500));

            web3Connection.switchToAccount(Bob.privateKey);
            await hasTxBlockNumber(network.fundBounty(bountyId, 500));

            expect(await network.isBountyFunded(bountyId)).to.be.true;
          });

          it(`Retracts Bobs funding`, async () => {
            await hasTxBlockNumber(network.retractFunds(bountyId, 1));
            expect(await network.isBountyFunded(bountyId)).to.be.false;
          });

          it(`Cancels funding`, async () => {
            web3Connection.switchToAccount(Admin.privateKey);
            await hasTxBlockNumber(network.cancelBounty(bountyId));
            expect(await bountyTransactional.getTokenAmount(Alice.address)).to.be.eq(10000);
            expect(await bountyTransactional.getTokenAmount(Bob.address)).to.be.eq(10000);
          })
        });
      });

      describe(`Happy path`, () => {
        before(async () => {
          await network.openBounty(0, bountyTransactional.contractAddress!,
                                   rewardToken.contractAddress!, 1000, 10000,
                                   'c3', 'Title 3', '//', 'master');
          bountyId = await network.cidBountyId('c3');

          web3Connection.switchToAccount(Alice.privateKey);
          await hasTxBlockNumber(network.fundBounty(bountyId, 10000));

          web3Connection.switchToAccount(Admin.privateKey);
          await increaseTime(61, web3Connection.Web3);
        });

        it(`Creates a PR and sets PR as ready`, async () => {
          const receipt = await network.createPullRequest(bountyId, '//', 'master',
                                                          'c3','//', 'feat-1', 1);
          const events = await network.getBountyPullRequestCreatedEvents({fromBlock: receipt.blockNumber, filter: {pullRequestId: 0}})
          expect(events.length).to.be.eq(1);

          await hasTxBlockNumber(network.markPullRequestReadyForReview(bountyId, 0));
          expect((await network.getPullRequest(bountyId, 0)).pullRequest.ready).to.be.true;
        });

        it(`Creates a Proposal`, async () => {
          await hasTxBlockNumber(network.createBountyProposal(bountyId, 0, [Alice.address, Bob.address], [51, 49]));
          expect((await network.getBounty(bountyId)).bounty.proposals.length).to.be.eq(1);
        });

        it(`Disputes a Proposal`, async () => {
          await hasTxBlockNumber(network.disputeBountyProposal(bountyId, 0));
          expect(await network.isProposalDisputed(bountyId, 0)).to.be.true;
        });

        it(`Refuses as owner`, async () => {
          await hasTxBlockNumber(network.refuseBountyProposal(bountyId, 0));
          expect((await network.getProposal(bountyId, 0)).proposal.refusedByBountyOwner).to.be.true;
        });

        it(`Creates Proposal and closes Bounty`, async () => {
          await hasTxBlockNumber(network.createBountyProposal(bountyId, 0, [Alice.address, Bob.address], [51, 49]));
          await increaseTime(61, web3Connection.Web3);
          const {bounty} = await network.getBounty(bountyId);
          expect(bounty.proposals.length).to.be.eq(2);

          await hasTxBlockNumber(network.closeBounty(bountyId, 1));

          const mergerAmount = bounty.tokenAmount / 100 * await network.calculatePercentPerTenK(10000);
          const bountyAmount = bounty.tokenAmount - mergerAmount;
          const AliceAmount = bountyAmount / 100 * 51;
          const BobAmount = bountyAmount / 100 * 49;

          expect(await rewardToken.getTokenAmount(Alice.address)).to.be.eq(1000);
          expect(await bountyTransactional.getTokenAmount(Alice.address)).to.be.eq(AliceAmount);
          expect(await bountyTransactional.getTokenAmount(Bob.address)).to.be.eq(BobAmount + 10000);
          expect(mergerAmount + AliceAmount + BobAmount).to.be.eq(bounty.tokenAmount);
        });
      });
    });
  });
});
