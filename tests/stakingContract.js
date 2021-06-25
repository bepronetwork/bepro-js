import { expect, assert } from "chai";
import moment from "moment";
import delay from "delay";
import { mochaAsync } from "./utils";
import { ERC20Contract, StakingContract } from "../build";
import Numbers from "../build/utils/Numbers";
let userPrivateKey =
  "0x7f76de05082c4d578219ca35a905f8debe922f1f00b99315ebf0706afc97f132";
const tokenAddress = "0x7a7748bd6f9bac76c2f3fcb29723227e3376cbb2";
let contractAddress = "0x949d274F63127bEd53e21Ed1Dd83dD6ACAfF7f64";
const totalMaxAmount = 100;
const individualMinimumAmount = 10;
const APR = 5;
const startDate = moment().add(1, "minutes");
const endDate = moment().add(10, "minutes");
const timeDiff =
  Numbers.timeToSmartContractTime(endDate) -
  Numbers.timeToSmartContractTime(startDate);
const userDepositNeededAPR =
  ((((APR / 365 / 24 / 60) * timeDiff) / 60) * individualMinimumAmount) / 100;
const totalNeededAPR =
  ((((APR / 365 / 24 / 60) * timeDiff) / 60) * totalMaxAmount) / 100;
console.log(totalNeededAPR.toFixed(18));
let deployed_tokenAddress;
const testConfig = {
  test: true,
  localtest: true, //ganache local blockchain
};

