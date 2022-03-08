import { erc721standard } from '../../interfaces';
// import IContract from '../IContract';
import ERC721 from './ERC721';
// import ERC20Contract from '../ERC20/ERC20Contract';

/**
 * @typedef {Object} ERC721Standard~Options
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection] created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 */

/**
 * ERC721Standard Object
 * @class ERC721Standard
 * @param {ERC721Standard~Options} options
 */
class ERC721Standard extends ERC721 {
  constructor(params = {}) {
    super({ abi: erc721standard, ...params });
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
    this.params.contract.use(erc721standard, this.getAddress());
  };

  /**
   * Verify if token ID exists
   * @param {Object} params
   * @param {number} params.tokenId
   * @returns {Promise<boolean>} Token Id
   */
  async exists({ tokenId }) {
    return await this.getWeb3Contract().methods.exists(tokenId).call();
  }

  /**
   * Set Base Token URI
   * @function
   * @param {Object} params
   * @param {string} params.URI
   * @param {IContract~TxOptions} options
   * @return {Promise<*>}
   */
  async setBaseTokenURI({ URI }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.setBaseURI(URI),
      options,
    );
  }

  async setBaseURI({ URI }, options) {
    return await this.setBaseTokenURI({ URI }, options);
  }

  /**
   * Set Token URI
   * @function
   * @param {Object} params
   * @param {string} params.tokenId
   * @param {string} params.URI
   * @param {IContract~TxOptions} options
   * @return {Promise<*>}
   */
  async setTokenURI({ tokenId, URI }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.setTokenURI(tokenId, URI),
      options,
    );
  }

  /**
   * @function
   * @description Mint created TokenId
   * @param {Object} params
   * @param {number} params.tokenId
   * @param {IContract~TxOptions} options
   * @return {Promise<TransactionObject>}
   */
  async mint({ tokenId }, options) {
    const to = await this.getUserAddress();
    return await this.__sendTx(
      this.getWeb3Contract().methods.mint(to, tokenId),
      options,
    );
  }

  /**
   * @function
   * @description Mint created TokenId
   * @param {Object} params
   * @param {Address} to Address to send to
   * @param {Integer} tokenId Token Id to use
   * @param {IContract~TxOptions} options
   * @return {Promise<TransactionObject>}
   */
  async mintTo({ to, tokenId }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.mint(to, tokenId),
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

export default ERC721Standard;
