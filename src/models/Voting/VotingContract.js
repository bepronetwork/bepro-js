import { voting } from '../../interfaces';
import ERC20Contract from '../ERC20/ERC20Contract';
import IContract from '../IContract';
import Numbers from '../../utils/Numbers';

/**
 * @typedef {Object} VotingContract~Options
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection] created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 */

/**
 * Voting Contract Object
 * @class VotingContract
 * @param {VotingContract~Options} options
 */
class VotingContract extends IContract {
  constructor(params = {}) {
    super({ ...params, abi: voting });
  }

  /**
   * Get ERC20 Address of the Contract
   * @returns {Promise<Address>}
   */
  erc20() {
    return this.__sendTx(
      this.getContract().methods.erc20(),
      { call: true },
    );
  }

  /**
   * Creates a Pool
   * @param {String} params.description
   * @param {Integer} params.expirationTime
   * @param {Array | Integer} params.poolOptions
   * @return {Promise<TransactionObject>}
   */
  createPool({
    description,
    expirationTime,
    poolOptions,
  }, options) {
    return this.__sendTx(
      this.getContract()
        .methods.createPoll(
          description,
          Numbers.timeToSmartContractTime(expirationTime),
          poolOptions,
        ),
      options,
    );
  }

  /**
   * Creates a Pool
   * @param {Integer} params.poolId
   * @return {Promise<TransactionObject>}
   */
  endPool({
    poolId,
  }, options) {
    return this.__sendTx(
      this.getContract()
        .methods.endPool(
          poolId,
        ),
      options,
    );
  }

  /**
     * Cast Vote
     * @param {Integer} params.poolId Pool Id
     * @param {Integer} params.voteId Vote Position on Length
     * @return {Promise<TransactionObject>}
     */
  castVote({
    poolId,
    voteId,
  }, options) {
    return this.__sendTx(
      this.getContract()
        .methods.castVote(
          poolId,
          voteId,
        ),
      options,
    );
  }

  /**
     * Stake Voting Tokens
     * @param {Integer} params.tokens Tokens
     * @return {Promise<TransactionObject>}
     */
  stakeVotingTokens({
    tokens,
  }, options) {
    return this.__sendTx(
      this.getContract()
        .methods.stakeVotingTokens(
          Numbers.toSmartContractDecimals(
            tokens,
            this.getERC20Contract().getDecimals(),
          ),
        ),
      options,
    );
  }

  /**
   * @typedef {Object} VotingContract~Pool
   * @property {Address} creator
   * @property {Bool} status
   * @property {Integer} optionsSize
   * @property {String} description
   * @property {Array | Address} voters
   * @property {Date} expirationTime
   */

  /**
     * Get Pool Information
     * @function
     * @param {Object} params
     * @param {Integer} params.poolId
     * @return {Promise<VotingContract~Pool>}
     */
  getPoolInformation = async ({ poolId }) => {
    const res = await this.__sendTx(
      this.getContract().methods.getPoolInformation(poolId),
      { call: true },
    );

    return {
      _id: poolId,
      creator: res[0],
      status: res[1],
      optionsSize: parseInt(res[2], 10),
      descripton: res[3],
      voters: res[4],
      expirationTime: Numbers.fromSmartContractTimeToMinutes(res[5]),
    };
  };

  /**
     * Get Pool Winner
     * @function
     * @param {Object} params
     * @param {Integer} params.poolId
     * @return {Integer} Winner Id
     * @return {Integer} Winner Id Index
     */
  getPoolWinner = async ({ poolId }) => {
    const res = await this.__sendTx(
      this.getContract().methods.getPoolWinner(poolId),
      { call: true },
    );

    return {
      winnerId: parseInt(res[0], 10),
      optionId: parseInt(res[1], 10),
    };
  };

  /**
     * Get Pool Winner
     * @function
     * @param {Object} params
     * @param {Integer} params.poolId Pool Id
     * @param {Integer} params.optionIndex Option Id for Pool
     * @return {Integer} Option Id
     */
  getPollOptionById = async ({ poolId, optionIndex }) => {
    const res = await this.__sendTx(
      this.getContract().methods.getPollOptionById(poolId, optionIndex),
      { call: true },
    );

    return parseInt(res[0], 10);
  };

  /**
     * Get Pool History for Address
     * @function
     * @param {Object} params
     * @param {Address} params.address
     * @return {Array | Integer} Pool Ids
     */
  getPollHistory = async ({ address }) => {
    const res = await this.__sendTx(
      this.getContract().methods.getPollHistory(address),
      { call: true },
    );

    return {
      pools: res[0].map(r => parseInt(r, 10)),
    };
  };

  /**
     * Get Pool Info for Voter
     * @function
     * @param {Object} params
     * @param {Integer} params.poolId
     * @param {Address} params.voter
     * @return {Integer} Vote
     * @return {Integer} Weigth (Token Value)
     */
  getPollInfoForVoter = async ({ poolId, voter }) => {
    const res = await this.__sendTx(
      this.getContract().methods.getPollInfoForVoter(poolId, voter),
      { call: true },
    );

    return {
      vote: parseInt(res[0], 10),
      weigth: Numbers.toSmartContractDecimals(
        res[1],
        this.getERC20Contract().getDecimals(),
      ),
    };
  };

  /**
     * Check if a User has voted
     * @function
     * @param {Object} params
     * @param {Integer} params.poolId
     * @param {Address} params.voter
     * @return {Bool} HasVoted
     */
  userHasVoted = async ({ poolId, voter }) => {
    const res = await this.__sendTx(
      this.getContract().methods.userHasVoted(poolId, voter),
      { call: true },
    );

    return res[0];
  };

  /**
     * Get Locked Amount
     * @function
     * @param {Object} params
     * @param {Address} params.voter
     * @return {Integer} Locked Amount
     */
  getLockedAmount = async ({ voter }) => {
    const res = await this.__sendTx(
      this.getContract().methods.getLockedAmount(voter),
      { call: true },
    );

    return Numbers.toSmartContractDecimals(
      res[0],
      this.getERC20Contract().getDecimals(),
    );
  };

  /**
     * Withdraw Tokens from Voting
     * @param {Integer} params.tokens Tokens
     * @return {Promise<TransactionObject>}
     */
  withdrawTokens({
    tokens,
  }, options) {
    return this.__sendTx(
      this.getContract()
        .methods.withdrawTokens(
          Numbers.toSmartContractDecimals(
            tokens,
            this.getERC20Contract().getDecimals(),
          ),
        ),
      options,
    );
  }

  /**
   * @async
   * @function
   * @throws {Error} Contract is not deployed, first deploy it and provide a contract address
   * @void
   */
  __assert = async () => {
    if (!this.getAddress()) {
      throw new Error(
        'Contract is not deployed, first deploy it and provide a contract address',
      );
    }

    /* Use ABI */
    this.params.contract.use(voting, this.getAddress());

    /* Set Token Address Contract for easy access */
    if (!this.params.ERC20Contract) {
      this.params.ERC20Contract = new ERC20Contract({
        web3Connection: this.web3Connection,
        contractAddress: await this.erc20(),
      });
    }

    /* Assert Token Contract */
    await this.params.ERC20Contract.start();
    await this.params.ERC20Contract.__assert();
  };

  /**
   * Deploy the Staking Contract
   * @function
   * @param [Object] params
   * @param {Address} params.erc20Contract
   * @param {function():void} params.callback
   * @return {Promise<*>}
   */
  deploy = async ({ erc20Contract, callback } = {}) => {
    const params = [erc20Contract];
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

export default VotingContract;
