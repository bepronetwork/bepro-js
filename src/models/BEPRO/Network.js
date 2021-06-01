/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line no-unused-vars
import { network } from '../../interfaces';
import Numbers from '../../utils/Numbers';
import IContract from '../IContract';
import ERC20Contract from '../ERC20/ERC20Contract';

/**
 * @typedef {Object} TokensNetwork~Options
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection] created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 * @property {string} [tokenAddress]
 * */

/**
 * TokensNetwork Object
 * @class TokensNetwork
 * @param {TokensNetwork~Options} options
 */
class Network extends IContract {
  /**
   * @typedef {Object} TokensNetwork~Issue
   * @property {boolean} finalized: boolean
   * @property {boolean} canceled
   * @property {number} votesForApprove
   * @property {number} TokensStaked
   * @property {Address} issueGenerator
   * @property {number} mergeProposalsAmount
   * @property {number} _id
   * @property {Date} creationDate
   */

  /**
   * @typedef {Object} TokensNetwork~MergedIssue
   * @property {Address[]} prAddresses
   * @property {number[]} prAmounts
   * @property {number} votes
   * @property {number} disputes
   * @property {Address} proposalAddress
   * @property {number} _id
   * @param params
   */

  constructor(params) {
    super({ abi: network, ...params });
  }

  /**
   * Asserts using the current contract
   * followed by setting a new {@link ERC20Contract} to this instances public params, asserting it.
   * @async
   * @function
   * @void
   * @throws {Error} Contract is not deployed, first deploy it and provide a contract address
   */
  __assert = async () => {
    if (!this.getAddress()) {
      throw new Error(
        'Contract is not deployed, first deploy it and provide a contract address',
      );
    }

    // Use ABI
    this.params.contract.use(network, this.getAddress());

    const transactionalAddress = await this.getTransactionTokenAddress();
    const settlerAddresss = await this.getSettlerTokenAddress();
    console.log("here")

    // Set Token Address Contract for easy access
    this.params.transactionalToken = new ERC20Contract({
      web3Connection: this.web3Connection,
      contractAddress: transactionalAddress,
    });

    // Set Token Address Contract for easy access
    this.params.settlerToken = new ERC20Contract({
      web3Connection: this.web3Connection,
      contractAddress: settlerAddresss,
    });
    // Assert Token Contract
    await this.params.transactionalToken.__assert();
    // Assert Token Contract
    await this.params.settlerToken.__assert();
  };

  /**
   * Get Open Issues Available
   * @param {Address} address
   * @returns {number[]}
   */
  async getIssuesByAddress(address) {
    const res = await this.params.contract
      .getContract()
      .methods.getIssuesByAddress(address)
      .call();

    return res.map(r => parseInt(r, 10));
  }

  /**
   * Get Amount of Issues Opened in the network
   * @returns {Promise<number>}
   */
  async getAmountofIssuesOpened() {
    return parseInt(
      await this.params.contract
        .getContract()
        .methods.incrementIssueID()
        .call(),
      10,
    );
  }

  /**
   * Get Amount of Issues Closed in the network
   * @returns {Promise<number>}
   */
  async getAmountofIssuesClosed() {
    return parseInt(
      await this.params.contract.getContract().methods.closedIdsCount().call(),
      10,
    );
  }

  /**
   * Get Amount of percentage Needed for Approve
   * @returns {Promise<number>}
   */
  async percentageNeededForApprove() {
    return parseInt(
      await this.params.contract
        .getContract()
        .methods.percentageNeededForApprove()
        .call(),
      10,
    );
  }

  /**
   * @description Get Amount of percentage Needed for Dispute
   * @returns {Promise<number>}
   */
  async percentageNeededForDispute() {
    return parseInt(
      await this.params.contract
        .getContract()
        .methods.percentageNeededForDispute()
        .call(),
      10,
    );
  }


  /**
   * Get Amount of percentage Needed for Merge
   * @returns {Promise<number>}
   */
  async percentageNeededForMerge() {
    return parseInt(
      await this.params.contract
        .getContract()
        .methods.percentageNeededForMerge()
        .call(),
      10,
    );
  }

