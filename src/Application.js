import Web3 from "web3";
import { ExchangeContract, ERC20Contract, StakingContract, ERC721Collectibles } from "./models/index";
import Account from './utils/Account';

const ETH_URL_MAINNET = "https://mainnet.infura.io/v3/37ec248f2a244e3ab9c265d0919a6cbc";
const ETH_URL_TESTNET ="https://rinkeby.infura.io/v3/811fe4fa5c4b41cb9b92f9656aaeaa3b";
const TEST_PRIVATE_KEY = "0x7f76de05082c4d578219ca35a905f8debe922f1f00b99315ebf0706afc97f132";

const networksEnum = Object.freeze({
	1: "Main",
	2: "Morden",
	3: "Ropsten",
	4: "Rinkeby",
	42: "Kovan",
});

export default class Application {
	constructor({test=false, mainnet=true, opt={
		web3Connection : ETH_URL_MAINNET
	}}) {
		this.test = test;
		this.opt = opt;
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
				(this.mainnet == true) ? this.opt.web3Connection : ETH_URL_TESTNET
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
     * @name getERC721Collectibles
     * @param {Address} ContractAddress (Opt) If it is deployed
	 * @param {Integer} CustomID  
     * @description Create a ERC721Collectibles Contract
     */
	getERC721Collectibles = ({customID=1, contractAddress=null}={}) => {
		try{

			switch(customID){
				case 0 : {
					return new ERC721Collectibles({
						web3: this.web3,
						contractAddress: contractAddress,
						acc : this.test ? this.account : null
					});
				}
				case 1 : {
					return new ERC721Collectibles({
						web3: this.web3,
						contractAddress: contractAddress,
						acc : this.test ? this.account : null
					});
				};
			
			}
			
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

