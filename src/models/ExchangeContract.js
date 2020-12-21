import { exchange } from "../interfaces";
import Contract from "./Contract";
import ERC20TokenContract from "./ERC20TokenContract";
import Numbers from "../utils/Numbers";
import _ from "lodash";
import moment from 'moment';

/**
 * Exchange Contract Object
 * @constructor ExchangeContract
 * @param {Web3} web3
 * @param {Address} tokenAddress
 * @param {Integer} decimals
 * @param {Address} contractAddress ? (opt)
 */

class ExchangeContract {
	constructor({
		web3,
		contractAddress = null /* If not deployed */,
		acc,
	}) {
		try {
			if (!web3) {
				throw new Error("Please provide a valid web3 provider");
			}
			this.web3 = web3;
			if (acc) {
				this.acc = acc;
			}

			this.params = {
				web3: web3,
				contractAddress: contractAddress,
				contract: new Contract(web3, exchange, contractAddress),
			};

		} catch (err) {
			throw err;
		}
	}

	__init__() {
		try {
			if (!this.getAddress()) {
				throw new Error("Please add a Contract Address");
			}
			
			this.__assert();
		} catch (err) {
			throw err;
		}
	};
	__metamaskCall = async ({ f, acc, value, callback=()=> {} }) => {
		return new Promise( (resolve, reject) => {
			f.send({
				from: acc,
				value: value,
			})
				.on("confirmation", (confirmationNumber, receipt) => {
					callback(confirmationNumber)
					if (confirmationNumber > 0) {
						resolve(receipt);
					}
				})
				.on("error", (err) => {
					reject(err);
				});
		});
	};

	__sendTx = async (f, call = false, value, callback=()=>{}) => {
		var res;
		if (!this.acc && !call) {
			const accounts = await this.params.web3.eth.getAccounts();
			res = await this.__metamaskCall({ f, acc: accounts[0], value, callback });
		} else if (this.acc && !call) {
			let data = f.encodeABI();
			res = await this.params.contract.send(
				this.acc.getAccount(),
				data,
				value
			);
		} else if (this.acc && call) {
			res = await f.call({ from: this.acc.getAddress() });
		} else {
			res = await f.call();
		}
		return res;
	};

	__deploy = async (params, callback) => {
		return await this.params.contract.deploy(
			this.acc,
			this.params.contract.getABI(),
			this.params.contract.getJSON().bytecode,
			params,
			callback
		);
	};

	/**
	 * @function setNewOwner
	 * @description Set New Owner of the Contract
	 * @param {string} address
	 */
	setNewOwner = async ({ address }) => {
		try {
			return await this.__sendTx(
				this.params.contract
					.getContract()
					.methods.transferOwnership(address)
			);
		} catch (err) {
			throw err;
		}
	};

	/**
	 * @function owner
	 * @description Get Owner of the Contract
	 * @returns {string} address
	 */

	async owner() {
		return await this.params.contract.getContract().methods.owner().call();
	}

	/**
	 * @function isPaused
	 * @description Get Owner of the Contract
	 * @returns {boolean}
	 */

	async isPaused() {
		return await this.params.contract.getContract().methods.paused().call();
	}

	/**
	 * @function pauseContract
	 * @type admin
	 * @description Pause Contract
	 */
	async pauseContract() {
		return await this.__sendTx(
			this.params.contract.getContract().methods.pause()
		);
	}

