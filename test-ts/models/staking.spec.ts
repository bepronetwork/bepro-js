import {StakingContract, StakingProduct, StakingSubscription} from '../../src-ts';
import {
  calculateAPR,
  defaultWeb3Connection,
  erc20Deployer,
  hasTxBlockNumber,
  increaseTime,
  revertChain
} from '../utils';
import {toSmartContractDecimals} from '../../src-ts/utils/numbers';
import {addMinutes} from 'date-fns'
import {expect} from 'chai';

describe.only(`StakingContract`, () => {
  let contract: StakingContract;
  let contractAddress: string;
  let stakeTokenAddress: string;
  //let accountAddress: string;
  let product: StakingProduct;
  let subscription: StakingSubscription;

  const stakeTokenCap = toSmartContractDecimals(1000) as number;
  const web3Connection = defaultWeb3Connection();

  before(async () => {
    await web3Connection.start();
    await revertChain(web3Connection.Web3);
    //accountAddress = web3Connection.Account.address;
  });

  it(`Deploys contract`, async () => {
    const erc20 = await erc20Deployer(`Staking`, `$stake`, stakeTokenCap, web3Connection);
    const deployer = new StakingContract(web3Connection);
    deployer.loadAbi();

    const deployed = await deployer.deployJsonAbi(erc20.contractAddress!);
    expect(deployed.contractAddress).to.exist;
    contractAddress = deployed.contractAddress!;
    stakeTokenAddress = erc20.contractAddress!;
  });

  describe(`Methods`, () => {
    before(async () => {
      contract = new StakingContract(web3Connection, contractAddress, stakeTokenAddress);
      await contract.loadContract();
    });

    it(`Approves transfers`, async () => {
      await hasTxBlockNumber(contract.approveERC20Transfer());
    });

    it(`Creates a staking product`, async () => {
      const startDate = +addMinutes(new Date(), 10);
      const endDate = +addMinutes(new Date(), 20);

      await hasTxBlockNumber(
        contract.createProduct(
          startDate, endDate, 10, 1,
          3, 1, false));

      const ids = await contract.getProductIds();

      expect(ids).to.have.length(1);

      product = await contract.getProduct(ids[0])
      expect(product.createdAt).to.not.be.false;
      console.log(product);
    });

    it(`Should deposit needed to apr admin`, async () => {
      const {APR, startDate, endDate, totalMaxAmount} = product;
      const totalNeeded = await contract.getAPRAmount(APR, startDate, endDate, totalMaxAmount);
      await hasTxBlockNumber(contract.depositAPRTokens(totalNeeded));

      expect(await contract.getTotalProductsAPRAmount()).to.eq(totalNeeded);
    });

    it(`Subscribes to product`, async () => {
      await increaseTime(65*10, web3Connection.Web3);

      await hasTxBlockNumber(contract.subscribeProduct(product._id, 1));

      subscription = await contract.getSubscription(0, product._id);
      expect(subscription.startDate).to.not.be.false;
      console.log(subscription);
    });

    it(`Checks held tokens`, async () => {
      expect(await contract.heldTokens())
        .to.eq(calculateAPR(1, product.startDate, product.endDate, 10))
    });

    it(`Checks future locked tokens`, async () => {
      expect(await contract.futureLockedTokens())
        .to.eq(calculateAPR(1, subscription.startDate, subscription.endDate, 1))
    });

    it(`Withdraws subscription`, async () => {
      await increaseTime(62*20, web3Connection.Web3);
      await hasTxBlockNumber(contract.withdrawSubscription(product._id, subscription._id));
      const {finalized, withdrawAmount, startDate, endDate} = await contract.getSubscription(subscription._id, product._id);
      const aprAmount = await contract.getAPRAmount(1, startDate, endDate, 1)
      expect(finalized).to.be.true;
      expect(withdrawAmount).to.eq(aprAmount+1);
      console.log(`withdrawn`, withdrawAmount);
    });

  });
})
