

import chai from 'chai';
import { mochaAsync } from './utils';
import { Application } from '..';
import moment from 'moment';
import Numbers from '../src/utils/Numbers';
var userPrivateKey = '0x7f76de05082c4d578219ca35a905f8debe922f1f00b99315ebf0706afc97f132';
const tokenAddress = "0x7a7748bd6f9bac76c2f3fcb29723227e3376cbb2";
const expect = chai.expect;
const ethAmount = 0.1;
var contractAddress = '0x949d274F63127bEd53e21Ed1Dd83dD6ACAfF7f64';
var totalMaxAmount = 100;
var individualMinimumAmount = 10;
var APR = 5;
var startDate = moment().add(1, 'minutes');
var endDate = moment().add(10, 'minutes');
var adminDeposit = APR/365/24/60*9*individualMinimumAmount/100;
var totalNeededAPR = APR/365/24/60*9*totalMaxAmount/100;

console.log("totalNeededAPR", totalNeededAPR, adminDeposit);

context('Staking Contract', async () => {
    var stakingContract;
    var app;
    var productId, subscriptionId, withdrawTx;
   
    before( async () =>  {
        app = new Application({test : true, mainnet : false});
    });

    it('should start the Application', mochaAsync(async () => {
        app = new Application({test : true, mainnet : false});
        expect(app).to.not.equal(null);
    }));

    it('should deploy Staking Contract', mochaAsync(async () => {
        /* Create Contract */
        stakingContract = app.getStakingContract({tokenAddress : tokenAddress});
        /* Deploy */
        let res = await stakingContract.deploy();
        await stakingContract.__assert();
        contractAddress = stakingContract.getAddress();
        expect(res).to.not.equal(false);
    }));


    it('should create a Product', mochaAsync(async () => {
        /* Create Event */
        let res = await stakingContract.createProduct({
            startDate : moment().add(1, 'minutes'),
            endDate : moment().add(10, 'minutes'),
            totalMaxAmount : totalMaxAmount,
            individualMinimumAmount : individualMinimumAmount,
            APR : APR,
            lockedUntilFinalization : false
        });
        expect(res).to.not.equal(false);
        /* Check if product was created */
        res = await stakingContract.getProducts();
        expect(res.length).to.equal(1);
        productId = res[0];
    }));


    it('should get Product Data', mochaAsync(async () => {
        /* Create Event */
        let res = await stakingContract.getProduct({
            product_id : productId
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
    }));

    it('should get APR Data', mochaAsync(async () => {

        let res = await stakingContract.getAPRAmount({
            APR, 
            startDate, 
            endDate, 
            amount : individualMinimumAmount
        });
        console.log("here", "here")
        expect(res).to.equal(adminDeposit.toFixed(18));

        res = await stakingContract.getTotalNeededTokensForAPRbyAdmin();
        console.log("res", res, Numbers.fromExponential(res))
        expect(Numbers.fromExponential(res).toFixed(18)).to.equal(totalNeededAPR.toFixed(18));
    }));

    // it('should get Held Tokens == 0', mochaAsync(async () => {
    //     /* Create Event */
    //     let res = await stakingContract.heldTokens();
    //     expect(res).to.equal(0);
    // }));

    // it('should get Available Tokens == 0', mochaAsync(async () => {
    //     /* Create Event */
    //     let res = await stakingContract.availableTokens();
    //     expect(res).to.equal(0);
    // }));

    // it('should get Future Locked Tokens == 0', mochaAsync(async () => {
    //     let res = await stakingContract.futureLockedTokens();
    //     expect(res).to.equal(0);
    // }));

    // it('should fund with tokens needed for APR', mochaAsync(async () => {
    //     let neededTokensAmount = await stakingContract.getTotalNeededTokensForAPRbyAdmin();
    //     let res = await stakingContract.depositAPRTokensByAdmin({amount : neededTokensAmount});
    //     expect(res).to.not.equal(false);
    // }));

    // it('should get Held Tokens == APR Needed for 1 subscription with min Amount', mochaAsync(async () => {
    //     let res = await stakingContract.heldTokens();
    //     expect(res).to.equal(await stakingContract.getTotalNeededTokensForAPRbyAdmin());
    // }));

    // it('should get Available Tokens == APR Needed for 1 subscription with min Amount', mochaAsync(async () => {
    //     let res = await stakingContract.availableTokens();
    //     expect(res).to.equal(await stakingContract.getTotalNeededTokensForAPRbyAdmin());
    // }));


    // it('should get subscribe to product Data & APR Right', mochaAsync(async () => {
    //     /* Approve Tx */
    //     let res = await stakingContract.approveERC20Transfer({
    //         address,
    //         product_id : productId,
    //         amount : individualMinimumAmount
    //     });

    //     expect(res).to.not.equal(false);

    //     res = await stakingContract.subscribeProduct({
    //         address : await app.getAddress(),
    //         product_id : productId,
    //         amount : individualMinimumAmount
    //     });
    //     expect(res).to.not.equal(false);

    //     res = await stakingContract.getSubscriptionsByAddress({address : await app.getAddress()});
    //     expect(res.length).to.equal(1);
    //     subscriptionId = res[0];
    // }));

    // it('should get Subscription Data Right', mochaAsync(async () => {
    //     let res = await stakingContract.getSubscription({
    //         subscription_id : subscriptionId,
    //         product_id : productId
    //     });

    //     expect(res._id).to.equal(subscriptionId);
    //     expect(res.productId).to.equal(productId);
    //     expect(res.startDate).to.not.equal(false);
    //     expect(res.endDate).to.not.equal(false);
    //     expect(res.amount).to.equal(individualMinimumAmount);
    //     expect(res.subscriberAddress).to.equal(await app.getAddress());
    //     expect(res.APR).to.equal(adminDeposit);
    //     expect(res.finalized).to.equal(false);
    // }));


    // it('should get Held Tokens == APR Amount + indivualAmount', mochaAsync(async () => {
    //     let res = await stakingContract.heldTokens();
    //     expect(res).to.equal(adminDeposit + individualMinimumAmount);
    // }));

    // it('should get Available Tokens == 0 (all used)', mochaAsync(async () => {
    //     let res = await stakingContract.availableTokens();
    //     expect(res).to.equal(0);
    // }));

    // it('should get Future Locked Tokens == APR Amount', mochaAsync(async () => {
    //     let res = await stakingContract.futureLockedTokens();
    //     expect(res).to.equal(adminDeposit + individualMinimumAmount);
    // }));


    // it('should withdraw Subscription', mochaAsync(async () => {
    //     let res = await stakingContract.withdrawSubscription({
    //         subscription_id : subscriptionId,
    //         product_id : productId
    //     });
    //     withdrawTx = res;
    //     expect(res).to.not.equal(false);
    // }));

    // it('should confirm Subscription Data after Withdraw', mochaAsync(async () => {
    //     let res = await stakingContract.getSubscription({
    //         subscription_id : subscriptionId,
    //         product_id : productId
    //     });

    //     expect(res.endDate).to.not.equal(false);
    //     expect(res.finalized).to.equal(true);


    //     let apr = await stakingContract.getAPRAmount({
    //         APR : APR, 
    //         startDate : res.startDate, 
    //         endDate : res.endDate, 
    //         amount : individualMinimumAmount
    //     });
    //     console.log("v", withdrawTx)
    
    //     expect(withdrawTx.amount).to.equal(apr + individualMinimumAmount);

    // }));

});
