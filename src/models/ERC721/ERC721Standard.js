import { erc721standard } from "../../interfaces";
import _ from "lodash";
import IContract from '../IContract';
import ERC20Contract from '../ERC20/ERC20Contract';
/**
 * ERC721Contract Object
 * @constructor ERC721Contract
 * @param {Web3} web3
 * @param {Address} contractAddress ? (opt)
 */

class ERC721Standard extends IContract{
	constructor(params) {
		super({abi : erc721standard, ...params});
	}

	  /**
     * @override 
     */
	__assert = async () => {
        if(!this.getAddress()){
            throw new Error("Contract is not deployed, first deploy it and provide a contract address");
        }
        /* Use ABI */
        this.params.contract.use(erc721collectibles, this.getAddress());

        /* Set Token Address Contract for easy access */
        this.params.ERC20Contract = new ERC20Contract({
            web3: this.web3,
            contractAddress: await this.purchaseToken(),
            acc : this.acc
        });

        /* Assert Token Contract */
        await this.params.ERC20Contract.__assert();
	}

	/**
	 * @function exists
	 * @description Verify if token ID exists 
	 * @returns {Integer} Token Id
	 */
	async exists({tokenID}) {
		return await this.params.contract
		.getContract()
		.methods.exists(tokenID)
		.call();	
	}

	/**
	 * @function getURITokenID
	 * @description Verify what is the getURITokenID
	 * @returns {String} URI
	 */
	 async getURITokenID({tokenID}){
		return await this.params.contract
		.getContract()
		.methods.tokenURI(tokenID)
		.call();
	}
	/**
	 * @function baseURI
	 * @description Verify what is the baseURI
	 * @returns {String} URI
	 */
	 async baseURI(){
		return await this.params.contract
		.getContract()
		.methods.baseURI()
		.call();
	}

	 /**
	 * @function setBaseTokenURI
	 * @description Set Base Token URI
    */
	setBaseTokenURI = async ({URI}) => {
		return await this.__sendTx(
			this.params.contract.getContract().methods.setBaseURI(URI)
		);
	}

	/**
	 * @function mint
	 * @description Mint created TokenID 
	 * @param {Address} to
	 * @param {Integer} tokenID
	*/
	async mint({tokenID}) {
		return await this.__sendTx(
			this.params.contract.getContract().methods.mint(tokenID)
		);
	}

	deploy = async ({name, symbol, callback}) => {

		if(!name){
			throw new Error("Please provide a name");
		}

		if(!symbol){
			throw new Error("Please provide a symbol");
		}
		let params = [name, symbol];
		let res = await this.__deploy(params, callback);
		this.params.contractAddress = res.contractAddress;
		/* Call to Backend API */
		await this.__assert();
		return res;
	};

	getERC20Contract = () => this.params.ERC20Contract;

}

export default ERC721Standard;
