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
    console.log('here');

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
    await this.params.transactionalToken.login();
    await this.params.transactionalToken.__assert();
    // Assert Token Contract
    await this.params.settlerToken.login();
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
   * @description Get Amount of Needed for Dispute
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
   * Get Total Amount of Tokens Staked in the network
   * @returns {Promise<number>}
   */
  async votesStaked() {
    return Numbers.fromDecimals(
      await this.params.contract
        .getContract()
        .methods.votesStaked()
        .call(),
      18,
    );
  }


  /**
   * Get Transaction Token Address
   * @returns {Promise<address>}
   */
  async getTransactionTokenAddress() {
    return await this.params.contract
      .getContract()
      .methods.transactionToken()
      .call();
  }

  /**
   * Get Settler Token Address
   * @returns {Promise<address>}
   */
  async getSettlerTokenAddress() {
    return await this.params.contract
      .getContract()
      .methods.settlerToken()
      .call();
  }


  /**
   * Get Amount Needed for Council
   * @returns {Promise<Integer>}
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
   * Verify if Issue is still in Draft Mode (Available to use the redeemIssue Action)
   * @param {Object} params
   * @param {number} params.issueId
   * @returns {Promise<boolean>}
   */
  async isIssueinDraft({ issueId }) {
    return await this.params.contract
      .getContract()
      .methods.isIssueinDraft(issueId)
      .call();
  }

  /**
   * Get Issue Id Info
   * @param {Object} params
   * @param {Address} params.address
   * @returns {Promise<number>} Number of votes
   */
  async getOraclesByAddress({ address }) {
    const r = await this.params.contract
      .getContract()
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
    const r = await this.params.contract
      .getContract()
      .methods.getOraclesSummary(address)
      .call();

    return {
      oraclesDelegatedByOthers: Numbers.fromDecimals(r[0], 18),
      amounts: r[1] ? r[1].map(a => Numbers.fromDecimals(a, 18)) : [],
      addresses:r[2] ? r[2].map(a => a) : [],
      tokensLocked: Numbers.fromDecimals(r[3], 18)
    };
  }


  /**
   * Get Issue By Id
   * @param {Object} params
   * @param {Address} params.issueId
   * @returns {Promise<TokensNetwork~Issue>}
   */
  async getIssueById({ issueId }) {
    const r = await this.__sendTx(
      this.params.contract.getContract().methods.getIssueById(issueId),
      true,
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
       this.params.contract.getContract().methods.lock(Numbers.toSmartContractDecimals(tokenAmount, this.getSettlerTokenContract().getDecimals())),
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
       this.params.contract.getContract().methods.unlock(Numbers.toSmartContractDecimals(tokenAmount, this.getSettlerTokenContract().getDecimals()), from),
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
         .methods.unlock(Numbers.toSmartContractDecimals(tokenAmount, this.getTransactionTokenContract().getDecimals()), delegatedTo),
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
   async openIssue({ tokenAmount, cid }) {
     if (tokenAmount < 0) {
       throw new Error('Tokens Amount has to be higher than 0');
     }

     return await this.__sendTx(
       this.params.contract.getContract().methods.openIssue(cid, Numbers.toSmartContractDecimals(tokenAmount, this.getTransactionTokenContract().getDecimals())),
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
         .methods.updateIssue(issueID, Numbers.toSmartContractDecimals(tokenAmount, this.getTransactionTokenContract().getDecimals())),
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
  getSettlerTokenContract = () => this.params.settlerToken;


  /**
   * @function
   * @return ERC20Contract|null
   */
  getTransactionTokenContract = () => this.params.transactionalToken;
}

export default Network;
