import Web3 from 'web3';
import Account from './utils/Account';
import IContract from './models/IContract';

const ETH_URL_MAINNET =
  "https://mainnet.infura.io/v3/37ec248f2a244e3ab9c265d0919a6cbc";
const ETH_URL_TESTNET =
  "https://rinkeby.infura.io/v3/811fe4fa5c4b41cb9b92f9656aaeaa3b";
//you can find this in "./truffle-config.js" file and should match ganache/ganache-cli local server settings too
const ETH_URL_LOCAL_TEST = "http://localhost:8545";
const TEST_PRIVATE_KEY =
  "0x7f76de05082c4d578219ca35a905f8debe922f1f00b99315ebf0706afc97f132";
//const LOCAL_TEST_PRIVATE_KEY = '4f4f26f4a82351b1f9a98623f901ad5fb2f3e38ac92ff39955ee8e124c718fa7';

const networksEnum = Object.freeze({
	1: "Ethereum Main",
	2: "Morden",
	3: "Ropsten",
	4: "Rinkeby",
	56: "BSC Main",
	97: "BSC Test",
	42: "Kovan",
});


/**
 * Web3Connection Object
 * @class Web3Connection
 * @param {Object} params Parameters
 * @param {Bool} params.test Default : False
 * @param {Bool} params.localtest Default : False
 * @param {Bool} params.mainnet Default : True (If Ethereum Mainnet)
 * @param {Object} params.opt Optional Chain Web3 Connection Object (Default ETH)
 * @param {String} params.opt.web3Connection Web3 Connection String (Ex : https://data-seed-prebsc-1-s1.binance.org:8545)
 */
class Web3Connection {
	constructor({
		test = false,
		localtest = false, //ganache local blockchain
		mainnet = true,
		opt = {
			web3Connection: ETH_URL_MAINNET,
		},
		...params
	}) {
		this.test = test;
		this.localtest = localtest;
		this.opt = opt;
		this.mainnet = mainnet;
		if (this.test) {
			this.start();
			this.login();
			if(!this.localtest) {
				this.account = new Account(this.web3, this.web3.eth.accounts.privateKeyToAccount(TEST_PRIVATE_KEY));
				console.log('My address: ' + this.account.getAddress())
			}
			///this.account = new Account(this.web3, this.web3.eth.accounts.privateKeyToAccount(LOCAL_TEST_PRIVATE_KEY));
		}
	}

	/****** */
	/*** CORE */
	/****** */

	/**
	 * @name start
	 * @description Start the Application
	 */
	start = () => {
		//this.web3 = new Web3(
		//	new Web3.providers.HttpProvider(this.mainnet == true ? this.opt.web3Connection : ETH_URL_TESTNET)
		//);
		if (this.mainnet)
			this.web3 = new Web3(new Web3.providers.HttpProvider(this.opt.web3Connection));
		else if (this.test && this.localtest)
			this.web3 = new Web3(new Web3.providers.HttpProvider(ETH_URL_LOCAL_TEST)
			//NOTE: depending on your web3 version, you may need to set a number of confirmation blocks
			, null, { transactionConfirmationBlocks: 1 }
			);
		else //if (this.test)
			this.web3 = new Web3(new Web3.providers.HttpProvider(ETH_URL_TESTNET));
		
		if (typeof window !== 'undefined') {
			window.web3 = this.web3;
		} else {
			if (!this.test) {
				throw new Error('Please Use an Ethereum Enabled Browser like Metamask or Coinbase Wallet');
			}
		}
	};

	/**
	 * @name login
	 * @description Login with Metamask or a web3 provider
	 */
	login = async () => {
		try {
			if (typeof window === 'undefined') {
				return false;
			}
			if (window.ethereum) {
				window.web3 = new Web3(window.ethereum);
				this.web3 = window.web3;
				await window.ethereum.enable();
				return true;
			}
			return false;
		} catch (err) {
			throw err;
		}
	};
	
	
	
	/******* */
	/** UTILS */
	/******* */

	/**
	 * @name getETHNetwork
	 * @description Access current ETH Network used
	 * @returns {String} Eth Network
	 */
	getETHNetwork = async () => {
		const netId = await this.web3.eth.net.getId();
		const networkName = networksEnum.hasOwnProperty(netId) ? networksEnum[netId] : (await this.web3.currentProvider.host); //'Unknown';
		return networkName;
	};

	/**
	 * @name getAddress
	 * @description Access current Address Being Used under Web3 Injector (ex : Metamask)
	 * @returns {Address} Address
	 */
	getAddress = async () => {
		const accounts = await this.web3.eth.getAccounts();
		return accounts[0];
	};

	/**
	 * @name getETHBalance
	 * @description Access current ETH Balance Available for the Injected Web3 Address
	 * @returns {Integer} Balance
	 */
	getETHBalance = async () => {
		let wei = await this.web3.eth.getBalance(await this.getAddress());
		return this.web3.utils.fromWei(wei, 'ether');
	};
}

export default Web3Connection;