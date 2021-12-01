import moment from 'moment';
import { erc20distribution } from '../../interfaces';
import ERC20Contract from './ERC20Contract';
import IContract from '../IContract';
import Numbers from '../../utils/Numbers';

/**
 * @typedef {Object} ERC20Distribution~Options
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection] created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 */

/**
 * ERC20 Token Distribution Contract Object
 * @class ERC20Distribution
 * @param {ERC20Distribution~Options} options
 */
class ERC20Distribution extends IContract {
  constructor(params = {}) {
    try {
      super({ ...params, abi: erc20distribution });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get ERC20 Address of the Token Contract managed
   * @returns {Promise<Address>}
   */
  async erc20() {
    return await this.params.contract.getContract().methods.erc20().call();
  }

  /**
   * Get Token Amount of ERC20 Address
   * @function
   * @param {Object} params
   * @param {Address} params.address
   * @returns {Promise<number>} Token Amount
   */
  getTokenAmount = async ({ address }) => await this.getERC20Contract().getTokenAmount(address);

  /**
   * (Admin only) Set Token address
   * @function
   * @param {Object} params
   * @param {Address} params.address ERC20 Address
   * @returns {Promise<boolean>} Success True if operation was successful
   */
   setTokenAddress = async ({ address }) => await this.__sendTx(
     this.params.contract
       .getContract()
       .methods.setTokenAddress(address),
   );

   /**
   * (Admin only) Get All tokens from the Distribution Contract
   * @function
   * @param {Object} params
   * @param {Address} params.address Address to transfer the ERC20 tokens to
   * @returns {Promise<boolean>} Success True if operation was successful
   */
    safeGuardAllTokens = async ({ address }) => await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.safeGuardAllTokens(address),
    );

    /**
   * (Admin only) Set the Token Generation Event
   * @function
   * @param {Object} params
   * @param {Integer} params.time Time to set the TGE to (Token Generation Event)
   * @returns {Promise<boolean>} Success True if operation was successful
   */
    setTGEDate = async ({ time }) => await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.setTGEDate(Numbers.timeToSmartContractTime(time)),
    );

    /**
   * (Admin only) Set Initial Distribution (Call the amount of times necessary)
   * @function
   * @param {Object} params
   * @param {Address} params.address Address of the recipient
   * @param {Integer} params.tokenAmount Token amount for this tranche
   * @param {Integer} params.unlockTime Time to when this tokens unlock
   * @returns {Promise<boolean>} Success True if operation was successful
   */
    setInitialDistribution = async ({ address, tokenAmount, unlockTime }) => {
      const tokenAmountWithDecimals = Numbers.toSmartContractDecimals(
        tokenAmount,
        this.getERC20Contract().getDecimals(),
      );
      return await this.__sendTx(
        this.params.contract
          .getContract()
          .methods.setInitialDistribution(address, tokenAmountWithDecimals, Numbers.timeToSmartContractTime(unlockTime)),
      );
    };

    /**
   * Trigger Token - should be called every month
   * @function
   * @param {Object} params
   * @returns {Promise<boolean>} Success True if operation was successful
   */
    triggerTokenSend = async () => await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.triggerTokenSend(),
    );

    /**
     *
     * @return {Promise<void>}
     * @throws {Error} Contract is not deployed, first deploy it and provide a contract address
     */
    __assert = async () => {
      if (!this.getAddress()) {
        throw new Error(
          'Contract is not deployed, first deploy it and provide a contract address',
        );
      }

      /* Use ABI */
      this.params.contract.use(erc20distribution, this.getAddress());

      /* Set Token Address Contract for easy access */
      if (!this.params.ERC20Contract) {
        this.params.ERC20Contract = new ERC20Contract({
          web3Connection: this.web3Connection,
          contractAddress: await this.erc20(),
        });
      }
      /* Assert Token Contract */
      await this.params.ERC20Contract.__assert();
    };

    /**
     * Deploy the Contract
     * @function
     * @param {Object} params
     * @param {function():void} params.callback
     * @return {Promise<*|undefined>}
     * @throws {Error} No Token Address Provided
     */
    deploy = async ({ callback } = {}) => {
      const params = [];
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

export default ERC20Distribution;
