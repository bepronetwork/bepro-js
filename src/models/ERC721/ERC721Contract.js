import { erc721standard } from '../../interfaces';
import IContract from '../IContract';

/**
 * ERC721Contract Object
 * @class ERC721Contract
 * @param {Web3} web3
 * @param {Address} contractAddress ? (opt)
 */

class ERC721Contract extends IContract {
  constructor(params = {}) {
    super({ abi: erc721standard, ...params });
  }

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
   * @function
   * @description Verify if token ID exists
   * @returns {Integer} Token Id
   */
  exists({ tokenID }) {
    return this.getContract()
      .methods.exists(tokenID)
      .call();
  }

  /**
   * @function
   * @description Verify what is the getURITokenID
   * @returns {String} URI
   */
  getURITokenID({ tokenID }) {
    return this.getContract()
      .methods.tokenURI(tokenID)
      .call();
  }

  /**
   * @function
   * @description Verify what is the baseURI
   * @returns {String} URI
   */
  baseURI() {
    return this.getContract().methods.baseURI().call();
  }

  /**
   * @function
   * @description Get name
   * @returns {String} Name
   */
  name() {
    return this.getContract().methods.name().call();
  }

  /**
   * @function
   * @description Get Symbol
   * @returns {String} Symbol
   */
  symbol() {
    return this.getContract().methods.symbol().call();
  }

  /**
   * @function
   * @description Set Base Token URI
   */
  setBaseTokenURI = ({ URI }, options) => this.__sendTx(
    this.getContract().methods.setBaseURI(URI),
    options,
  );

  /**
   * @function
   * @description Mint created TokenID
   * @param {Object} params
   * @param {Address} to Address to send to
   * @param {Integer} tokenId Token Id to use
   */
  mint({ to, tokenId }, options) {
    return this.__sendTx(
      this.getContract().methods.mint(to, tokenId),
      options,
    );
  }

  /**
   * @function
   * @description Approve Use of TokenID
   * @param {Object} params
   * @param {Address} to Address to send to
   * @param {Integer} tokenId Token Id to use
   */
  approve({ to, tokenId }, options) {
    return this.__sendTx(
      this.getContract().methods.approve(to, tokenId),
      options,
    );
  }

  /**
   * @function
   * @description Approve All Use
   * @param {Object} params
   * @param {Address} to Address to approve to
   * @param {Bool} approve If to approve or disapprove
   */
  setApprovalForAll({ to, approve = true }, options) {
    return this.__sendTx(
      this.getContract().methods.setApprovalForAll(to, approve),
      options,
    );
  }

  /**
   * @function
   * @description Approve All Use
   * @param {Object} params
   * @param {Address} from Address to approve from
   * @param {Address} to Address to approve to
   */
  isApprovedForAll({ from, to }) {
    return this.getContract()
      .methods.isApprovedForAll(from, to)
      .call();
  }

  deploy = async ({ name, symbol }, options) => {
    if (!name) {
      throw new Error('Please provide a name');
    }

    if (!symbol) {
      throw new Error('Please provide a symbol');
    }
    const params = [ name, symbol ];
    const res = await this.__deploy(params, options);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };
}

export default ERC721Contract;
