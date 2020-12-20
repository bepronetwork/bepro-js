import Web3 from "web3";
import ExchangeContract from "./ExchangeContract";
import Account from './Account';

const ETH_URL_MAINNET =
	"https://mainnet.infura.io/v3/811fe4fa5c4b41cb9b92f9656aaeaa3b";
const ETH_URL_TESTNET =
	"https://kovan.infura.io/v3/811fe4fa5c4b41cb9b92f9656aaeaa3b";
const TEST_PRIVATE_KEY = 
	"0x7f76de05082c4d578219ca35a905f8debe922f1f00b99315ebf0706afc97f132";

const networksEnum = Object.freeze({
	1: "Main",
	2: "Morden",
	3: "Ropsten",
	4: "Rinkeby",
	42: "Kovan",
});

class Application {
	constructor({test=false, mainnet=true}) {
		this.test = test;
		this.mainnet = mainnet;
		if(this.test){
			this.start();
			this.login();
			this.account = new Account(this.web3, this.web3.eth.accounts.privateKeyToAccount(TEST_PRIVATE_KEY));
		}
	}

	
	start = () => {
		this.web3 = new Web3(
			new Web3.providers.HttpProvider(
				(this.mainnet == true) ? ETH_URL_MAINNET : ETH_URL_TESTNET
			)
		);
		if (typeof window !== "undefined") {
			window.web3 = this.web3;
		}else{
			if(!this.test){
				throw new Error("Please Use an Ethereum Enabled Browser like Metamask or Coinbase Wallet");
			}
		}
	}

	

	login = async () => {
		try{
			if (typeof window === "undefined") { return false; }
			if (window.ethereum) {
				window.web3 = new Web3(window.ethereum);
				this.web3 = window.web3;
				await window.ethereum.enable();
				return true;
			}
			return false;
		}catch(err){
			throw err;
		}
	};


	__getUserAccount = ({privateKey}) => {
		return new Account(this.web3, this.web3.eth.accounts.privateKeyToAccount(privateKey));
	}
	
	/* getExchangeContract */
	getExchangeContract =  ({ contractAddress=null}) => {
		try{
			return new ExchangeContract({
				web3: this.web3,
				contractAddress: contractAddress,
				acc : this.test ? this.account : null
			});
		}catch(err){
			throw err;
		}
	};

	/* Get Network of Platform Web3 */
	getETHNetwork = async () => {
		const netId = await this.web3.eth.net.getId();
		const networkName = networksEnum.hasOwnProperty(netId)
			? networksEnum[netId]
			: "Unknown";
		return networkName;
	};

	/* Get User Address */
	getAddress = async () => {
		const accounts = await this.web3.eth.getAccounts();
		return accounts[0];
	};

	/* Get User Balance in Ethereum */
	getETHBalance = async () => {
		let wei = await this.web3.eth.getBalance(await this.getAddress());
		return this.web3.utils.fromWei(wei, "ether");
	};
}

export default Application;
