import _ from 'lodash';
import { staking } from '../../interfaces';
import ERC20Contract from '../ERC20/ERC20Contract';
import ERC721Collectibles from '../ERC721/ERC721Collectibles';
import IContract from '../IContract';
import Numbers from '../../utils/Numbers';

/**
 * @typedef {Object} StakingContract~Options
 * @property {string} tokenAddress
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection] created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 */

/**
 * Staking Contract Object
 * @class StakingContract
 * @param {StakingContract~Options} options
 */
class StakingContract extends IContract {
  constructor(params = {}) {
    super({ ...params, abi: staking });

    if (params.tokenAddress) {
      this.params.ERC20Contract = new ERC20Contract({
        web3Connection: this.web3Connection,
        contractAddress: params.tokenAddress,
      });
    }

    if (params.collectiblesAddress) {
      this.params.ERC721Collectibles = new ERC721Collectibles({
        web3Connection: this.web3Connection,
        contractAddress: params.collectiblesAddress,
      });
    }
  }

  /**
   * Get ERC20 Address of the Contract
   * @returns {Promise<Address>}
   */
  async erc20() {
    return await this.getWeb3Contract().methods.erc20().call();
  }

  /**
   * Get Token Amount of ERC20 Address
   * @function
   * @param {Object} params
   * @param {Address} params.address
   * @returns {Promise<number>}
   */
  async getTokenAmount({ address }) {
    return await this.getERC20Contract().getTokenAmount(address);
  }

  /**
   * Get All Tokens Locked for the APR
   * @returns {Promise<number>}
   */
  async futureLockedTokens() {
    const res = await this.getWeb3Contract().methods.futureLockedTokens().call();
    return Numbers.fromDecimals(res, this.getERC20Contract().getDecimals());
  }

  /**
   * Get All Tokens Available for the Subscription Amount
   * @returns {Promise<number>}
   */
  async availableTokens() {
    const res = await this.getWeb3Contract().methods.availableTokens().call();
    return Numbers.fromDecimals(res, this.getERC20Contract().getDecimals());
  }

  /**
   * Get All Tokens Held in Stake at that specific moment
   * @returns {Promise<number>}
   */
  async heldTokens() {
    const res = await this.getWeb3Contract().methods.heldTokens().call();
    return Numbers.fromDecimals(res, this.getERC20Contract().getDecimals());
  }

  /**
   * Get APR Amount based on amount of timestamp, amount and APR of that product
   * @function
   * @param {Object} params
   * @param {Integer} params.APR
   * @param {Date} params.startDate
   * @param {Date} params.endDate
   * @param {Integer} params.amount Token Amount
   * @returns {Promise<number>}
   */
  async getAPRAmount({
    APR, startDate, endDate, amount,
  }) {
    const res = await this.getWeb3Contract().methods.getAPRAmount(
      APR,
      Numbers.timeToSmartContractTime(startDate),
      Numbers.timeToSmartContractTime(endDate),
      Numbers.toSmartContractDecimals(
        amount,
        this.getERC20Contract().getDecimals(),
      ),
    ).call();
    return Numbers.fromDecimals(res, this.getERC20Contract().getDecimals());
  }

