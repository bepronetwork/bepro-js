import { erc721 } from '../../interfaces';
import IContract from '../IContract';

/**
 * @typedef {Object} ERC721~Options
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection]
 * created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 */

/**
 * ERC721 Object
 * @class ERC721
 * @abstract
 * @param {ERC721~Options} options
 */
class ERC721 extends IContract {
  constructor(params = {}) {
    super({ abi: erc721, ...params });
  }

  /**
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
    /* Use ABI */
    this.params.contract.use(erc721, this.getAddress());
  };

  /**
   * @function
   * @description Get balance (number of token ids) of owner
   * @param {Object} params
   * @param {Address} params.owner
   * @returns {Promise<uint256>}
   */
  async balanceOf({ owner }) {
    return await this.getWeb3Contract().methods.balanceOf(owner).call();
  }

  /**
   * @function
   * @description Get balance (number of token ids) of owner
   * @param {Object} params
   * @param {uint256} params.tokenId
   * @returns {Promise<Address>}
   */
  async ownerOf({ tokenId }) {
    return await this.getWeb3Contract().methods.ownerOf(tokenId).call();
  }

  /**
   * @function
   * @description Get name
   * @returns {Promise<String>} Name
   */
  async name() {
    return await this.getWeb3Contract().methods.name().call();
  }

  /**
   * @function
   * @description Get Symbol
   * @returns {Promise<String>} Symbol
   */
  async symbol() {
    return await this.getWeb3Contract().methods.symbol().call();
  }

  /**
   * Verify what is the getURITokenId
   * @param {Object} params
   * @param {number} params.tokenId
   * @returns {Promise<string>} URI
   */
  // async getURITokenId({ tokenId }) {
  async getTokenURI({ tokenId }) {
    return await this.getWeb3Contract().methods.tokenURI(tokenId).call();
  }

  async tokenURI({ tokenId }) {
    return await this.getURITokenId({ tokenId });
  }

  /**
   * Verify what is the baseURI
   * @returns {Promise<string>} URI
   */
  async baseURI() {
    return await this.getWeb3Contract().methods.baseURI().call();
  }

  /**
   * @function
   * @description Get tokenId of owner given its index in the list of owner token ids.
   * @param {Object} params
   * @param {Address} owner Owner address
   * @param {Integer} index Token Id index
   * @returns {Promise<Integer>}
   */
  async tokenOfOwnerByIndex({ owner, index }) {
    return await this.getWeb3Contract().methods.tokenOfOwnerByIndex(owner, index).call();
  }

  /**
   * @function
   * @description Get total supply of token ids.
   * @returns {Promise<Integer>}
   */
  async totalSupply() {
    return await this.getWeb3Contract().methods.totalSupply().call();
  }

  /**
   * @function
   * @description Get tokenId by index
   * @param {Object} params
   * @param {Integer} index Token Id index
   * @returns {Promise<Integer>}
   */
  async tokenByIndex({ index }) {
    return await this.getWeb3Contract().methods.tokenByIndex(index).call();
  }

  /**
   * @function
   * @description Approve Use of TokenId
   * @param {Object} params
   * @param {Address} to Address to send to
   * @param {Integer} tokenId Token Id to use
   * @param {IContract~TxOptions} options
   * @returns {Promise<Transaction>} approve transaction promise
   */
  async approve({ to, tokenId }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.approve(to, tokenId),
      options,
    );
  }

  /**
   * @function
   * @description Get approved TokenId address
   * @param {Object} params
   * @param {Integer} tokenId Token Id to use
   * @returns {Promise<Bool>} approved
   */
  async getApproved({ tokenId }) {
    return await this.getWeb3Contract().methods.getApproved(tokenId).call();
  }

  /**
   * @function
   * @description Approve All Use
   * @param {Object} params
   * @param {Address} to Address to approve to
   * @param {Bool} approve If to approve or disapprove
   * @param {IContract~TxOptions} options
   * @returns {Promise<Transaction>} setApprovalForAll transaction promise
   */
  async setApprovalForAll({ to, approve = true }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.setApprovalForAll(to, approve),
      options,
    );
  }

  /**
   * @function
   * @description Approve All Use
   * @param {Object} params
   * @param {Address} from Address to approve from
   * @param {Address} to Address to approve to
   * @returns {Promise<Bool>} approved for all
   */
  async isApprovedForAll({ from, to }) {
    return await this.getWeb3Contract().methods.isApprovedForAll(from, to).call();
  }

  /**
   * @function
   * @description Transfer tokenId from one address to another.
   * NOTE: Prior transfer approval is required.
   * @param {Object} params
   * @param {Address} from From address
   * @param {Address} to To address
   * @param {Integer} tokenId TokenId
   * @param {IContract~TxOptions} options
   * @returns {Promise<Transaction>}
   */
  async transferFrom({ from, to, tokenId }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.transferFrom(from, to, tokenId),
      options,
    );
  }

  /**
   * @function
   * @description Safe 'transferFrom' function
   * @param {Object} params
   * @param {Address} from From address
   * @param {Address} to To address
   * @param {Integer} tokenId TokenId
   * @param {IContract~TxOptions} options
   * @returns {Promise<Transaction>}
   */
  async safeTransferFrom({ from, to, tokenId }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.safeTransferFrom(from, to, tokenId),
      options,
    );
  }

  /**
   * @link ERC721Standard.__deploy
   * @param {Object} params
   * @param {string} params.name
   * @param {string} params.symbol
   * @param {IContract~TxOptions} options
   * @return {Promise<*|undefined>}
   * @throws {Error} Please provide a name
   * @throws {Error} Please provide a symbol
   */
  deploy = async ({ name, symbol }, options) => {
    if (!name) {
      throw new Error('Please provide a name');
    }

    if (!symbol) {
      throw new Error('Please provide a symbol');
    }
    const params = [name, symbol];
    const res = await this.__deploy(params, options);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };
}

export default ERC721;
