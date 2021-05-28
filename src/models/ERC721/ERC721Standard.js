import { erc721standard } from '../../interfaces';
import IContract from '../IContract';
import ERC20Contract from '../ERC20/ERC20Contract';

/**
 * @typedef {Object} ERC721Standard~Options
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection] created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 */

/**
 * ERC721Contract Object
 * @class ERC721Contract
 * @param {ERC721Standard~Options} options
 */
class ERC721Standard extends IContract {
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
    this.params.contract.use(erc721collectibles, this.getAddress());

    /* Set Token Address Contract for easy access */
    this.params.ERC20Contract = new ERC20Contract({
      web3Connection: this.web3Connection,
      contractAddress: await this.purchaseToken(),
    });

    /* Assert Token Contract */
    await this.params.ERC20Contract.__assert();
  };

  /**
   * Verify if token ID exists
   * @param {Object} params
   * @param {number} params.tokenID
   * @returns {Promise<boolean>} Token Id
   */
  async exists({ tokenID }) {
    return await this.params.contract
      .getContract()
      .methods.exists(tokenID)
      .call();
  }

  /**
   * Verify what is the getURITokenID
   * @param {Object} params
   * @param {number} params.tokenID
   * @returns {Promise<string>} URI
   */
  async getURITokenID({ tokenID }) {
    return await this.params.contract
      .getContract()
      .methods.tokenURI(tokenID)
      .call();
  }

  /**
   * Verify what is the baseURI
   * @returns {Promise<string>} URI
   */
  async baseURI() {
    return await this.params.contract.getContract().methods.baseURI().call();
  }

  /**
   * Set Base Token URI
   * @function
   * @param {Object} params
   * @param {string} params.URI
   * @return {Promise<*>}
   */
  setBaseTokenURI = async ({ URI }) => await this.__sendTx(
    this.params.contract.getContract().methods.setBaseURI(URI),
  );

  /**
   * Mint created TokenID
   * @param {Object} params
   * @param {number} params.tokenID
   * @return {Promise<TransactionObject>}
   */
  async mint({ tokenID }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.mint(tokenID),
    );
  }

  /**
   * @link ERC721Standard.__deploy
   * @param {Object} params
   * @param {string} params.name
   * @param {*} params.symbol
   * @param {function():void} params.callback
   * @return {Promise<*|undefined>}
   * @throws {Error} Please provide a name
   * @throws {Error} Please provide a symbol
   */
  deploy = async ({ name, symbol, callback }) => {
    if (!name) {
      throw new Error('Please provide a name');
    }

    if (!symbol) {
      throw new Error('Please provide a symbol');
    }
    const params = [name, symbol];
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

export default ERC721Standard;
