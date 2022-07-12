import { timeLockProtocolMiningReward } from '../../interfaces';
import IContract from '../IContract';

/**
 * @typedef {Object} TimeLockProtocolMiningReward~Options
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection]
 * created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 */

/**
 * @class TimeLockProtocolMiningReward
 * @param {TimeLockProtocolMiningReward~Options} options
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
class TimeLockProtocolMiningReward extends IContract {
  constructor(params = {}) {
    super({ abi: timeLockProtocolMiningReward, ...params });
  }

  /**
   * Use a {@link timeLockProtocolMiningReward} contract with the current address
   * @return {Promise<void>}
   */
  __assert = async () => {
    this.params.contract.use(timeLockProtocolMiningReward, this.getAddress());
    // this.params.decimals = await this.getDecimalsAsync();
  };

  /**
   * Get contract address
   * @returns {Address} address
   */
  getAddress() {
    return this.params.contractAddress;
  }

  /**
   * Get reward token address
   * @function
   * @returns {Promise<Address>} Reward token address
   */
  async rewardToken() {
    return await this.getContract().methods.rewardToken().call();
  }

  /**
   * Get reward token default reward amount
   * @function
   * @returns {Promise<Integer>} Default reward token amount
   */
  async rewardAmount() {
    return await this.getContract().methods.rewardAmount().call();
  }

  /**
   * Get encoded call reward token amount
   * @function
   * @param {Object} params Parameters
   * @param {string} params.id Encoded call hash id as bytes32 string
   * @returns {Promise<Integer>} Reward token amount
   */
  async callsRewardTokenAmount({ id }) {
    return await this.getContract().methods.callsRewardTokenAmount(id).call();
  }

  /**
   * Schedule function call
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.target Target contract address
   * @param {Integer} params.value Eth value sent with the call
   * @param {string} params.data Encoded call data
   * @param {string} params.predecessor Predecessor call hash required to have finished first
   * @param {string} params.salt Salt id to identify each call
   * @param {Integer} params.delay Delay in seconds before call execution
   * @param {Integer} params.rewardTokenAmount Reward token amount for sender for executing the call
   * @param {IContract~TxOptions} options
   * @returns {Promise<Transaction>} Transaction
   */
  async schedule({
    target, value, data, predecessor, salt, delay, rewardTokenAmount,
  }, options) {
    return await this.__sendTx(
      this.getContract().methods.schedule(
        target, value, data, predecessor, salt, delay, rewardTokenAmount,
      ),
      options,
    );
  }

  /**
   * Schedule an operation containing a batch of transactions.
   * @function
   * @param {Object} params Parameters
   * @param {Array<Address>} params.targets Target contracts addresses
   * @param {Array<Integer>} params.values Eth values sent with the batch
   * @param {Array<string>} params.datas Encoded call datas
   * @param {string} params.predecessor Required call id to be finished before executing current call
   * @param {string} params.salt Salt id
   * @param {Integer} params.delay Delay in seconds before call execution
   * @param {Integer} params.rewardTokenAmount Reward token amount
   * @param {IContract~TxOptions} options
   * @returns {Promise<Transaction>} Transaction
   * Requirements:
   * - the caller must have the 'proposer' role.
   */
  async scheduleBatch({
    targets, values, datas, predecessor, salt, delay, rewardTokenAmount,
  }, options) {
    return await this.__sendTx(
      this.getContract().methods.scheduleBatch(
        targets, values, datas, predecessor, salt, delay, rewardTokenAmount,
      ),
      options,
    );
  }

  /**
   * Cancel an operation
   * @function
   * @param {Object} params Parameters
   * @param {string} params.id Call hash
   * @param {IContract~TxOptions} options
   * @returns {Promise<Transaction>} Transaction
   * Requirements:
   * - the caller must have the 'proposer' role.
   */
  async cancel({ id }, options) {
    return await this.__sendTx(
      this.getContract().methods.cancel(id),
      options,
    );
  }

  /**
   * Execute an (ready) operation containing a single transaction.
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.target Target contract address
   * @param {Integer} params.value Eth value sent with the call
   * @param {string} params.data Encoded call data
   * @param {string} params.predecessor Required call id to be finished before executing current call
   * @param {string} params.salt Salt id
   * @param {IContract~TxOptions} options
   * @returns {Promise<Transaction>} Transaction
   * Requirements:
   * - the caller must have the 'executor' role.
   */
  async execute({
    target, value, data, predecessor, salt,
  }, options) {
    return await this.__sendTx(
      this.getContract().methods.execute(target, value, data, predecessor, salt),
      options,
    );
  }

  /**
   * Execute an (ready) operation containing a batch of transactions.
   * @function
   * @param {Object} params Parameters
   * @param {Array<Address>} params.targets Target contracts addresses
   * @param {Array<Integer>} params.values Eth values sent with the batch
   * @param {Array<string>} params.datas Encoded call datas
   * @param {string} params.predecessor Required call id to be finished before executing current call
   * @param {string} params.salt Salt id
   * @param {IContract~TxOptions} options
   * @returns {Promise<Transaction>} Transaction
   * Requirements:
   * - the caller must have the 'executor' role.
   */
  async executeBatch({
    targets, values, datas, predecessor, salt,
  }, options) {
    return await this.__sendTx(
      this.getContract().methods.executeBatch(
        targets, values, datas, predecessor, salt,
      ),
      options,
    );
  }

  /**
   * Changes the minimum timelock duration for future operations.
   * @function
   * @param {Object} params Parameters
   * @param {Integer} params.newDelay New delay in seconds
   * @param {IContract~TxOptions} options
   * @returns {Promise<Transaction>} Transaction
   * Requirements:
   * - the caller must be the timelock itself. This can only be achieved by scheduling and later executing
   * an operation where the timelock is the target and the data is the ABI-encoded call to this function.
   */
  async updateDelay({ newDelay }, options) {
    return await this.__sendTx(
      this.getContract().methods.updateDelay(newDelay),
      options,
    );
  }

  /**
   * Returns whether an id correspond to a registered operation. This
   * includes both Pending, Ready and Done operations.
   * @function
   * @param {Object} params Parameters
   * @param {string} params.id Call hash as id
   * @returns {Promise<Boolean>}
   */
  async isOperation({ id }) {
    return await this.getContract().methods.isOperation(id).call();
  }

  /**
   * Returns whether an operation is pending or not.
   * @function
   * @param {Object} params Parameters
   * @param {string} params.id Call hash as id
   * @returns {Promise<Boolean>}
   */
  async isOperationPending({ id }) {
    return await this.getContract().methods.isOperationPending(id).call();
  }

  /**
   * Returns whether an operation is ready or not.
   * @function
   * @param {Object} params Parameters
   * @param {string} params.id Call hash as id
   * @returns {Promise<Boolean>}
   */
  async isOperationReady({ id }) {
    return await this.getContract().methods.isOperationReady(id).call();
  }

  /**
   * Returns whether an operation is done or not.
   * @function
   * @param {Object} params Parameters
   * @param {string} params.id Call hash as id
   * @returns {Promise<Boolean>}
   */
  async isOperationDone({ id }) {
    return await this.getContract().methods.isOperationDone(id).call();
  }

  /**
   * Returns the timestamp at with an operation becomes ready (0 for
   * unset operations, 1 for done operations).
   * @function
   * @param {Object} params Parameters
   * @param {string} params.id Call hash as id
   * @returns {Promise<Integer>}
   */
  async getTimestamp({ id }) {
    return await this.getContract().methods.getTimestamp(id).call();
  }

  /**
   * Returns the minimum delay for an operation to become valid.
   * This value can be changed by executing an operation that calls `updateDelay`.
   * @functon
   * @returns {Promise<Integer>}
   */
  async getMinDelay() {
    return await this.getContract().methods.getMinDelay().call();
  }

  /**
   * Returns the identifier of an operation containing a single transaction.
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.target Target contract address
   * @param {Integer} params.value Eth value sent with the call
   * @param {string} params.data Encoded call data
   * @param {string} params.predecessor Required call id to be finished before executing current call
   * @param {string} params.salt Salt id
   * @returns {Promise<string>} bytes32 hash
   */
  async hashOperation({
    target, value, data, predecessor, salt,
  }) {
    return await this.getContract().methods.hashOperation(
      target, value, data, predecessor, salt,
    ).call();
  }

  /**
   * Returns the identifier of an operation containing a batch of transactions.
   * @function
   * @param {Object} params Parameters
   * @param {Array<Address>} params.targets Target contracts addresses
   * @param {Array<Integer>} params.values Eth values sent with the batch
   * @param {Array<string>} params.datas Encoded call datas
   * @param {string} params.predecessor Required call id to be finished before executing current call
   * @param {string} params.salt Salt id
   * @returns {Promise<string>} bytes32 hash
   */
  async hashOperationBatch({
    targets, values, datas, predecessor, salt,
  }) {
    return await this.getContract().methods.hashOperationBatch(
      targets, values, datas, predecessor, salt,
    ).call();
  }

  /**
   * Deploy contract
   * @function
   * @param {Object} params Parameters
   * @param {Integer} params.minDelay Minimum delay in seconds to schedule call
   * @param {Array<Address>} params.proposers Array of proposers addresses
   * @param {Array<Address>} params.executors Array of executors addresses
   * @param {Address} params.rewardTokenAddress Reward token address
   * @param {Number} params.rewardTokenAmount Reward token amount
   * @param {IContract~TxOptions} options
   * @returns {Promise<Transaction>} Transaction
   */
  deploy = async ({
    minDelay, proposers, executors, rewardTokenAddress, rewardTokenAmount,
  }, options) => {
    if (!rewardTokenAddress) {
      throw new Error('Please provide a Reward erc20 token address');
    }

    if (!rewardTokenAmount) {
      throw new Error('Please provide a Reward erc20 token amount');
    }

    const params = [ minDelay, proposers, executors, rewardTokenAddress, rewardTokenAmount ];
    const res = await this.__deploy(params, options);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };
}

export default TimeLockProtocolMiningReward;