	/**
	 * @function unpauseContract
	 * @type admin
	 * @description Unpause Contract
	 */
	async unpauseContract() {
		return await this.__sendTx(
			this.params.contract.getContract().methods.unpause()
		);
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
			_resultId : r[1],
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
			_id : r[0],
			_resultId : r[1],
			pool : r[2],
			cost: r[3],
			odd: r[4],
			amount: r[5],
			inPool: r[6],
			outPool: r[7],
			fees: r[8],
			liqAmount: r[9]
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
	 * @param {Integer} fractionsAmount
	 * @return {Integer} cost
	 */

	async getFractionsCost({event_id, resultSpace_id, fractionsAmount}) {
		return await this.__sendTx(
			this.params.contract.getContract().methods.getFractionsCost(event_id, resultSpace_id, fractionsAmount), true);
	}

 	/**
	 * @function getSlipageOnBuy
	 * @description Get Slipage on Buy
	 * @param {Integer} event_id
	 * @param {Integer} resultSpace_id
	 * @param {Integer} fractionsAmount
	 * @returns {Integer} _id
	 */
	async getSlipageOnBuy({event_id, resultSpace_id, fractionsAmount}) {
		return await this.params.contract.getContract().methods.getSlipageOnBuy(event_id, resultSpace_id, fractionsAmount).call();
	}

	/**
	 * @function getSlipageOnSell
	 * @description Get Slipage on Sell
	 * @param {Integer} event_id
	 * @param {Integer} resultSpace_id
	 * @param {Integer} fractionsAmount
	 * @returns {Integer} _id
	 */
	async getSlipageOnSell({event_id, resultSpace_id, fractionsAmount}) {
		return await this.params.contract.getContract().methods.getSlipageOnSell(event_id, resultSpace_id, fractionsAmount).call();
	}

	/* POST User Functions */

	/**
	 * @function createEvent
	 * @description Create an Event
	 * @param {Integer | Array} _resultSpaceIds
	 * @param {String} urlOracle
	 * @param {String} eventName

	 */

	createEvent = async ({ _resultSpaceIds, urlOracle, eventName }) => {
		return await this.__sendTx(
			this.params.contract.getContract().methods.createEvent(_resultSpaceIds, urlOracle, eventName));
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
	 * @param {Integer} _eventId
	 * @param {Integer} _resultSpaceId
	 * @param {Integer} _fractionsAmount
	 */

	buy = async ({ _eventId, _resultSpaceId, _fractionsAmount}) => {
		let ETHCost = await this.getFractionsCost({fractionsAmount : _fractionsAmount});
		let ETHToWei = Numbers.toSmartContractDecimals(ETHCost, 18);
		return await this.__sendTx(
			this.params.contract.getContract().methods.buy(_eventId, _resultSpaceId, _fractionsAmount),
			false,
			ETHToWei
		);
	};

	/**
	 * @function sell
	 * @description Sell Fractions
	 * @param {Integer} _eventId
	 * @param {Integer} _resultSpaceId
	 * @param {Integer} _fractionsAmount
	 */

	sell = async ({ _eventId, _resultSpaceId, _fractionsAmount}) => {
		return await this.__sendTx(
			this.params.contract.getContract().methods.sell(_eventId, _resultSpaceId, _fractionsAmount)
		);
	};

	/**
	 * @function pullFractions
	 * @description Take Fractions out of the pool
	 * @param {Integer} _eventId
	 * @param {Integer} _resultSpaceId
	 * @param {Integer} _fractionsAmount
	 */

	pullFractions = async ({ _eventId, _resultSpaceId, _fractionsAmount}) => {
		return await this.__sendTx(
			this.params.contract.getContract().methods.pullFractions(_eventId, _resultSpaceId, _fractionsAmount)
		);
	};

	/**
	 * @function pushFractions
	 * @description Move Fractions to the Pool
	 * @param {Integer} _eventId
	 * @param {Integer} _resultSpaceId
	 * @param {Integer} _fractionsAmount
	 */

	pushFractions = async ({ _eventId, _resultSpaceId, _fractionsAmount}) => {
		return await this.__sendTx(
			this.params.contract.getContract().methods.pushFractions(_eventId, _resultSpaceId, _fractionsAmount)
		);
	};


	/**
	 * @function withdrawWins
	 * @description Withdraw Wins on end of Event
	 * @param {Integer} _eventId
	 * @param {Integer} _resultSpaceId
	 */

	withdrawWins = async ({ _eventId, _resultSpaceId}) => {
		return await this.__sendTx(
			this.params.contract.getContract().methods.withdrawWins(_eventId, _resultSpaceId, _fractionsAmount)
		);
	};


	/**
	 * @function removeOtherERC20Tokens
	 * @description Remove Tokens from other ERC20 Address (in case of accident)
	 * @param {Address} tokenAddress
	 * @param {Address} toAddress
	 */
	removeOtherERC20Tokens = async ({ tokenAddress, toAddress }) => {
		return await this.__sendTx(
			this.params.contract
				.getContract()
				.methods.removeOtherERC20Tokens(tokenAddress, toAddress)
		);
	};

	__assert() {
		this.params.contract.use(exchange, this.getAddress());
	}


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

	getAddress() {
		return this.params.contractAddress;
	}

	/**
	 * @function getOwner
	 * @description Get owner address of contract
	 * @param {Address} Address
	 */

	getOwner = async () => {
		return await this.params.contract.getContract().methods.owner().call();
	};

	/**
	 * @function getBalance
	 * @description Get Balance of Contract
	 * @param {Integer} Balance
	 */
	
	getBalance = async () => {
		let wei = await this.web3.eth.getBalance(this.getAddress());
        return this.web3.utils.fromWei(wei, 'ether');
	};
}

export default ExchangeContract;
