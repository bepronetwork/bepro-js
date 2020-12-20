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

	assertERC20Info = async () => {
		let decimals = await this.decimalsAsync();
		let tokenAddress = await this.erc20();

		this.params.erc20TokenContract = new ERC20TokenContract({
			web3: this.web3,
			decimals: decimals,
			contractAddress: tokenAddress,
			acc : this.acc
		});
		this.decimals = decimals;
	}

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
	 * @function erc20
	 * @description Get Token Address
	 * @returns {Address} Token Address
	 */
	async erc20() {
		return await this.params.contract
		.getContract()
		.methods.erc20()
		.call();
	}

	/**
	 * @function decimals
	 * @description Get Decimals
	 * @returns {Integer} Integer
	 */
	async decimalsAsync() {
		return parseInt(await this.params.contract
		.getContract()
		.methods.decimals()
		.call());
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
	 * @function tradeValue
	 * @description Get swapratio for the pool
	 * @returns {Integer} trade value against ETH
	 */
	async tradeValue() {
		return Numbers.fromDecimals(
			(await this.params.contract
				.getContract()
				.methods.tradeValue()
				.call()),
			this.getDecimals()
		);
	}

	/**
	 * @function startDate
	 * @description Get Start Date of Pool
	 * @returns {Date}
	 */
	async startDate() {
		return Numbers.fromSmartContractTimeToMinutes(
			await this.params.contract.getContract().methods.startDate().call()
		);
	}

	/**
	 * @function endDate
	 * @description Get End Date of Pool
	 * @returns {Date}
	 */
	async endDate() {
		return Numbers.fromSmartContractTimeToMinutes(
			await this.params.contract.getContract().methods.endDate().call()
		);
	}

	/**
	 * @function isFinalized
	 * @description To see if contract was finalized
	 * @returns {Boolean}
	 */
	async isFinalized() {
		return await this.params.contract.getContract().methods.hasFinalized().call()
		
	}

	/**
	 * @function individualMinimumAmount
	 * @description Get Individual Minimum Amount for each address
	 * @returns {Integer}
	 */
	async individualMinimumAmount() {
		return Numbers.fromDecimals(
			await this.params.contract
				.getContract()
				.methods.individualMinimumAmount()
				.call(),
			this.getDecimals()
		);
	}

	/**
	 * @function individualMaximumAmount
	 * @description Get Individual Maximum Amount for each address
	 * @returns {Integer}
	 */
	async individualMaximumAmount() {
		return Numbers.fromDecimals(
			(await this.params.contract
				.getContract()
				.methods.individualMaximumAmount()
				.call()),
			this.getDecimals()
		);
	}

	/**
	 * @function minimumRaiseAchieved
	 * @description Was Minimum Raise Achieved
	 * @returns {Boolean}
	 */
	async minimumRaiseAchieved() {
		var res;
		try{
			res = await this.params.contract
			.getContract()
			.methods
			.minimumRaiseAchieved().call()
			.catch(err => {throw err;})
		}catch(err){
			return false;
		}
		return res;
	}

	/**
	 * @function minimumRaise
	 * @description Get Minimum Raise amount for Token Sale
	 * @returns {Integer} Amount in Tokens
	 */
	async minimumRaise() {
		return Numbers.fromDecimals(
			(await this.params.contract
				.getContract()
				.methods.minimumRaise()
				.call()),
			this.getDecimals()
		);
	}

	/**
	 * @function tokensAllocated
	 * @description Get Total tokens Allocated already, therefore the tokens bought until now
	 * @returns {Integer} Amount in Tokens
	 */
	async tokensAllocated() {
		return Numbers.fromDecimals(
			(await this.params.contract
				.getContract()
				.methods.tokensAllocated()
				.call()),
			this.getDecimals()
		);
	}

	/**
	 * @function tokensForSale
	 * @description Get Total tokens Allocated/In Sale for the Pool
	 * @returns {Integer} Amount in Tokens
	 */
	async tokensForSale() {
		return Numbers.fromDecimals(
			await this.params.contract
				.getContract()
				.methods.tokensForSale()
				.call(),
			this.getDecimals()
		);
	}

	/**
	 * @function hasMinimumRaise
	 * @description See if hasMinimumRaise 
	 * @returns {Boolea} 
	 */
	async hasMinimumRaise() {
		return await this.params.contract
			.getContract()
			.methods.hasMinimumRaise()
			.call();
	}

	/**
	 * @function minimumReached
	 * @description See if minimumRaise was Reached
	 * @returns {Integer}
	 */
	async wasMinimumRaiseReached() {
		if(await this.hasMinimumRaise()){
			return (await this.tokensAllocated() > await this.minimumRaise());
		}else{
			return true;
		}
	}

	/**
	 * @function tokensAvailable
	 * @description Get Total tokens owned by the Pool
	 * @returns {Integer} Amount in Tokens
	 */
	async tokensAvailable() {
		return Numbers.fromDecimals(
			await this.params.contract
				.getContract()
				.methods.availableTokens()
				.call(),
			this.getDecimals()
		);
	}

	/**
	 * @function tokensLeft
	 * @description Get Total tokens available to be sold in the pool
	 * @returns {Integer} Amount in Tokens
	 */
	async tokensLeft() {
		return Numbers.fromDecimals(
			await this.params.contract
				.getContract()
				.methods.tokensLeft()
				.call(),
			this.getDecimals()
		);
	}

	/**
	 * @function withdrawableUnsoldTokens
	 * @description Get Total tokens available to be withdrawn by the admin
	 * @returns {Integer} Amount in Tokens
	 */
	async withdrawableUnsoldTokens() {
		var res = 0;
		if(await this.hasFinalized()
		&& (!await this.wereUnsoldTokensReedemed())
		){
			if(await this.wasMinimumRaiseReached()){
				/* Minimum reached */
				res = (await this.tokensForSale()) - (await this.tokensAllocated());
			}else{
				/* Minimum reached */
				res = await this.tokensForSale();
			}
		}
		return res;
	}

	/**
	 * @function withdrawableFunds
	 * @description Get Total funds raised to be withdrawn by the admin
	 * @returns {Integer} Amount in ETH
	 */
	async withdrawableFunds() {
		var res = 0;
		if(
			await this.hasFinalized() &&
			await this.wasMinimumRaiseReached()
			){
			res = await this.getBalance();
		}
		return res;
	}

	/**
	 * @function isTokenSwapAtomic
	 * @description Verify if the Token Swap is atomic on this pool
	 * @returns {Boolean}
	 */
	async isTokenSwapAtomic() {
		return await this.params.contract
			.getContract()
			.methods.isTokenSwapAtomic()
			.call();
	}


	/**
	 * @function hasWhitelisting
	 * @description Verify if swap has whitelisting
	 * @returns {Boolean}
	 */
	async hasWhitelisting() {
		return await this.params.contract
			.getContract()
			.methods.hasWhitelisting()
			.call();
	}

	/**
	 * @function isWhitelisted
	 * @description Verify if address is whitelisted
	 * @returns {Boolean}
	 */
	async isWhitelisted({address}) {
		let res = await this.params.contract
			.getContract()
			.methods.isWhitelisted(address)
			.call();
		return res == true ? true : false;
	}
	
	/**
	 * @function wereUnsoldTokensReedemed
	 * @description Verify if the admin already reemeded unsold tokens
	 * @returns {Boolean}
	 */
	async wereUnsoldTokensReedemed() {
		return await this.params.contract
			.getContract()
			.methods.unsoldTokensReedemed()
			.call();
	}

	/**
	 * @function isFunded
	 * @description Verify if the Token Sale is Funded with all Tokens proposed in tokensForSale
	 * @returns {Boolean}
	 */
	async isFunded() {
		return await this.params.contract
			.getContract()
			.methods.isSaleFunded()
			.call();
	}

	/**
	 * @function isOpen
	 * @description Verify if the Token Sale is Open for Swap
	 * @returns {Boolean}
	 */
	async isOpen() {
		return await this.params.contract.getContract().methods.isOpen().call();
	}

	/**
	 * @function hasStarted
	 * @description Verify if the Token Sale has started the Swap
	 * @returns {Boolean}
	 */
	async hasStarted() {
		return await this.params.contract
			.getContract()
			.methods.hasStarted()
			.call();
	}

	/**
	 * @function hasFinalized
	 * @description Verify if the Token Sale has finalized, if the current date is after endDate
	 * @returns {Boolean}
	 */
	async hasFinalized() {
		return await this.params.contract
			.getContract()
			.methods.hasFinalized()
			.call();
	}

	/**
	 * @function isPreStart
	 * @description Verify if the Token Sale in not open yet, where the admin can fund the pool
	 * @returns {Boolean}
	 */
	async isPreStart() {
		return await this.params.contract
			.getContract()
			.methods.isPreStart()
			.call();
	}

	/**
	 * @function getPurchase
	 * @description Get Purchase based on ID
	 * @param {Integer} purchase_id
	 * @returns {Integer} _id
	 * @returns {Integer} amount
	 * @returns {Address} purchaser
	 * @returns {Integer} ethAmount
	 * @returns {Date} timestamp
	 * @returns {Boolean} wasFinalized
	 * @returns {Boolean} reverted
	 */

	getPurchase = async ({ purchase_id }) => {
		let res = await this.params.contract
			.getContract()
			.methods.getPurchase(purchase_id)
			.call();
		return {
			_id: purchase_id,
			amount: Numbers.fromDecimals(res[0], this.getDecimals()),
			purchaser: res[1],
			ethAmount: Numbers.fromDecimals(res[2], 18),
			timestamp: Numbers.fromSmartContractTimeToMinutes(res[3]),
			wasFinalized: res[4],
			reverted: res[5],
		};
	};

	/**
	 * @function getWhiteListedAddresses
	 * @description Get Whitelisted Addresses
	 * @returns {Array | Address} addresses
	 */

	getWhitelistedAddresses = async () =>
		await this.params.contract.getContract().methods.getWhitelistedAddresses().call();

	/**
	 * @function getBuyers
	 * @description Get Buyers
	 * @returns {Array | Integer} _ids
	 */

	getBuyers = async () =>
		await this.params.contract.getContract().methods.getBuyers().call();

	/**
	 * @function getPurchaseIds
	 * @description Get All Purchase Ids
	 * @returns {(Array | Integer)} _ids
	 */
	getPurchaseIds = async () => {
		let res = await this.params.contract
			.getContract()
			.methods.getPurchaseIds()
			.call();
		return res.map((id) => Numbers.fromHex(id));
	};

	/**
	 * @function getPurchaseIds
	 * @description Get All Purchase Ids filter by Address/Purchaser
	 * @param {Address} address
	 * @returns {Array | Integer} _ids
	 */
	getAddressPurchaseIds = async ({ address }) => {
		let res = await this.__sendTx(
			this.params.contract.getContract().methods.getMyPurchases(address),
			true
		);
		return res.map((id) => Numbers.fromHex(id));
	};

	/**
	 * @function getETHCostFromTokens
	 * @description Get ETH Cost from Tokens Amount
	 * @param {Integer} tokenAmount
	 * @returns {Integer} ethAmount
	 */
	getETHCostFromTokens = async ({ tokenAmount }) => {
		let amountWithDecimals = Numbers.toSmartContractDecimals(
			tokenAmount,
			this.getDecimals()
		);

		return Numbers.fromDecimals(
			await this.params.contract
				.getContract()
				.methods.cost(amountWithDecimals)
				.call(),
			18
		);
	};

	/* POST User Functions */

	/**
	 * @function swap
	 * @description Swap tokens by Ethereum
	 * @param {Integer} tokenAmount
	 */

	swap = async ({ tokenAmount, callback }) => {
		let amountWithDecimals = Numbers.toSmartContractDecimals(
			tokenAmount,
			this.getDecimals()
		);
		let ETHCost = await this.getETHCostFromTokens({
			tokenAmount,
		});
		let ETHToWei = Numbers.toSmartContractDecimals(ETHCost, 18);
		return await this.__sendTx(
			this.params.contract.getContract().methods.swap(amountWithDecimals),
			false,
			ETHToWei,
			callback
		);
	};

	/**
	 * @function redeemTokens
	 * @variation isStandard
	 * @description Reedem tokens bought
	 * @param {Integer} purchase_id
	 */

	redeemTokens = async ({ purchase_id }) => {
		return await this.__sendTx(
			this.params.contract.getContract().methods.redeemTokens(purchase_id)
		);
	};

	/**
	 * @function redeemGivenMinimumGoalNotAchieved
	 * @variation isStandard
	 * @description Reedem Ethereum from sale that did not achieve minimum goal
	 * @param {Integer} purchase_id
	 */
	redeemGivenMinimumGoalNotAchieved = async ({ purchase_id }) => {
		return await this.__sendTx(
			this.params.contract
				.getContract()
				.methods.redeemGivenMinimumGoalNotAchieved(purchase_id)
		);
	};

	/**
	 * @function withdrawUnsoldTokens
	 * @description Withdraw unsold tokens of sale
	 */

	withdrawUnsoldTokens = async () => {
		return await this.__sendTx(
			this.params.contract.getContract().methods.withdrawUnsoldTokens()
		);
	};

	/**
	 * @function withdrawFunds
	 * @description Withdraw all funds from tokens sold
	 */
	withdrawFunds = async () => {
		return await this.__sendTx(
			this.params.contract.getContract().methods.withdrawFunds()
		);
	};

	/**
	 * @function approveFundERC20
	 * @description Approve the pool to use approved tokens for sale
	 */
	approveFundERC20 = async ({ tokenAmount, callback }) => {
		return await this.params.erc20TokenContract.approve({
			address: this.getAddress(),
			amount: tokenAmount,
			callback
		});
	};

	/**
	 * @function isApproved
	 * @description Verify if the Admin has approved the pool to use receive the tokens for sale
	 * @param {Integer} tokenAmount
	 * @param {Address} address
	 * @returns {Boolean}
	 */
	isApproved = async ({ tokenAmount, address }) => {
		return await this.params.erc20TokenContract.isApproved({
			address: address,
			amount: tokenAmount,
			spenderAddress: this.getAddress()
		});
	};

	/**
	 * @function fund
	 * @description Send tokens to pool for sale, fund the sale
	 * @param {Integer} tokenAmount
	 */
	fund = async ({ tokenAmount, callback }) => {
		let amountWithDecimals = Numbers.toSmartContractDecimals(
			tokenAmount,
			this.getDecimals()
		);

		return await this.__sendTx(
			this.params.contract.getContract().methods.fund(amountWithDecimals),
			null,
			null,
			callback
		);
	};

	/**
	 * @function addWhitelistedAddress
	 * @description add WhiteListed Address
	 * @param { Array | Addresses} Addresses
	 */
	addWhitelistedAddress = async ({addresses}) => {

		if(!addresses || !addresses.length || addresses.length == 0){
			throw new Error("Addresses not well setup");
		}

		let oldAddresses = await this.getWhitelistedAddresses();
		oldAddresses = oldAddresses.map( a => String(a).toLowerCase());
		addresses = addresses.map( a => String(a).toLowerCase());

		var addressesClean = [];
		addresses = addresses.filter( (item) => {
			if(
				(oldAddresses.indexOf(item) < 0) && 
				(addressesClean.indexOf(item) < 0)
				){
				// Does not exist
				addressesClean.push(item);
			}
		})

		return await this.__sendTx(
			this.params.contract.getContract().methods.add(addressesClean)
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
	deploy = async ({
		tradeValue,
		tokensForSale,
		startDate,
		endDate,
		individualMinimumAmount = 0,
		individualMaximumAmount = 0,
		isTokenSwapAtomic = true,
		minimumRaise = 0,
		feeAmount = 1,
		hasWhitelisting = false,
		callback
	}) => {
		if (_.isEmpty(this.getTokenAddress())) {
			throw new Error("Token Address not provided");
		}
		if (tradeValue <= 0) {
			throw new Error("Trade Value has to be > 0");
		}
		if (tokensForSale <= 0) {
			throw new Error("Tokens for Sale has to be > 0");
		}
		if (feeAmount < 1) {
			throw new Error("Fee Amount has to be >= 1");
		}
		if(minimumRaise != 0 && (minimumRaise > tokensForSale)) {
			throw new Error("Minimum Raise has to be bigger than total Raise")
		}
		if(Date.parse(startDate) >= Date.parse(endDate)) {
			throw new Error("Start Date has to be smaller than End Date")
		}
		if(Date.parse(startDate) <= Date.parse(moment(Date.now()).add(2, 'm').toDate())) {
			throw new Error("Start Date has to be higher (at least 2 minutes) than now")
		}
		if(individualMaximumAmount < 0) {
			throw new Error("Individual Maximum Amount should be bigger than 0")
		}
		if(individualMinimumAmount < 0) {
			throw new Error("Individual Minimum Amount should be bigger than 0")
		}

		if(individualMaximumAmount > 0){
			/* If exists individualMaximumAmount */
			if(individualMaximumAmount <= individualMinimumAmount) {
				throw new Error("Individual Maximum Amount should be bigger than Individual Minimum Amount")
			}
			if(individualMaximumAmount > tokensForSale) {
				throw new Error("Individual Maximum Amount should be smaller than total Tokens For Sale")
			}
		}
	
		if(individualMaximumAmount == 0){
			individualMaximumAmount = tokensForSale; /* Set Max Amount to Unlimited if 0 */
		}

		let params = [
			this.getTokenAddress(),
			Numbers.toSmartContractDecimals(tradeValue, 18) /* to wei */,
			Numbers.toSmartContractDecimals(tokensForSale, this.getDecimals()),
			Numbers.timeToSmartContractTime(startDate),
			Numbers.timeToSmartContractTime(endDate),
			Numbers.toSmartContractDecimals(
				individualMinimumAmount,
				this.getDecimals()
			),
			Numbers.toSmartContractDecimals(
				individualMaximumAmount,
				this.getDecimals()
			),
			isTokenSwapAtomic,
			Numbers.toSmartContractDecimals(minimumRaise, this.getDecimals()),
			parseInt(feeAmount),
			hasWhitelisting
		];
		console.log("params", params);
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
