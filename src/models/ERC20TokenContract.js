import contract from "./Contract";
import { ierc20 } from "../interfaces";
import Numbers from "../utils/Numbers";
let self;

class ERC20TokenContract {
	constructor({decimals, contractAddress, web3, acc}) {
		if(!decimals){
			throw new Error("Please provide the ERC20 decimals");
		}
		if(acc){
			this.acc = acc;
		}
		this.params = {
			web3 : web3,
			contractAddress : contractAddress,
			contract: new contract(web3, ierc20, contractAddress),
			decimals : decimals
		};
		self = {
			contract: new contract(web3, ierc20, contractAddress)
		};
	}

	__metamaskCall = async ({ f, acc, value, callback=()=>{}}) => {
		return new Promise((resolve, reject) => {
			f.send({
				from: acc,
				value: value,
			})
				.on("confirmation", (confirmationNumber, receipt) => {
					callback(confirmationNumber);
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

	__assert() {
		this.params.contract.use(ierc20, this.getAddress());
	}
	
	getContract() {
		return this.params.contract.getContract();
	}

	getAddress() {
		return this.params.contractAddress;
	}

	setNewOwner = async ({ address }) => {
		try {
			return await this.__sendTx( 
				this.params.contract
				.getContract()
				.methods.transferOwnership(address)
			);
		} catch (err) {
			console.log(err);
		}
	};

	async transferTokenAmount({ toAddress, tokenAmount}) {
		let amountWithDecimals = Numbers.toSmartContractDecimals(
			tokenAmount,
			this.getDecimals()
		);
		return await this.__sendTx( 
			this.params.contract
			.getContract()
			.methods.transfer(toAddress, amountWithDecimals)
		);
	}

	async getTokenAmount(address) {
		return Numbers.fromDecimals(
			await this.getContract().methods.balanceOf(address).call(),
			this.getDecimals()
		);
	}

	async totalSupply() {
		return await this.getContract().methods.totalSupply().call();
	}

	getABI() {
		return self.contract;
	}

	getDecimals(){
		return this.params.decimals;
	}

	async isApproved({ address, amount, spenderAddress }) {
		try {
			let approvedAmount = Numbers.fromDecimals(
				await this.getContract().methods.allowance(address, spenderAddress).call(),
				this.getDecimals()
			);
			return (approvedAmount >= amount);
		} catch (err) {
			throw err;
		}
	}

	async approve({ address, amount, callback }) {
		try {
			let amountWithDecimals = Numbers.toSmartContractDecimals(
				amount,
				this.getDecimals()
			);
			return await this.__sendTx( 
				this.params.contract
				.getContract()
				.methods.approve(address, amountWithDecimals),
				null,
				null,
				callback
			);
		} catch (err) {
			throw err;
		}
	}
}

export default ERC20TokenContract;
