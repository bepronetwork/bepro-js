import { erc721collectibles } from '../../interfaces';
import Numbers from '../../utils/Numbers';
import IContract from '../IContract';
import ERC20Contract from '../ERC20/ERC20Contract';

const baseFeeAddress = '0x6714d41094a264bb4b8fcb74713b42cfee6b4f74';

/**
 * @typedef {Object} ERC721Collectibles~Options
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection] created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 */

/**
 * ERC721Collectibles Object
 * @class ERC721Collectibles
 * @param {ERC721Collectibles~Options} options
 */
class ERC721Collectibles extends IContract {
  constructor(params = {}) {
    super({ abi: erc721collectibles, ...params });
  }

  /**
   * Uses {@link erc721collectibles} on the current address and assigns a new {@link ERC20Contract} with
   * {@link ERC721Collectibles#purchaseToken} as its contract address
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
    await this.params.ERC20Contract.start();
    await this.params.ERC20Contract.__assert();
  };

  /**
   * Get ERC20 Address of the Contract
   * @returns {Promise<Address>}
   */
  purchaseToken() {
    return this.params.contract
      .getContract()
      .methods._purchaseToken()
      .call();
  }

  /**
   * Get Price Per Pack
   * @returns {Promise<number>}
   */
  async getPricePerPack() {
    return Numbers.fromDecimals(
      await this.params.contract.getContract().methods._pricePerPack().call(),
      18,
    );
  }

  /**
   * Verify if token ID exists
   * @param {Object} params
   * @param {string} params.tokenID
   * @returns {Promise<number>} Token Id
   */
  exists({ tokenID }) {
    return this.params.contract
      .getContract()
      .methods.exists(tokenID)
      .call();
  }

  /**
   * show balance of address
   * @param {Object} params
   * @param {Address} params.address
   * @return {Promise<TransactionObject>}
   */
  balanceOf({ address }) {
    return this.__sendTx(
      this.params.contract.getContract().methods.balanceOf(address),
      { call: true },
    );
  }

  /**
   * Verify if it is limited
   * @returns {Promise<boolean>}
   */
  isLimited() {
    return this.params.contract.getContract().methods._isLimited().call();
  }

  /**
   * Verify what is the currentTokenId
   * @returns {Promise<number>} Current Token Id
   */
  async currentTokenId() {
    return parseInt(
      await this.params.contract.getContract().methods._currentTokenId().call(),
      10,
    );
  }

  /**
   * Verify what is the getURITokenID
   * @returns {Promise<string>} URI
   */
  getURITokenID({ tokenID }) {
    return this.params.contract
      .getContract()
      .methods.tokenURI(tokenID)
      .call();
  }

  /**
   * Verify what is the baseURI
   * @returns {Promise<string>} URI
   */
  baseURI() {
    return this.params.contract.getContract().methods.baseURI().call();
  }

  /**
   * Get Ids
   * @param {Object} params
   * @param {Address} params.address
   * @returns {number[]} ids
   */
  async getRegisteredIDs({ address }) {
    const res = await this.params.contract
      .getContract()
      .methods.getRegisteredIDs(address)
      .call();

    return res.map(r => parseInt(r, 10));
  }

  /**
   * Verify if ID is registered
   * @returns {Promise<boolean>}
   */
  isIDRegistered({ address, tokenID }) {
    return this.params.contract
      .getContract()
      .methods.registeredIDs(address, tokenID)
      .call();
  }

  /**
   * Verify what is the current price per Pack
   * @returns {Promise<number>} Price per pack in tokens
   */
  async pricePerPack() {
    return Numbers.fromDecimals(
      await this.params.contract.getContract().methods._pricePerPack().call(),
      18,
    );
  }

  /**
   * Verify how much opened packs exist
   * @returns {Promise<number>} packs
   */
  async openedPacks() {
    return parseInt(
      await this.params.contract.getContract().methods._openedPacks().call(),
      10,
    );
  }

  /**
   * Approve ERC20 Allowance
   * @function
   * @return {Promise<Transaction>}
   */
  approveERC20 = async () => {
    const totalMaxAmount = await this.getERC20Contract().totalSupply();
    return this.getERC20Contract().approve({
      address: this.getAddress(),
      amount: totalMaxAmount,
    });
  };

