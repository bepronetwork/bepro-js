import _ from "lodash";
import moment from "moment";

import { prediction } from "../interfaces";
import Numbers from "../utils/Numbers";
import IContract from './IContract';

/**
 * Exchange Contract Object
 * @constructor ExchangeContract
 * @param {Web3} web3
 * @param {Address} tokenAddress
 * @param {Integer} decimals
 * @param {Address} contractAddress ? (opt)
 */

class PredictionMarketContract extends IContract {
	constructor(params) {
		super({abi: prediction, ...params});
	}

	/* Get Functions */
	/**
	 * @function getMarkets
	 * @description Get Markets
	 * @returns {Integer | Array} Get Market Ids
	 */
	async getMarkets() {
		let res = await this.params.contract
			.getContract()
			.methods
			.getMarkets()
			.call();
		return res.map((marketId) => Number(Numbers.fromHex(marketId)));
	}


	// TODO
	// /* Get Functions */
	// /**
	//  * @function getMyMarkets
	//  * @description Get Markets
	//  * @returns {Integer | Array} Get Market Ids user interacted with
	//  */
	//  async getMarkets() {
	// 	let res = await this.params.contract
	// 		.getContract()
	// 		.methods
	//     .getMyMarkets()
	// 		.call();
	// 	return res.map((id) => Numbers.fromHex(id));
	// }

	/**
	 * @function getMarketData
	 * @description Get getMarketData
	 * @param {Integer} marketId
	 * @returns {String} Market Name
	 * @returns {Integer} closeDateTime
	 * @returns {Integer} state
	 * @returns {Address} Oracle Address
	 * @returns {Integer} liquidity
	 * @returns {Array} outcomeIds
	 */
	async getMarketData({marketId}) {
		// TODO: move all calls to same function
		const name = await this.__sendTx(this.getContract().methods.getMarketName(marketId), true);
		const closeDateTime = await this.__sendTx(this.getContract().methods.getMarketClosedDateTime(marketId), true);
		const state = await this.__sendTx(this.getContract().methods.getMarketState(marketId), true);
		const oracleAddress = await this.__sendTx(this.getContract().methods.getMarketOracle(marketId), true);
		const liquidity = await this.__sendTx(this.getContract().methods.getMarketAvailableLiquidity(marketId), true);
		const outcomeIds = await this.__sendTx(this.getContract().methods.getMarketOutcomeIds(marketId), true);

		return {
			name,
			closeDateTime: moment.unix(closeDateTime).format("YYYY-MM-DD HH:mm"),
			state,
			oracleAddress,
			liquidity: Numbers.fromDecimalsNumber(liquidity, 18),
			outcomeIds: outcomeIds.map((outcomeId) => Numbers.fromBigNumberToInteger(outcomeId, 18))
		};
	}

	/**
	 * @function getOutcomeData
	 * @description Get Market Outcome Data
	 * @param {Integer} marketId
	 * @param {Integer} outcomeId
	 * @returns {String} name
	 * @returns {Integer} price
	 * @returns {Integer} sahres
	 */
	async getOutcomeData({marketId, outcomeId}) {
		const name = await this.__sendTx(this.getContract().methods.getMarketOutcomeName(marketId, outcomeId), true);
		const price = await this.__sendTx(this.getContract().methods.getMarketOutcomePrice(marketId, outcomeId), true);
		const shares = await this.__sendTx(this.getContract().methods.getMarketOutcomeAvailableShares(marketId, outcomeId), true);

		return {
			name,
			price: Numbers.fromDecimalsNumber(price, 18),
			shares: Numbers.fromDecimalsNumber(shares, 18),
		};
	}

