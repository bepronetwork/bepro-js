import { staking } from "../../interfaces";
import ERC20Contract from '../ERC20/ERC20Contract';
import IContract from '../IContract';
import _ from "lodash";
import Numbers from "../../utils/Numbers";

/**
 * Staking Contract Object
 * @class StakingContract
 * @param {Web3} web3
 * @param {Address} tokenAddress
 * @param {Address} contractAddress ? (opt)
 */

class StakingContract extends IContract {
	constructor({tokenAddress /* Token Address */, ...params}) {
		try {
            super({...params, abi : staking});
            if(tokenAddress){
                this.params.ERC20Contract = new ERC20Contract({
                    web3: params.web3,
                    contractAddress: tokenAddress,
                    acc : params.acc
                });
            }

		} catch (err) {
			throw err;
		}
    }

    /**
	 * @function
	 * @description Get ERC20 Address of the Contract
	 * @returns {Address}
	*/
	async erc20() {
		return await this.__sendTx(this.params.contract.getContract().methods.erc20(), true);
    }

    /**
	 * @function
	 * @description Get Token Amount of ERC20 Address
	 * @returns {Address}
	*/
    getTokenAmount = async ({ address }) => {
        return await this.getERC20Contract().getTokenAmount(address);
    }

    /**
	 * @function
	 * @description Get All Tokens Locked for the APR
	 * @returns {Integer}
	*/
	async futureLockedTokens() {
		let res = await this.__sendTx(this.params.contract.getContract().methods.futureLockedTokens(), true);
        return Numbers.fromDecimals(res, this.getERC20Contract().getDecimals());
    }

    /**
	 * @function
	 * @description Get All Tokens Available for the Subscription Amount
	 * @returns {Integer}
	*/
	async availableTokens() {
		let res = await this.__sendTx(this.params.contract.getContract().methods.availableTokens(), true);
        return Numbers.fromDecimals(res, this.getERC20Contract().getDecimals());
    }

    /**
	 * @function
	 * @description Get All Tokens Held in Stake at that specific moment
	 * @returns {Integer}
	*/
	async heldTokens() {
		let res = await this.__sendTx(this.params.contract.getContract().methods.heldTokens(), true);
        return Numbers.fromDecimals(res, this.getERC20Contract().getDecimals());
    }

    /**
	 * @function
	 * @description Get APR Amount based on amount of timestamp, amount and APR of that product
     * @param {Integer} APR
	 * @param {Date} startDate
	 * @param {Date} endDate
     * @param {Integer} amount Token Amount
     * @returns {Integer}
    */
    getAPRAmount = async ({APR, startDate, endDate, amount}) => {
        let res = await this.__sendTx(
            this.params.contract.getContract().methods.getAPRAmount(
                APR,
                Numbers.timeToSmartContractTime(startDate),
                Numbers.timeToSmartContractTime(endDate),
                Numbers.toSmartContractDecimals(amount, this.getERC20Contract().getDecimals())
            ), true
        );
        return Numbers.fromDecimals(res, this.getERC20Contract().getDecimals());

    }
    /**
	 * @function
	 * @description createProduct
	 * @param {Date} startDate
	 * @param {Date} endDate
	 * @param {Integer} totalMaxAmount
     * @param {Integer} individualMinimumAmount
	 * @param {Integer} APR
	 * @param {Boolean} lockedUntilFinalization
	*/

    async createProduct({
        startDate,
        endDate,
        totalMaxAmount,
        individualMinimumAmount,
        APR,
        lockedUntilFinalization
      }){
        return await this.__sendTx(
			this.params.contract.getContract().methods.createProduct(
                Numbers.timeToSmartContractTime(startDate),
                Numbers.timeToSmartContractTime(endDate),
                Numbers.toSmartContractDecimals(
                    totalMaxAmount,
                    this.getERC20Contract().getDecimals()
                ),
                Numbers.toSmartContractDecimals(
                  individualMinimumAmount,
                  this.getERC20Contract().getDecimals()
                ),
                APR,
                lockedUntilFinalization
            )
        )
    }

