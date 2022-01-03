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
import {addMilliseconds, addMinutes, differenceInMilliseconds, differenceInSeconds} from 'date-fns'
import {expect} from 'chai';

describe.only(`StakingContract`, () => {
  let contract: StakingContract;
  let contractAddress: string;
  let stakeTokenAddress: string;

  let product: StakingProduct;
  let subscription: StakingSubscription;

  let endDate: number;
  let startDate: number;

  let totalNeededAPR: number;

  const stakeTokenCap = toSmartContractDecimals(1000) as number;
  const web3Connection = defaultWeb3Connection();

  const APR = 5;
  const totalMaxAmount = 100;
  const individualMinAmount = 10;
  const individualMaxAmount = 30;

  const calculateApr = (_amount: number, time: number) => ((((APR / 365 / 24 / 60) * time) / 60) * _amount) / 100;
  // const userDepositNeeded = calculateApr(individualMinAmount);


  before(async () => {
    await web3Connection.start();
    await revertChain(web3Connection.Web3);

    // matching js time with chain time
    const time = +(await web3Connection.eth.getBlock(await web3Connection.Web3.eth.getBlockNumber())).timestamp * 1000;
    const traveled = addMilliseconds(new Date(), differenceInMilliseconds(new Date(), time));
    endDate = +addMinutes(traveled, 10);
    startDate = +addMinutes(traveled, 2);
    totalNeededAPR = calculateApr(totalMaxAmount, differenceInSeconds(endDate, startDate));
    //accountAddress = web3Connection.Account.address;
    console.log(traveled, new Date(endDate), new Date(startDate), totalNeededAPR)
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

      await hasTxBlockNumber(
        contract.createProduct(startDate, endDate, totalMaxAmount, individualMinAmount,
                               individualMaxAmount, APR, false));

      const ids = await contract.getProductIds();

      expect(ids).to.have.length(1);

      product = await contract.getProduct(ids[0])
      expect(product.createdAt).to.not.be.false;
    });

    it(`Should deposit needed to apr admin`, async () => {
      const {APR, startDate, endDate, totalMaxAmount} = product;
      const totalNeeded = await contract.getAPRAmount(APR, startDate, endDate, totalMaxAmount);
      console.log(totalNeeded, totalNeededAPR);
      await hasTxBlockNumber(contract.depositAPRTokens(totalNeeded));

      expect(await contract.getTotalProductsAPRAmount()).to.eq(totalNeeded);
    });

    it(`Subscribes to product`, async () => {
      await hasTxBlockNumber(contract.subscribeProduct(1, 1));

      subscription = await contract.getSubscription(1, 1);

      console.log(subscription);
      console.log(await contract.getProduct(1));

      expect(subscription.startDate).to.be.greaterThan(0);

    });

    it(`Checks held tokens`, async () => {
      expect(await contract.heldTokens())
        .to.eq(individualMinAmount + totalNeededAPR)
    });

    it(`Checks future locked tokens`, async () => {
      expect(await contract.futureLockedTokens())
        .to.eq(calculateAPR(1, subscription.startDate, subscription.endDate, 1))
    });

    it(`Withdraws subscription`, async () => {
      await increaseTime(62, web3Connection.Web3);
      await hasTxBlockNumber(contract.withdrawSubscription(product._id, subscription._id));
      const {finalized, withdrawAmount, startDate, endDate} = await contract.getSubscription(subscription._id, product._id);
      const aprAmount = await contract.getAPRAmount(1, startDate, endDate, 1)
      expect(finalized).to.be.true;
      expect(withdrawAmount).to.eq(aprAmount+1);
      console.log(`withdrawn`, withdrawAmount);
    });

  });
})