	/**
	 * @function getMyMarketShares
	 * @description Get My Market Shares
	 * @param {Integer} marketId
	 * @returns {Integer} Liquidity Shares
	 * @returns {Array} Outcome Shares
	 */
	async getMyMarketShares({marketId}) {
		const liquidityShares = await this.__sendTx(this.getContract().methods.myLiquidityShares(marketId), true);
		const outcome1Shares = await this.__sendTx(this.getContract().methods.myShares(marketId, 0), true);
		const outcome2Shares = await this.__sendTx(this.getContract().methods.myShares(marketId, 1), true);

		return  {
			liquidityShares: Numbers.fromDecimalsNumber(liquidityShares, 18),
			outcomeShares: {
				0: Numbers.fromDecimalsNumber(outcome1Shares, 18),
				1: Numbers.fromDecimalsNumber(outcome2Shares, 18),
			}
		};
	}

	// TODO
 	// /**
	//  * @function isMarketOpen
	//  * @param {Integer} marketId
	//  * @description Check if market is open for trading
	//  * @returns {Boolean}
	//  */
	// async isMarketOpen(marketId) {
	// 	return await this.getContract().methods.isMarketOpen(marketId).call();
	// }

	/**
	 * @function getMarketOutcomePrice
	 * @description Get Market Price
	 * @param {Integer} marketId
	 * @param {Integer} outcomeId
	 * @return {Integer} price
	 */
	async getMarketOutcomePrice({marketId, outcomeId}) {
		return Numbers.fromDecimals(
			await this.__sendTx(
				this.getContract().methods.getMarketOutcomePrice(marketId, outcomeId),
				true
			),
			18
		);
	}

	/* POST User Functions */

	/**
	 * @function createMarket
	 * @description Create a µarket
	 * @param {String} name
	 * @param {Integer} duration
	 * @param {Address} oracleAddress
	 * @param {String} outcome1Name
	 * @param {String} outcome2Name
	 * @param {Integer} ethAmount
	 */
	 createMarket = async ({name, duration, oracleAddress, outcome1Name, outcome2Name, ethAmount}) => {
		let ethToWei = Numbers.toSmartContractDecimals(ethAmount, 18);
		return await this.__sendTx(
			this.getContract().methods.createMarket(
				name,
				duration,
				oracleAddress,
				outcome1Name,
				outcome2Name,
			),
			false,
			ethToWei
		);
	};


	/**
	 * @function addLiquidity
	 * @description Add Liquidity from Market
	 * @param {Integer} marketId
	 * @param {Integer} ethAmount
	 */
	addLiquidity = async ({marketId, ethAmount}) => {
		let ethToWei = Numbers.toSmartContractDecimals(ethAmount, 18);
		return await this.__sendTx(
			this.getContract().methods.addLiquidity(marketId),
			false,
			ethToWei
		);
	};

	/**
	 * @function removeLiquidity
	 * @description Remove Liquidity from Market
	 * @param {Integer} marketId
	 * @param {Integer} shares
	 */
	removeLiquidity = async ({marketId, shares}) => {
		shares = Numbers.toSmartContractDecimals(shares, 18);
		return await this.__sendTx(
			this.getContract().methods.removeLiquidity(marketId, shares)
		);
	};


	/**
	 * @function buy
	 * @description Buy Shares of a Market Outcome
	 * @param {Integer} marketId
	 * @param {Integer} outcomeId
	 * @param {Integer} ethAmount
	 */
	buy = async ({ marketId, outcomeId, ethAmount}) => {
		let ethToWei = Numbers.toSmartContractDecimals(ethAmount, 18);
		return await this.__sendTx(
			this.getContract().methods.buy(marketId, outcomeId),
			false,
			ethToWei
		);
	};

	/**
	 * @function sell
	 * @description Sell Shares of a Market Outcome
	 * @param {Integer} marketId
	 * @param {Integer} outcomeId
	 * @param {Integer} shares
	 */
	sell = async ({marketId, outcomeId, shares}) => {
		shares = Numbers.toSmartContractDecimals(shares, 18);
		return await this.__sendTx(
			this.getContract().methods.sell(marketId, outcomeId, shares),
			false,
		);
	};

	/**
	* @function deploy
	* @description Deploy the Pool Contract
	*/
	deploy = async ({callback}) => {
		let params = [];
		let res = await this.__deploy(params, callback);
		this.params.contractAddress = res.contractAddress;
		/* Call to Backend API */
		this.__assert();
		return res;
	};
}

export default PredictionMarketContract;
