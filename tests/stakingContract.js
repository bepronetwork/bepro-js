import chai from 'chai';
import moment from 'moment';
import delay from 'delay';
import { mochaAsync } from './utils';
import { Application } from '..';
import Numbers from '../src/utils/Numbers';

import { deployed_tokenAddress } from './erc20Contract';

const { expect } = chai;
let contractAddress = '0x949d274F63127bEd53e21Ed1Dd83dD6ACAfF7f64';
const totalMaxAmount = 100;
const individualMinimumAmount = 10;
const APR = 5;
const startDate = moment().add(1, 'minutes');
const endDate = moment().add(10, 'minutes');
const timeDiff = Numbers.timeToSmartContractTime(endDate)
  - Numbers.timeToSmartContractTime(startDate);
const userDepositNeededAPR = ((((APR / 365 / 24 / 60) * timeDiff) / 60) * individualMinimumAmount) / 100;
const totalNeededAPR = ((((APR / 365 / 24 / 60) * timeDiff) / 60) * totalMaxAmount) / 100;
console.log(totalNeededAPR.toFixed(18));

context('Staking Contract', async () => {
  let stakingContract;
  let app;
  let productId;
  let subscriptionId;
  let withdrawTx;
  let startDateSubscription;
  let endDateSubscription;
  let userAddress;

  before(async () => {
    app = new Application({ test: true, localtest: true, mainnet: false });
    console.log(
      `stakingContract.deployed_tokenAddress: ${deployed_tokenAddress}`,
    );
  });

  it(
    'should start the Application',
    mochaAsync(async () => {
      app = new Application({ test: true, localtest: true, mainnet: false });
      expect(app).to.not.equal(null);
      userAddress = await app.getAddress();
    }),
  );

  it(
    'should deploy Staking Contract',
    mochaAsync(async () => {
      /* Create Contract */
      stakingContract = app.getStakingContract({
        tokenAddress: deployed_tokenAddress,
      });
      /* Deploy */
      const res = await stakingContract.deploy();
      await stakingContract.__assert();
      contractAddress = stakingContract.getAddress();
      expect(res).to.not.equal(false);
    }),
  );

  it(
    'should create a Product',
    mochaAsync(async () => {
      /* Create Event */
      let res = await stakingContract.createProduct({
        startDate: moment().add(1, 'minutes'),
        endDate: moment().add(10, 'minutes'),
        totalMaxAmount,
        individualMinimumAmount,
        APR,
        lockedUntilFinalization: false,
      });
      expect(res).to.not.equal(false);
      /* Check if product was created */
      res = await stakingContract.getProducts();
      expect(res.length).to.equal(1);
      productId = res[0];
    }),
  );

  it(
    'should get Product Data',
    mochaAsync(async () => {
      /* Create Event */
      const res = await stakingContract.getProduct({
        product_id: productId,
      });
      expect(res.createdAt).to.not.equal(false);
      expect(res.startDate).to.not.equal(false);
      expect(res.endDate).to.not.equal(false);
      expect(res.totalMaxAmount).to.not.equal(false);
      expect(res.individualMinimumAmount).to.not.equal(false);
      expect(res.APR).to.not.equal(false);
      expect(res.currentAmount).to.not.equal(false);
      expect(res.lockedUntilFinalization).to.equal(false);
      expect(res.subscribers.length).to.equal(0);
      expect(res.subscriptionIds.length).to.equal(0);
    }),
  );

  it(
    'should get APR Data',
    mochaAsync(async () => {
      let res = await stakingContract.getAPRAmount({
        APR,
        startDate,
        endDate,
        amount: individualMinimumAmount,
      });
      expect(res).to.equal(userDepositNeededAPR.toFixed(18));
      res = await stakingContract.getTotalNeededTokensForAPRbyAdmin();
      expect(Numbers.fromExponential(res).toString()).to.equal(
        totalNeededAPR.toFixed(18),
      );
    }),
  );

  it(
    'should get Held Tokens == 0',
    mochaAsync(async () => {
      /* Create Event */
      const res = await stakingContract.heldTokens();
      expect(Numbers.fromExponential(res).toString()).to.equal(
        Number(0).toString(),
      );
    }),
  );

  it(
    'should get Available Tokens == 0',
    mochaAsync(async () => {
      /* Create Event */
      const res = await stakingContract.availableTokens();
      expect(Numbers.fromExponential(res).toString()).to.equal(
        Number(0).toString(),
      );
    }),
  );

  it(
    'should get Future Locked Tokens == 0',
    mochaAsync(async () => {
      const res = await stakingContract.futureLockedTokens();
      expect(Numbers.fromExponential(res).toString()).to.equal(
        Number(0).toString(),
      );
    }),
  );

  it(
    'should get tokens needed for APR == totalNeededAPR',
    mochaAsync(async () => {
      const tokensNeeded = await stakingContract.getTotalNeededTokensForAPRbyAdmin();
      expect(
        Numbers.fromExponential(totalNeededAPR.toFixed(18)).toString(),
      ).to.equal(tokensNeeded);
    }),
  );

  it(
    'should fund with tokens needed for APR',
    mochaAsync(async () => {
      const neededTokensAmount = await stakingContract.getTotalNeededTokensForAPRbyAdmin();
      const res = await stakingContract.depositAPRTokensByAdmin({
        amount: neededTokensAmount,
      });
      expect(res).to.not.equal(false);
    }),
  );

  it(
    'should get Held Tokens == APR Needed for 1 subscription with min Amount',
    mochaAsync(async () => {
      const res = await stakingContract.heldTokens();
      const tokensNeeded = await stakingContract.getTotalNeededTokensForAPRbyAdmin();
      expect(Numbers.fromExponential(res).toString()).to.equal(tokensNeeded);
    }),
  );

  it(
    'should get Available Tokens == APR Needed for 1 subscription with min Amount',
    mochaAsync(async () => {
      const res = await stakingContract.availableTokens();
      const tokensNeeded = await stakingContract.getTotalNeededTokensForAPRbyAdmin();
      expect(Numbers.fromExponential(res).toString()).to.equal(tokensNeeded);
    }),
  );

  it(
    'should get subscribe to product Data & APR Right',
    mochaAsync(async () => {
      /* Approve Tx */
      let res = await stakingContract.approveERC20Transfer();

      expect(res).to.not.equal(false);

      res = await stakingContract.subscribeProduct({
        address: userAddress,
        product_id: productId,
        amount: individualMinimumAmount,
      });
      expect(res).to.not.equal(false);

      res = await stakingContract.getSubscriptionsByAddress({
        address: userAddress,
      });
      expect(res.length).to.equal(1);
      subscriptionId = res[0];
    }),
  );

  it(
    'should get Subscription Data Right',
    mochaAsync(async () => {
      const res = await stakingContract.getSubscription({
        subscription_id: subscriptionId,
        product_id: productId,
      });
      startDateSubscription = res.startDate;
      endDateSubscription = res.endDate;
      expect(res.startDate).to.not.equal(false);
      expect(res.endDate).to.not.equal(false);
      expect(res.amount).to.equal(individualMinimumAmount.toString());
      expect(res.subscriberAddress).to.equal(userAddress);
      expect(res.APR).to.equal(APR);
      expect(res.finalized).to.equal(false);
    }),
  );

  it(
    'should get Held Tokens == APR Amount + indivualAmount',
    mochaAsync(async () => {
      const res = await stakingContract.heldTokens();
      expect(res).to.equal(
        Number(individualMinimumAmount + totalNeededAPR).toString(),
      );
    }),
  );

  it(
    'should get Future Locked Tokens == APR Amount',
    mochaAsync(async () => {
      const res = await stakingContract.futureLockedTokens();
      const userAPR = ((((APR / 365 / 24 / 60)
          * (Numbers.timeToSmartContractTime(endDateSubscription)
            - Numbers.timeToSmartContractTime(startDateSubscription)))
          / 60)
          * individualMinimumAmount)
        / 100;
      expect(res).to.equal(
        Number(individualMinimumAmount + userAPR).toString(),
      );
    }),
  );

  it(
    'should get Available Tokens == 0 (all used)',
    mochaAsync(async () => {
      const res = await stakingContract.availableTokens();
      const userAPR = ((((APR / 365 / 24 / 60)
          * (Numbers.timeToSmartContractTime(endDateSubscription)
            - Numbers.timeToSmartContractTime(startDateSubscription)))
          / 60)
          * individualMinimumAmount)
        / 100;
      expect(res).to.equal(Number(totalNeededAPR - userAPR).toFixed(18));
    }),
  );

  it(
    'should withdraw Subscription',
    mochaAsync(async () => {
      await delay(1 * 60 * 1000);
      const res = await stakingContract.withdrawSubscription({
        subscription_id: subscriptionId,
        product_id: productId,
      });
      withdrawTx = res;
      expect(res).to.not.equal(false);
    }),
  );

  it(
    'should confirm Subscription Data after Withdraw',
    mochaAsync(async () => {
      const res = await stakingContract.getSubscription({
        subscription_id: subscriptionId,
        product_id: productId,
      });
      expect(res.endDate).to.not.equal(false);
      expect(res.finalized).to.equal(true);

      const apr = await stakingContract.getAPRAmount({
        APR,
        startDate: res.startDate,
        endDate: res.endDate,
        amount: individualMinimumAmount,
      });
      expect(res.withdrawAmount).to.equal(
        String(Number(apr) + Number(individualMinimumAmount)).toString(),
      );
    }),
  );
});