  /**
   * Creates a product
   * @param {Object} params
   * @param {Date} params.startDate
   * @param {Date} params.endDate
   * @param {Integer} params.totalMaxAmount
   * @param {Integer} params.individualMinimumAmount
   * @param {Integer} params.individualMaxAmount
   * @param {Integer} params.APR
   * @param {Boolean} params.lockedUntilFinalization
   * @param {IContract~TxOptions} options
   * @return {Promise<TransactionObject>}
   */
  async createProduct({
    startDate,
    endDate,
    totalMaxAmount,
    individualMinimumAmount,
    individualMaxAmount,
    APR,
    lockedUntilFinalization,
  }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.createProduct(
        Numbers.timeToSmartContractTime(startDate),
        Numbers.timeToSmartContractTime(endDate),
        Numbers.toSmartContractDecimals(
          totalMaxAmount,
          this.getERC20Contract().getDecimals(),
        ),
        Numbers.toSmartContractDecimals(
          individualMinimumAmount,
          this.getERC20Contract().getDecimals(),
        ),
        Numbers.toSmartContractDecimals(
          individualMaxAmount,
          this.getERC20Contract().getDecimals(),
        ),
        APR,
        lockedUntilFinalization,
      ),
      options,
    );
  }

  /**
   * Get All Available Products Ids
   * @function
   * @returns {Promise<number[]>} ids
   */
  async getProducts() {
    return await this.getWeb3Contract().methods.getProductIds().call();
  }

  /**
   * @typedef {Object} StakingContract~Product
   * @property {Date} createdAt
   * @property {Date} startDate
   * @property {Date} endDate
   * @property {boolean} lockedUntilFinalization
   * @property {number} APR
   * @property {number} currentAmount
   * @property {number} individualMinimumAmount
   * @property {number} individualMaxAmount
   * @property {number} totalMaxAmount
   * @property {number[]} subscriptionIds
   * @property {Address[]} subscribers
   * @property {number} _id
   */

  /**
   * Get product
   * @function
   * @param {Object} params
   * @param {number} params.product_id
   * @return {Promise<StakingContract~Product>}
   */
  async getProduct({ product_id }) {
    const res = await this.getWeb3Contract().methods.getProduct(product_id).call();

    return {
      _id: product_id,
      createdAt: Numbers.fromSmartContractTimeToMinutes(res[0]),
      startDate: Numbers.fromSmartContractTimeToMinutes(res[1]),
      endDate: Numbers.fromSmartContractTimeToMinutes(res[2]),
      totalMaxAmount: Numbers.fromDecimals(
        res[3],
        this.getERC20Contract().getDecimals(),
      ),
      individualMinimumAmount: Numbers.fromDecimals(
        res[4],
        this.getERC20Contract().getDecimals(),
      ),
      individualMaxAmount: Numbers.fromDecimals(
        res[5],
        this.getERC20Contract().getDecimals(),
      ),
      APR: parseInt(res[6], 10),
      currentAmount: Numbers.fromDecimals(
        res[7],
        this.getERC20Contract().getDecimals(),
      ),
      lockedUntilFinalization: res[8],
      subscribers: res[9],
      subscriptionIds: Numbers.fromExponential(res[10]),
    };
  }

  /**
   * Approve ERC20 Allowance for Transfer for Subscribe Product
   * @function
   * @param {IContract~TxOptions} options
   * @return {Promise<TransactionObject>}
   */
  async approveERC20Transfer(options) {
    const totalMaxAmount = await this.getERC20Contract().totalSupply();
    return await this.getERC20Contract().approve({
      address: this.getAddress(),
      amount: Numbers.toSmartContractDecimals(
        totalMaxAmount,
        this.getERC20Contract().getDecimals(),
      ),
    }, options);
  }

  /**
   * Subscribe to a product Staking
   * @function
   * @param {Object} params
   * @param {number} params.product_id
   * @param {number} params.amount
   * @param {IContract~TxOptions} options
   * @throws {Error} Has to Approve Token Transfer First, use the 'approve' Call
   * @returns {Promise<boolean>} Success
   */
  async subscribeProduct({ address, product_id, amount }, options) {
    /* Get Decimals of Amount */
    const amountWithDecimals = Numbers.toSmartContractDecimals(
      amount,
      this.getERC20Contract().getDecimals(),
    );
    /* Verify if transfer is approved for this amount */
    const isApproved = await this.getERC20Contract().isApproved({
      address,
      amount,
      spenderAddress: this.getAddress(),
    });
    if (!isApproved) {
      throw new Error(
        "Has to Approve Token Transfer First, use the 'approve' Call",
      );
    }

    return await this.__sendTx(
      this.getWeb3Contract().methods.subscribeProduct(product_id, amountWithDecimals),
      options,
    );
  }

  /**
   * @typedef {Object} StakingContract~ProductSubscription
   * @property {number} amount
   * @property {number} APR
   * @property {number} withdrawAmount
   * @property {number} productId
   * @property {number} _id
   * @property {Address} subscriberAddress
   * @property {Date} startDate
   * @property {Date} endDate
   * @property {boolean} finalized
   */

  /**
   * Get Subscription from product
   * @function
   * @param {Object} params
   * @param {number} params.subscription_id
   * @param {number} params.product_id
   * @return {Promise<StakingContract~ProductSubscription>}
   */
  async getSubscription({ subscription_id, product_id }) {
    const res = await this.getWeb3Contract().methods.getSubscription(
      subscription_id, product_id,
    ).call();

    return {
      _id: Numbers.fromExponential(res[0]),
      productId: Numbers.fromExponential(res[1]),
      startDate: Numbers.fromSmartContractTimeToMinutes(res[2]),
      endDate: Numbers.fromSmartContractTimeToMinutes(res[3]),
      amount: Numbers.fromDecimals(
        res[4],
        this.getERC20Contract().getDecimals(),
      ),
      subscriberAddress: res[5],
      APR: parseInt(res[6], 10),
      finalized: res[7],
      withdrawAmount: Numbers.fromDecimals(
        res[8],
        this.getERC20Contract().getDecimals(),
      ),
    };
  }

  /**
   * Withdraw Subscription to a product Staking
   * @function
   * @param {Object} params
   * @param {number} params.subscription_id
   * @param {number} params.product_id
   * @param {IContract~TxOptions} options
   * @return {Promise<TransactionObject>}
   */
  async withdrawSubscription({ product_id, subscription_id }, options) {
    return await this.__sendTx(
      this.getWeb3Contract()
        .methods.withdrawSubscription(product_id, subscription_id),
      options,
    );
  }

  /**
   * Get Subscriptions by Address
   * @function
   * @param {Object} params
   * @param {Address} params.address
   * @returns {Promise<number[]>} subscriptions_ids
   */
  async getSubscriptionsByAddress({ address }) {
    const res = await this.getWeb3Contract().methods.getMySubscriptions(address).call();
    return res.map(r => Numbers.fromExponential(r));
  }

  /**
   * Get All Subscriptions done
   * @function
   * @returns {Promise<Subscription[]>} subscriptions
   */
  async getAllSubscriptions() {
    /* Get All Products */
    const products = await this.getProducts();

    /* Get All Subscriptions */
    const subscriptions = await Promise.all(
      products.map(async (product) => {
        const productObj = await this.getProduct({
          product_id: product,
        });
        return await Promise.all(
          productObj.subscriptionIds.map(async subscription_id => this.getSubscription({
            subscription_id,
            product_id: product,
          })),
        );
      }),
    );
    return subscriptions ? _.flatten(subscriptions) : [];
  }

  /**
   * Transfer Tokens by the Admin to ensure APR Amount
   * @function
   * @param {Object} params
   * @param {number} params.amount
   * @param {IContract~TxOptions} options
   * @param {Promise<number>} amount
   */
  async depositAPRTokensByAdmin({ amount }, options) {
    return await this.getERC20Contract().transferTokenAmount({
      toAddress: this.getAddress(),
      tokenAmount: amount,
    }, options);
  }

  /**
   * Get Total Amount of tokens needed to be deposited by Admin to ensure APR for all available Products
   * @function
   * @return {Promise<number>} Amount
   */
  async getTotalNeededTokensForAPRbyAdmin() {
    const products = await this.getProducts();

    const allProducts = await Promise.all(
      products.map(async (product) => {
        const productObj = await this.getProduct({
          product_id: product,
        });
        const res = await this.getAPRAmount({
          APR: productObj.APR,
          startDate: productObj.startDate,
          endDate: productObj.endDate,
          amount: productObj.totalMaxAmount,
        });
        return parseFloat(res);
      }),
    );
    return Numbers.fromExponential(
      allProducts.reduce((a, b) => a + b, 0),
    ).toString();
  }

  /**
   * @async
   * @function
   * @throws {Error} Contract is not deployed, first deploy it and provide a contract address
   * @void
   */
  __assert = async () => {
    if (!this.getAddress()) {
      throw new Error(
        'Contract is not deployed, first deploy it and provide a contract address',
      );
    }
    /* Use ABI */
    this.params.contract.use(staking, this.getAddress());

    /* Set Token Address Contract for easy access */
    if (!this.params.ERC20Contract) {
      this.params.ERC20Contract = new ERC20Contract({
        web3Connection: this.web3Connection,
        contractAddress: await this.erc20(),
      });
    }

    /* Assert Token Contract */
    await this.params.ERC20Contract.login();
    await this.params.ERC20Contract.__assert();
  };

  /**
   * Deploy the Staking Contract
   * @function
   * @param {IContract~TxOptions} options
   * @return {Promise<*>}
   */
  deploy = async (options) => {
    if (!this.getERC20Contract()) {
      throw new Error('No Token Address Provided');
    }
    const erc721address = this.getERC721Contract()
      ? this.getERC721Contract().getAddress()
      : '0x0000000000000000000000000000000000000000';
    const params = [this.getERC20Contract().getAddress(), erc721address];
    const res = await this.__deploy(params, options);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };

  /**
   * @function
   * @return ERC20Contract|undefined
   */
  getERC20Contract() {
    return this.params.ERC20Contract;
  }

  /**
   * @function
   * @return ERC721Collectibles|undefined
   */
  getERC721Contract() {
    return this.params.ERC721Collectibles;
  }
}

export default StakingContract;
