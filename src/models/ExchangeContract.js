import { exchange } from "../interfaces";
import Numbers from "../utils/Numbers";
import _ from "lodash";
import IContract from './IContract';

/**
 * Exchange Contract Object
 * @constructor ExchangeContract
 * @param {Web3} web3
 * @param {Address} tokenAddress
 * @param {Integer} decimals
 * @param {Address} contractAddress ? (opt)
 */

class ExchangeContract extends IContract{
	constructor(params) {
		super({...params, interface : exchange});
	}

	/* Get Functions */
	/**
	 * @function getEvents
	 * @description Get Events 
	 * @returns {Integer | Array} Get Events ID
	 */
	async getEvents() {
		let res = await this.params.contract
			.getContract()
			.methods.getEvents()
			.call();	
		return res.map((id) => Numbers.fromHex(id));
	
	}
	
	/**
	 * @function getMyEvents
	 * @description Get Events 
	 * @returns {Integer | Array} Get Events ID
	*/
	async getMyEvents() {
		let res = await this.__sendTx(
			this.params.contract.getContract().methods.getMyEvents(),
			true
		);
		return res.map((id) => Numbers.fromHex(id));
	}

	/**
	 * @function getEventData
	 * @description Get EventData 
	 * @param {Integer} event_id
	 * @returns {String} Event Name
	 * @returns {Integer} Result Id
	 * @returns {String} URL Oracle
	 * @returns {Boolean} Is Resolved
	 */
	async getEventData({event_id}) {
		
		let r = await this.__sendTx(
			this.params.contract.getContract().methods.getEventData(event_id),
			true
		);

		return  {
			name : r[0],
			_resultId : Numbers.fromHex(r[1]),
			urlOracle : r[2],
			isResolved: r[3]
		}
	
	}

	/**
	 * @function getMyEventHoldings
	 * @description Get My Event Holdings 
	 * @param {Integer} event_id
	 * @returns {Integer} 1 In Pool Balances
	 * @returns {Integer} 1 Out Pool Balances
	 * @returns {Integer} 1 Liquidity Balances
	 * @returns {Integer} 2 In Pool Balances
	 * @returns {Integer} 2 Out Pool Balances
	 * @returns {Integer} 2 Liquidity Balances
	 */
	
	async getMyEventHoldings({event_id}) {

		let r = await this.__sendTx(
			this.params.contract.getContract().methods.getMyEventHoldings(event_id),
			true
		);

		return  {
			inPoolBalancesA : r[0],
			outPoolBalancesA : r[1],
			liquidityA : r[2],
			inPoolBalancesB: r[3],
			outPoolBalancesB: r[4],
			liquidityB: r[5]
		}
	}

	/**
	 * @function getResultSpaceData
	 * @description Get Result Space Data
	 * @param {Integer} event_id
	 * @param {Integer} resultSpace_id
	 * @returns {Integer} _id
	 * @returns {Integer} _resultId
	 * @returns {Integer} pool
	 * @returns {Integer} cost
	 * @returns {Integer} odd
	 * @returns {Integer} amount
	 * @returns {Integer} inPool
	 * @returns {Integer} outPool
	 * @returns {Integer} fees
	 * @returns {Integer} liqAmount
	 */
	
	async getResultSpaceData({event_id, resultSpace_id}) {

		let r = await this.__sendTx(
			this.params.contract.getContract().methods.getResultSpaceData(event_id, resultSpace_id),
			true
		);

		return {
			_id : Numbers.fromHex(r[0]),
			_resultId : Numbers.fromHex(r[1]),
			pool : Numbers.fromDecimals(r[2], 18),
			cost: Numbers.fromDecimals(r[3], 7),
			odd: Numbers.fromDecimals(r[4], 4),
			amount: Numbers.fromDecimals(r[5], 7),
			inPool: Numbers.fromDecimals(r[6], 7),
			outPool: Numbers.fromDecimals(r[7], 7),
			fees: Numbers.fromDecimals(r[8], 7),
			liqAmount: Numbers.fromDecimals(r[9], 7),
		}
	}

 	/**
	 * @function isEventOpen
	 * @description To see if Event is open
	 * @returns {Boolean}
	 */
	async isEventOpen() {
		return await this.params.contract.getContract().methods.isEventOpen().call()
		
	}

	/**
	 * @function getFractionsCost
	 * @description Get Fractions Cost
	 * @param {Integer} event_id
	 * @param {Integer} resultSpace_id
	 * @param {Integer} fractions_amount
	 * @return {Integer} cost
	 */

	async getFractionsCost({event_id, resultSpace_id, fractions_amount}) {
		return Numbers.fromDecimals(await this.__sendTx(
			this.params.contract.getContract().methods.getFractionsCost(event_id, resultSpace_id, fractions_amount), true), 18);
	}