     /**
	 * @function
	 * @description Get All Available Products
     * @returns {Array | Integer} ids
    */
    getProducts = async () =>  await this.__sendTx(
        this.params.contract.getContract().methods.getProductIds(),
        true
    );

    /**
	 * @function
	 * @description Get Subscription from product
	 * @param {Integer} product_id
     * @returns {Date} createdAt
     * @returns {Date} startDate
     * @returns {Date} endDate
     * @returns {Integer} totalMaxAmount
     * @returns {Integer} individualMinimumAmount
     * @returns {Integer} APR
     * @returns {Integer} currentAmount
     * @returns {Boolean} lockedUntilFinalization
     * @returns {Array | Address} subscribers
     * @returns {Array | Integer} subscriptionIds
    */
    getProduct = async ({ product_id }) => {
        let res = await this.__sendTx(
            this.params.contract.getContract()
            .methods.getProduct(product_id), true
        );

        return {
            _id : product_id,
            createdAt: Numbers.fromSmartContractTimeToMinutes(res[0]),
            startDate: Numbers.fromSmartContractTimeToMinutes(res[1]),
            endDate: Numbers.fromSmartContractTimeToMinutes(res[2]),
            totalMaxAmount: Numbers.fromDecimals(res[3], this.getERC20Contract().getDecimals()),
            individualMinimumAmount: Numbers.fromDecimals(res[4], this.getERC20Contract().getDecimals()),
            APR: parseInt(res[5]),
            currentAmount: Numbers.fromDecimals(res[6], this.getERC20Contract().getDecimals()),
            lockedUntilFinalization: res[7],
            subscribers: res[8],
            subscriptionIds: Numbers.fromExponential(res[9])
        }
    }

    /**
	 * @function
	 * @description Approve ERC20 Allowance for Transfer for Subscribe Product
    */
    approveERC20Transfer = async () => {
        let totalMaxAmount = await this.getERC20Contract().totalSupply();
        return await this.getERC20Contract().approve({
            address: this.getAddress(),
            amount: Numbers.toSmartContractDecimals(
                totalMaxAmount,
                this.getERC20Contract().getDecimals()
            )
        })
    }

    /**
	 * @function
	 * @description Subscribe to a product Staking
	 * @param {Integer} product_id
	 * @param {Integer} amount
     * @returns {Boolean} Success
    */
    subscribeProduct = async ({address, product_id, amount}) => {
        /* Get Decimals of Amount */
        let amountWithDecimals = Numbers.toSmartContractDecimals(
            amount,
            this.getERC20Contract().getDecimals()
        )
        /* Verify if transfer is approved for this amount */
        let isApproved = await this.getERC20Contract().isApproved({
            address : address, amount, spenderAddress : this.getAddress()
        });
        if(!isApproved){
            throw new Error("Has to Approve Token Transfer First, use the 'approve' Call");
        }

        return await this.__sendTx(
            this.params.contract
            .getContract()
            .methods.subscribeProduct(product_id, amountWithDecimals)
        )
    }

    /**
	 * @function
	 * @description Get Subscription from product
	 * @param {Integer} product_id
	 * @param {Integer} subscription_id
     * @returns {Integer} _id
     * @returns {Integer} productId
     * @returns {Date} startDate
     * @returns {Date} endDate
     * @returns {Address} subscriberAddress
     * @returns {Integer} APR
     * @returns {Boolean} finalized
    */
    getSubscription = async ({ subscription_id, product_id }) => {
        let res = await this.__sendTx(
            this.params.contract
            .getContract()
            .methods.getSubscription(subscription_id, product_id), true
        );

        return {
            _id: Numbers.fromExponential(res[0]),
            productId: Numbers.fromExponential(res[1]),
            startDate: Numbers.fromSmartContractTimeToMinutes(res[2]),
            endDate: Numbers.fromSmartContractTimeToMinutes(res[3]),
            amount: Numbers.fromDecimals(res[4], this.getERC20Contract().getDecimals()),
            subscriberAddress: res[5],
            APR: parseInt(res[6]),
            finalized: res[7],
            withdrawAmount: Numbers.fromDecimals(res[8], this.getERC20Contract().getDecimals()),
        }
    }

