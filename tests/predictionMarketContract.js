

import chai from 'chai';
import { mochaAsync } from './utils';
import { Application } from '..';

const expect = chai.expect;

context('Prediction Market Contract', async () => {
    let contractAddress = null;
    let predictionMarketContract;
    let app;

    before( async () =>  {
        app = new Application({test : true, mainnet : false});
    });

    it('should start the Application', mochaAsync(async () => {
        app = new Application({test : true, mainnet : false});
        expect(app).to.not.equal(null);
    }));

    it('should deploy Prediction Market Contract', mochaAsync(async () => {
        /* Create Contract */
        predictionMarketContract = app.getPredictionMarketContract({contractAddress : contractAddress});
        /* Deploy */
        const res = await predictionMarketContract.deploy({});
        contractAddress = predictionMarketContract.getAddress();
        expect(res).to.not.equal(false);
    }));
});
