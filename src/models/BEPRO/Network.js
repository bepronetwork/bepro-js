import { beproNetwork } from "../../interfaces";
import Numbers from "../../utils/Numbers";
import _ from "lodash";
import IContract from '../IContract';
import ERC20Contract from '../ERC20/ERC20Contract';

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
            contractAddress: await this.purchaseToken(),
            acc : this.acc
        });

        /* Assert Token Contract */
        await this.params.ERC20Contract.__assert();
	}

	   
    /**
	 * @function getAmountofStakers
	 * @description Get Amount of Stakers in the network
	 * @returns {Integer}
	*/
	async getAmountofStakers() {
		return parseInt(await this.params.contract.getContract().methods.incrementID().call());
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
	 * @function getTicketBEPROAPR
	 * @description Get Amount of BEPRO APR for Tickets in the network
	 * @returns {Integer}
	*/
	async getTicketBEPROAPR() {
		return parseInt(await this.params.contract.getContract().methods.ticketGenAPR().call());
    }

     /**
	 * @function getTicketReputationCorrelation
	 * @description Get Amount of Ticket -> Issues correlation in the network
	 * @returns {Integer}
	*/
	async getTicketReputationCorrelation() {
		return parseInt(await this.params.contract.getContract().methods.ticketToReputationTrade().call());
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
	 * @function totalTicketsStaked
	 * @description Get Total Amount of Tickets Staked in the network
	 * @returns {Integer}
	*/
	async totalTicketsStaked() {
		return Numbers.fromDecimals(await this.params.contract.getContract().methods.totalTicketsStaked().call(), 18);
    }

	/**
	 * @function getTicketAPRAmount
	 * @description Get year APR Ticket
	 * @returns {Integer} Token Id
	 */
	async getTicketAPRAmount({startDate, endDate, amount}) {
		return Numbers.fromDecimals(await this.__sendTx(
			this.params.contract.getContract().methods.getTicketAPRAmount(
                startDate, endDate, amount
            )
		), 18);	
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
	 * @function setFeeAddress
	 * @description set Fee Address
	 * @param {Address} purchaseToken 
	*/
	async setFeeAddress({purchaseToken}) {
		return await this.__sendTx(
			this.params.contract.getContract().methods.setFeeAddress(purchaseToken)
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

export default BEPRONetwork;