    /**
	 * @function
	 * @description Withdraw Subscription to a product Staking
	 * @param {Integer} product_id
	 * @param {Integer} subscription_id
    */
    withdrawSubscription = async ({ product_id, subscription_id }) => {
        return await this.__sendTx(
            this.params.contract
            .getContract()
            .methods.withdrawSubscription(product_id, subscription_id)
       );
    }

    /**
	 * @function
	 * @description Get Subscriptions by Address
	 * @param {Address} address
	 * @returns {Array | Integer} subscriptions_ids
    */
    getSubscriptionsByAddress = async ({ address }) => {
        let res = await this.__sendTx(
            this.params.contract
            .getContract()
            .methods.getMySubscriptions(address),
            true
        );
        return res.map(r => Numbers.fromExponential(r))
    }

    /**
	 * @function
	 * @description Get All Subscriptions done
	 * @returns {Array | Subscription} subscriptions
    */
    getAllSubscriptions = async () => {
        /* Get All Products */
        const products = await this.getProducts();

        /* Get All Subscriptions */
        const subscriptions = await Promise.all(
            products.map(async product => {
                const productObj = await this.getProduct({
                    product_id: product
                })
                return await Promise.all(
                    productObj.subscriptionIds.map(async subscription_id => {
                        return this.getSubscription({
                            subscription_id: subscription_id,
                            product_id: product
                        })
                    })
                )
            })
        )
        return subscriptions ? _.flatten(subscriptions) : [];
    }

    /**
	 * @function
	 * @description Transfer Tokens by the Admin to ensure APR Amount
	 * @param {Integer} amount
    */
    async depositAPRTokensByAdmin({amount}) {
        return await this.getERC20Contract().transferTokenAmount({
            toAddress : this.getAddress(),
            tokenAmount : amount
        });
    }

    /**
	 * @function
	 * @description Get Total Amount of tokens needed to be deposited by Admin to ensure APR for all available Products
	 * @return {Integer} Amount
    */
    getTotalNeededTokensForAPRbyAdmin = async () => {
        const products = await this.getProducts();

        const allProducts = await Promise.all(
            products.map(async product => {
                const productObj = await this.getProduct({
                    product_id: product
                })
                let res = await this.getAPRAmount({
                    APR: productObj.APR,
                    startDate: productObj.startDate,
                    endDate: productObj.endDate,
                    amount: productObj.totalMaxAmount
                })
                return parseFloat(res);
            })
        )
        return Numbers.fromExponential(allProducts.reduce((a, b) => a + b, 0)).toString();
    }

    /**
     * @override
     */
	__assert = async () => {
        if(!this.getAddress()){
            throw new Error("Contract is not deployed, first deploy it and provide a contract address");
        }

        /* Use ABI */
        this.params.contract.use(staking, this.getAddress());

        /* Set Token Address Contract for easy access */
        this.params.ERC20Contract = new ERC20Contract({
            web3: this.web3,
            contractAddress: await this.erc20(),
            acc : this.acc
        });


        /* Assert Token Contract */
        await this.params.ERC20Contract.__assert();
	}


	/**
        * @function
        * @override
        * @description Deploy the Staking Contract
    */
	deploy = async ({callback}={}) => {
        if(!this.getERC20Contract()){
            throw new Error("No Token Address Provided");
        }
		let params = [
            this.getERC20Contract().getAddress()
        ];
		let res = await this.__deploy(params, callback);
		this.params.contractAddress = res.contractAddress;
		/* Call to Backend API */
		await this.__assert();
		return res;
    };

    getERC20Contract = () => this.params.ERC20Contract;
}

export default StakingContract;