  /**
   * Get Total Amount of Tokens Staked for Tickets in the network
   * @returns {Promise<number>}
   */
  async getTokensStaked() {
    return Numbers.fromDecimals(
      await this.params.contract.getContract().methods.totalStaked().call(),
      18,
    );
  }

  /**
   * GetTotal amount of time where an issue has to be approved
   * @returns {Promise<Date>}
   */
  async timeOpenForIssueApprove() {
    return Numbers.fromSmartContractTimeToMinutes(
      await this.params.contract
        .getContract()
        .methods.timeOpenForIssueApprove()
        .call(),
    );
  }

  /**
   * Get Total Amount of Tokens Staked for Tickets in the network
   * @returns {Promise<number>}
   */
  async TokensVotesStaked() {
    return Numbers.fromDecimals(
      await this.params.contract
        .getContract()
        .methods.TokensVotesStaked()
        .call(),
      18,
    );
  }

  /**
   * Get Transactional Token Address (Address of token used to pay for bounties)
   * @returns {Promise<number>}
   */
  async getTransactionTokenAddress() {
    return await this.params.contract
      .getContract()
      .methods.transactionToken()
      .call();
  }

  /**
   * Get Settle Token Address (Address of token to decide use of bounties)
   * @returns {Promise<number>}
   */
  async getSettlerTokenAddress() {
    return await this.params.contract
      .getContract()
      .methods.settlerToken()
      .call();
  }

  /**
   * Get Total Amount of Tokens Staked for Council in the network
   * @returns {Promise<number>}
   */
  async COUNCIL_AMOUNT() {
    return Numbers.fromDecimals(
      await this.params.contract
        .getContract()
        .methods.COUNCIL_AMOUNT()
        .call(),
      18,
    );
  }

  /**
   * Get Total Amount of Tokens Staked for Operator in the network
   * @returns {Promise<number>}
   */
  async OPERATOR_AMOUNT() {
    return Numbers.fromDecimals(
      await this.params.contract
        .getContract()
        .methods.OPERATOR_AMOUNT()
        .call(),
      18,
    );
  }

  /**
   * Get Total Amount of Tokens Staked for Developer in the network
   * @returns {Promise<number>}
   */
  async DEVELOPER_AMOUNT() {
    return Numbers.fromDecimals(
      await this.params.contract
        .getContract()
        .methods.DEVELOPER_AMOUNT()
        .call(),
      18,
    );
  }

  /**
   * Is issue Approved
   * @param {Object} params
   * @param {number} params.issueId
   * @returns {Promise<boolean>}
   */
  async isIssueApproved({ issueId }) {
    return await this.params.contract
      .getContract()
      .methods.isIssueApproved(issueId)
      .call();
  }

  /**
   * Is issue available to be approved (time wise)
   * @param {Object} params
   * @param {number} params.issueId
   * @returns {Promise<boolean>}
   */
  async isIssueApprovable({ issueId }) {
    return await this.params.contract
      .getContract()
      .methods.isIssueApprovable(issueId)
      .call();
  }

  /**
   * Can this issue be merged
   * @param {Object} params
   * @param {number} params.issueId
   * @param {number} params.mergeId
   * @returns {Promise<boolean>}
   */
  async isIssueMergeable({ issueId, mergeId }) {
    return await this.params.contract
      .getContract()
      .methods.isIssueMergeable(issueId, mergeId)
      .call();
  }

  /**
   * Can this issue be merged
   * @param {Object} params
   * @param {number} params.issueId
   * @param {number} params.mergeId
   * @returns {Promise<boolean>}
   */
  async isMergeTheOneWithMoreVotes({ issueId, mergeId }) {
    return await this.params.contract
      .getContract()
      .methods.isMergeTheOneWithMoreVotes(issueId, mergeId)
      .call();
  }

