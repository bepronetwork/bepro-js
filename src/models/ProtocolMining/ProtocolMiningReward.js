import { protocolMiningReward } from '../../interfaces';
import Numbers from '../../utils/Numbers';
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
   * @returns {Address}
   */
  async rewardToken() {
    return await this.getWeb3Contract().methods.rewardToken().call();
  }

  /**
   * Get reward token default reward amount
   * @function
   * @returns {Integer}
   */
  async rewardAmount() {
    return await this.getWeb3Contract().methods.rewardAmount().call();
  }

  /**
   * Get encoded call reward token amount
   * @function
   * @param {Object} params Parameters
   * @param {string} params.callHash Encoded call hash as bytes32 string
   * @returns {Promise<Integer>} Reward token amount
   */
  async callsRewardTokenAmount({ callHash }) {
    return await this.getWeb3Contract().methods.callsRewardTokenAmount(callHash).call();
  }

  /**
   * Get encoded function call hash
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.target Smart contract address target
   * @param {string} params.funcSelector Function selector as byte4 string
   * @returns {Promise<string>} Call hash as bytes32 string
   */
  async hashOperation({ target, funcSelector }) {
    return await this.getWeb3Contract().methods.hashOperation(target, funcSelector).call();
  }

  /**
   * Get encoded function call hash given encoded data with function selector
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.target Smart contract address target
   * @param {string} params.callData Encoded call data with function selector and params
   * @returns {Promise<string>} Call hash as bytes32 string
   */
  async hashOperationData({ target, callData }) {
    return await this.getWeb3Contract().methods.hashOperationData(target, callData).call();
  }

  /**
   * Get encoded function calls hashes as batch
   * @function
   * @param {Object} params Parameters
   * @param {Array<Address>} params.targets Smart contract addresses targets
   * @param {Array<string>} params.funcSelectors Function selectors as byte4 string
   * @returns {Promise<string>} Call hash as bytes32 string
   */
  async hashOperationBatch({ targets, funcSelectors }) {
    return await this.getWeb3Contract().methods.hashOperationBatch(targets, funcSelectors).call();
  }

  /**
   * Get encoded function calls hashes as batch given encoded data with function selectors
   * @function
   * @param {Object} params Parameters
   * @param {Array<Address>} params.targets Smart contract addresses targets
   * @param {Array<string>} params.callDatas Encoded calls data with function selectors and params
   * @returns {Promise<string>} Call hash as bytes32 string
   */
  async hashOperationBatchData({ targets, callDatas }) {
    return await this.getWeb3Contract().methods.hashOperationBatchData(targets, callDatas).call();
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
  async approveCall({
    target,
    funcSelector,
    rewardTokenAmount,
  }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.approveCall(
        target, funcSelector, rewardTokenAmount,
      ),
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
  async approveCallData({
    target,
    callData,
    rewardTokenAmount,
  }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.approveCallData(
        target, callData, rewardTokenAmount,
      ),
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
  async approveBatch({
    targets,
    funcSelectors,
    rewardTokenAmount,
  }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.approveBatch(
        targets, funcSelectors, rewardTokenAmount,
      ),
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
  async approveBatchData({
    targets,
    callDatas,
    rewardTokenAmount,
  }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.approveBatchData(
        targets, callDatas, rewardTokenAmount,
      ),
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
  async disapproveCall({
    target,
    funcSelector,
  }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.disapproveCall(
        target, funcSelector,
      ),
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
  async disapproveCallData({
    target,
    callData,
  }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.disapproveCallData(
        target, callData,
      ),
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
  async disapproveBatch({
    targets,
    funcSelectors,
  }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.disapproveBatch(
        targets, funcSelectors,
      ),
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
  async disapproveBatchData({
    targets,
    callDatas,
  }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.disapproveBatchData(
        targets, callDatas,
      ),
      options,
    );
  }

  /**
   * Disapprove all function calls
   * @function
   * @returns {Promise<Transaction>} Transaction
   */
  async disapproveAll(options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.disapproveAll(),
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
  async execute({
    target,
    funcSelector,
    callParam,
  }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.execute(
        target, funcSelector, callParam,
      ),
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
  async executeData({
    target,
    callData,
  }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.executeData(
        target, callData,
      ),
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
  async executeBatch({
    targets,
    values,
    funcSelectors,
    callParams,
  }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.executeBatch(
        targets, values, funcSelectors, callParams,
      ),
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
  async executeBatchData({
    targets,
    values,
    callDatas,
  }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.executeBatchData(
        targets, values, callDatas,
      ),
      options,
    );
  }

  /**
   * Get call hash as bytes32 given an index
   * @function
   * @param {Integer} i Index of approved call
   * @returns {Promise<string>} Call hash as bytes32 string
   */
  async getCallHashByIndex(i) {
    return await this.getWeb3Contract().methods.getCallHashByIndex(i).call();
  }

  /**
   * Get calls array length
   * @function
   * @returns {Promise<Integer>} Calls count
   */
  async callsCount() {
    return await this.getWeb3Contract().methods.callsCount().call();
  }

  /**
   * True if call hash is approved (exists), false otherwise
   * @param {Object} params Parameters
   * @param {string} params.callHash Call hash as bytes32 string
   * @returns {Promise<Boolean>} true if call hash exists, false otherwise
   */
  async callApproved({ callHash }) {
    return await this.getWeb3Contract().methods.callApproved(callHash).call();
  }

  /**
   * Remove call by hash, call hash must be approved (exists)
   * @param {Object} params Parameters
   * @param {string} params.callHash Call hash as bytes32 string
   * @returns {Promise<Transaction>} Transaction
   */
  async removeCallHash({ callHash }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.removeCallHash(callHash),
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

    const params = [rewardTokenAddress, rewardTokenAmount];
    const res = await this.__deploy(params, options);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };
}

export default ProtocolMiningReward;
