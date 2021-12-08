/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line no-unused-vars
import { networkFactory } from '../../interfaces';
import Numbers from '../../utils/Numbers';
import IContract from '../IContract';
import ERC20Contract from '../ERC20/ERC20Contract';

/**
 * @typedef {Object} NetworkFactory~Options
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection] created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 */

/**
 * Network Object
 * @class Network
 * @param {Network~Options} options
 */

class Network extends IContract {
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
    await this.params.settlerToken.start();
    await this.params.settlerToken.__assert();
  };

  /**
   * Get Network By Creator Address
   * @param {Address} address
   * @returns {Adddress}
   */
  getNetworkByAddress(address) {
    return this.params.contract
      .getContract()
      .methods.getNetworkByAddress(address)
      .call();
  }

  /**
   * Get Network By Id
   * @param {number} id
   * @returns {Adddress}
   */
  getNetworkById(id) {
    return this.params.contract
      .getContract()
      .methods.getNetworkById(id)
      .call();
  }

  /**
     * Get Amount of Networks Forked in the Protocol
     * @returns {Promise<number>}
     */
  getAmountofNetworksForked() {
    return this.params.contract.getContract().methods.networksAmount().call();
  }

  /**
     * Get Total Amount of Tokens Locked by Operator in the Network
     * @param {Address} address
     * @returns {Promise<number>}
     */
  async getLockedStakedByAddress(address) {
    return Numbers.fromDecimals(
      await this.params.contract.getContract().methods.tokensLocked(address).call(),
      18,
    );
  }

  /**
     * Get Open Issues Available
     * @param {Address} address
     * @returns {Address[]}
     */
  getNetworks() {
    return this.params.contract
      .getContract()
      .methods.networksArray()
      .call();
  }

  /**
     * Get Total Amount of Tokens Staked in the Protocol
     * @returns {Promise<number>}
     */
  async getBEPROLocked() {
    return Numbers.fromDecimals(
      await this.params.contract.getContract().methods.tokensLockedTotal().call(),
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
  getSettlerTokenAddress() {
    return this.params.contract
      .getContract()
      .methods.beproAddress()
      .call();
  }

  /**
   * Get Amount Needed for Operator
   * @returns {Promise<Integer>}
   */
  async OPERATOR_AMOUNT() {
    return Numbers.fromDecimals(
      await this.params.contract
        .getContract()
        .methods.OPERATOR_AMOUNT()
        .call(),
      18,
    );
  }

  /**
   * Approve ERC20 Allowance
   * @function
   * @return {Promise<number>}
   */
  approveSettlerERC20Token = async () => {
    const totalMaxAmount = await this.getSettlerTokenContract().totalSupply();
    return this.getSettlerTokenContract().approve({
      address: this.getAddress(),
      amount: totalMaxAmount,
    });
  };

  /**
   * Verify if Approved
   * @function
   * @param {Object} params
   * @param {number} params.amount
   * @param {Address} params.address
   * @return {Promise<number>}
   */
  isApprovedSettlerToken = ({ amount, address }) => this.getSettlerTokenContract().isApproved({
    address,
    amount,
    spenderAddress: this.getAddress(),
  });

  /**
   * lock tokens for operator use
   * @param {Object} params
   * @params params.tokenAmount {number}
   * @throws {Error} Tokens Amount has to be higher than 0
   * @throws {Error} Tokens not approve for tx, first use 'approveERC20'
   * @return {Promise<TransactionObject>}
   */
  lock({ tokenAmount }, options) {
    if (tokenAmount <= 0) {
      throw new Error('Token Amount has to be higher than 0');
    }

    return this.__sendTx(
      this.params.contract.getContract().methods.lock(
        Numbers.toSmartContractDecimals(tokenAmount, this.getSettlerTokenContract().getDecimals()),
      ),
      options,
    );
  }

  /**
   * Unlock Tokens for oracles
   * @throws {Error} Tokens Amount has to be higher than 0
   * @return {Promise<TransactionObject>}
   */
  unlock(options) {
    return this.__sendTx(
      this.params.contract.getContract().methods.unlock(),
      options,
    );
  }

  /**
   * Create Network
   * @param {Object} params
   * @param {Address} params.settlerToken
   * @param {Address} params.transactionalToken
   * @return {Promise<TransactionObject>}
   */
  createNetwork({ settlerToken, transactionalToken }, options) {
    return this.__sendTx(
      this.params.contract
        .getContract()
        .methods.createNetwork(settlerToken, transactionalToken),
      options,
    );
  }

  /**
   * Deploys Contracts
   * @function
   * @param {Object} params
   * @param {string} params.beproAddress
   * @param {function():void} params.callback
   * @return {Promise<*|undefined>}
   */
  deploy = async ({
    beproAddress, callback,
  }) => {
    const params = [beproAddress];
    const res = await this.__deploy(params, callback);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };

  /**
   * @function
   * @return ERC20Contract|null
   */
  getSettlerTokenContract = () => this.params.settlerToken;
}

export default Network;
