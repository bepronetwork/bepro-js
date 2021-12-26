import { cerc20mock } from '../../interfaces';
import Numbers from '../../utils/Numbers';
import ERC20Contract from '../ERC20/ERC20Contract';

/**
 * @typedef {Object} CERC20Mock~Options
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection] created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 */

/**
 * @class CERC20Mock, use no decimals transformation for numbers because we hold underlaying token asset.
 * @param {CERC20Mock~Options} options
 * @dev See https://compound.finance/developers
 */
class CERC20Mock extends ERC20Contract {
  constructor(params = {}) {
    super({ ...params, abi: cerc20mock });
    if (params.tokenAddress) {
      this.params.ERC20Contract = new ERC20Contract({
        web3Connection: this.web3Connection,
        contractAddress: params.tokenAddress,
      });
    }
  }

  /**
     * Block number that interest started to increase from
     * @returns {Promise<uint256>}
     */
  async initialBlockNumber() {
    return await this.getWeb3Contract().methods.initialBlockNumber().call();
  }

  /**
     * Initial exchange rate used when minting the first CTokens (used when totalSupply = 0)
     * @returns {Promise<uint256>}
     */
  async initialExchangeRate() {
    return await this.getWeb3Contract().methods.initialExchangeRate().call();
  }

  /**
     * Indicator that this is a CToken contract (for inspection)
     * @returns {Promise<bool>}
     */
  async isCToken() {
    return await this.getWeb3Contract().methods.isCToken().call();
  }

  /**
     * Underlying asset for this CToken
     * @returns {Promise<address>}
     */
  async underlying() {
    return await this.getWeb3Contract().methods.underlying().call();
  }

  /** * User Interface ** */

  /**
     * Get the underlying balance of the `owner`
     * @dev This also accrues interest in a transaction
     * @param {address} The address of the account to query
     * @returns {Promise<uint256>} The amount of underlying owned by `owner`
     */
  async balanceOfUnderlying(owner) {
    const balance = await this.getWeb3Contract().methods.balanceOfUnderlying(owner).call();
    return Numbers.fromDecimalsToBN(
      balance,
      this.getERC20Contract().getDecimals(),
    );
  }

  /**
     * Accrue interest then return the up-to-date exchange rate
     * @returns {Promise<uint256>} Calculated exchange rate
     */
  async exchangeRateCurrent() {
    const rate = await this.getWeb3Contract().methods.exchangeRateCurrent().call();
    const decimals = this.getDecimals();
    const rate2 = Numbers.fromDecimalsToBN(
      rate,
      decimals,
    );
    return rate2; // rate
  }

  /**
     * Sender supplies assets into the market and receives cTokens in exchange
     * Accrues interest whether or not the operation succeeds, unless reverted
     * @param {uint256} The amount of the underlying asset to supply
     * @returns {Promise<bool>} true=success, otherwise a failure
     */
  async mint(mintAmount) {
    const decimals = this.getERC20Contract().getDecimals();
    const mintAmountWithDecimals = Numbers.fromBNToDecimals(
      mintAmount,
      decimals,
    );
    return await this.__sendTx(this.getWeb3Contract().methods.mint(mintAmountWithDecimals));
    // return await this.__sendTx(this.getWeb3Contract().methods.mint(mintAmount));
  }

  /**
     * Sender supplies underlying to the money market
     * @dev This is just a mock
     * @param {uint256} supplyAmount The amount of underlying to supply
     * @returns {Promise<bool>} true=success, otherwise a failure
     */
  async supplyUnderlying(supplyAmount) {
    const decimals = this.getERC20Contract().getDecimals();
    const supplyAmountWithDecimals = Numbers.fromBNToDecimals(
      supplyAmount,
      decimals,
    );
    return await this.__sendTx(this.getWeb3Contract().methods.supplyUnderlying(supplyAmountWithDecimals));
    // return await this.__sendTx(this.getWeb3Contract().methods.supplyUnderlying(supplyAmount));;
  }

  /**
     * Sender redeems cTokens in exchange for a specified amount of underlying asset
     * @dev This is just a mock
     * @param {uint256} redeemAmount The amount of underlying to redeem
     * @returns {Promise<bool>} true=success, otherwise a failure
     */
  async redeemUnderlying(redeemAmount) {
    const decimals = this.getERC20Contract().getDecimals();
    const redeemAmountWithDecimals = Numbers.fromBNToDecimals(
      redeemAmount,
      decimals,
    );
    return await this.__sendTx(this.getWeb3Contract().methods.redeemUnderlying(redeemAmountWithDecimals));
    // return await this.__sendTx(this.getWeb3Contract().methods.redeemUnderlying(redeemAmount));
  }

  /**
   * Use a {@link cerc20mock} contract with the current address
   * @return {Promise<void>}
   */
  __assert = async () => {
    if (!this.getAddress()) {
      throw new Error(
        'Contract is not deployed, first deploy it and provide a contract address',
      );
    }

    this.params.contract.use(cerc20mock, this.getAddress());
    this.params.decimals = await this.getDecimalsAsync();

    /* Set Token Address Contract for easy access */
    if (!this.params.ERC20Contract) {
      this.params.ERC20Contract = new ERC20Contract({
        web3Connection: this.web3Connection,
        contractAddress: await this.underlying(),
      });
    }
    /* Assert Token Contract */
    await this.params.ERC20Contract.login();
    await this.params.ERC20Contract.__assert();
  };

  /**
   * Deploy CERC20Mock
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.underlying The address of the underlying asset
   * @param {uint256} params.initialExchangeRate The initial exchange rate, scaled by 1e18
   * @param {uint256} params.decimals ERC-20 decimal precision of this token
   * @returns {Promise<Transaction>} Transaction
   */
  deploy = async ({
    // underlying,
    initialExchangeRate, decimals, callback,
  }) => {
    // if (!underlying) {
    //  throw new Error('Please provide an underlying asset address');
    // }

    if (!initialExchangeRate) {
      throw new Error('Please provide an initial exchange rate');
    }

    if (!decimals) {
      throw new Error('Please provide decimals');
    }

    if (!this.getERC20Contract()) {
      throw new Error('No Token Address Provided');
    }

    const underlying = this.getERC20Contract().getAddress();

    const params = [underlying, initialExchangeRate, decimals];
    const res = await this.__deploy(params, callback);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };

  /**
   * @function
   * @return ERC20Contract|undefined
   */
  getERC20Contract = () => this.params.ERC20Contract;
}

export default CERC20Mock;
