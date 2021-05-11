/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line no-unused-vars
import _ from 'lodash';
import { beproNetwork } from '../../interfaces';
import Numbers from '../../utils/Numbers';
import IContract from '../IContract';
import ERC20Contract from '../ERC20/ERC20Contract';

const beproAddress = '0xCF3C8Be2e2C42331Da80EF210e9B1b307C03d36A';

/**
 * BEPRONetwork Object
 * @class BEPRONetwork
 * @param {Object} params Parameters
 * @param {Address} params.contractAddress Optional/If Existent
 */
class BEPRONetwork extends IContract {
  constructor(params) {
    super({ abi: beproNetwork, ...params });
  }

  /**
   * Asserts using the current contract
   * followed by setting a new {@link ERC20Contract} to this instances public params, asserting it.
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
    this.params.contract.use(beproNetwork, this.getAddress());

    // Set Token Address Contract for easy access
    this.params.ERC20Contract = new ERC20Contract({
      web3: this.web3,
      contractAddress: beproAddress,
      acc: this.acc,
    });

    // Assert Token Contract
    await this.params.ERC20Contract.__assert();
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
      await this.params.contract.getContract().methods.incrementIssueID().call(),
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
   * Get Amount of Needed for Approve
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
   * Get Amount of Needed for Merge
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
   * Get Total Amount of BEPRO Staked for Tickets in the network
   * @returns {Promise<number>}
   */
  async getBEPROStaked() {
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
   * Get Total Amount of BEPRO Staked for Tickets in the network
   * @returns {Promise<number>}
   */
  async beproVotesStaked() {
    return Numbers.fromDecimals(
      await this.params.contract
        .getContract()
        .methods.beproVotesStaked()
        .call(),
      18,
    );
  }

  /**
   * Get Total Amount of BEPRO Staked for Council in the network
   * @returns {Promise<number>}
   */
  async COUNCIL_BEPRO_AMOUNT() {
    return Numbers.fromDecimals(
      await this.params.contract
        .getContract()
        .methods.COUNCIL_BEPRO_AMOUNT()
        .call(),
      18,
    );
  }

  /**
   * Get Total Amount of BEPRO Staked for Operator in the network
   * @returns {Promise<number>}
   */
  async OPERATOR_BEPRO_AMOUNT() {
    return Numbers.fromDecimals(
      await this.params.contract
        .getContract()
        .methods.OPERATOR_BEPRO_AMOUNT()
        .call(),
      18,
    );
  }

  /**
   * Get Total Amount of BEPRO Staked for Developer in the network
   * @returns {Promise<number>}
   */
  async DEVELOPER_BEPRO_AMOUNT() {
    return Numbers.fromDecimals(
      await this.params.contract
        .getContract()
        .methods.DEVELOPER_BEPRO_AMOUNT()
        .call(),
      18,
    );
  }

  /**
   * Is issue Approved
   * @param {number} issueId
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
   * @param {number} issueId
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
   * @param {number} issueId
   * @param {number} mergeId
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
   * @param {number} issueId
   * @param {number} mergeId
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
   * @param {Address} address
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
   * @param issue_id
   * @return {Promise<{finalized: boolean, canceled: boolean, votesForApprove: number, beproStaked: number, issueGenerator: Address, mergeProposalsAmount: number, _id: number, creationDate: Date}>}
   */
  async getIssueById({ issue_id }) {
    const r = await this.__sendTx(
      this.params.contract.getContract().methods.getIssueById(issue_id),
      true,
    );

    return {
      _id: Numbers.fromHex(r[0]),
      beproStaked: Numbers.fromDecimals(r[1], 18),
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
   * @param issue_id
   * @param merge_id
   * @return {Promise<{prAddresses: Address|Array, prAmounts: number|number[], votes: number, _id: number, proposalAddress: Address}>}
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
  approveERC20 = async () => {
    const totalMaxAmount = await this.getERC20Contract().totalSupply();
    return await this.getERC20Contract().approve({
      address: this.getAddress(),
      amount: totalMaxAmount,
    });
  };

  /**
   * Verify if Approved
   * @function
   * @return {Promise<number>}
   */
  isApprovedERC20 = async ({ amount, address }) => await this.getERC20Contract().isApproved({
    address,
    amount,
    spenderAddress: this.getAddress(),
  });

  /**
   * lock BEPRO for oracles
   * @params params.beproAmount {number}
   * @return {Promise<*>}
   * @throws {Error} Bepro Amount has to be higher than 0
   * @throws {Error} Bepro not approve for tx, first use 'approveERC20'
   */
  async lockBepro({ beproAmount }) {
    if (beproAmount <= 0) {
      throw new Error('Bepro Amount has to be higher than 0');
    }

    if (!(await this.isApprovedERC20({ amount, address }))) {
      throw new Error("Bepro not approve for tx, first use 'approveERC20'");
    }

    return await this.__sendTx(
      this.params.contract.getContract().methods.lockBepro(beproAmount),
    );
  }

  /**
   * Unlock BEPRO for oracles
   * @params params.beproAmount {number}
   * @params params.from {address}
   * @return {Promise<*>}
   * @throws {Error} Bepro Amount has to be higher than 0
   */
  async unlockBepro({ beproAmount, from }) {
    if (beproAmount <= 0) {
      throw new Error('Bepro Amount has to be higher than 0');
    }

    return await this.__sendTx(
      this.params.contract.getContract().methods.unlockBepro(beproAmount, from),
    );
  }

  /**
   * Delegated Oracles to others
   * @param {number} beproAmount
   * @param {Address} delegatedTo
   * @return {Promise<*>}
   */
  async delegateOracles({ beproAmount, delegatedTo }) {
    if (beproAmount <= 0) {
      throw new Error('Bepro Amount has to be higher than 0');
    }

    return await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.unlockBepro(beproAmount, delegatedTo),
    );
  }

  /**
   * open Issue
   * @param {number} beproAmount
   * @param {Address} address
   * @throws {Error} Bepro Amount has to be higher than 0
   * @throws {Error} Bepro not approve for tx, first use 'approveERC20'
   * @return {Promise<*>}
   */
  async openIssue({ beproAmount, address }) {
    if (beproAmount < 0) {
      throw new Error('Bepro Amount has to be higher than 0');
    }

    if (!(await this.isApprovedERC20({ amount, address }))) {
      throw new Error("Bepro not approve for tx, first use 'approveERC20'");
    }

    return await this.__sendTx(
      this.params.contract.getContract().methods.openIssue(beproAmount),
    );
  }

  /**
   * open Issue
   * @param {number} issueId
   * @return {Promise<*>}
   */
  async approveIssue({ issueId }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.approveIssue(issueId),
    );
  }

  /**
   * redeem Issue
   * @param {number} issueId
   * @return {Promise<*>}
   */
  async redeemIssue({ issueId }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.redeemIssue(issueId),
    );
  }

