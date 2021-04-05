import { erc721collectibles } from "../interfaces";
import Numbers from "../utils/Numbers";
import _ from "lodash";
import IContract from './IContract';
import ERC20Contract from './ERC20Contract';


const baseFeeAddress = "0x6714d41094a264bb4b8fcb74713b42cfee6b4f74";
/**
 * ERC721Contract Object
 * @constructor ERC721Contract
 * @param {Web3} web3
 * @param {Address} contractAddress ? (opt)
 */

class ERC721Collectibles extends IContract{
	constructor(params) {
		super({abi : erc721collectibles, ...params});
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
	 * @function purchaseToken
	 * @description Get ERC20 Address of the Contract
	 * @returns {Address}
	*/
	async purchaseToken() {
		return await this.params.contract.getContract().methods._purchaseToken().call();
    }

	/**
	 * @function getPricePerPack
	 * @description Get Price Per Pack 
	 * @returns {Integer}
	*/
	async getPricePerPack() {
		return Numbers.fromDecimals(await this.params.contract.getContract().methods._pricePerPack().call(), 18);
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
	 * @function isLimited
	 * @description Verify if it is limited
	 * @returns {Bool} 
	 */
	async isLimited(){
		return await this.params.contract
		.getContract()
		.methods._isLimited()
		.call();
	}

	/**
	 * @function currentTokenId
	 * @description Verify what is the currentTokenId
	 * @returns {Integer} Current Token Id 
	 */

	async currentTokenId(){
		return parseInt(await this.params.contract
		.getContract()
		.methods._currentTokenId()
		.call());
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
	 * @function getRegisteredIDs
	 * @description Get Ids
	 * @returns {Integer | Array} ids 
	 */
	async getRegisteredIDs(){
		let res = await this.__sendTx(
            this.params.contract
            .getContract()
            .methods.getRegisteredIDs(),
            true
        ); 

        return res.map(r => parseInt(r))
	}


	/**
	 * @function isIDRegistered
	 * @description Verify if ID is registered
	 * @returns {Bool} 
	 */
	async isIDRegistered({address, tokenID}){
		return await this.params.contract
		.getContract()
		.methods.registeredIDs(address, tokenID)
		.call();
	}

	
	/**
	 * @function pricePerPack
	 * @description Verify what is the current price per Pack 
	 * @returns {Integer} Price per pack in tokens
	 */

	async pricePerPack(){
		return Numbers.fromDecimals(await this.params.contract
		.getContract()
		.methods._pricePerPack()
		.call(), 18);
	}
	
	/**
	 * @function openedPacks
	 * @description Verify how much opened packs exist
	 * @returns {Integer} packs
	 */

	async openedPacks(){
		return parseInt(await this.params.contract
		.getContract()
		.methods._openedPacks()
		.call());
	}

	 /**
	 * @function approveERC20
	 * @description Approve ERC20 Allowance
    */
	approveERC20 = async () => {
		let totalMaxAmount = await this.getERC20Contract().totalSupply();
		return await this.getERC20Contract().approve({
			address: this.getAddress(),
			amount: totalMaxAmount
		})
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
	 * @function isApproved
	 * @description Approve ERC20 Allowance
	 * @param {Address} address
	 * @param {Integer} amount 
    */
	isApproved = async ({address, amount}) => {
		return await this.getERC20Contract().isApproved({address : address, amount : amount, spenderAddress : this.getAddress()});
	}

	/**
	 * @function openPack
	 * @description open Pack of tokens 
	 * @param {Integer} amount Amount of packs to open
	*/
	async openPack({amount}) {
		return await this.__sendTx(
			this.params.contract.getContract().methods.openPack(amount)
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

	/**
	 * @function setPurchaseTokenAddress
	 * @description set Purchase Token Address
	 * @param {Address} purchaseToken 
	*/
	async setPurchaseTokenAddress({purchaseToken}) {
		return await this.__sendTx(
			this.params.contract.getContract().methods.setPurchaseTokenAddress(purchaseToken)
		);
	}

	/**
	 * @function setStakeAddress
	 * @description set Stake Address
	 * @param {Address} purchaseToken 
	*/
	async setStakeAddress({purchaseToken}) {
		return await this.__sendTx(
			this.params.contract.getContract().methods.setStakeAddress(purchaseToken)
		);
	}

	/**
	 * @function setSwapBackAddress
	 * @description set Fee Address
	 * @param {Address} purchaseToken 
	*/
	async setSwapBackAddress({purchaseToken}) {
		return await this.__sendTx(
			this.params.contract.getContract().methods.setSwapBackAddress(purchaseToken)
		);
	}

	/**
	 * @function setFeeAddress
	 * @description set Fee Address
	 * @param {Address} purchaseToken 
	*/
	async setFeeAddress({purchaseToken}) {
		return await this.__sendTx(
			this.params.contract.getContract().methods.setFeeAddress(purchaseToken)
		);
	}

	/**
	 * @function setPricePerPack
	 * @description set Price per Pack
	 * @param {Amount} newPrice 
	*/
    async setPricePerPack({newPrice}){
		let newPriceWithDecimals = Numbers.toSmartContractDecimals(
			newPrice, 
			18
		);
		return await this.__sendTx(
			this.params.contract.getContract().methods.setPricePerPack(newPriceWithDecimals)
		);
	}

	deploy = async ({name, symbol, limitedAmount=0, erc20Purchase, 
		feeAddress='0x0000000000000000000000000000000000000001', 
		otherAddress='0x0000000000000000000000000000000000000001', callback}) => {

		if(!erc20Purchase){
			throw new Error("Please provide an erc20 address for purchases");
		}

		if(!name){
			throw new Error("Please provide a name");
		}

		if(!symbol){
			throw new Error("Please provide a symbol");
		}
		let params = [name, symbol, limitedAmount, erc20Purchase, baseFeeAddress, feeAddress, otherAddress];
		let res = await this.__deploy(params, callback);
		this.params.contractAddress = res.contractAddress;
		/* Call to Backend API */
		await this.__assert();
		return res;
	};

	getERC20Contract = () => this.params.ERC20Contract;

}

export default ERC721Collectibles;
