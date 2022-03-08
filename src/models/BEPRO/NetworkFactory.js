/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line no-unused-vars
import { networkFactory } from '../../interfaces';
import Numbers from '../../utils/Numbers';
import IContract from '../IContract';
import ERC20Contract from '../ERC20/ERC20Contract';

const BigNumber = require('bignumber.js');

/**
 * @typedef {Object} NetworkFactory~Options
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection]
 * created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 */

/**
 * NetworkFactory Object
 * @class NetworkFactory
 * @param {NetworkFactory~Options} options
 */
class NetworkFactory extends IContract {
  constructor(params) {
    super({ abi: networkFactory, ...params });
  }


  /**
   * Asserts the 2 {@link ERC20Contract} on the current address
   * @function
   * @return {Promise<void>}
   * @throws {Error} Contract is not deployed, first deploy it and provide a contract address
   */
  __assert = async () => {
    if (!this.getAddress()) {
      throw new Error(
        'Contract is not deployed, first deploy it and provide a contract address',
      );
    }

    // Use ABI
    this.params.contract.use(networkFactory, this.getAddress());

    const beproAddress = await this.getSettlerTokenAddress();

    // Set Token Address Contract for easy access
    this.params.settlerToken = new ERC20Contract({
      web3Connection: this.web3Connection,
      contractAddress: beproAddress,
    });
    // Assert Token Contract
    await this.params.settlerToken.login();
    await this.params.settlerToken.__assert();
  };

  /**
   * Get Network By Creator Address
   * @param {Address} address
   * @returns {Adddress}
   */
  async getNetworkByAddress(address) {
    return await this.getWeb3Contract()
      .methods.getNetworkByAddress(address)
      .call();
  }

  /**
   * Get Network By Id
   * @param {number} id
   * @returns {Adddress}
   */
  async getNetworkById(id) {
    return await this.getWeb3Contract()
      .methods.getNetworkById(id)
      .call();
  }

  /**
   * Get Amount of Networks Forked in the Protocol
   * @returns {Promise<number>}
   */
  async getAmountofNetworksForked() {
    return Number(await this.getWeb3Contract().methods.networksAmount().call());
  }

  async networksAmount() {
    return BigNumber(await this.getWeb3Contract().methods.networksAmount().call());
  }


  /**
   * Get Total Amount of Tokens Locked by Operator in the Network
   * @param {Address} address
   * @returns {Promise<number>}
   */
  async getLockedStakedByAddress(address) {
    return Numbers.fromDecimals(
      await this.getWeb3Contract().methods.tokensLocked(address).call(),
      18,
    );
  }

  async getTokensLocked(address) {
    return Numbers.fromDecimalsToBN(
      await this.getWeb3Contract().methods.tokensLocked(address).call(),
      18,
    );
  }

  /**
   * Get Open Issues Available
   * @param {Address} address
   * @returns {Address[]}
   */
  async getNetworks() {
    const res = await this.getWeb3Contract()
      .methods.networksArray()
      .call();
    return res;
  }

  /**
   * Get Total Amount of Tokens Staked in the Protocol
   * @returns {Promise<number>}
   */
  async getBEPROLocked() {
    return Numbers.fromDecimals(
      await this.getWeb3Contract().methods.tokensLockedTotal().call(),
      18,
    );
  }

  async tokensLockedTotal() {
    return Numbers.fromDecimalsToBN(
      await this.getWeb3Contract().methods.tokensLockedTotal().call(),
      18,
    );
  }

  /**
   * Verify if Address is Council
   * @param {Object} params
   * @param {number} params.address
   * @returns {Promise<address>}
   */
  async isOperator({ address }) {
    return await this.getLockedStakedByAddress(address) >= await this.OPERATOR_AMOUNT();
  }

  /**
   * Get Settler Token Address
   * @returns {Promise<address>}
   */
  async getSettlerTokenAddress() {
    return await this.getWeb3Contract()
      .methods.beproAddress()
      .call();
  }

  async beproAddress() {
    return await this.getWeb3Contract()
      .methods.beproAddress()
      .call();
  }

  /**
   * Get Amount Needed for Operator
   * @returns {Promise<Integer>}
   */
  async OPERATOR_AMOUNT() {
    return Numbers.fromDecimals(
      await this.getWeb3Contract()
        .methods.OPERATOR_AMOUNT()
        .call(),
      18,
    );
  }

  /**
   * Approve ERC20 Allowance
   * @function
   * @param {IContract~TxOptions} options
   * @return {Promise<number>}
   */
  async approveSettlerERC20Token(options) {
    const totalMaxAmount = await this.getSettlerTokenContract().totalSupply();
    return await this.getSettlerTokenContract().approve({
      address: this.getAddress(),
      amount: totalMaxAmount,
    }, options);
  }


  /**
   * Verify if Approved
   * @function
   * @param {Object} params
   * @param {number} params.amount
   * @param {Address} params.address
   * @return {Promise<number>}
   */
  async isApprovedSettlerToken({ amount, address }) {
    return await this.getSettlerTokenContract().isApproved({
      address,
      amount,
      spenderAddress: this.getAddress(),
    });
  }

  /**
   * lock tokens for operator use
   * @param {Object} params
   * @params params.tokenAmount {number}
   * @param {IContract~TxOptions} options
   * @throws {Error} Tokens Amount has to be higher than 0
   * @throws {Error} Tokens not approve for tx, first use 'approveERC20'
   * @return {Promise<TransactionObject>}
   */
  lock({ tokenAmount }, options) {
    if (tokenAmount <= 0) {
      throw new Error('Token Amount has to be higher than 0');
    }

    return this.__sendTx(
      this.getWeb3Contract().methods.lock(
        Numbers.toSmartContractDecimals(
          tokenAmount,
          this.getSettlerTokenContract().getDecimals(),
        ),
      ),
      options,
    );
  }

  /**
   * Unlock Tokens for oracles
   * @param {IContract~TxOptions} options
   * @throws {Error} Tokens Amount has to be higher than 0
   * @return {Promise<TransactionObject>}
   */
  unlock(options) {
    return this.__sendTx(
      this.getWeb3Contract().methods.unlock(),
      options,
    );
  }

  /**
   * Create Network
   * @param {Object} params
   * @param {Address} params.settlerToken
   * @param {Address} params.transactionalToken
   * @param {IContract~TxOptions} options
   * @return {Promise<TransactionObject>}
   */
  createNetwork({ settlerToken, transactionalToken }, options) {
    return this.__sendTx(
      this.getWeb3Contract()
        .methods.createNetwork(settlerToken, transactionalToken),
      options,
    );
  }

  /**
   * Deploys Contracts
   * @function
   * @param {Object} params
   * @param {string} params.beproAddress
   * @param {IContract~TxOptions} options
   * @return {Promise<*|undefined>}
   */
  deploy = async ({ beproAddress }, options) => {
    const params = [beproAddress];
    const res = await this.__deploy(params, options);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };

  /**
   * @function
   * @return ERC20Contract|null
   */
  getSettlerTokenContract() {
    return this.params.settlerToken;
  }
}

export default NetworkFactory;