  /**
   * open Issue
   * @param {number} issueId
   * @param {number} mergeId
   * @return {Promise<*>}
   */
  async approveMerge({ issueId, mergeId }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.approveMerge(issueId, mergeId),
    );
  }

  /**
   * open Issue
   * @param {number} issueID
   * @param {number} beproAmount
   * @param {address} address
   * @return {Promise<*>}
   */
  async updateIssue({ issueID, beproAmount, address }) {
    if (beproAmount < 0) {
      throw new Error('Bepro Amount has to be higher than 0');
    }

    if (!(await this.isApprovedERC20({ amount, address }))) {
      throw new Error("Bepro not approve for tx, first use 'approveERC20'");
    }

    return await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.updateIssue(issueID, beproAmount, address),
    );
  }

  /**
   * Propose Merge of Issue
   * @param {number} issueID
   * @param {Address | Address[]} prAddresses
   * @param {number | number[]} prAmounts
   * @return {Promise<*>}
   */
  async proposeIssueMerge({ issueID, prAddresses, prAmounts }) {
    if (prAddresses.length != prAmounts.length) {
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
   * @param {number} issueID
   * @param {number} mergeID
   * @return {Promise<*>}
   */
  async closeIssue({ issueID, mergeID }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.closeIssue(issueID, mergeID),
    );
  }

  /**
   * Deploys current contract and awaits {@link BEPRONetwork#__assert}
   * @function
   * @param tokenAddress
   * @param callback
   * @return {Promise<*|undefined>}
   */
  deploy = async ({ tokenAddress, callback }) => {
    const params = [tokenAddress];
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
  getERC20Contract = () => this.params.ERC20Contract;
}

export default BEPRONetwork;
