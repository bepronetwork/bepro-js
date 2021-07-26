import _ from "lodash";
import moment from "moment";

import { prediction } from "../interfaces";
import Numbers from "../utils/Numbers";
import IContract from './IContract';

const actions = {
	0: 'Buy',
	1: 'Sell',
	2: 'Add Liquidity',
	3: 'Remove Liquidity',
	4: 'Claim Winnings',
	5: 'Claim Liquidity',
}

/**
 * PredictionMarket Contract Object
 * @constructor PredictionMarketContract
 * @param {Web3} web3
 * @param {Integer} decimals
 * @param {Address} contractAddress
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
		const marketData = await this.params.contract.getContract().methods.getMarketData(marketId).call();
		const outcomeIds = await this.__sendTx(this.getContract().methods.getMarketOutcomeIds(marketId), true);

		return {
			name: marketData[0],
			closeDateTime: moment.unix(marketData[2]).format("YYYY-MM-DD HH:mm"),
			state: parseInt(marketData[1]),
			oracleAddress: '0x0000000000000000000000000000000000000000',
			liquidity: Numbers.fromDecimalsNumber(marketData[3], 18),
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
		const outcomeData = await this.params.contract.getContract().methods.getMarketOutcomeData(marketId, outcomeId).call();

		return {
			name: outcomeData[0],
			price: Numbers.fromDecimalsNumber(outcomeData[1], 18),
			shares: Numbers.fromDecimalsNumber(outcomeData[2], 18),
		};
	}
	/**
	 * @function getMyAccount
	 * @description Returns connected wallet account address
	 * @returns {String | undefined} address
	 */
	async getMyAccount() {
		const accounts = await this.params.web3.eth.getAccounts();

		return accounts[0];
	}

	/**
	 * @function getAverageOutcomeBuyPrice
	 * @description Calculates average buy price of market outcome based on user events
	 * @param {Array} events
	 * @param {Integer} marketId
	 * @param {Integer} outcomeId
	 * @returns {Integer} price
	 */
	getAverageOutcomeBuyPrice({events, marketId, outcomeId}) {
		// filtering by marketId + outcomeId + buy action
		events = events.filter(event => {
      return (
        event.action === 'Buy' &&
        event.marketId === marketId &&
        event.outcomeId === outcomeId
			);
		});

		if (events.length === 0) return 0;

		const totalShares = events.map(item => item.shares).reduce((prev, next) => prev + next);
		const totalAmount = events.map(item => item.value).reduce((prev, next) => prev + next);

		return totalAmount / totalShares;
	}

	/**
	 * @function getAverageAddLiquidityPrice
	 * @description Calculates average add liquidity of market outcome based on user events
	 * @param {Array} events
	 * @param {Integer} marketId
	 * @returns {Integer} price
	 */
	 getAverageAddLiquidityPrice({events, marketId}) {
		// filtering by marketId + add liquidity action
		events = events.filter(event => {
      return (
        event.action === 'Add Liquidity' &&
        event.marketId === marketId
			);
		});

		if (events.length === 0) return 0;

		const totalShares = events.map(item => item.shares).reduce((prev, next) => prev + next);
		const totalAmount = events.map(item => item.value).reduce((prev, next) => prev + next);

		return totalAmount / totalShares;
	}

	/**
	 * @function getMyPortfolio
	 * @description Get My Porfolio
	 * @returns {Array} Outcome Shares
	 */
	async getMyPortfolio() {
		const account = await this.getMyAccount();
		if (!account) return [];

		const marketIds = await this.getMarkets();
		const events = await this.getMyActions();

		// TODO: improve this (avoid looping through all markets)
		return await marketIds.reduce(async (obj, marketId) => {
			const marketShares = await this.getContract().methods.getUserMarketShares(marketId, account).call();
			const claimStatus = await this.getContract().methods.getUserClaimStatus(marketId, account).call();

			const portfolio = {
				liquidity: {
					shares: Numbers.fromDecimalsNumber(marketShares[0], 18),
					price: this.getAverageAddLiquidityPrice({events, marketId}),
				},
				outcomes: {
					0: {
						shares: Numbers.fromDecimalsNumber(marketShares[1], 18),
						price: this.getAverageOutcomeBuyPrice({events, marketId, outcomeId: 0}),
					},
					1: {
						shares: Numbers.fromDecimalsNumber(marketShares[2], 18),
						price: this.getAverageOutcomeBuyPrice({events, marketId, outcomeId: 1}),
					},
				},
				claimStatus: {
					winningsToClaim: claimStatus[0],
					winningsClaimed: claimStatus[1],
					liquidityToClaim: claimStatus[2],
					liquidityClaimed: claimStatus[3],
					liquidityFees: Numbers.fromDecimalsNumber(claimStatus[4], 18)
				}
			};

			return await {
				...(await obj),
				[marketId]: portfolio,
			};
		}, {});
	}

	/**
	 * @function getMyMarketShares
	 * @description Get My Market Shares
	 * @param {Integer} marketId
	 * @returns {Integer} Liquidity Shares
	 * @returns {Array} Outcome Shares
	 */
	 async getMyMarketShares({marketId}) {
		const account = await this.getMyAccount();
		if (!account) return [];

		const marketShares = await this.getContract().methods.getUserMarketShares(marketId, account).call();

		return  {
			liquidityShares: Numbers.fromDecimalsNumber(marketShares[0], 18),
			outcomeShares: {
				0: Numbers.fromDecimalsNumber(marketShares[1], 18),
				1: Numbers.fromDecimalsNumber(marketShares[2], 18),
			}
		};
	}

	async getMyActions() {
		const account = await this.getMyAccount();
		if (!account) return [];

		const events = await this.getContract().getPastEvents('ParticipantAction', {
			fromBlock: 0,
			toBlock: 'latest',
			filter: {participant: account} // filtering by address
		});

		// filtering by address
		return events.map(event => {
			return {
				action: actions[Numbers.fromBigNumberToInteger(event.returnValues.action, 18)],
				marketId: Numbers.fromBigNumberToInteger(event.returnValues.marketId, 18),
				outcomeId: Numbers.fromBigNumberToInteger(event.returnValues.outcomeId, 18),
				shares: Numbers.fromDecimalsNumber(event.returnValues.shares, 18),
				value: Numbers.fromDecimalsNumber(event.returnValues.value, 18),
				timestamp: Numbers.fromBigNumberToInteger(event.returnValues.timestamp, 18),
				transactionHash: event.transactionHash,
			}
		})
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

	/**
	 * @function getMarketPrices
	 * @description Get Market Price
	 * @param {Integer} marketId
	 * @return {Object} prices
	 */
	async getMarketPrices({marketId}) {
		const marketPrices = await this.getContract().methods.getMarketPrices(marketId).call();

		return {
			liquidity: Numbers.fromDecimalsNumber(marketPrices[0], 18),
			outcomes: {
				0: Numbers.fromDecimalsNumber(marketPrices[1], 18),
				1: Numbers.fromDecimalsNumber(marketPrices[2], 18)
			}
		};
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
	 createMarket = async ({name, duration, oracleAddress, outcomes, ethAmount}) => {
		let ethToWei = Numbers.toSmartContractDecimals(ethAmount, 18);
		return await this.__sendTx(
			this.getContract().methods.createMarket(
				name,
				duration,
				oracleAddress,
				outcomes
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

	resolveMarketOutcome = async ({marketId}) => {
		return await this.__sendTx(
			this.getContract().methods.resolveMarketOutcome(marketId),
			false,
		);
	};

	claimWinnings = async ({marketId}) => {
		return await this.__sendTx(
			this.getContract().methods.claimWinnings(marketId),
			false,
		);
	};

	claimLiquidity = async ({marketId}) => {
		return await this.__sendTx(
			this.getContract().methods.claimLiquidity(marketId),
			false,
		);
	};
}

export default PredictionMarketContract;
