import { protocolMiningReward } from '../../interfaces';
// import Numbers from '../../utils/Numbers';
import IContract from '../IContract';

/**
 * @typedef {Object} ProtocolMiningReward~Options
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection]
 * created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 */

/**
 * @class ProtocolMiningReward
 * @param {ProtocolMiningReward~Options} options
 * NOTE: to encode function signature we use 'web3.eth.abi.encodeFunctionSignature'
 * For example, for encoding transfer function of ERC20 token we do:
 * web3.eth.abi.encodeFunctionSignature('transfer(address,uint256)')
 * NOTE: to encode parameters for encoded call data we use
 * web3.eth.abi.encodeParameters(typesArray, valuesArray)
 * For example, for encoding transfer function parameters of ERC20 token we do:
 * web3.eth.abi.encodeParameters(['address','uint256'], [userAddress, transferTokenAmount])
 * userAddress, transferTokenAmount are variables holding user address and tokens amount.
 * NOTE: to encode function signature together with parameters as a single encoded call data
 * we use a combination of the two above.
 * Specific details on how to encode call data can be found in the unit test file.
 */
class ProtocolMiningReward extends IContract {
  constructor(params = {}) {
    super({ abi: protocolMiningReward, ...params });
  }

  /**
   * Use a {@link protocolMiningReward} contract with the current address
   * @return {Promise<void>}
   */
  __assert = async () => {
    this.params.contract.use(protocolMiningReward, this.getAddress());
    // this.params.decimals = await this.getDecimalsAsync();
  };

  /**
   * Get Token Address
   * @returns {Address} address
   */
  getAddress() {
    return this.params.contractAddress;
  }

  /**
   * Get reward token address
   * @function
   * @returns {Promise<Address>}
   */
  rewardToken() {
    return this.getContract().methods.rewardToken().call();
  }

  /**
   * Get reward token default reward amount
   * @function
   * @returns {Promise<Integer>}
   */
  rewardAmount() {
    return this.getContract().methods.rewardAmount().call();
  }

  /**
   * Get encoded call reward token amount
   * @function
   * @param {Object} params Parameters
   * @param {string} params.callHash Encoded call hash as bytes32 string
   * @returns {Promise<Integer>} Reward token amount
   */
  callsRewardTokenAmount({ callHash }) {
    return this.getContract().methods.callsRewardTokenAmount(callHash).call();
  }

  /**
   * Get encoded function call hash
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.target Smart contract address target
   * @param {string} params.funcSelector Function selector as byte4 string
   * @returns {Promise<string>} Call hash as bytes32 string
   */
  hashOperation({ target, funcSelector }) {
    return this.getContract().methods.hashOperation(target, funcSelector).call();
  }

  /**
   * Get encoded function call hash given encoded data with function selector
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.target Smart contract address target
   * @param {string} params.callData Encoded call data with function selector and params
   * @returns {Promise<string>} Call hash as bytes32 string
   */
  hashOperationData({ target, callData }) {
    return this.getContract().methods.hashOperationData(target, callData).call();
  }

  /**
   * Get encoded function calls hashes as batch
   * @function
   * @param {Object} params Parameters
   * @param {Array<Address>} params.targets Smart contract addresses targets
   * @param {Array<string>} params.funcSelectors Function selectors as byte4 string
   * @returns {Promise<string>} Call hash as bytes32 string
   */
  hashOperationBatch({ targets, funcSelectors }) {
    return this.getContract().methods.hashOperationBatch(targets, funcSelectors).call();
  }

  /**
   * Get encoded function calls hashes as batch given encoded data with function selectors
   * @function
   * @param {Object} params Parameters
   * @param {Array<Address>} params.targets Smart contract addresses targets
   * @param {Array<string>} params.callDatas Encoded calls data with function selectors and params
   * @returns {Promise<string>} Call hash as bytes32 string
   */
  hashOperationBatchData({ targets, callDatas }) {
    return this.getContract().methods.hashOperationBatchData(targets, callDatas).call();
  }

  /**
   * Approve function call
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.target Contract address to call
   * @param {string} params.funcSelector Target contract function selector
   * @param {Integer} params.rewardTokenAmount Token reward amount to sender
   * @returns {Promise<Transaction>} Transaction
   */
  approveCall({
    target,
    funcSelector,
    rewardTokenAmount,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.approveCall(target, funcSelector, rewardTokenAmount),
      options,
    );
  }

  /**
   * Approve function call
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.target Contract address to call
   * @param {string} params.callData Target contract encoded call data with function selector and params
   * @param {Integer} params.rewardTokenAmount Token reward amount to sender
   * @returns {Promise<Transaction>} Transaction
   */
  approveCallData({
    target,
    callData,
    rewardTokenAmount,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.approveCallData(target, callData, rewardTokenAmount),
      options,
    );
  }

  /**
   * Approve function calls as batch
   * @function
   * @param {Object} params Parameters
   * @param {Array<Address>} params.targets Contract addresses to call
   * @param {Array<string>} params.funcSelectors Target contract function selectors
   * @param {Integer} params.rewardTokenAmount Token reward amount to sender
   * @returns {Promise<Transaction>} Transaction
   */
  approveBatch({
    targets,
    funcSelectors,
    rewardTokenAmount,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.approveBatch(targets, funcSelectors, rewardTokenAmount),
      options,
    );
  }

  /**
   * Approve function calls as batch
   * @function
   * @param {Object} params Parameters
   * @param {Array<Address>} params.targets Contract addresses to call
   * @param {Array<string>} params.callDatas Target contract function selectors
   * @param {Integer} params.rewardTokenAmount Token reward amount to sender
   * @returns {Promise<Transaction>} Transaction
   */
  approveBatchData({
    targets,
    callDatas,
    rewardTokenAmount,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.approveBatchData(targets, callDatas, rewardTokenAmount),
      options,
    );
  }

