/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line no-unused-vars
import { network } from '../../interfaces';
import Numbers from '../../utils/Numbers';
import IContract from '../IContract';
import ERC20Contract from '../ERC20/ERC20Contract';

/**
 * @typedef {Object} Network~Options
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection] created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 */

/**
 * Network Object
 * @class Network
 * @param {Network~Options} options
 */

class Network extends IContract {
  constructor(params) {
    super({ abi: network, ...params });
  }

  /**
   * Asserts the 2 {@link ERC20Contract} on the current address
   * @function
   * @return {Promise<void>}
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
    await this.params.transactionalToken.start();
    await this.params.transactionalToken.__assert();
    // Assert Token Contract
    await this.params.settlerToken.start();
    await this.params.settlerToken.__assert();
  };

  /**
   * Get Open Issues Available
   * @param {Address} address
   * @returns {number[]}
   */
  async getIssuesByAddress(address) {
    const res = await this.getContract()
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
      await this.getContract().methods.incrementIssueID().call(),
      10,
    );
  }

  /**
   * Get Amount of Issues Closed in the network
   * @returns {Promise<number>}
   */
  async getAmountofIssuesClosed() {
    return parseInt(
      await this.getContract().methods.closedIdsCount().call(),
      10,
    );
  }

  /**
   * Get Amount of Disputers (people who locked BEPRO) in the network
   * @returns {Promise<number>}
   */
  async getAmountOfDisputers() {
    return parseInt(
      await this.getContract().methods.oraclersArray().call(),
      10,
    );
  }

  /**
   * Get Amount of Needed for Approve
   * @returns {Promise<number>}
   */
  async percentageNeededForApprove() {
    return parseInt(
      await this.getContract()
        .methods.percentageNeededForApprove()
        .call(),
      10,
    );
  }

  /**
   * @description Get Amount of % Needed for Dispute
   * @returns {Promise<number>}
   */
  async percentageNeededForDispute() {
    return parseInt(
      await this.getContract()
        .methods.percentageNeededForDispute()
        .call(),
      10,
    );
  }

  /**
   * @description Get Amount of Merge Fee Share
   * @returns {Promise<number>}
   */
  async mergeCreatorFeeShare() {
    return parseInt(
      await this.getContract()
        .methods.mergeCreatorFeeShare()
        .call(),
      10,
    );
  }

  /**
   * @description Get Time of disputableTime
   * @returns {Promise<Date>}
   */
  async disputableTime() {
    return Numbers.fromSmartContractTimeToMinutes(
      await this.getContract()
        .methods.disputableTime()
        .call(),
      10,
    );
  }

  /**
   * @description Get Time of redeemTime
   * @returns {Promise<Date>}
   */
  async redeemTime() {
    return Numbers.redeemTime(
      await this.getContract()
        .methods.redeemTime()
        .call(),
      10,
    );
  }

  /**
   * Get Amount of Needed for Merge
   * @returns {Promise<number>}
   */
  async percentageNeededForMerge() {
    return parseInt(
      await this.getContract()
        .methods.percentageNeededForMerge()
        .call(),
      10,
    );
  }

  /**
   * Get Total Amount of Tokens Staked for Bounties in the Network
   * @returns {Promise<number>}
   */
  async getTokensStaked() {
    return Numbers.fromDecimals(
      await this.getContract().methods.totalStaked().call(),
      18,
    );
  }

  /**
   * Get Total Amount of BEPRO Staked for Oracles
   * @returns {Promise<number>}
   */
  async getBEPROStaked() {
    return Numbers.fromDecimals(
      await this.getContract().methods.oraclesStaked().call(),
      18,
    );
  }

  async oraclesStaked() {
    return Numbers.fromDecimalsToBN(
      await this.getContract().methods.oraclesStaked().call(),
      18,
    );
  }

  /**
   * Get Total Amount of Tokens Staked in the network
   * @returns {Promise<number>}
   */
  async votesStaked() {
    return Numbers.fromDecimals(
      await this.getContract()
        .methods.votesStaked()
        .call(),
      18,
    );
  }

  /**
   * Get Transaction Token Address
   * @returns {Promise<address>}
   */
  getTransactionTokenAddress() {
    return this.getContract()
      .methods.transactionToken()
      .call();
  }

  /**
   * Verify if Address is Council
   * @param {Object} params
   * @param {number} params.address
   * @returns {Promise<address>}
   */
  async isCouncil({ address }) {
    return await this.getOraclesByAddress({ address }) >= await this.COUNCIL_AMOUNT();
  }

  /**
   * Get Settler Token Address
   * @returns {Promise<address>}
   */
  getSettlerTokenAddress() {
    return this.getContract()
      .methods.settlerToken()
      .call();
  }

  /**
   * Get Amount Needed for Council
   * @returns {Promise<Integer>}
   */
  async COUNCIL_AMOUNT() {
    return Numbers.fromDecimals(
      await this.getContract()
        .methods.COUNCIL_AMOUNT()
        .call(),
      18,
    );
  }

  /**
   * Get Amount Needed for Council
   * @returns {Promise<Integer>}
   */

  /**
   * Change amount needed for Council
   * @param {Object} params
   * @param {number} params.value
   * @return {Promise<TransactionObject>}
   */
  changeCouncilAmount(params, options) {
    // Backwards compatibility
    const value = typeof params === 'object' ? params.value : params;

    return this.__sendTx(
      this.getContract().methods.changeCOUNCIL_AMOUNT(
        Numbers.toSmartContractDecimals(value, this.getSettlerTokenContract().getDecimals()),
      ),
      options,
    );
  }

  /**
   * Verify if Issue is still in Draft Mode (Available to use the redeemIssue Action)
   * @param {Object} params
   * @param {number} params.issueId
   * @returns {Promise<boolean>}
   */
  isIssueInDraft({ issueId }) {
    return this.getContract()
      .methods.isIssueInDraft(issueId)
      .call();
  }

  /**
   * Verify if Merge is disputed (i.e. was rejected by the network holders)
   * @param {Object} params
   * @param {number} params.issueId
   * @param {number} params.mergeId
   * @returns {Promise<boolean>}
   */
  isMergeDisputed({ issueId, mergeId }) {
    return this.getContract()
      .methods.isMergeDisputed(issueId, mergeId)
      .call();
  }

  /**
   * Get Issue Id Info
   * @param {Object} params
   * @param {Address} params.address
   * @returns {Promise<number>} Number of votes
   */
  async getOraclesByAddress({ address }) {
    const r = await this.getContract()
      .methods.getOraclesByAddress(address)
      .call();
    return Numbers.fromDecimals(r, 18);
  }

  /**
   * Get Oralces By Address
   * @param {Object} params
   * @param {Address} params.address
   * @returns {Integer} oraclesDelegatedByOthers
   * @returns {Array | Integer} amounts
   * @returns {Array | Address} addresses
   * @returns {Integer} tokensLocked
   */
  async getOraclesSummary({ address }) {
    const r = await this.getContract()
      .methods.getOraclesSummary(address)
      .call();

    return {
      oraclesDelegatedByOthers: Numbers.fromDecimals(r[0], 18),
      amounts: r[1] ? r[1].map(a => Numbers.fromDecimals(a, 18)) : [],
      addresses: r[2] ? r[2].map(a => a) : [],
      tokensLocked: Numbers.fromDecimals(r[3], 18),
    };
  }

  /**
   * Get Issue By Id
   * @param {Object} params
   * @param {String} params.issueCID
   * @returns {Promise<TokensNetwork~Issue>}
   */
  async getIssueByCID({ issueCID }) {
    const r = await this.__sendTx(
      this.getContract().methods.getIssueByCID(issueCID),
      { call: true },
    );

    return {
      _id: Numbers.fromHex(r[0]),
      cid: r[1],
      creationDate: Numbers.fromSmartContractTimeToMinutes(r[2]),
      tokensStaked: Numbers.fromDecimals(r[3], 18),
      issueGenerator: r[4],
      mergeProposalsAmount: parseInt(r[5], 10),
      finalized: r[6],
      canceled: r[7],
      recognizedAsFinished: r[8],
    };
  }

  /**
   * Get Issue By Id
   * @param {Object} params
   * @param {Integer} params.issueId
   * @returns {Promise<TokensNetwork~Issue>}
   */
  async getIssueById({ issueId }) {
    const r = await this.__sendTx(
      this.getContract().methods.getIssueById(issueId),
      { call: true },
    );

    return {
      _id: Numbers.fromHex(r[0]),
      cid: r[1],
      creationDate: Numbers.fromSmartContractTimeToMinutes(r[2]),
      tokensStaked: Numbers.fromDecimals(r[3], 18),
      issueGenerator: r[4],
      mergeProposalsAmount: parseInt(r[5], 10),
      finalized: r[6],
      canceled: r[7],
      recognizedAsFinished: r[8],
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
      this.getContract()
        .methods.getMergeById(issue_id, merge_id),
      { call: true },
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
    return this.getSettlerTokenContract().approve({
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
    return this.getTransactionTokenContract().approve({
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
  isApprovedSettlerToken = ({ amount, address }) => this.getSettlerTokenContract().isApproved({
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
  isApprovedTransactionalToken = ({ amount, address }) => this.getTransactionTokenContract().isApproved({
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
  lock({ tokenAmount }, options) {
    if (tokenAmount <= 0) {
      throw new Error('Token Amount has to be higher than 0');
    }

    return this.__sendTx(
      this.getContract().methods.lock(
        Numbers.toSmartContractDecimals(tokenAmount, this.getSettlerTokenContract().getDecimals()),
      ),
      options,
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
  unlock({ tokenAmount, from }, options) {
    if (tokenAmount <= 0) {
      throw new Error('Tokens Amount has to be higher than 0');
    }

    return this.__sendTx(
      this.getContract().methods.unlock(
        Numbers.toSmartContractDecimals(tokenAmount, this.getSettlerTokenContract().getDecimals()),
        from,
      ),
      options,
    );
  }

  /**
   * Delegated Oracles to others
   * @param {Object} params
   * @param {number} params.tokenAmount
   * @param {Address} params.delegatedTo
   * @return {Promise<TransactionObject>}
   */
  delegateOracles({ tokenAmount, delegatedTo }, options) {
    if (tokenAmount <= 0) {
      throw new Error('Tokens Amount has to be higher than 0');
    }

    return this.__sendTx(
      this.getContract()
        .methods.delegateOracles(
          Numbers.toSmartContractDecimals(tokenAmount, this.getTransactionTokenContract().getDecimals()),
          delegatedTo,
        ),
      options,
    );
  }

  /**
   * Recognize Issue as Resolved
   * @param {Object} params
   * @param {Number} params.issueId
   * @return {Promise<TransactionObject>}
   */
  recognizeAsFinished({ issueId }, options) {
    return this.__sendTx(
      this.getContract()
        .methods.recognizeAsFinished(issueId),
      options,
    );
  }

  /**
   * open Issue
   * @param {Object} params
   * @param {number} params.tokenAmount
   * @param {String} params.cid
   * @throws {Error} Tokens Amount has to be higher than 0
   * @throws {Error} Tokens not approve for tx, first use 'approveERC20'
   * @return {Promise<TransactionObject>}
   */
  openIssue({ tokenAmount, cid }, options) {
    if (tokenAmount < 0) {
      throw new Error('Tokens Amount has to be higher than 0');
    }

    return this.__sendTx(
      this.getContract().methods.openIssue(
        cid,
        Numbers.toSmartContractDecimals(tokenAmount, this.getTransactionTokenContract().getDecimals()),
      ),
      options,
    );
  }

  /**
   * redeem Issue
   * @param {Object} params
   * @param {number} params.issueId
   * @return {Promise<TransactionObject>}
   */
  redeemIssue({ issueId }, options) {
    return this.__sendTx(
      this.getContract().methods.redeemIssue(issueId),
      options,
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
  updateIssue({ issueID, tokenAmount }, options) {
    if (tokenAmount < 0) {
      throw new Error('Tokens Amount has to be higher than 0');
    }

    return this.__sendTx(
      this.getContract()
        .methods.updateIssue(
          issueID,
          Numbers.toSmartContractDecimals(tokenAmount, this.getTransactionTokenContract().getDecimals()),
        ),
      options,
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
  proposeIssueMerge({ issueID, prAddresses, prAmounts }, options) {
    if (prAddresses.length !== prAmounts.length) {
      throw new Error('prAddresses dont match prAmounts size');
    }
    const prAmountsWithDecimals = prAmounts.map(
      p => Numbers.toSmartContractDecimals(p, this.getTransactionTokenContract().getDecimals()),
    );

    return this.__sendTx(
      this.getContract()
        .methods.proposeIssueMerge(issueID, prAddresses, prAmountsWithDecimals),
      options,
    );
  }

  /**
   * close Issue
   * @param {Object} params
   * @param {number} params.issueID
   * @param {number} params.mergeID
   * @return {Promise<TransactionObject>}
   */
  closeIssue({ issueID, mergeID }, options) {
    return this.__sendTx(
      this.getContract().methods.closeIssue(issueID, mergeID),
      options,
    );
  }

  /**
   * Dispute Merge
   * @param {Object} params
   * @param {number} params.issueID
   * @param {number} params.mergeID
   * @return {Promise<TransactionObject>}
   */
  disputeMerge({ issueID, mergeID }, options) {
    return this.__sendTx(
      this.getContract().methods.disputeMerge(issueID, mergeID),
      options,
    );
  }

  /**
   * Deploys current contract and awaits for {@link TokensNetwork#__assert}
   * @function
   * @param {Object} params
   * @param {string} params.settlerTokenAddress
   * @param {string} params.transactionTokenAddress
   * @param {string} params.governanceAddress
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
  getSettlerTokenContract() {
    return this.params.settlerToken;
  }

  /**
   * @function
   * @return ERC20Contract|null
   */
  getTransactionTokenContract() {
    return this.params.transactionalToken;
  }
}

export default Network;
