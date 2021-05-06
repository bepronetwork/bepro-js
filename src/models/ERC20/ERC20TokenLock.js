import { tokenlock } from "../../interfaces";
import ERC20Contract from "./ERC20Contract";
import IContract from "../IContract";
import _ from "lodash";
import Numbers from "../../utils/Numbers";
import moment from "moment";
import dayjs from "dayjs";
var assert = require("assert");

/**
 * ERC20 Token Lock Contract Object
 * @class ERC20TokenLock
 * @param {Web3} web3
 * @param {Address} tokenAddress
 * @param {Address} contractAddress ? (opt)
 */

class ERC20TokenLock extends IContract {
  constructor({ tokenAddress /* Token Address */, ...params }) {
    try {
      super({ ...params, abi: tokenlock });
      console.log("ERC20TokenLock.ctor.tokenAddress: " + tokenAddress);
      console.log(
        "ERC20TokenLock.ctor.contractAddress: " + params.contractAddress
      );
      if (tokenAddress) {
        this.params.ERC20Contract = new ERC20Contract({
          web3: params.web3,
          contractAddress: tokenAddress,
          acc: params.acc,
        });
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * @function
   * @description Get ERC20 Address of the Token Contract managed
   * @returns {Address}
   */
  async erc20() {
    return await this.params.contract.getContract().methods.erc20().call();
  }

  /**
   * @function
   * @description Get Token Amount of ERC20 Address
   * @returns {Address}
   */
  getTokenAmount = async ({ address }) => {
    return await this.getERC20Contract().getTokenAmount(address);
  };

  /**
   * @function
   * @description Get All Tokens staked/locked at that specific moment
   * @returns {Integer}
   */
  async totalAmountStaked() {
    let res = await this.params.contract
      .getContract()
      .methods.totalAmountStaked()
      .call();
    return Numbers.fromDecimals(res, this.getERC20Contract().getDecimals());
  }

  /**
   * @function
   * @description Get minimum amount of tokens to lock per user
   * @returns {Integer}
   */
  async minAmountToLock() {
    let res = await this.params.contract
      .getContract()
      .methods.minAmountToLock()
      .call();
    return Numbers.fromDecimals(res, this.getERC20Contract().getDecimals());
  }

  /**
   * @function
   * @description Get maximum amount of tokens to lock per user
   * @returns {Integer}
   */
  async maxAmountToLock() {
    let res = await this.params.contract
      .getContract()
      .methods.maxAmountToLock()
      .call();
    return Numbers.fromDecimals(res, this.getERC20Contract().getDecimals());
  }

  /**
   * @function
   * @description Check if locked tokens release date has come and user can withdraw them
   * @returns {Boolean}
   */
  canRelease = async ({ address }) => {
    return await this.params.contract
      .getContract()
      .methods.canRelease(address)
      .call();
  };

  /**
   * @function
   * @description Get locked tokens amount for a given address
   * @returns {Integer} amount Locked token amount
   */
  getLockedTokens = async ({ address }) => {
    let res = await this.params.contract
      .getContract()
      .methods.getLockedTokens(address)
      .call();
    return Numbers.fromDecimals(res, this.getERC20Contract().getDecimals());
  };

  /**
   * @function
   * @description Get locked tokens info for a given address
   * @returns {Date} startDate
   * @returns {Date} endDate
   * @returns {Integer} amount Token amount
   */
  getLockedTokensInfo = async ({ address }) => {
    let res = await this.params.contract
      .getContract()
      .methods.getLockedTokensInfo(address)
      .call();

    return {
      startDate: Numbers.fromSmartContractTimeToMinutes(res[0]),
      endDate: Numbers.fromSmartContractTimeToMinutes(res[1]),
      amount: Numbers.fromDecimals(
        res[2],
        this.getERC20Contract().getDecimals()
      ),
    };
  };

  /**
   * @function
   * @description Admin sets maximum amount of tokens to lock per user
   * @param {Integer} tokenAmount Maximum tokens amount
   * @returns {Boolean} Success True if operation was successful
   */
  setMaxAmountToLock = async ({ tokenAmount }) => {
    this.onlyOwner(); //verify that user is admin

    /* Get Decimals of Amount */
    let amountWithDecimals = Numbers.toSmartContractDecimals(
      tokenAmount,
      this.getERC20Contract().getDecimals()
    );

    return await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.setMaxAmountToLock(amountWithDecimals)
    );
  };

  /**
   * @function
   * @description Admin sets minimum amount of tokens to lock per user
   * @param {Integer} tokenAmount Minimum tokens amount
   * @returns {Boolean} Success True if operation was successful
   */
  setMinAmountToLock = async ({ tokenAmount }) => {
    this.onlyOwner(); //verify that user is admin

    /* Get Decimals of Amount */
    let amountWithDecimals = Numbers.toSmartContractDecimals(
      tokenAmount,
      this.getERC20Contract().getDecimals()
    );

    return await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.setMinAmountToLock(amountWithDecimals)
    );
  };

  /**
   * @description User locks his tokens until specified end date.
   * @param {Integer} amount Tokens amount to be locked
   * @param {Date} endDate Lock tokens until this end date
   * @returns {Boolean} Success True if operation was successful
   * REQUIREMENTS:
   *	user must have approved this contract to spend the tokens "amount" he wants to lock before calling this function.
   */
  lock = async ({ address, amount, endDate }) => {
    /// 'address' is current user address

    this.whenNotPaused(); // verify that contract is not paused

    assert(
      amount > 0 &&
        amount >= (await this.minAmountToLock()) &&
        amount <= (await this.maxAmountToLock()),
      "Invalid token amount"
    );
    assert(endDate > moment(), "Invalid end date");

    // check if user can lock tokens
    let lockedAmount = await this.getLockedTokens({ address: address });
    assert(lockedAmount == 0, "User already has locked tokens"); //otherwise user already locked tokens

    /* Verify if transfer is approved for this amount */
    let isApproved = await this.getERC20Contract().isApproved({
      address: address,
      amount: amount,
      spenderAddress: this.getAddress(),
    });
    if (!isApproved) {
      throw new Error(
        "Has to Approve Token Transfer First, use the 'approve' Call"
      );
    }
    console.log("---lock.bp0");
    return await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.lock(
          Numbers.toSmartContractDecimals(
            amount,
            this.getERC20Contract().getDecimals()
          ),
          Numbers.timeToSmartContractTime(endDate)
        )
    );
  };

