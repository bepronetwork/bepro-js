import { staking } from "../interfaces";
import Contract from "./Contract";
import Numbers from "../utils/Numbers";
import _ from "lodash";
import moment from 'moment';

/**
 * Staking Contract Object
 * @constructor StakingContract
 * @param {Web3} web3
 * @param {Address} tokenAddress
 * @param {Integer} decimals
 * @param {Address} contractAddress ? (opt)
 */

class StakingContract {
	constructor({
		web3,
        contractAddress = null /* If not deployed */,
        tokenAddress, /* Token Address */
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
                erc20TokenAddress :  new ERC20TokenContract({
                    web3: params.web3,
                    contractAddress: params.tokenAddress
                }),
				contract: new Contract(web3, exchange, contractAddress),
			};

		} catch (err) {
			throw err;
		}
	}

    /**
        * @constructor Deploy 
    */
    async deploy() {
        try {
            const contractDeployed = await this.deploy({
                erc20Address: this.params.tokenAddress
            })
            this.__assert();

            return {
                address: contractDeployed.address,
                transactionHash: contractDeployed.transactionHash
            }
        } catch (err) {
            console.log(err)
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
		try{
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
				).catch(err => {throw err;});
			} else if (this.acc && call) {
				res = await f.call({ from: this.acc.getAddress() }).catch(err => {throw err;});
			} else {
				res = await f.call().catch(err => {throw err;});
			}
			return res;
		}catch(err){
			throw err;
		}
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
		this.params.contract.use(staking, this.getAddress());
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

export default StakingContract;
