import { erc20mock } from '../../interfaces';
import Numbers from '../../utils/Numbers';
import ERC20Contract from '../ERC20/ERC20Contract';

/**
 * @typedef {Object} ERC20Mock~Options
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection] created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 */

/**
 * @class ERC20Mock
 * @param {ERC20Mock~Options} options
 */
class ERC20Mock extends ERC20Contract {
  constructor(params = {}) {
    super({ abi: erc20mock, ...params });
  }

  /**
   * Use a {@link erc20mock} contract with the current address
   * @return {Promise<void>}
   */
  __assert = async () => {
    this.params.contract.use(erc20mock, this.getAddress());
    this.params.decimals = await this.getDecimalsAsync();
  };

  /**
     * Mint tokens to given address.
     * @function
     * @param {Object} params Parameters
     * @param {Address} params.to The address to mind tokens to.
     * @param {uint256} params.amount The amount of the underlying asset to supply.
     * @returns {Promise<void>}
     */
  async mint({ to, amount }) {
    const decimals = this.getDecimals();
    const amountWithDecimals = Numbers.fromBNToDecimals(
      amount,
      decimals,
    );
    // console.log('ERC20Mock.mint: ', amountWithDecimals);
    return await this.__sendTx(this.getContract().methods.mint(to, amountWithDecimals));
  }

  /**
   * Deploy ERC20Mock
   * @function
   * @param {Object} params Parameters
   * @returns {Promise<Transaction>} Transaction
   */
  deploy = async ({ callback } = {}) => {
    const params = [];

    const res = await this.__deploy(params, callback);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };
}

export default ERC20Mock;