 	/**
	 * @function getSlipageOnBuy
	 * @description Get Slipage on Buy
	 * @param {Integer} event_id
	 * @param {Integer} resultSpace_id
	 * @param {Integer} fractions_amount
	 * @returns {Integer} _id
	 */
	async getSlipageOnBuy({event_id, resultSpace_id, fractions_amount}) {
		return await this.params.contract.getContract().methods.getSlipageOnBuy(event_id, resultSpace_id, fractions_amount).call();
	}

	/**
	 * @function getSlipageOnSell
	 * @description Get Slipage on Sell
	 * @param {Integer} event_id
	 * @param {Integer} resultSpace_id
	 * @param {Integer} fractions_amount
	 * @returns {Integer} _id
	 */
	async getSlipageOnSell({event_id, resultSpace_id, fractions_amount}) {
		return await this.params.contract.getContract().methods.getSlipageOnSell(event_id, resultSpace_id, fractions_amount).call();
	}

	/* POST User Functions */

	/**
	 * @function createEvent
	 * @description Create an Event
	 * @param {Integer | Array} _resultSpaceIds
	 * @param {String} urlOracle
	 * @param {String} eventName

	 */

	createEvent = async ({ resultSpaceIds, urlOracle, eventName, ethAmount=0 }) => {
		if(ethAmount == 0){
			throw new Error("Eth Amount has to be > 0")
		}
		let ETHToWei = Numbers.toSmartContractDecimals(ethAmount, 18);
		return await this.__sendTx(
			this.params.contract.getContract().methods.createEvent(resultSpaceIds, urlOracle, eventName), 
			false,
			ETHToWei
		);
	};


	/**
	 * @function resolveEvent
	 * @description Resolve Event
	 * @param {Integer} event_id
	 * @param {Integer} resultSpace_id

	 */

	resolveEvent = async ({event_id, resultSpace_id}) => {
		return await this.__sendTx(
			this.params.contract.getContract().methods.resolveEvent(event_id, resultSpace_id));
	};


	/**
	 * @function addLiquidity
	 * @description Add Liquidity
	 * @param {Integer} eventId
	 */

	addLiquidity = async ({ event_id, ethAmount}) => {
		let ETHToWei = Numbers.toSmartContractDecimals(ethAmount, 18);
		return await this.__sendTx(
			this.params.contract.getContract().methods.addLiquidity(event_id),
			false,
			ETHToWei
		);
	};

	/**
	 * @function removeLiquidity
	 * @description Remove Liquidity
	 * @param {Integer} eventId
	 */

	removeLiquidity = async ({event_id}) => {
		return await this.__sendTx(
			this.params.contract.getContract().methods.removeLiquidity(event_id)
		);
	};


	/**
	 * @function buy
	 * @description Buy Fractions
	 * @param {Integer} event_id
	 * @param {Integer} resultSpace_id
	 * @param {Integer} fractions_amount
	 */

	buy = async ({ event_id, resultSpace_id, fractions_amount}) => {
		fractions_amount =  Numbers.toSmartContractDecimals(fractions_amount, 7);
		let ETHCost = await this.getFractionsCost({event_id, resultSpace_id, fractions_amount});
		let ETHToWei = Numbers.toSmartContractDecimals(ETHCost, 18);
		console.log("eth", event_id, resultSpace_id, fractions_amount, ETHCost);
		return await this.__sendTx(
			this.params.contract.getContract().methods.buy(event_id, resultSpace_id, fractions_amount),
			false,
			ETHToWei
		);
	};

	/**
	 * @function sell
	 * @description Sell Fractions
	 * @param {Integer} event_id
	 * @param {Integer} resultSpace_id
	 * @param {Integer} fractions_amount
	 */

	sell = async ({ event_id, resultSpace_id, fractions_amount}) => {
		return await this.__sendTx(
			this.params.contract.getContract().methods.sell(event_id, resultSpace_id, fractions_amount)
		);
	};

	/**
	 * @function pullFractions
	 * @description Take Fractions out of the pool
	 * @param {Integer} event_id
	 * @param {Integer} resultSpace_id
	 * @param {Integer} fractions_amount
	 */

	pullFractions = async ({ event_id, resultSpace_id, fractions_amount}) => {
		return await this.__sendTx(
			this.params.contract.getContract().methods.pullFractions(event_id, resultSpaceId, fractions_amount)
		);
	};

	/**
	 * @function pushFractions
	 * @description Move Fractions to the Pool
	 * @param {Integer} eventId
	 * @param {Integer} resultSpace_id
	 * @param {Integer} fractions_amount
	 */

	pushFractions = async ({ event_id, resultSpace_id, fractions_amount}) => {
		return await this.__sendTx(
			this.params.contract.getContract().methods.pushFractions(event_id, resultSpace_id, fractions_amount)
		);
	};


	/**
	 * @function withdrawWins
	 * @description Withdraw Wins on end of Event
	 * @param {Integer} event_id
	 * @param {Integer} resultSpace_id
	 */

	withdrawWins = async ({event_id, resultSpace_id}) => {
		return await this.__sendTx(
			this.params.contract.getContract().methods.withdrawWins(event_id, resultSpace_id)
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

export default ExchangeContract;