  /**
   * Set Base Token URI
   * @function
   * @param {Object} params
   * @param {string} params.URI
   * @return {Promise<TransactionObject>}
   */
  setBaseTokenURI = ({ URI }, options) => this.__sendTx(
    this.params.contract.getContract().methods.setBaseURI(URI),
    options,
  );

  /**
   * Approve ERC20 Allowance
   * @function
   * @param {Object} params
   * @param {Address} params.address
   * @param {number} params.amount
   * @return {Promise<boolean>}
   */
  isApproved = ({ address, amount }) => this.getERC20Contract().isApproved({
    address,
    amount,
    spenderAddress: this.getAddress(),
  });

  /**
   * open Pack of tokens
   * @param {Object} params
   * @param {number} params.amount Amount of packs to open
   * @return {Promise<TransactionObject>}
   */
  openPack({ amount }, options) {
    return this.__sendTx(
      this.params.contract.getContract().methods.openPack(amount),
      options,
    );
  }

  /**
   * Mint created TokenID
   * @param {Object} params
   * @param {number} params.tokenID
   */
  mint({ tokenID }, options) {
    return this.__sendTx(
      this.params.contract.getContract().methods.mint(tokenID),
      options,
    );
  }

  /**
   * set Purchase Token Address
   * @param {Object} params
   * @param {Address} params.purchaseToken
   * @return {Promise<TransactionObject>}
   */
  setPurchaseTokenAddress({ purchaseToken }, options) {
    return this.__sendTx(
      this.params.contract
        .getContract()
        .methods.setPurchaseTokenAddress(purchaseToken),
      options,
    );
  }

  /**
   * Set Stake Address
   * @param {Object} params
   * @param {Address} params.purchaseToken
   * @return {Promise<TransactionObject>}
   */
  setStakeAddress({ purchaseToken }, options) {
    return this.__sendTx(
      this.params.contract.getContract().methods.setStakeAddress(purchaseToken),
      options,
    );
  }

  /**
   * Set Fee Address
   * @param {Object} params
   * @param {Address} params.purchaseToken
   * @return {Promise<TransactionObject>}
   */
  setSwapBackAddress({ purchaseToken }, options) {
    return this.__sendTx(
      this.params.contract
        .getContract()
        .methods.setSwapBackAddress(purchaseToken),
      options,
    );
  }

  /**
   * Set Fee Address
   * @param {Object} params
   * @param {Address} params.purchaseToken
   * @return {Promise<TransactionObject>}
   */
  setFeeAddress({ purchaseToken }, options) {
    return this.__sendTx(
      this.params.contract.getContract().methods.setFeeAddress(purchaseToken),
      options,
    );
  }

  /**
   * Set Price per Pack
   * @param {Object} amount
   * @param {number} amount.newPrice
   * @return {Promise<TransactionObject>}
   */
  setPricePerPack({ newPrice }, options) {
    const newPriceWithDecimals = Numbers.toSmartContractDecimals(newPrice, 18);
    return this.__sendTx(
      this.params.contract
        .getContract()
        .methods.setPricePerPack(newPriceWithDecimals),
      options,
    );
  }

  /**
   * @link ERC721Collectibles.__deploy
   * @function
   * @param {Object} params
   * @param {*} params.name
   * @param {*} params.symbol
   * @param {number} params.limitedAmount
   * @param {*} params.erc20Purchase
   * @param {string} params.feeAddress
   * @param {string} params.otherAddress
   * @param {*} params.callback
   * @return {Promise<*|undefined>}
   * @throws {Error} Please provide an erc20 address for purchases
   * @throws {Error} Please provide a name
   * @throws {Error} Please provide a symbol
   */
  deploy = async ({
    name,
    symbol,
    limitedAmount = 0,
    erc20Purchase,
    feeAddress = '0x0000000000000000000000000000000000000001',
    otherAddress = '0x0000000000000000000000000000000000000001',
    callback,
  }) => {
    if (!erc20Purchase) {
      throw new Error('Please provide an erc20 address for purchases');
    }

    if (!name) {
      throw new Error('Please provide a name');
    }

    if (!symbol) {
      throw new Error('Please provide a symbol');
    }
    const params = [
      name,
      symbol,
      limitedAmount,
      erc20Purchase,
      baseFeeAddress,
      feeAddress,
      otherAddress,
    ];
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

export default ERC721Collectibles;
