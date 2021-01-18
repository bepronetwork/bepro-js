import Web3 from "web3";
import { ExchangeContract, ERC20Contract, StakingContract } from "./models/index";
import Account from './utils/Account';

const ETH_URL_MAINNET =
	"https://mainnet.infura.io/v3/811fe4fa5c4b41cb9b92f9656aaeaa3b";
const ETH_URL_TESTNET =
	"https://kovan.infura.io/v3/811fe4fa5c4b41cb9b92f9656aaeaa3b";
const TEST_PRIVATE_KEY = 
	"0xfdf5475fe6be966cf39e533e5b478b2e10d04e5e966be18f45714550d2429d21";

const networksEnum = Object.freeze({
	1: "Main",
	2: "Morden",
	3: "Ropsten",
	4: "Rinkeby",
	42: "Kovan",
});

export default class Application {
	constructor({test=false, mainnet=true}) {
		this.test = test;
		this.mainnet = mainnet;
		if(this.test){
			this.start();
			this.login();
			this.account = new Account(this.web3, this.web3.eth.accounts.privateKeyToAccount(TEST_PRIVATE_KEY));
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

    /**
     * @name login
     * @description Login with Metamask or a web3 provider
     */
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
    
    /****** */
    /** GETTERS */
    /****** */

    /**
     * @name getExchangeContract
     * @param {Address} ContractAddress (Opt) If it is deployed
     * @description Create a Exchange Contract
     */
	getExchangeContract =  ({ contractAddress=null}={}) => {
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
    
     /**
     * @name getStakingContract
     * @param {Address} ContractAddress (Opt) If it is deployed
     * @description Create a Staking Contract
     */
	getStakingContract =  ({ contractAddress=null, tokenAddress=null}={}) => {
		try{
			return new StakingContract({
				web3: this.web3,
				contractAddress: contractAddress,
				tokenAddress,
				acc : this.test ? this.account : null
			});
		}catch(err){
			throw err;
		}
    };
    
     /**
     * @name getERC20Contract
     * @param {Address} ContractAddress (Opt) If it is deployed
     * @description Create a ERC20 Contract
     */
	getERC20Contract =  ({ contractAddress=null}) => {
		try{
			return new ERC20Contract({
				web3: this.web3,
				contractAddress: contractAddress,
				acc : this.test ? this.account : null
			});
		}catch(err){
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
		const networkName = networksEnum.hasOwnProperty(netId)
			? networksEnum[netId]
			: "Unknown";
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
		return this.web3.utils.fromWei(wei, "ether");
	};
}