  /**
   * Get Issue Id Info
   * @param {Object} params
   * @param {Address} params.address
   * @returns {Promise<number>} Number of votes
   */
  async getVotesByAddress({ address }) {
    const r = await this.params.contract
      .getContract()
      .methods.getVotesByAddress(address)
      .call();
    return Numbers.fromDecimals(r, 18);
  }

  /**
   * Get Issue Id Info
   * @param {Object} params
   * @param {number} params.issue_id
   * @return {Promise<TokensNetwork~Issue>}
   */
  async getIssueById({ issue_id }) {
    const r = await this.__sendTx(
      this.params.contract.getContract().methods.getIssueById(issue_id),
      true,
    );

    return {
      _id: Numbers.fromHex(r[0]),
      tokensStaked: Numbers.fromDecimals(r[1], 18),
      creationDate: Numbers.fromSmartContractTimeToMinutes(r[2]),
      issueGenerator: r[3],
      votesForApprove: Numbers.fromDecimals(r[4], 18),
      mergeProposalsAmount: parseInt(r[5], 10),
      finalized: r[6],
      canceled: r[7],
    };
  }


  /**
   * Get votes, address and amounts for issue
   * @param {Object} params
   * @param {number} params.issue_id
   * @param {number} params.merge_id
   * @return {Promise<TokensNetwork~MergedIssue>}
   */
  async getMergeById({ issue_id, merge_id }) {
    const r = await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.getMergeById(issue_id, merge_id),
      true,
    );

