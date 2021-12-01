const predictionAchievement = require("../interfaces").predictionAchievement;

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

class PredictionMarketAchievementContract extends IContract {
	constructor(params) {
    // a predictionMarketContractAddress is required
    if (!params.predictionMarketContractAddress) {
      throw 'predictionMarketContractAddress param is required'
    }

    // a realitioERC20ContractAddress is required
    if (!params.realitioERC20ContractAddress) {
      throw 'realitioERC20ContractAddress param is required'
    }

		super({abi: predictionAchievement, ...params});
		this.contractName = 'predictionMarketAchievement';

    // initializing predictionMarket contract
    const predictionMarketParams = { ...params, contractAddress: params.predictionMarketContractAddress };
    this.predictionMarket = new PredictionMarketContract(predictionMarketParams);

    // initializing predictionMarket contract
    const realitioERC20Params = { ...params, contractAddress: params.realitioERC20ContractAddress };
    this.realitioERC20 = new RealitioERC20Contract(realitioERC20Params);
	}

  async hasUserPredicted({ user }) {
    const events = await this.predictionMarket.getEvents('MarketActionTx', { user, action: '0' });

    return events.length > 0;
  }

  async hasUserClaimedWinnings({ user }) {
    const events = await this.predictionMarket.getEvents('MarketActionTx', { user, action: '4' });

    return events.length > 0;
  }

  async hasUserBonded({ user }) {
    const answers = await this.realitioERC20.getEvents('LogNewAnswer', { user });

    return answers.length > 0;
  }

  async hasUserCreatedMarket({ user }) {
    // TODO: find way to fetch info without events
    const events = await this.predictionMarket.getEvents('MarketCreated', { user });

    return events.length > 0;
  }
}

module.exports = PredictionMarketAchievementContract;
