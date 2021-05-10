import { ierc20 } from "../../interfaces";
import Numbers from "../../utils/Numbers";
import IContract from "../IContract";

/**
 * @class ERC20Contract
 * @param {Object} params Parameters
 * @param {Boolean} params.mainnet
 * @param {Boolean} params.test
 * @param {Boolean} params.localtest, ganache local blockchain
 * @param {Web3Connection} params.web3Connection ? (opt), created from above params
 * @param {Address} params.contractAddress Optional/If Existent
 */
class ERC20Contract extends IContract {
  constructor(params) {
    super({ abi: ierc20, ...params });
  }

  __assert = async () => {
    this.params.contract.use(ierc20, this.getAddress());
    this.params.decimals = await this.getDecimalsAsync();
  };

  getContract() {
    return this.params.contract.getContract();
  }
  /**
   * @function
   * @description Get Token Address
   * @returns {Address} address
   */
  getAddress() {
    return this.params.contractAddress;
  }

  /**
   * @function
   * @description Transfer Tokens
   * @param {Object} params Parameters
   * @param {Address} params.toAddress To Address
   * @param {Integer} params.tokenAmount Amount of Tokens
   * @returns {Transaction} Transaction
   */
  transferTokenAmount = async ({ toAddress, tokenAmount }) => {
    let amountWithDecimals = Numbers.toSmartContractDecimals(
      tokenAmount,
      this.getDecimals()
    );
    return await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.transfer(toAddress, amountWithDecimals)
    );
  }

  /**
   * @function
   * @description Get Amount of Tokens User Holds
   * @param {Address} address User Address
   * @returns {Transaction} Transaction
   */
  getTokenAmount = async (address) => {
    return Numbers.fromDecimals(
      await this.getContract().methods.balanceOf(address).call(),
      this.getDecimals()
    );
  }

  /**
   * @function
   * @description Get Total Supply of Token
   * @returns {Integer} Total supply
   */
  totalSupply = async () =>  {
    return Numbers.fromDecimals(
      await this.getContract().methods.totalSupply().call(),
      this.getDecimals()
    );
  }

  getABI() {
    return this.params.contract;
  }


  /**
   * @function
   * @description Get Decimals of Token
   * @returns {Integer} Total supply
   */
  getDecimals() {
    return this.params.decimals;
  }

  getDecimalsAsync = async () =>  {
    return await this.getContract().methods.decimals().call();
  }

  /**
   * @function
   * @description Verify if Spender is Approved to use tokens
   * @param {Object} params Parameters
   * @param {Address} params.address Sender Address
   * @param {Integer} params.amount Amount of Tokens
   * @param {Address} params.spenderAddress Spender Address
   * @returns {Bool} isApproved
   */
  isApproved = async ({ address, amount, spenderAddress }) =>  {
    try {
      let approvedAmount = Numbers.fromDecimals(
        await this.getContract()
          .methods.allowance(address, spenderAddress)
          .call(),
        this.getDecimals()
      );
      return approvedAmount >= amount;
    } catch (err) {
      throw err;
    }
  }

  /**
   * @function
   * @description Approve tokens to be used by another address/contract
   * @param {Object} params Parameters
   * @param {Address} params.address Spender Address/Contract
   * @param {Integer} params.amount Amount of Tokens
   * @returns {Transaction} Transaction
   */
  approve = async ({ address, amount, callback }) => {
    try {
      let amountWithDecimals = Numbers.toSmartContractDecimals(
        amount,
        this.getDecimals()
      );
      let res = await this.__sendTx(
        this.params.contract
          .getContract()
          .methods.approve(address, amountWithDecimals),
        null,
        null,
        callback
      );
      return res;
    } catch (err) {
      throw err;
    }
  }

  /**
   * @function
   * @description Deploy ERC20 Token
   * @param {Object} params Parameters
   * @param {String} params.name Name of token
   * @param {String} params.symbol Symbol of token
   * @param {Integer} params.cap Max supply of Token (ex : 100M)
   * @param {Address} params.distributionAddress Where tokens should be sent to initially
   * @returns {Transaction} Transaction
   */
  deploy = async ({ name, symbol, cap, distributionAddress, callback }) => {
    if (!distributionAddress) {
      throw new Error("Please provide an Distribution address for distro");
    }

    if (!name) {
      throw new Error("Please provide a name");
    }

    if (!symbol) {
      throw new Error("Please provide a symbol");
    }

    if (!cap) {
      throw new Error("Please provide a cap");
    }
    let params = [name, symbol, cap, distributionAddress];
    let res = await this.__deploy(params, callback);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };
}

export default ERC20Contract;