  /**
   * @function
   * @description User withdraws his locked tokens after specified end date
   * @return {Boolean} Success True if operation was successful
   */
  release = async ({ address }) => {
    /// 'address' is current user address

    // check if user has locked tokens and if he can unlock and withdraw them
    let { startDate, endDate, amount } = await this.getLockedTokensInfo({
      address: address,
    });
    let lockedAmount = amount;

    assert(lockedAmount > 0, "ERC20TokenLock.user has no locked tokens");
    assert(
      moment() >= endDate,
      "ERC20TokenLock.tokens release date not reached"
    );

    return await this.__sendTx(
      this.params.contract.getContract().methods.release()
    );
  };

  /**
   * @function
   * @description Approve this contract to transfer tokens of the ERC20 token contract on behalf of user
   * @return {Boolean} Success True if operation was successful
   */
  approveERC20Transfer = async () => {
    //let totalMaxAmount = await this.getERC20Contract().getTokenAmount(await this.getUserAddress());
    let totalMaxAmount = await this.getERC20Contract().totalSupply();
    return await this.getERC20Contract().approve({
      address: this.getAddress(),
      amount: Numbers.toSmartContractDecimals(
        totalMaxAmount,
        this.getERC20Contract().getDecimals()
      ),
    });
  };

  __assert = async () => {
    if (!this.getAddress()) {
      throw new Error(
        "Contract is not deployed, first deploy it and provide a contract address"
      );
    }

    /* Use ABI */
    this.params.contract.use(tokenlock, this.getAddress());

    /* Set Token Address Contract for easy access */
    if (!this.params.ERC20Contract) {
      //console.log('---ERC20TokenLock.__assert.ERC20Contract null, creating new one');
      this.params.ERC20Contract = new ERC20Contract({
        web3: this.web3,
        contractAddress: await this.erc20(),
        acc: this.acc,
      });
    }
    /* Assert Token Contract */
    await this.params.ERC20Contract.__assert();
  };

  /**
   * @description Deploy the ERC20 Token Lock Contract
   */
  deploy = async ({ callback } = {}) => {
    if (!this.getERC20Contract()) {
      throw new Error("No Token Address Provided");
    }
    let params = [this.getERC20Contract().getAddress()];

    let res = await this.__deploy(params, callback);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };

  getERC20Contract = () => this.params.ERC20Contract;
}

export default ERC20TokenLock;
