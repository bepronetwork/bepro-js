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
 * @param params.web3 {Web3}
 * @param params.contractAddress {Address}
 * @param params.acc {*}
 * @param params.abi {beproNetwork}
 */
class BEPRONetwork extends IContract {
  constructor(params) {
    super({ abi: beproNetwork, ...params });
  }

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
   * @function
   * @description Get Open Issues Available
   * @param {Address} address
   * @returns {Integer | Array}
   */
  async getIssuesByAddress(address) {
    const res = await this.params.contract
      .getContract()
      .methods.getIssuesByAddress(address)
      .call();

    return res.map(r => parseInt(r, 10));
  }

  /**
   * @function
   * @description Get Amount of Issues Opened in the network
   * @returns {Integer}
   */
  async getAmountofIssuesOpened() {
    return parseInt(
      await this.params.contract.getContract().methods.incrementIssueID().call(),
      10,
    );
  }

  /**
   * @function
   * @description Get Amount of Issues Closed in the network
   * @returns {Integer}
   */
  async getAmountofIssuesClosed() {
    return parseInt(
      await this.params.contract.getContract().methods.closedIdsCount().call(),
      10,
    );
  }

  /**
   * @function
   * @description Get Amount of Needed for Approve
   * @returns {Integer}
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
   * @function
   * @description Get Amount of Needed for Merge
   * @returns {Integer}
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
   * @function
   * @description Get Total Amount of BEPRO Staked for Tickets in the network
   * @returns {Integer}
   */
  async getBEPROStaked() {
    return Numbers.fromDecimals(
      await this.params.contract.getContract().methods.totalStaked().call(),
      18,
    );
  }

  /**
   * @function
   * @description GetTotal amount of time where an issue has to be approved
   * @returns {Date}
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
   * @function
   * @description Get Total Amount of BEPRO Staked for Tickets in the network
   * @returns {Integer}
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
   * @function
   * @description Get Total Amount of BEPRO Staked for Council in the network
   * @returns {Integer}
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
   * @function
   * @description Get Total Amount of BEPRO Staked for Operator in the network
   * @returns {Integer}
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
   * @function
   * @description Get Total Amount of BEPRO Staked for Developer in the network
   * @returns {Integer}
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
   * @function
   * @description Is issue Approved
   * @param {Integer} issueId
   * @returns {Bool}
   */
  async isIssueApproved({ issueId }) {
    return await this.params.contract
      .getContract()
      .methods.isIssueApproved(issueId)
      .call();
  }

  /**
   * @function
   * @description Is issue available to be approved (time wise)
   * @param {Integer} issueId
   * @returns {Bool}
   */
  async isIssueApprovable({ issueId }) {
    return await this.params.contract
      .getContract()
      .methods.isIssueApprovable(issueId)
      .call();
  }

  /**
   * @function
   * @description Is issue mergeable
   * @param {Integer} issueId
   * @param {Integer} mergeId
   * @returns {Bool}
   */
  async isIssueMergeable({ issueId, mergeId }) {
    return await this.params.contract
      .getContract()
      .methods.isIssueMergeable(issueId, mergeId)
      .call();
  }

  /**
   * @function
   * @description Is issue mergeable
   * @param {Integer} issueId
   * @param {Integer} mergeId
   * @returns {Bool}
   */
  async isMergeTheOneWithMoreVotes({ issueId, mergeId }) {
    return await this.params.contract
      .getContract()
      .methods.isMergeTheOneWithMoreVotes(issueId, mergeId)
      .call();
  }

  /**
   * @function
   * @description Get Issue Id Info
   * @param {Address} address
   * @returns {Integer} votes
   */

  async getVotesByAddress({ address }) {
    const r = await this.params.contract
      .getContract()
      .methods.getVotesByAddress(address)
      .call();
    return Numbers.fromDecimals(r, 18);
  }

  /**
   * @function
   * @description Get Issue Id Info
   * @param {Integer} issue_id
   * @returns {Integer} _id
   * @returns {Integer} beproStaked
   * @returns {Date} creationDate
   * @returns {Address} issueGenerator
   * @returns {Integer} votesForApprove
   * @returns {Integer} mergeProposalsAmount
   * @returns {Bool} finalized
   * @returns {Bool} canceled
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
   * @function
   * @description Get Issue Id Info
   * @param {Integer} issue_id
   * @param {Integer} merge_id
   * @returns {Integer} _id
   * @returns {Integer} votes
   * @returns {Address | Array} prAddresses
   * @returns {Integer | Array} prAmounts
   * @returns {Address} proposalAddress
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
   * @function
   * @description Approve ERC20 Allowance
   */
  approveERC20 = async () => {
    const totalMaxAmount = await this.getERC20Contract().totalSupply();
    return await this.getERC20Contract().approve({
      address: this.getAddress(),
      amount: totalMaxAmount,
    });
  };

  /**
   * @function
   * @description Verify if Approved
   */
  isApprovedERC20 = async ({ amount, address }) => await this.getERC20Contract().isApproved({
    address,
    amount,
    spenderAddress: this.getAddress(),
  });

  /**
   * @function
   * @description lock BEPRO for oracles
   * @param {integer} beproAmount
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
   * @function
   * @description Unlock BEPRO for oracles
   * @param {integer} beproAmount
   * @param {address} from
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
   * @function
   * @description Delegated Oracles to others
   * @param {integer} beproAmount
   * @param {address} delegatedTo
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
   * @function
   * @description open Issue
   * @param {integer} beproAmount
   * @param {address} address
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
   * @function
   * @description open Issue
   * @param {integer} issueId
   */
  async approveIssue({ issueId }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.approveIssue(issueId),
    );
  }

  /**
   * @function
   * @description redeem Issue
   */
  async redeemIssue({ issueId }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.redeemIssue(issueId),
    );
  }

  /**
   * @function
   * @description open Issue
   * @param {integer} issueId
   * @param {integer} mergeId
   */
  async approveMerge({ issueId, mergeId }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.approveMerge(issueId, mergeId),
    );
  }

  /**
   * @function
   * @description open Issue
   * @param {integer} issueID
   * @param {integer} beproAmount
   * @param {address} address
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
   * @function
   * @description Propose Merge of Issue
   * @param {integer} issueID
   * @param {address | Array} prAddresses
   * @param {address | Integer} prAmounts
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
   * @function
   * @description close Issue
   * @param {integer} issueID
   * @param {integer} mergeID
   */
  async closeIssue({ issueID, mergeID }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.closeIssue(issueID, mergeID),
    );
  }

  deploy = async ({ tokenAddress, callback }) => {
    const params = [tokenAddress];
    const res = await this.__deploy(params, callback);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };

  getERC20Contract = () => this.params.ERC20Contract;
}

export default BEPRONetwork;
