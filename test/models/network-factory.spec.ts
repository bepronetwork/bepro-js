import {Network, NetworkFactory, Web3Connection} from '../../src';
import {fromDecimals, toSmartContractDecimals} from '../../src/utils/numbers';
import {shouldBeRejected, defaultWeb3Connection, erc20Deployer, revertChain, outputDeploy, hasTxBlockNumber} from '../utils/';
import {describe, it} from 'mocha';
import {expect} from 'chai';
import {Errors} from '../../src/interfaces/error-enum';

describe(`NetworkFactory`, () => {

  let web3Connection: Web3Connection;
  let networkFactoryContractAddress = process.env.NETWORK_FACTORY_ADDRESS;
  let settlerToken: string;
  let networkToken: string;

  const cap = toSmartContractDecimals(1000000) as number;

  before(async () => {
    web3Connection = defaultWeb3Connection();
    await web3Connection.start();
    await revertChain(web3Connection.Web3);
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
      expect(event[0].returnValues[1], `Event opener`).to.be.eq(web3Connection.Account.address);
    });

    it(`Throws because one network per user`, async () => {
      await shouldBeRejected(networkFactory.createNetwork(settlerToken!, settlerToken!), `one Network`)
    });

    describe(`With network`, () => {
      let network!: Network;

      before(async () => {
        network = new Network(web3Connection, await networkFactory.getNetworkByAddress(web3Connection.Account.address));
        await network.loadContract();
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

      it(`Should unlock because issue was redeemed`, async () => {
        expect((await networkFactory.unlock())?.blockHash).to.exist;
      });

      it(`Creates a new network because we have already unlocked`, async () => {
        await networkFactory.approveSettlerERC20Token();
        await networkFactory.lock(+fromDecimals(cap))
        expect((await networkFactory.createNetwork(settlerToken!, settlerToken!))?.blockHash).to.exist;
      })
    })
  })
})
