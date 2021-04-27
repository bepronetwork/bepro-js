import { beproNetwork } from "../../interfaces";
import Numbers from "../../utils/Numbers";
import _ from "lodash";
import IContract from '../IContract';
import ERC20Contract from '../ERC20/ERC20Contract';


const beproAddress = "0xCF3C8Be2e2C42331Da80EF210e9B1b307C03d36A";

/**
 * BEPRONetwork Object
 * @constructor BEPRONetwork
 * @param {Web3} web3
 * @param {Address} contractAddress ? (opt)
 */

class BEPRONetwork extends IContract{
	constructor(params) {
		super({abi : beproNetwork, ...params});
	}

	  /**
     * @override 
     */
	__assert = async () => {
        if(!this.getAddress()){
            throw new Error("Contract is not deployed, first deploy it and provide a contract address");
        }
        /* Use ABI */
        this.params.contract.use(beproNetwork, this.getAddress());

        /* Set Token Address Contract for easy access */
        this.params.ERC20Contract = new ERC20Contract({
            web3: this.web3,
            contractAddress: beproAddress,
            acc : this.acc
        });

        /* Assert Token Contract */
        await this.params.ERC20Contract.__assert();
	}
	   
    /**
	 * @function getOpenIssues
	 * @description Get Open Issues Available
	 * @returns {Integer | Array}
	*/
	async getOpenIssues() {
		throw new Error("This should be done with a function outside of bepro-js, via the events OpenIssue & CloseIssue and maintained in a offchain system")
    }
   
    /**
	 * @function getIssuesByAddress
	 * @description Get Open Issues Available
	 * @param {Address} address
	 * @returns {Integer | Array}
	*/
	async getIssuesByAddress(address) {
		let res = await this.params.contract
		.getContract()
		.methods.getIssuesByAddress(address)
		.call();

        return res.map(r => parseInt(r))
    }

    /**
	 * @function getAmountofIssuesOpened
	 * @description Get Amount of Issues Opened in the network
	 * @returns {Integer}
	*/
	async getAmountofIssuesOpened() {
		return parseInt(await this.params.contract.getContract().methods.incrementIssueID().call());
    }

	 /**
	 * @function getAmountofIssuesClosed
	 * @description Get Amount of Issues Closed in the network
	 * @returns {Integer}
	*/
	async getAmountofIssuesClosed() {
		return parseInt(await this.params.contract.getContract().methods.closedIdsCount().call());
    }

    /**
	 * @function getBEPROStaked
	 * @description Get Total Amount of BEPRO Staked for Tickets in the network
	 * @returns {Integer}
	*/
	async getBEPROStaked() {
		return Numbers.fromDecimals(await this.params.contract.getContract().methods.totalStaked().call(), 18);
    }

	/**
	 * @function getIssueById
	 * @description Get Issue Id Info
	 * @param {Integer} issue_id
	 * @returns {Integer} _id
	 * @returns {Integer} beproStaked
	 * @returns {Address} issueGenerator
	 * @returns {Bool} finalized
	 * @returns {Address | Array} prAddresses
	 * @returns {Integer | Array} prAmounts
	*/

	async getIssueById({issue_id}) {

		let r = await this.__sendTx(
			this.params.contract.getContract().methods.getIssueById(issue_id),
			true
		);

		return {
			_id : Numbers.fromHex(r[0]),
			beproStaked : Numbers.fromDecimals(r[1], 18),
			issueGenerator : r[2],
			finalized: r[3],
			prAddresses: r[4],
			prAmounts: r[5] ? r[5].map( a => Numbers.fromDecimals(a, 18)) : 0
		}
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
	 * @function isApprovedERC20
	 * @description Verify if Approved
    */
	isApprovedERC20 = async ({amount, address}) => {
		return await this.getERC20Contract().isApproved({
			address: address,
			amount: amount,
			spenderAddress : this.getAddress()
		})
	}


	/**
	 * @function openIssue
	 * @description open Issue 
	 * @param {integer} beproAmount 
	 * @param {address} address
	*/
	async openIssue({beproAmount, address}) {

		if(beproAmount < 0){
			throw new Error("Bepro Amount has to be higher than 0")
		}

		if(!await this.isApprovedERC20({amount, address})){
			throw new Error("Bepro not approve for tx, first use 'approveERC20'");
		}

		return await this.__sendTx(
			this.params.contract.getContract().methods.openIssue(beproAmount)
		);
	}

	/**
	 * @function updateIssue
	 * @description open Issue 
	 * @param {integer} issueID
	 * @param {integer} beproAmount 
	 * @param {address} address
	*/
	async updateIssue({issueID, beproAmount, address}) {

		if(beproAmount < 0){
			throw new Error("Bepro Amount has to be higher than 0")
		}

		if(!await this.isApprovedERC20({amount, address})){
			throw new Error("Bepro not approve for tx, first use 'approveERC20'");
		}

		return await this.__sendTx(
			this.params.contract.getContract().methods.updateIssue(issueID, beproAmount, address)
		);
	}

	/**
	 * @function closeIssue
	 * @description close Issue 
	 * @param {integer} issueID 
	 * @param {address | Array} prAddresses
	 * @param {address | Integer} prAmounts
	*/
	async closeIssue({issueID, prAddresses, prAmounts}) {
		if(prAddresses.length != prAmounts.length){
			throw new Error("prAddresses dont match prAmounts size")
		}
		return await this.__sendTx(
			this.params.contract.getContract().methods.closeIssue(issueID, prAddresses, prAmounts)
		);
	}


	deploy = async ({tokenAddress, callback}) => {
		let params = [tokenAddress];
		let res = await this.__deploy(params, callback);
		this.params.contractAddress = res.contractAddress;
		/* Call to Backend API */
		await this.__assert();
		return res;
	};

	getERC20Contract = () => this.params.ERC20Contract;

}

export default BEPRONetwork;
