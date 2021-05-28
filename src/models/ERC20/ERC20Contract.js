import { ierc20 } from '../../interfaces';
import Numbers from '../../utils/Numbers';
import IContract from '../IContract';

/**
 * @typedef {Object} ERC20Contract~Options
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection] created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 */

/**
 * @class ERC20Contract
 * @param {ERC20Contract~Options} options
 */
class ERC20Contract extends IContract {
  constructor(params = {}) {
    super({ abi: ierc20, ...params });
  }

  /**
   * Use a {@link ierc20} contract with the current address
   * @return {Promise<void>}
   */
  __assert = async () => {
    this.params.contract.use(ierc20, this.getAddress());
    this.params.decimals = await this.getDecimalsAsync();
  };

  /**
   *
   * @return {*}
   */
  getContract() {
    return this.params.contract.getContract();
  }

  /**
   * Get Token Address
   * @returns {Address} address
   */
  getAddress() {
    return this.params.contractAddress;
  }

  /**
   * Transfer Tokens
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.toAddress To Address
   * @param {Integer} params.tokenAmount Amount of Tokens
   * @returns {Promise<Transaction>} Transaction
   */
  transferTokenAmount = async ({ toAddress, tokenAmount }) => {
    const amountWithDecimals = Numbers.toSmartContractDecimals(
      tokenAmount,
      this.getDecimals(),
    );
    return await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.transfer(toAddress, amountWithDecimals),
    );
  };

  /**
   * Get Amount of Tokens User Holds
   * @function
   * @param {Address} address User Address
   * @returns {Promise<Transaction>} Transaction
   */
  getTokenAmount = async address => Numbers.fromDecimals(
    await this.getContract().methods.balanceOf(address).call(),
    this.getDecimals(),
  );

  /**
   * Get Total Supply of Token
   * @function
   * @returns {Promise<number>} Total supply
   */
  totalSupply = async () => Numbers.fromDecimals(
    await this.getContract().methods.totalSupply().call(),
    this.getDecimals(),
  );

  /**
   *
   * @return {Contract}
   */
  getABI() {
    return this.params.contract;
  }

  /**
   * Get Decimals of Token
   * @function
   * @returns {number} Total supply
   */
  getDecimals() {
    return this.params.decimals;
  }

  /**
   *
   * @return {Promise<number>}
   */
  getDecimalsAsync = async () => await this.getContract().methods.decimals().call();

  /**
   * Verify if Spender is Approved to use tokens
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.address Sender Address
   * @param {number} params.amount Amount of Tokens
   * @param {Address} params.spenderAddress Spender Address
   * @returns {Promise<boolean>} isApproved
   */
  isApproved = async ({ address, amount, spenderAddress }) => {
    try {
      const approvedAmount = Numbers.fromDecimals(
        await this.getContract()
          .methods.allowance(address, spenderAddress)
          .call(),
        this.getDecimals(),
      );
      return approvedAmount >= amount;
    } catch (err) {
      throw err;
    }
  };

  /**
   * Approve tokens to be used by another address/contract
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.address Spender Address/Contract
   * @param {number} params.amount Amount of Tokens
   * @param {function():void} params.callback callback for the Tx
   * @returns {Promise<Transaction>} Transaction
   */
  approve = async ({ address, amount, callback }) => {
    try {
      const amountWithDecimals = Numbers.toSmartContractDecimals(
        amount,
        this.getDecimals(),
      );
      const res = await this.__sendTx(
        this.params.contract
          .getContract()
          .methods.approve(address, amountWithDecimals),
        null,
        null,
        callback,
      );
      return res;
    } catch (err) {
      throw err;
    }
  };

  /**
   * Deploy ERC20 Token
   * @function
   * @param {Object} params Parameters
   * @param {string} params.name Name of token
   * @param {string} params.symbol Symbol of token
   * @param {number} params.cap Max supply of Token (ex : 100M)
   * @param {Address} params.distributionAddress Where tokens should be sent to initially
   * @returns {Promise<Transaction>} Transaction
   */
  deploy = async ({
    name, symbol, cap, distributionAddress, callback,
  }) => {
    if (!distributionAddress) {
      throw new Error('Please provide an Distribution address for distro');
    }

    if (!name) {
      throw new Error('Please provide a name');
    }

    if (!symbol) {
      throw new Error('Please provide a symbol');
    }

    if (!cap) {
      throw new Error('Please provide a cap');
    }
    const params = [name, symbol, cap, distributionAddress];
    const res = await this.__deploy(params, callback);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };
}

export default ERC20Contract;
