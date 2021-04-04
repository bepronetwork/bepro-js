

import chai from 'chai';
import { mochaAsync } from './utils';
import { Application } from '..';
import moment from 'moment';

const expect = chai.expect;
const ethAmount = 0.1;

context('Prediction Market Contract', async () => {
    let app;
    let predictionMarketContract;
    let contractAddress;

    // market / outcome ids we'll make unit tests with
    let marketId = 0;
    let outcomeIds = [0, 1];

    before( async () =>  {
        app = new Application({test : true, mainnet : false});
    });

    it('should start the Application', mochaAsync(async () => {
        app = new Application({test : true, mainnet : false});
        expect(app).to.not.equal(null);
    }));

    it('should deploy Prediction Market Contract', mochaAsync(async () => {
        // Create Contract
        predictionMarketContract = app.getPredictionMarketContract({contractAddress : contractAddress});
        // Deploy
        const res = await predictionMarketContract.deploy({});
        contractAddress = predictionMarketContract.getAddress();
        expect(res).to.not.equal(false);
    }));

    it('should create a Market', mochaAsync(async () => {
        const res = await predictionMarketContract.createMarket({
            name: 'Will BTC price close above 100k$ on May 1st 2022',
            oracleAddress: '0x0000000000000000000000000000000000000000', // TODO
            duration: moment('2022-05-01').diff(moment(), 'seconds'),
            outcome1Name: 'Yes',
            outcome2Name: 'No',
            ethAmount: ethAmount
        })
        expect(res.status).to.equal(true);

        const marketIds = await predictionMarketContract.getMarkets();
        expect(marketIds.length).to.equal(1);
        expect(marketIds[0]).to.equal(marketId);
    }));

    it('should create another Market', mochaAsync(async () => {
        const res = await predictionMarketContract.createMarket({
            name: 'Will ETH price close above 10k$ on May 1st 2022',
            oracleAddress: '0x0000000000000000000000000000000000000000', // TODO
            duration: moment('2022-05-01').diff(moment(), 'seconds'),
            outcome1Name: 'Yes',
            outcome2Name: 'No',
            ethAmount: ethAmount
        });
        expect(res.status).to.equal(true);

        const marketIds = await predictionMarketContract.getMarkets();
        expect(marketIds.length).to.equal(2);
    }));

    it('should get Market data', mochaAsync(async () => {
        const res = await predictionMarketContract.getMarketData({marketId})
        expect(res).to.eql({
            name: 'Will BTC price close above 100k$ on May 1st 2022',
            closeDateTime: '2022-05-01 00:00',
            state: 0,
            oracleAddress: '0x0000000000000000000000000000000000000000',
            liquidity: 0.1,
            outcomeIds: [0, 1],
        });
    }));

    it('should get Market Outcomes data', mochaAsync(async () => {
        const outcome1 = await predictionMarketContract.getOutcomeData({marketId, outcomeId: outcomeIds[0]});
        expect(outcome1).to.eql({
            name: 'Yes',
            price: 0.5,
            shares: 0.1
        });

        const outcome2 = await predictionMarketContract.getOutcomeData({marketId, outcomeId: outcomeIds[1]});
        expect(outcome2).to.eql({
            name: 'No',
            price: 0.5,
            shares: 0.1
        });
    }));
});
