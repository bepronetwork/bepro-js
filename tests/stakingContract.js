

import chai from 'chai';
import { mochaAsync } from './utils';
import { Application } from '..';
import moment from 'moment';
import delay from 'delay';
import Numbers from '../src/utils/Numbers';
var userPrivateKey = '0x7f76de05082c4d578219ca35a905f8debe922f1f00b99315ebf0706afc97f132';
const tokenAddress = "0x7a7748bd6f9bac76c2f3fcb29723227e3376cbb2";
import { deployed_tokenAddress } from './erc20Contract';
const expect = chai.expect;
const ethAmount = 0.1;
var contractAddress = '0x949d274F63127bEd53e21Ed1Dd83dD6ACAfF7f64';
var totalMaxAmount = 100;
var individualMinimumAmount = 10;
var APR = 5;
var startDate = moment().add(1, 'minutes');
var endDate = moment().add(10, 'minutes');
var timeDiff = Numbers.timeToSmartContractTime(endDate) - Numbers.timeToSmartContractTime(startDate);
var userDepositNeededAPR = APR/365/24/60*timeDiff/60*individualMinimumAmount/100;
var totalNeededAPR = APR/365/24/60*timeDiff/60*totalMaxAmount/100;
console.log(totalNeededAPR.toFixed(18))

context('Staking Contract', async () => {
    var stakingContract;
    var app;
    var productId, subscriptionId, withdrawTx, startDateSubscription, endDateSubscription;
	var userAddress;
	
    before( async () =>  {
        app = new Application({test : true, localtest: true, mainnet : false});
		console.log('stakingContract.deployed_tokenAddress: ' + deployed_tokenAddress);
    });

    it('should start the Application', mochaAsync(async () => {
        app = new Application({test : true, localtest: true, mainnet : false});
        expect(app).to.not.equal(null);
		userAddress = await app.getAddress();
    }));

    it('should deploy Staking Contract', mochaAsync(async () => {
        /* Create Contract */
        stakingContract = app.getStakingContract({tokenAddress : deployed_tokenAddress});
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
        expect(res).to.equal(userDepositNeededAPR.toFixed(18));
        res = await stakingContract.getTotalNeededTokensForAPRbyAdmin();
        expect(Numbers.fromExponential(res).toString()).to.equal(totalNeededAPR.toFixed(18));
    }));

    it('should get Held Tokens == 0', mochaAsync(async () => {
        /* Create Event */
        let res = await stakingContract.heldTokens();
        expect(Numbers.fromExponential(res).toString()).to.equal(Number(0).toString());
    }));

    it('should get Available Tokens == 0', mochaAsync(async () => {
        /* Create Event */
        let res = await stakingContract.availableTokens();
        expect(Numbers.fromExponential(res).toString()).to.equal(Number(0).toString());
    }));

    it('should get Future Locked Tokens == 0', mochaAsync(async () => {
        let res = await stakingContract.futureLockedTokens();
        expect(Numbers.fromExponential(res).toString()).to.equal(Number(0).toString());
    }));

    it('should get tokens needed for APR == totalNeededAPR', mochaAsync(async () => {
        let tokensNeeded = await stakingContract.getTotalNeededTokensForAPRbyAdmin();
        expect(Numbers.fromExponential(totalNeededAPR.toFixed(18)).toString()).to.equal(tokensNeeded);
    }));

    it('should fund with tokens needed for APR', mochaAsync(async () => {
        let neededTokensAmount = await stakingContract.getTotalNeededTokensForAPRbyAdmin();
        let res = await stakingContract.depositAPRTokensByAdmin({amount : neededTokensAmount});
        expect(res).to.not.equal(false);
    }));

    it('should get Held Tokens == APR Needed for 1 subscription with min Amount', mochaAsync(async () => {
        let res = await stakingContract.heldTokens();
        let tokensNeeded = await stakingContract.getTotalNeededTokensForAPRbyAdmin();
        expect(Numbers.fromExponential(res).toString()).to.equal(tokensNeeded);
    }));

    it('should get Available Tokens == APR Needed for 1 subscription with min Amount', mochaAsync(async () => {
        let res = await stakingContract.availableTokens();
        let tokensNeeded = await stakingContract.getTotalNeededTokensForAPRbyAdmin();
        expect(Numbers.fromExponential(res).toString()).to.equal(tokensNeeded);
    }));


    it('should get subscribe to product Data & APR Right', mochaAsync(async () => {
        /* Approve Tx */
        let res = await stakingContract.approveERC20Transfer();

        expect(res).to.not.equal(false);

        res = await stakingContract.subscribeProduct({
            address : userAddress,
            product_id : productId,
            amount : individualMinimumAmount 
        });
        expect(res).to.not.equal(false);

        res = await stakingContract.getSubscriptionsByAddress({address : userAddress});
        expect(res.length).to.equal(1);
        subscriptionId = res[0];
    }));

    it('should get Subscription Data Right', mochaAsync(async () => {
        let res = await stakingContract.getSubscription({
            subscription_id : subscriptionId,
            product_id : productId
        });
        startDateSubscription = res.startDate;
        endDateSubscription = res.endDate;
        console.log("res", res)
        expect(res.startDate).to.not.equal(false);
        expect(res.endDate).to.not.equal(false);
        expect(res.amount).to.equal(individualMinimumAmount.toString());
        expect(res.subscriberAddress).to.equal(userAddress);
        expect(res.APR).to.equal(APR);
        expect(res.finalized).to.equal(false);
    }));


    it('should get Held Tokens == APR Amount + indivualAmount', mochaAsync(async () => {
        let res = await stakingContract.heldTokens();
        expect(res).to.equal(Number(individualMinimumAmount + totalNeededAPR).toString());
    }));

    it('should get Future Locked Tokens == APR Amount', mochaAsync(async () => {
        let res = await stakingContract.futureLockedTokens();
        let userAPR = APR/365/24/60*(Numbers.timeToSmartContractTime(endDateSubscription)-Numbers.timeToSmartContractTime(startDateSubscription))/60*individualMinimumAmount/100;
        expect(res).to.equal(Number(individualMinimumAmount + userAPR).toString());
    }));

    it('should get Available Tokens == 0 (all used)', mochaAsync(async () => {
        let res = await stakingContract.availableTokens();
        let userAPR = APR/365/24/60*(Numbers.timeToSmartContractTime(endDateSubscription)-Numbers.timeToSmartContractTime(startDateSubscription))/60*individualMinimumAmount/100;
        expect(res).to.equal(Number(totalNeededAPR - userAPR).toFixed(18));
    }));

    it('should withdraw Subscription', mochaAsync(async () => {
        setTimeout( async () => {
            console.log(new Date())
            let res = await stakingContract.withdrawSubscription({
                subscription_id : subscriptionId,
                product_id : productId
            });
            withdrawTx = res;
            console.log("withdrawTx", res)
            expect(res).to.not.equal(false);
            done();
        }, 1000);       
    }));

    it('should confirm Subscription Data after Withdraw', mochaAsync(async () => {
        let res = await stakingContract.getSubscription({
            subscription_id : subscriptionId,
            product_id : productId
        });
        console.log("r", res)
        expect(res.endDate).to.not.equal(false);
        expect(res.finalized).to.equal(true);
   
        let apr = await stakingContract.getAPRAmount({
            APR : APR, 
            startDate : res.startDate, 
            endDate : res.endDate, 
            amount : individualMinimumAmount
        });
        console.log("res", res.withdrawAmount, individualMinimumAmount, apr)
    
        expect(res.withdrawAmount).to.equal(Number(apr) + Number(individualMinimumAmount));
    }));

});