import {Network, NetworkFactory, Web3Connection} from '../../src';
import {fromDecimals, toSmartContractDecimals} from '../../src/utils/numbers';
import {shouldBeRejected, defaultWeb3Connection, erc20Deployer, outputDeploy, hasTxBlockNumber} from '../utils/';
import {describe, it} from 'mocha';
import {expect} from 'chai';
import {Errors} from '../../src/interfaces/error-enum';

describe(`NetworkFactory`, () => {

  let web3Connection: Web3Connection;
  let networkFactoryContractAddress!: string;
  let settlerToken: string;
  let networkToken: string;
  let accountAddress: string;

  const cap = toSmartContractDecimals(1000000);

  before(async () => {
    web3Connection = await defaultWeb3Connection(true, true);
    accountAddress = web3Connection.Account.address;
  })


  describe(`Deploy`, () => {

    it(`SettlerToken`, async () => {
      const receipt = await erc20Deployer(`Settler`, `$settler`, cap, web3Connection);
      expect(receipt.contractAddress).to.not.be.empty;
      settlerToken = receipt.contractAddress!;
    });

    it(`NetworkToken`, async () => {
      const receipt = await erc20Deployer(`Usage`, `$usage`, cap, web3Connection);
      expect(receipt.contractAddress).to.not.be.empty;
      networkToken = receipt.contractAddress!;
    });

    it(`Network Factory Contract`, async () => {
      const deployer = new NetworkFactory(web3Connection);
      await deployer.loadAbi();
      const receipt = await deployer.deployJsonAbi(settlerToken!);
      expect(receipt.contractAddress).to.not.be.empty;
      networkFactoryContractAddress = receipt.contractAddress;
      console.log(networkFactoryContractAddress)
    });

    after(() => {
      outputDeploy([[`NetworkFactory`, networkFactoryContractAddress!], [`ERC20`, settlerToken]])
    });
  });


  describe(`Integration`, () => {
    let networkFactory: NetworkFactory;

    before(async () => {
      networkFactory = new NetworkFactory(web3Connection, networkFactoryContractAddress);
      await networkFactory.loadContract();
    })

    it(`Matches token address`, async () => {
      expect(await networkFactory.getSettlerTokenAddress()).to.be.eq(settlerToken);
    });

    it(`Throws because no locked amount`, async () => {
      await shouldBeRejected(networkFactory.createNetwork(settlerToken!, settlerToken!), `has to lock`);
    });

    it(`Throws because trying to lock 0`, async () => {
      await shouldBeRejected(networkFactory.lock(0), Errors.AmountNeedsToBeHigherThanZero)
    });

    it(`Throws because needs allow`, async () => {
      await shouldBeRejected(networkFactory.lock(1), `exceeds allowance`);
    });

    it(`Throws because no coins to unlock`, async () => {
      await shouldBeRejected(networkFactory.unlock(), `have tokens`);
    });

    it(`Approves, locks and unlocks settler`, async () => {
      await networkFactory.approveSettlerERC20Token();
      const tx = await networkFactory.lock(+fromDecimals(cap));
      expect(tx.blockHash, `lock action`).to.not.be.empty;
      expect(await networkFactory.getBEPROLocked(), `locked total`).to.eq(+fromDecimals(cap));
      await hasTxBlockNumber(networkFactory.unlock())
      expect(await networkFactory.getBEPROLocked(), `locked total`).to.eq(0);
    });

    it(`Should lock and create a new network`, async () => {
      await networkFactory.approveSettlerERC20Token();
      await hasTxBlockNumber(networkFactory.lock(+fromDecimals(cap)));
      const tx = await networkFactory.createNetwork(networkToken!, networkToken!);
      expect(await networkFactory.getAmountOfNetworksForked(), `Amount of networks`).to.eq(1);

      const event = await networkFactory.contract.self.getPastEvents(`CreatedNetwork`, {filter: {transactionHash: tx.transactionHash}})
      expect(event[0].returnValues['opener'], `Event opener`).to.be.eq(accountAddress);
    });

    it(`Throws because one network per user`, async () => {
      await shouldBeRejected(networkFactory.createNetwork(settlerToken!, settlerToken!), `one Network`)
    });

    describe(`With network`, () => {
      let network!: Network;

      before(async () => {
        network = new Network(web3Connection, await networkFactory.getNetworkByAddress(accountAddress));
        await network.loadContract();
      })

      it(`Asserts governor === accountAddress`, async () => {
        await hasTxBlockNumber(network.sendTx(network.contract.methods.claimGovernor()))
        expect(await network.callTx(network.contract.methods._governor())).to.be.eq(accountAddress);
      })

      it(`Locks tokens and throws because can't unlock`, async () => {
        await network.approveSettlerERC20Token();
        await network.lock(10);
        await shouldBeRejected(networkFactory.unlock(), `have 0 Settler`)
        await network.unlock(10, web3Connection.Account.address);
      });

      it(`Creates an issue and throws because can't unlock`, async () => {
        await network.openIssue(`cid1`, 10);
        await shouldBeRejected(networkFactory.unlock(), `have 0 Transactional`);
        await network.updateIssue(1, 0);
        await network.redeemIssue(1);
      });

      it(`Change redeem time`, async () => {
        await hasTxBlockNumber(network.changeRedeemTime(60), `Should have changed redeem time`);
        expect(await network.redeemTime()).to.be.eq(60);
      });

      it(`Changes disputable time`, async () => {
        await hasTxBlockNumber(network.changeDisputableTime(120));
      })

      it(`Should unlock because issue was redeemed`, async () => {
        await hasTxBlockNumber(networkFactory.unlock(), `should have unlocked`);
      });

      it(`Creates a new network because we have already unlocked`, async () => {
        await networkFactory.approveSettlerERC20Token();
        await networkFactory.lock(+fromDecimals(cap))
        await hasTxBlockNumber(networkFactory.createNetwork(settlerToken!, settlerToken!), `Should have created network`)
      })
    })
  })
})
