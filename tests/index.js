

import chai from 'chai';
import { mochaAsync } from './utils';
import moment from 'moment';
import Application from '../src/models';
import delay from 'delay';
var contractAddress = '';
var userPrivateKey = '0x7f76de05082c4d578219ca35a905f8debe922f1f00b99315ebf0706afc97f132';

const expect = chai.expect;
const tokenPurchaseAmount = 0.0000000000021455460;
const tokenFundAmount = 0.000000000003455460;
const tradeValue = 0.0000000000012342;

context('Tests', async () => {
    var swapContract;
    var app;
   
    before( async () =>  {
        app = new Application({test : true, mainnet : false});
    });

    it('should deploy Fixed Swap Contract', mochaAsync(async () => {

        app = new Application({test : true, mainnet : false});
        /* Create Contract */
        swapContract = app.getFixedSwapContract({tokenAddress : ERC20TokenAddress, decimals : 18});
        /* Deploy */
        let res = await swapContract.deploy({
            tradeValue : tradeValue, 
            tokensForSale : tokenFundAmount, 
            isTokenSwapAtomic : true,
            individualMaximumAmount : tokenFundAmount,
            startDate : moment().add(6, 'minutes'),
            endDate : moment().add(8, 'minutes'),
            hasWhitelisting : true
        });
        contractAddress = swapContract.getAddress();
        expect(res).to.not.equal(false);
    }));


});
