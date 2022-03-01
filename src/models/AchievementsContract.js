const achievements = require("../interfaces").achievements;

const Numbers = require( "../utils/Numbers");
const IContract = require( './IContract');
const PredictionMarketContract = require( './PredictionMarketContract');
const RealitioERC20Contract = require( './RealitioERC20Contract');

const realitioLib = require('@reality.eth/reality-eth-lib/formatters/question');

/**
 * PredictionMarket Contract Object
 * @constructor PredictionMarketContract
 * @param {Web3} web3
 * @param {Integer} decimals
 * @param {Address} contractAddress
 */

class AchievementsContract extends IContract {
	constructor(params) {
    super({abi: achievements, ...params});
		this.contractName = 'achievements';
	}

  async hasUserPredicted({ user }) {
    await initializePredictionMarketContract();
    const events = await this.predictionMarket.getEvents('MarketActionTx', { user, action: '0' });

    return events.length > 0;
  }

  async hasUserClaimedWinnings({ user }) {
    await initializePredictionMarketContract();
    const events = await this.predictionMarket.getEvents('MarketActionTx', { user, action: '4' });

    return events.length > 0;
  }

  async hasUserBonded({ user }) {
    await initializePredictionMarketContract();
    const answers = await this.realitioERC20.getEvents('LogNewAnswer', { user });

    return answers.length > 0;
  }

  async hasUserCreatedMarket({ user }) {
    await initializePredictionMarketContract();
    // TODO: find way to fetch info without events
    const events = await this.predictionMarket.getEvents('MarketCreated', { user });

    return events.length > 0;
  }

  async initializePredictionMarketContract() {
    // predictionMarket already initialized
    if (this.predictionMarket) return;

    const contractAddress = await this.getContract().methods.predictionMarket().call();

    this.predictionMarket = new PredictionMarketContract({ ...params, contractAddress });
  }

  async initializeRealitioERC20Contract() {
    // predictionMarket already initialized
    if (this.realitioERC20) return;

    const contractAddress = await this.getContract().methods.realitioERC20().call();

    this.realitioERC20 = new RealitioERC20Contract({ ...params, contractAddress });
  }
}

module.exports = AchievementsContract;
