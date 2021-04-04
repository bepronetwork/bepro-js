

import { expect } from 'chai';
import moment from 'moment';

import { mochaAsync } from './utils';
import { Application } from '..';

context('Prediction Market Contract', async () => {
    let app;
    let predictionMarketContract;
    let contractAddress;

    // market / outcome ids we'll make unit tests with
    let marketId = 0;
    let outcomeIds = [0, 1];
    const ethAmount = 0.1;

    before( async () =>  {
        app = new Application({test : true, mainnet : false});
    });

    context('Contract Deployment', async () => {
        it('should start the Application', mochaAsync(async () => {
            app = new Application({test : true, mainnet : false});
            expect(app).to.not.equal(null);
        }));

        it('should deploy Prediction Market Contract', mochaAsync(async () => {
            // Create Contract
            predictionMarketContract = app.getPredictionMarketContract({contractAddress : '0x12da09ccFfd721798d047404276d8c67Aa60b66f'});
            // predictionMarketContract = app.getPredictionMarketContract({contractAddress : contractAddress});
            // Deploy
            // const res = await predictionMarketContract.deploy({});
            // contractAddress = predictionMarketContract.getAddress();
            // expect(res).to.not.equal(false);
        }));
    });

    context('Market Creation', async () => {
        it('should create a Market', mochaAsync(async () => {
            try {
                const res = await predictionMarketContract.createMarket({
                    name: 'Will BTC price close above 100k$ on May 1st 2022',
                    oracleAddress: '0x0000000000000000000000000000000000000000', // TODO
                    duration: moment('2022-05-01').diff(moment(), 'seconds'),
                    outcome1Name: 'Yes',
                    outcome2Name: 'No',
                    ethAmount: ethAmount
                });
                expect(res.status).to.equal(true);
            } catch(e) {
                // TODO: review this
            }

            const marketIds = await predictionMarketContract.getMarkets();
            marketId = marketIds[marketIds.length - 1];
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
    });

    context('Market Creation', async () => {
        it('should get Market data', mochaAsync(async () => {
            const res = await predictionMarketContract.getMarketData({marketId});
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
            const outcome1Data = await predictionMarketContract.getOutcomeData({marketId, outcomeId: outcomeIds[0]});
            expect(outcome1Data).to.eql({
                name: 'Yes',
                price: 0.5,
                shares: 0.1
            });

            const outcome2Data = await predictionMarketContract.getOutcomeData({marketId, outcomeId: outcomeIds[1]});
            expect(outcome2Data).to.eql({
                name: 'No',
                price: 0.5,
                shares: 0.1
            });

            // outcomes share prices should sum to 1
            expect(outcome1Data.price + outcome2Data.price).to.equal(1);
            // outcomes number of shares should dum to ethAmount * 2
            expect(outcome1Data.shares + outcome2Data.shares).to.equal(ethAmount * 2);
        }));
    });

    context('Market Interaction', async () => {
        it('should display my shares', mochaAsync(async () => {
            const res = await predictionMarketContract.getMyMarketShares({marketId});
            // currently holding liquidity tokens from market creation
            expect(res).to.eql({
                liquidityShares: 0.1,
                outcomeShares: {
                    0: 0.0,
                    1: 0.0,
                }
            });
        }));

        it('should buy outcome shares', mochaAsync(async () => {
            const outcomeId = 0;
            const oppositeOutcomeId = 1;

            try {
                const res = await predictionMarketContract.buy({marketId, outcomeId, ethAmount});
                expect(res.status).to.equal(true);
            } catch(e) {
                // TODO: review this
            }

            const marketData = await predictionMarketContract.getMarketData({marketId});
            const outcome1Data = await predictionMarketContract.getOutcomeData({marketId, outcomeId: outcomeIds[0]});
            const outcome2Data = await predictionMarketContract.getOutcomeData({marketId, outcomeId: outcomeIds[1]});

            // Prices sum = 1
            // 0.8 + 0.2 = 1
            expect(outcome1Data.price).to.equal(0.8);
            expect(outcome2Data.price).to.equal(0.2);
            expect(outcome1Data.price + outcome2Data.price).to.equal(1);

            // # Shares Product = Liquidity^2
            // 0.05 * 0.2 = 0.1^2
            expect(outcome1Data.shares).to.equal(0.05);
            expect(outcome2Data.shares).to.equal(0.2);
            expect(outcome1Data.shares * outcome2Data.shares).to.equal(marketData.liquidity**2);

            const myShares = await predictionMarketContract.getMyMarketShares({marketId});
            expect(myShares).to.eql({
                liquidityShares: 0.1,
                outcomeShares: {
                    0: 0.15,
                    1: 0.0,
                }
            });
        }));

        it('should add liquidity', mochaAsync(async () => {
            const myShares = await predictionMarketContract.getMyMarketShares({marketId});
            const marketData = await predictionMarketContract.getMarketData({marketId});
            const outcome1Data = await predictionMarketContract.getOutcomeData({marketId, outcomeId: outcomeIds[0]});
            const outcome2Data = await predictionMarketContract.getOutcomeData({marketId, outcomeId: outcomeIds[1]});

            try {
                const res = await predictionMarketContract.addLiquidity({marketId, ethAmount})
                expect(res.status).to.equal(true);
            } catch(e) {
                // TODO: review this
            }

            const myNewShares = await predictionMarketContract.getMyMarketShares({marketId});
            const newMarketData = await predictionMarketContract.getMarketData({marketId});
            const newOutcome1Data = await predictionMarketContract.getOutcomeData({marketId, outcomeId: outcomeIds[0]});
            const newOutcome2Data = await predictionMarketContract.getOutcomeData({marketId, outcomeId: outcomeIds[1]});

            // Outcome prices shoud remain the same after providing liquidity
            expect(newOutcome1Data.price).to.equal(outcome1Data.price);
            expect(newOutcome2Data.price).to.equal(outcome2Data.price);

            // # Shares Product = Liquidity^2
            // 0.075 * 0.3 = 0.15^2
            expect(newMarketData.liquidity).to.above(marketData.liquidity);
            expect(newMarketData.liquidity).to.equal(0.15);
            expect(newOutcome1Data.shares).to.above(outcome1Data.shares);
            expect(newOutcome1Data.shares).to.equal(0.075);
            expect(newOutcome2Data.shares).to.above(outcome2Data.shares);
            expect(newOutcome2Data.shares).to.equal(0.3);
            expect(newOutcome1Data.shares * newOutcome2Data.shares).to.equal(newMarketData.liquidity**2);

            // Price balances are not 0.5-0.5, liquidity will be added through shares + liquidity
            expect(myNewShares.liquidityShares).to.above(myShares.liquidityShares);
            expect(myNewShares.liquidityShares).to.equal(0.15);
            // shares balance of higher odd outcome increases
            expect(myNewShares.outcomeShares[0]).to.above(myShares.outcomeShares[0]);
            expect(myNewShares.outcomeShares[0]).to.equal(0.225);
            // shares balance of lower odd outcome remains
            expect(myNewShares.outcomeShares[1]).to.equal(myShares.outcomeShares[1]);
            expect(myNewShares.outcomeShares[1]).to.equal(0);
        }));

        it('should remove liquidity', mochaAsync(async () => {
            const myShares = await predictionMarketContract.getMyMarketShares({marketId});
            const marketData = await predictionMarketContract.getMarketData({marketId});
            const outcome1Data = await predictionMarketContract.getOutcomeData({marketId, outcomeId: outcomeIds[0]});
            const outcome2Data = await predictionMarketContract.getOutcomeData({marketId, outcomeId: outcomeIds[1]});
            const contractBalance = Number(await predictionMarketContract.getBalance());
            const liquiditySharesToRemove = 0.05;

            try {
                const res = await predictionMarketContract.removeLiquidity({marketId, shares: liquiditySharesToRemove});
                expect(res.status).to.equal(true);
            } catch(e) {
                // TODO: review this
            }

            const myNewShares = await predictionMarketContract.getMyMarketShares({marketId});
            const newMarketData = await predictionMarketContract.getMarketData({marketId});
            const newOutcome1Data = await predictionMarketContract.getOutcomeData({marketId, outcomeId: outcomeIds[0]});
            const newOutcome2Data = await predictionMarketContract.getOutcomeData({marketId, outcomeId: outcomeIds[1]});
            const newContractBalance = Number(await predictionMarketContract.getBalance());

            // Outcome prices shoud remain the same after removing liquidity
            expect(newOutcome1Data.price).to.equal(outcome1Data.price);
            expect(newOutcome2Data.price).to.equal(outcome2Data.price);

            // # Shares Product = Liquidity^2
            // 0.05 * 0.2 = 0.1^2
            expect(newMarketData.liquidity).to.below(marketData.liquidity);
            expect(newMarketData.liquidity).to.equal(0.1);
            expect(newOutcome1Data.shares).to.below(outcome1Data.shares);
            expect(newOutcome1Data.shares).to.equal(0.05);
            expect(newOutcome2Data.shares).to.below(outcome2Data.shares);
            expect(newOutcome2Data.shares).to.equal(0.2);
            expect(newOutcome1Data.shares * newOutcome2Data.shares).to.equal(newMarketData.liquidity**2);

            // Price balances are not 0.5-0.5, liquidity will be added through shares + liquidity
            expect(myNewShares.liquidityShares).to.below(myShares.liquidityShares);
            expect(myNewShares.liquidityShares).to.equal(0.1);
            // shares balance of higher odd outcome remains
            expect(myNewShares.outcomeShares[0]).to.equal(myShares.outcomeShares[0]);
            expect(myNewShares.outcomeShares[0]).to.equal(0.225);
            // shares balance of lower odd outcome increases
            expect(myNewShares.outcomeShares[1]).to.above(myShares.outcomeShares[1]);
            expect(myNewShares.outcomeShares[1]).to.equal(0.075);

            // User gets part of the liquidity tokens back in ETH
            expect(newContractBalance).to.below(contractBalance);
            // TODO: check amountTransferred from internal transactions
            const amountTransferred = Number((contractBalance - newContractBalance).toFixed(5));
            expect(amountTransferred).to.equal(0.025);
        }));

        it('should sell outcome shares', mochaAsync(async () => {
            const outcomeId = 0;
            const shares = 0.15;

            const marketData = await predictionMarketContract.getMarketData({marketId});
            const outcome1Data = await predictionMarketContract.getOutcomeData({marketId, outcomeId: outcomeIds[0]});
            const outcome2Data = await predictionMarketContract.getOutcomeData({marketId, outcomeId: outcomeIds[1]});
            const contractBalance = Number(await predictionMarketContract.getBalance());

            try {
                const res = await predictionMarketContract.sell({marketId, outcomeId, shares});
                expect(res.status).to.equal(true);
            } catch(e) {
                // TODO: review this
            }

            const newMarketData = await predictionMarketContract.getMarketData({marketId});
            const newOutcome1Data = await predictionMarketContract.getOutcomeData({marketId, outcomeId: outcomeIds[0]});
            const newOutcome2Data = await predictionMarketContract.getOutcomeData({marketId, outcomeId: outcomeIds[1]});
            const newContractBalance = Number(await predictionMarketContract.getBalance());

            // outcome price should decrease
            expect(newOutcome1Data.price).to.below(outcome1Data.price);
            expect(newOutcome1Data.price).to.equal(0.5);
            // opposite outcome price should increase
            expect(newOutcome2Data.price).to.above(outcome2Data.price);
            expect(newOutcome2Data.price).to.equal(0.5);
            // Prices sum = 1
            // 0.5 + 0.5 = 1
            expect(newOutcome1Data.price + newOutcome2Data.price).to.equal(1);

            // Liquidity value remains the same
            expect(newMarketData.liquidity).to.equal(marketData.liquidity);

            // outcome shares should increase
            expect(newOutcome1Data.shares).to.above(outcome1Data.shares);
            expect(newOutcome1Data.shares).to.equal(0.1);
            // opposite outcome shares should increase
            expect(newOutcome2Data.shares).to.below(outcome2Data.shares);
            expect(newOutcome2Data.shares).to.equal(0.1);
            // # Shares Product = Liquidity^2
            // 0.1 * 0.1 = 0.1^2
            expect(outcome1Data.shares * outcome2Data.shares).to.equal(newMarketData.liquidity**2);
            expect(newOutcome1Data.shares * newOutcome2Data.shares).to.equal(newMarketData.liquidity**2);

            const myShares = await predictionMarketContract.getMyMarketShares({marketId});
            expect(myShares).to.eql({
                liquidityShares: 0.1,
                outcomeShares: {
                    0: 0.075,
                    1: 0.075,
                }
            });

            // User gets shares value back in ETH
            expect(newContractBalance).to.below(contractBalance);
            // TODO: check amountTransferred from internal transactions
            const amountTransferred = Number((contractBalance - newContractBalance).toFixed(5));
            expect(amountTransferred).to.equal(0.1);
        }));
    });
});
