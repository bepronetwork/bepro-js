import _ from 'lodash';
import { erc721contract } from '../../interfaces';
import IContract from '../IContract';
/**
 * ERC721Contract Object
 * @class ERC721Contract
 * @param {Web3} web3
 * @param {Address} contractAddress ? (opt)
 */

class ERC721Contract extends IContract {
  constructor(params = {}) {
    super({ abi: erc721contract, ...params });
  }

  __assert = async () => {
    if (!this.getAddress()) {
      throw new Error(
        'Contract is not deployed, first deploy it and provide a contract address',
      );
    }
    /* Use ABI */
    this.params.contract.use(erc721contract, this.getAddress());
  };

  /**
   * @function
   * @description Verify if token ID exists
   * @returns {Integer} Token Id
   */
  async exists({ tokenID }) {
    return await this.params.contract
      .getContract()
      .methods.exists(tokenID)
      .call();
  }

  /**
   * @function
   * @description Verify what is the getURITokenID
   * @returns {String} URI
   */
  async getURITokenID({ tokenID }) {
    return await this.params.contract
      .getContract()
      .methods.tokenURI(tokenID)
      .call();
  }

  /**
   * @function
   * @description Verify what is the baseURI
   * @returns {String} URI
   */
  async baseURI() {
    return await this.params.contract.getContract().methods.baseURI().call();
  }

  /**
   * @function
   * @description Get name
   * @returns {String} Name
   */
  async name() {
    return await this.params.contract.getContract().methods.name().call();
  }

  /**
   * @function
   * @description Get Symbol
   * @returns {String} Symbol
   */
  async symbol() {
    return await this.params.contract.getContract().methods.symbol().call();
  }

  /**
   * @function
   * @description Set Base Token URI
   */
  setBaseTokenURI = async ({ URI }) => await this.__sendTx(
    this.params.contract.getContract().methods.setBaseURI(URI),
  );

  /**
   * @function
   * @description Mint created TokenID
   * @param {Object} params
   * @param {Address} to Address to send to
   * @param {Integer} tokenId Token Id to use
   */
  async mint({ to, tokenId }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.mint(to, tokenId),
    );
  }

  /**
   * @function
   * @description Approve Use of TokenID
   * @param {Object} params
   * @param {Address} to Address to send to
   * @param {Integer} tokenId Token Id to use
   */
  async approve({ to, tokenId }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.approve(to, tokenId),
    );
  }

  /**
   * @function
   * @description Approve All Use
   * @param {Object} params
   * @param {Address} to Address to approve to
   * @param {Bool} approve If to approve or disapprove
   */
  async setApprovalForAll({ to, approve }) {
    return await this.__sendTx(
      this.params.contract.getContract().methods.setApprovalForAll(to, approve),
    );
  }

  /**
   * @function
   * @description Approve All Use
   * @param {Object} params
   * @param {Address} from Address to approve from
   * @param {Address} to Address to approve to
   */
  async isApprovedForAll({ from, to }) {
    return await this.params.contract.getContract().methods.isApprovedForAll(from, to).call();
  }

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
}

export default ERC721Contract;