  /**
   * Disapprove function call
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.target Contract address to call
   * @param {string} params.funcSelector Target contract function selector
   * @returns {Promise<Transaction>} Transaction
   */
  disapproveCall({
    target,
    funcSelector,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.disapproveCall(target, funcSelector),
      options,
    );
  }

  /**
   * Disapprove function call with encoded call data
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.target Contract address to call
   * @param {string} params.callData Target contract encoded call data with function selector and params
   * @returns {Promise<Transaction>} Transaction
   */
  disapproveCallData({
    target,
    callData,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.disapproveCallData(target, callData),
      options,
    );
  }

  /**
   * Disapprove function calls as batch
   * @function
   * @param {Object} params Parameters
   * @param {Array<Address>} params.targets Contract addresses to call
   * @param {Array<string>} params.funcSelectors Target contract function selectors
   * @returns {Promise<Transaction>} Transaction
   */
  disapproveBatch({
    targets,
    funcSelectors,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.disapproveBatch(targets, funcSelectors),
      options,
    );
  }

  /**
   * Disapprove function calls as batch with encoded call datas
   * @function
   * @param {Object} params Parameters
   * @param {Array<Address>} params.targets Contract addresses to call
   * @param {Array<string>} params.callDatas Target contract encoded call datas with function selectors and params
   * @returns {Promise<Transaction>} Transaction
   */
  disapproveBatchData({
    targets,
    callDatas,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.disapproveBatchData(targets, callDatas),
      options,
    );
  }

  /**
   * Disapprove all function calls
   * @function
   * @returns {Promise<Transaction>} Transaction
   */
  disapproveAll(options) {
    return this.__sendTx(
      this.getContract().methods.disapproveAll(),
      options,
    );
  }

  /**
   * Execute call from approve function calls
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.target Contract address to call
   * @param {string} params.funcSelector Target contract function selector
   * @param {string} params.callParam Target contract function params as encoded data
   * @returns {Promise<Transaction>} Transaction
   */
  execute({
    target,
    funcSelector,
    callParam,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.execute(target, funcSelector, callParam),
      options,
    );
  }

  /**
   * Execute call from approve function calls with encoded call data
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.target Contract address to call
   * @param {string} params.callData Target contract encoded call data with function selector and params
   * @returns {Promise<Transaction>} Transaction
   */
  executeData({
    target,
    callData,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.executeData(target, callData),
      options,
    );
  }

  /**
   * Execute call from approve batch function calls
   * @function
   * @param {Object} params Parameters
   * @param {Array<Address>} params.targets Target contracts addresses
   * @param {Array<Integer>} params.values Eth values for each call
   * @param {Array<string>} params.funcSelectors Target contracts function selectors
   * @param {Array<string>} params.callParams Target contracts function params as encoded call datas
   * @returns {Promise<Transaction>} Transaction
   */
  executeBatch({
    targets,
    values,
    funcSelectors,
    callParams,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.executeBatch(targets, values, funcSelectors, callParams),
      options,
    );
  }

  /**
   * Execute call from approve batch function calls with encoded call datas
   * @function
   * @param {Object} params Parameters
   * @param {Array<Address>} params.targets Contract address to call
   * @param {Array<Integer>} params.values eth values for each call
   * @param {Array<string>} params.callDatas Target contract encoded call datas with function selectors and params
   * @returns {Promise<Transaction>} Transaction
   */
  executeBatchData({
    targets,
    values,
    callDatas,
  }, options) {
    return this.__sendTx(
      this.getContract().methods.executeBatchData(targets, values, callDatas),
      options,
    );
  }

  /**
   * Get call hash as bytes32 given an index
   * @function
   * @param {Integer} i Index of approved call
   * @returns {Promise<string>} Call hash as bytes32 string
   */
  getCallHashByIndex(i) {
    return this.getContract().methods.getCallHashByIndex(i).call();
  }

  /**
   * Get calls array length
   * @function
   * @returns {Promise<Integer>} Calls count
   */
  callsCount() {
    return this.getContract().methods.callsCount().call();
  }

  /**
   * True if call hash is approved (exists), false otherwise
   * @param {Object} params Parameters
   * @param {string} params.callHash Call hash as bytes32 string
   * @returns {Promise<Boolean>} true if call hash exists, false otherwise
   */
  callApproved({ callHash }) {
    return this.getContract().methods.callApproved(callHash).call();
  }

  /**
   * Remove call by hash, call hash must be approved (exists)
   * @param {Object} params Parameters
   * @param {string} params.callHash Call hash as bytes32 string
   * @returns {Promise<Transaction>} Transaction
   */
  removeCallHash({ callHash }, options) {
    return this.__sendTx(
      this.getContract().methods.removeCallHash(callHash),
      options,
    );
  }

  /**
   * Deploy ERC20 Token
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.rewardTokenAddress Reward token address
   * @param {Number} params.rewardTokenAmount Reward token amount
   * @param {IContract~TxOptions} options
   * @returns {Promise<Transaction>} Transaction
   */
  deploy = async ({ rewardTokenAddress, rewardTokenAmount }, options) => {
    if (!rewardTokenAddress) {
      throw new Error('Please provide a Reward erc20 token address');
    }

    if (!rewardTokenAmount) {
      throw new Error('Please provide a Reward erc20 token amount');
    }

    const params = [ rewardTokenAddress, rewardTokenAmount ];
    const res = await this.__deploy(params, options);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };
}

export default ProtocolMiningReward;