    return {
      _id: Numbers.fromHex(r[0]),
      votes: Numbers.fromDecimals(r[1], 18),
      disputes: Numbers.fromDecimals(r[2], 18),
      prAddresses: r[3],
      prAmounts: r[4] ? r[4].map(a => Numbers.fromDecimals(a, 18)) : 0,
      proposalAddress: r[5],
    };
  }

  /**
   * Approve ERC20 Allowance
   * @function
   * @return {Promise<number>}
   */
  approveSettlerERC20Token = async () => {
    const totalMaxAmount = await this.getSettlerTokenContract().totalSupply();
    return await this.getSettlerTokenContract().approve({
      address: this.getAddress(),
      amount: totalMaxAmount,
    });
  };

   /**
   * Approve ERC20 Allowance
   * @function
   * @return {Promise<number>}
   */
  approveTransactionalERC20Token = async () => {
    const totalMaxAmount = await this.getTransactionTokenContract().totalSupply();
    return await this.getTransactionTokenContract().approve({
      address: this.getAddress(),
      amount: totalMaxAmount,
    });
  };

  /**
   * Verify if Approved
   * @function
   * @param {Object} params
   * @param {number} params.amount
   * @param {Address} params.address
   * @return {Promise<number>}
   */
  isApprovedSettlerToken = async ({ amount, address }) => await this.getSettlerTokenContract().isApproved({
    address,
    amount,
    spenderAddress: this.getAddress(),
  });

  /**
   * Verify if Approved
   * @function
   * @param {Object} params
   * @param {number} params.amount
   * @param {Address} params.address
   * @return {Promise<number>}
   */
   isApprovedTransactionalToken = async ({ amount, address }) => await this.getTransactionTokenContract().isApproved({
    address,
    amount,
    spenderAddress: this.getAddress(),
  });

  /**
   * lock tokens for oracles
   * @param {Object} params
   * @params params.tokenAmount {number}
   * @throws {Error} Tokens Amount has to be higher than 0
   * @throws {Error} Tokens not approve for tx, first use 'approveERC20'
   * @return {Promise<TransactionObject>}
   */
  async lock({ tokenAmount }) {
    if (tokenAmount <= 0) {
      throw new Error('Token Amount has to be higher than 0');
    }


    return await this.__sendTx(
      this.params.contract.getContract().methods.lock(tokenAmount),
    );
  }

  /**
   * Unlock Tokens for oracles
   * @param {Object} params
   * @params params.tokenAmount {number}
   * @params params.from {address}
   * @throws {Error} Tokens Amount has to be higher than 0
   * @return {Promise<TransactionObject>}
   */
  async unlock({ tokenAmount, from }) {
    if (tokenAmount <= 0) {
      throw new Error('Tokens Amount has to be higher than 0');
    }

    return await this.__sendTx(
      this.params.contract.getContract().methods.unlock(tokenAmount, from),
    );
  }

  /**
   * Delegated Oracles to others
   * @param {Object} params
   * @param {number} params.tokenAmount
   * @param {Address} params.delegatedTo
   * @return {Promise<TransactionObject>}
   */
  async delegateOracles({ tokenAmount, delegatedTo }) {
    if (tokenAmount <= 0) {
      throw new Error('Tokens Amount has to be higher than 0');
    }

    return await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.unlock(tokenAmount, delegatedTo),
    );
  }

  /**
   * open Issue
   * @param {Object} params
   * @param {number} params.tokenAmount
   * @param {Address} params.address
   * @throws {Error} Tokens Amount has to be higher than 0
   * @throws {Error} Tokens not approve for tx, first use 'approveERC20'
   * @return {Promise<TransactionObject>}
   */
  async openIssue({ tokenAmount, cid }) {
    if (tokenAmount < 0) {
      throw new Error('Tokens Amount has to be higher than 0');
    }

    return await this.__sendTx(
      this.params.contract.getContract().methods.openIssue(cid, tokenAmount),
    );
  }

  /**
   * open Issue
   * @param {Object} params
   * @param {number} params.issueId
   * @return {Promise<TransactionObject>}
   */
  async approveIssue({ issueId }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.approveIssue(issueId),
    );
  }

  /**
   * redeem Issue
   * @param {Object} params
   * @param {number} params.issueId
   * @return {Promise<TransactionObject>}
   */
  async redeemIssue({ issueId }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.redeemIssue(issueId),
    );
  }

  /**
   * open Issue
   * @param {Object} params
   * @param {number} params.issueId
   * @param {number} params.mergeId
   * @return {Promise<TransactionObject>}
   */
  async approveMerge({ issueId, mergeId }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.approveMerge(issueId, mergeId),
    );
  }

  /**
   * open Issue
   * @param {Object} params
   * @param {number} params.issueID
   * @param {number} params.tokenAmount
   * @param {address} params.address
   * @return {Promise<TransactionObject>}
   */
  async updateIssue({ issueID, tokenAmount }) {
    if (tokenAmount < 0) {
      throw new Error('Tokens Amount has to be higher than 0');
    }


    return await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.updateIssue(issueID, tokenAmount),
    );
  }

  /**
   * Propose Merge of Issue
   * @param {Object} params
   * @param {number} params.issueID
   * @param {Address[]} params.prAddresses
   * @param {number[]} params.prAmounts
   * @return {Promise<TransactionObject>}
   */
  async proposeIssueMerge({ issueID, prAddresses, prAmounts }) {
    if (prAddresses.length !== prAmounts.length) {
      throw new Error('prAddresses dont match prAmounts size');
    }
    return await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.proposeIssueMerge(issueID, prAddresses, prAmounts),
    );
  }

  /**
   * close Issue
   * @param {Object} params
   * @param {number} params.issueID
   * @param {number} params.mergeID
   * @return {Promise<TransactionObject>}
   */
  async closeIssue({ issueID, mergeID }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.closeIssue(issueID, mergeID),
    );
  }

  /**
   * Deploys current contract and awaits for {@link TokensNetwork#__assert}
   * @function
   * @param {Object} params
   * @param {string} params.tokenAddress
   * @param {function():void} params.callback
   * @return {Promise<*|undefined>}
   */
  deploy = async ({
    settlerTokenAddress, transactionTokenAddress, governanceAddress, callback,
  }) => {
    const params = [settlerTokenAddress, transactionTokenAddress, governanceAddress];
    const res = await this.__deploy(params, callback);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };

  /**
   * @function
   * @return ERC20Contract|null
   */
  getSettlerTokenContract = () => this.params.settlerToken;


  /**
   * @function
   * @return ERC20Contract|null
   */
  getTransactionTokenContract = () => this.params.transactionalToken;
}

export default Network;
