var fs = require("fs");
const _ = require("lodash");
const web = require("web3");

class Contract {
	constructor(web3, contract_json, address) {
		this.web3 = web3;
		this.json = contract_json;
		this.abi = contract_json.abi;
		this.address = address;
		this.contract = new web3.eth.Contract(contract_json.abi, address);
	}

	async deploy(account, abi, byteCode, args = [], callback=()=>{}) {
		var res;
		this.contract = new this.web3.eth.Contract(abi);
		if(account){	
			res = await this.web3.eth.sendSignedTransaction(
				(await account.getAccount().signTransaction({
					data : this.contract.deploy({
						data : byteCode,
						arguments: args
					}).encodeABI(),
					from  : account.getAddress(),
					gas : 5913388
				}
			)).rawTransaction);
		}else{
			const accounts = await this.web3.eth.getAccounts();
			res = await this.__metamaskDeploy({byteCode, args, acc : accounts[0], callback});
		}
		this.address = res.contractAddress;
		return res;
	}

	__metamaskDeploy = async ({byteCode, args, acc, callback = () => {}}) => {
		return new Promise ((resolve, reject) => {
			try{
				this.getContract()
				.deploy({
					data: byteCode,
					arguments: args,
				}).send({from : acc})
				.on('confirmation', (confirmationNumber, receipt) => { 
					callback(confirmationNumber)
					if(confirmationNumber > 0){
						resolve(receipt);
					}
				})
				.on('error', err => {reject(err)});
			}catch(err){
				reject(err);
			}
		})
	}

	async use(contract_json, address) {
		this.json = contract_json;
		this.abi = contract_json.abi;
		this.address = address ? address : this.address;
		this.contract = new this.web3.eth.Contract(
			contract_json.abi,
			this.address
		);
	}

	async send(account, byteCode, value='0x0', callback=() => {}){
		return new Promise( async (resolve, reject) => {
			let tx = {
				data : byteCode,
				from  : account.address,
				to : this.address,
				gas : 4430000,
				gasPrice : 20000000000,
				value: value ? value : '0x0'
			}
	
			let result = await account.signTransaction(tx);
			this.web3.eth.sendSignedTransaction(result.rawTransaction)
			.on('confirmation', (confirmationNumber, receipt) => { 
				callback(confirmationNumber);
				if(confirmationNumber > 0){
					resolve(receipt);
				}
			})
			.on('error', err => {reject(err)});
		})
       
	}
	
	getContract() {
		return this.contract;
	}

	getABI() {
		return this.abi;
	}

	getJSON() {
		return this.json;
	}

	getAddress() {
		return this.address;
	}
}

export default Contract;