context("Staking Contract", async () => {
  let erc20Contract;
  let stakingContract;
  let app;
  let productId;
  let subscriptionId;
  let withdrawTx;
  let startDateSubscription;
  let endDateSubscription;
  let userAddress;

  before(async () => {
    stakingContract = new StakingContract(testConfig);
    userAddress = await stakingContract.getUserAddress(); //local test with ganache
    console.log("stakingContract.userAddress: " + userAddress);
  });

  ///this function is needed in all contracts working with an ERC20Contract token
  ///NOTE: it deploys a new ERC20Contract token for individual contract functionality testing
  it(
    "should deploy a new ERC20Contract",
    mochaAsync(async () => {
      // Create Contract
      erc20Contract = new ERC20Contract(testConfig);
      expect(erc20Contract).to.not.equal(null);
      // Deploy
      const res = await erc20Contract.deploy({
        name: "test",
        symbol: "B.E.P.R.O",
        cap: Numbers.toSmartContractDecimals(100000000, 18),
        distributionAddress: userAddress, //await app.getAddress()
      });
      await erc20Contract.__assert();
      deployed_tokenAddress = erc20Contract.getAddress();
      expect(res).to.not.equal(false);
      expect(deployed_tokenAddress).to.equal(res.contractAddress);
      console.log(
        "ERC20Contract.deployed_tokenAddress: " + deployed_tokenAddress
      );
    })
  );

  it(
    "should start the StakingContract",
    mochaAsync(async () => {
      stakingContract = new StakingContract(testConfig);
      expect(app).to.not.equal(null);
    })
  );

  it(
    "should deploy Staking Contract",
    mochaAsync(async () => {
      /* Create Contract */
      //stakingContract = new StakingContract({tokenAddress : deployed_tokenAddress}); //LIVE on mainnet
      stakingContract = new StakingContract({
        ...testConfig,
        tokenAddress: deployed_tokenAddress,
      }); //ganache local test
      /* Deploy */
      const res = await stakingContract.deploy();
      await stakingContract.__assert();
      contractAddress = stakingContract.getAddress();
      expect(res).to.not.equal(false);
    })
  );

  it(
    "should create a Product",
    mochaAsync(async () => {
      /* Create Event */
      let res = await stakingContract.createProduct({
        startDate: moment().add(1, "minutes"),
        endDate: moment().add(10, "minutes"),
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
    })
  );

  it(
    "should get Product Data",
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
    })
  );

  it(
    "should get APR Data",
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
        totalNeededAPR.toFixed(18)
      );
    })
  );

  it(
    "should get Held Tokens == 0",
    mochaAsync(async () => {
      /* Create Event */
      const res = await stakingContract.heldTokens();
      expect(Numbers.fromExponential(res).toString()).to.equal(
        Number(0).toString()
      );
    })
  );

  it(
    "should get Available Tokens == 0",
    mochaAsync(async () => {
      /* Create Event */
      const res = await stakingContract.availableTokens();
      expect(Numbers.fromExponential(res).toString()).to.equal(
        Number(0).toString()
      );
    })
  );

  it(
    "should get Future Locked Tokens == 0",
    mochaAsync(async () => {
      const res = await stakingContract.futureLockedTokens();
      expect(Numbers.fromExponential(res).toString()).to.equal(
        Number(0).toString()
      );
    })
  );

  it(
    "should get tokens needed for APR == totalNeededAPR",
    mochaAsync(async () => {
      const tokensNeeded =
        await stakingContract.getTotalNeededTokensForAPRbyAdmin();
      expect(
        Numbers.fromExponential(totalNeededAPR.toFixed(18)).toString()
      ).to.equal(tokensNeeded);
    })
  );

  it(
    "should fund with tokens needed for APR",
    mochaAsync(async () => {
      const neededTokensAmount =
        await stakingContract.getTotalNeededTokensForAPRbyAdmin();
      const res = await stakingContract.depositAPRTokensByAdmin({
        amount: neededTokensAmount,
      });
      expect(res).to.not.equal(false);
    })
  );

  it(
    "should get Held Tokens == APR Needed for 1 subscription with min Amount",
    mochaAsync(async () => {
      const res = await stakingContract.heldTokens();
      const tokensNeeded =
        await stakingContract.getTotalNeededTokensForAPRbyAdmin();
      expect(Numbers.fromExponential(res).toString()).to.equal(tokensNeeded);
    })
  );

  it(
    "should get Available Tokens == APR Needed for 1 subscription with min Amount",
    mochaAsync(async () => {
      const res = await stakingContract.availableTokens();
      const tokensNeeded =
        await stakingContract.getTotalNeededTokensForAPRbyAdmin();
      expect(Numbers.fromExponential(res).toString()).to.equal(tokensNeeded);
    })
  );

  it(
    "should get subscribe to product Data & APR Right",
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
    })
  );

  it(
    "should get Subscription Data Right",
    mochaAsync(async () => {
      const res = await stakingContract.getSubscription({
        subscription_id: subscriptionId,
        product_id: productId,
      });
      startDateSubscription = res.startDate;
      endDateSubscription = res.endDate;
      console.log("res", res);
      expect(res.startDate).to.not.equal(false);
      expect(res.endDate).to.not.equal(false);
      expect(res.amount).to.equal(individualMinimumAmount.toString());
      expect(res.subscriberAddress).to.equal(userAddress);
      expect(res.APR).to.equal(APR);
      expect(res.finalized).to.equal(false);
    })
  );

  it(
    "should get Held Tokens == APR Amount + indivualAmount",
    mochaAsync(async () => {
      const res = await stakingContract.heldTokens();
      expect(res).to.equal(
        Number(individualMinimumAmount + totalNeededAPR).toString()
      );
    })
  );

  it(
    "should get Future Locked Tokens == APR Amount",
    mochaAsync(async () => {
      const res = await stakingContract.futureLockedTokens();
      const userAPR =
        ((((APR / 365 / 24 / 60) *
          (Numbers.timeToSmartContractTime(endDateSubscription) -
            Numbers.timeToSmartContractTime(startDateSubscription))) /
          60) *
          individualMinimumAmount) /
        100;
      expect(res).to.equal(
        Number(individualMinimumAmount + userAPR).toString()
      );
    })
  );

  it(
    "should get Available Tokens == 0 (all used)",
    mochaAsync(async () => {
      const res = await stakingContract.availableTokens();
      const userAPR =
        ((((APR / 365 / 24 / 60) *
          (Numbers.timeToSmartContractTime(endDateSubscription) -
            Numbers.timeToSmartContractTime(startDateSubscription))) /
          60) *
          individualMinimumAmount) /
        100;
      expect(res).to.equal(Number(totalNeededAPR - userAPR).toFixed(18));
    })
  );

  it(
    "should withdraw Subscription",
    mochaAsync(async () => {
      await delay(1 * 60 * 1000);
      const res = await stakingContract.withdrawSubscription({
        subscription_id: subscriptionId,
        product_id: productId,
      });
      withdrawTx = res;
      expect(res).to.not.equal(false);
    })
  );

  it(
    "should confirm Subscription Data after Withdraw",
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
        String(Number(apr) + Number(individualMinimumAmount)).toString()
      );
    })
  );
});
