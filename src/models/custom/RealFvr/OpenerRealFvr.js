import { openerRealFvr } from '../../../interfaces';
import Numbers from '../../../utils/Numbers';
import IContract from '../../IContract';
import ERC20Contract from '../../ERC20/ERC20Contract';

/**
 * @typedef {Object} OpenerRealFvr~Options
 * @property {Boolean} test
 * @property {Boolean} localtest ganache local blockchain
 * @property {Web3Connection} [web3Connection=Web3Connection] created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
 * @property {string} [contractAddress]
 * @property {string} [tokenAddress]
 */

/**
 * OpenerRealFvr Object
 * @class OpenerRealFvr
 * @param {OpenerRealFvr~Options} options
 */
class OpenerRealFvr extends IContract {
  constructor(params = {}) {
    super({ abi: openerRealFvr, ...params });
  }

  /**
   * Asserts a new {@link ERC20Contract} on the current address
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
    this.params.contract.use(openerRealFvr, this.getAddress());

    if (!this.params.tokenAddress) {
      throw new Error("Problem on ERC20 Assert, 'tokenAddress' not provided");
    }
    // Set Token Address Contract for easy access
    this.params.ERC20Contract = new ERC20Contract({
      web3Connection: this.web3Connection,
      contractAddress: this.params.tokenAddress,
    });
    try {
      // Assert Token Contract
      await this.params.ERC20Contract.__assert();
    } catch (err) {
      throw new Error(`ERC20 assert err, confirm ERC20 'tokenAddress': ${err}`);
    }
  };

  /**
   * Buy Pack
   * @function
   * @param {Object} params Parameters
   * @param {number} params.packId Pack Id
   * @param {IContract~TxOptions} options
   * @returns {Promise<Transaction>} Transaction
   */
  async buyPack({ packId }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.buyPack(packId),
      options,
    );
  }

  /**
   * Offer Pack
   * @function
   * @description Buy Packs
   * @param {Object} params Parameters
   * @param {Array | Integer} params.packIds Pack Id
   * @param {IContract~TxOptions} options
   * @returns {Transaction} Transaction
   */
  async buyPacks({ packIds }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.buyPacks(packIds),
      options,
    );
  }

  /**
   * @function
   * @description Open Pack
   * @param {Object} params Parameters
   * @param {Integer} params.packId Pack Id
   * @param {IContract~TxOptions} options
   * @returns {Transaction} Transaction
   */
  async openPack({ packId }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.openPack(packId),
      options,
    );
  }

  /**
   * @function
   * @description Open Packs
   * @param {Object} params Parameters
   * @param {Array | Integer} params.packIds Pack Id
   * @param {IContract~TxOptions} options
   * @returns {Transaction} Transaction
   */
  async openPacks({ packIds }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.openPacks(packIds),
      options,
    );
  }

  /**
   * @function
   * @description Offer Pack
   * @param {Object} params Parameters
   * @param {number} params.packId Pack Id
   * @param {Address} params.receivingAddress Pack Id number
   * @param {IContract~TxOptions} options
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  async offerPack({ packId, receivingAddress }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.offerPack(packId, receivingAddress),
      options,
    );
  }

  /**
   * Create Pack
   * @function
   * @param {Object} params Parameters
   * @param {number} params.nftAmount Amount of NFTs/Tokens
   * @param {number} params.price Price of Pack
   * @param {string} params.serie Serie of Pack
   * @param {string} params.packType Pack Type
   * @param {string} params.drop Pack Drop
   * @param {Date} params.saleStart Start Date
   * @param {Address | Address[]} params.saleDistributionAddresses Revenue Addresses of the First Purchase
   * @param {number | number[]} params.saleDistributionAmounts Revenue Amounts of the First Purchase
   * @param {Address | Address[]} params.marketplaceDistributionAddresses Marketplace distribution address
   * @param {number | number[]} params.marketplaceDistributionAmounts Revenue Amounts of marketplace
   * @param {IContract~TxOptions} options
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  async createPack({
    nftAmount,
    price,
    serie,
    packType,
    drop,
    saleStart,
    saleDistributionAddresses,
    saleDistributionAmounts,
    marketplaceDistributionAddresses,
    marketplaceDistributionAmounts,
  }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.createPack(
        parseInt(nftAmount, 10),
        Numbers.toSmartContractDecimals(price, 3), // String(price).toString(),
        serie,
        packType,
        drop,
        Numbers.timeToSmartContractTime(saleStart),
        saleDistributionAddresses,
        saleDistributionAmounts,
        marketplaceDistributionAddresses,
        marketplaceDistributionAmounts,
      ),
      options,
    );
  }

  /**
   * Edit Pack Info
   * @function
   * @param {Object} params Parameters
   * @param {number} params.packId Pack Number
   * @param {Date} params.saleStart Time of Start of the Sale
   * @param {string} params.serie Serie of Pack
   * @param {string} params.packType Pack Type
   * @param {string} params.drop Pack Drop
   * @param {number} params.price Pack Price
   * @param {IContract~TxOptions} options
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  async editPackInfo({
    packId, saleStart, price, serie, packType, drop,
  }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.createPack(
        packId,
        Numbers.timeToSmartContractTime(saleStart),
        serie,
        packType,
        drop,
        Numbers.toSmartContractDecimals(price, 3), // String(price).toString(),
      ),
      options,
    );
  }

  /**
   * Delete Pack
   * @function
   * @param {Object} params Parameters
   * @param {number} params.packId Pack Id number
   * @param {IContract~TxOptions} options
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  async deletePackById({ packId }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.deletePackById(packId),
      options,
    );
  }

  /**
   * Mint Token Id (After buying a pack)
   * @function
   * @param {Object} params Parameters
   * @param {number} params.tokenId Token ID
   * @param {IContract~TxOptions} options
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  async mint({ tokenId }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.mint(tokenId),
      options,
    );
  }

  /**
   * Set Purchase Token
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.address Token Address
   * @param {IContract~TxOptions} options
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  async setPurchaseTokenAddress({ address }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.setPurchaseTokenAddress(address),
      options,
    );
  }

  /**
   * Lock the Contract
   * @function
   * @param {IContract~TxOptions} options
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  async lock(options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.lock(),
      options,
    );
  }

  /**
   * Unlock the Contract
   * @function
   * @param {IContract~TxOptions} options
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  async unlock(options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.unlock(),
      options,
    );
  }

  /**
   * Set Token Price of Real Fvr in USD --> 1*10**18 as input means 1 Real Fvr = $0.000001
   * @function
   * @param {Object} params Parameters
   * @param {Price} params.price Token Price
   * @param {IContract~TxOptions} options
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  async setTokenPriceInUSD({ price }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.setTokenPriceInUSD(price),
      options,
    );
  }

  /**
   * Set Base Id URI
   * @function
   * @param {Object} params Parameters
   * @param {string} params.uri URI of the Token Id Metadata JSON
   * @param {IContract~TxOptions} options
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  async setBaseURI({ uri }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.setBaseURI(uri),
      options,
    );
  }

  /**
   * Set Specific Token Id URI
   * @function
   * @param {Object} params Parameters
   * @param {number} params.tokenId Token ID
   * @param {string} params.uri URI of the Token Id Metadata JSON
   * @param {IContract~TxOptions} options
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  async setTokenURI({ tokenId, uri }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.setTokenURI(tokenId, uri),
      options,
    );
  }

  /**
   * Get Pack If Information
   * @function
   * @param {Object} params Parameters
   * @param {number} params.packId
   * @returns {number} packId
   * @returns {number} packNumber
   * @returns {number} price
   * @returns {string} serie
   * @returns {string} drop
   * @returns {string} packType
   * @returns {Address} buyer
   * @returns {Address[] | Address} saleDistributionAddresses
   * @returns {Promise<number[] | number>} saleDistributionAmounts
   */
  async getPackbyId({ packId }) {
    const res = await this.getWeb3Contract().methods.getPackbyId(packId).call();

    return {
      packId,
      initialNFTId: parseInt(res[1], 10),
      price: Numbers.fromDecimals(res[2], 3), // 6),
      serie: res[3],
      drop: res[4],
      packType: res[5],
      buyer: res[6],
      saleDistributionAddresses: res[7],
      saleDistributionAmounts: res[8] ? res[8].map(a => parseInt(a, 10)) : [],
      opened: res[9],
    };
  }

  /**
   * Get Token IDs that were already bought via a pack
   * @function
   * @description Get Token IDs that were already bought via a pack
   * @param {Object} params Parameters
   * @param {Address} params.address
   * @returns {Array | Integer} TokensRegistered
   */
  async getRegisteredTokens({ address }) {
    const res = await this.getWeb3Contract().methods.getRegisteredIDs(address).call();

    return res.map(a => parseInt(a, 10));
  }

  /**
   * Verify if a Token was already minted
   * @function
   * @description Get Distribution Sales Description for ERC721 Marketplace Sales
   * @param {Object} params Parameters
   * @param {Integer} params.tokenid Token Id
   * @returns {Array | Integer} Distribution Amounts
   * @returns {Array | Address} Distribution Addresses
   */
  async getMarketplaceDistributionForERC721({ tokenId }) {
    const res = await this.getWeb3Contract().methods.getMarketplaceDistributionForERC721(tokenId).call();

    return {
      distributionAmounts: res[0].map(a => parseInt(a, 10)),
      distributionAddresses: res[1],
    };
  }

  /**
   * @function
   * @description Verify if a Token was already minted
   * @param {Object} params Parameters
   * @param {number} params.tokenId
   * @returns {Promise<boolean>} wasMinted
   */
  async exists({ tokenId }) {
    return await this.getWeb3Contract().methods.exists(tokenId).call();
  }

  /**
   * @function
   * @description Get Purchase Token Address
   * @returns {Address} Token Address
   */
  async getPurchaseToken() {
    return await this.getWeb3Contract().methods._purchaseToken().call();
  }

  /**
   * @function
   * @description Get Real Fvr Cost in USD
   * @returns {Integer} Price in Real Fvr Tokens
   */
  async getTokenWorthof1USD() {
    return Numbers.fromDecimals(
      await this.getWeb3Contract().methods._realFvrTokenPriceUSD().call(),
      this.getERC20Contract().getDecimals(),
    );
  }

  /**
   * Get Cost in Fvr Tokens of the Pack
   * @function
   * @param {Object} params Parameters
   * @param {number} params.packId
   * @returns {Promise<number>} Price in Real Fvr Tokens
   */
  async getPackPriceInFVR({ packId }) {
    return Numbers.fromDecimals(
      await this.getWeb3Contract().methods.getPackPriceInFVR(packId).call(),
      this.getERC20Contract().getDecimals(),
    );
  }

  /**
   * Get Amount of Packs Created
   * @function
   * @returns {Promise<number>} packsAmount
   */
  async getAmountOfPacksCreated() {
    return parseInt(
      await this.getWeb3Contract().methods.packIncrementId().call(),
      10,
    );
  }

  /**
   * Get Amount of Packs Opened
   * @function
   * @returns {Promise<number>} packsAmount
   */
  async getAmountOfPacksOpened() {
    return parseInt(
      await this.getWeb3Contract().methods._openedPacks().call(),
      10,
    );
  }

  /**
   * Get Amount of Tokens/NFTs Created (Inherent to the Packs)
   * @function
   * @returns {Promise<number>} tokensAmount
   */
  async getAmountOfTokensCreated() {
    return parseInt(
      await this.getWeb3Contract().methods.lastNFTID().call(),
      10,
    );
  }

  /**
   * User deploys the contract
   * @function
   * @param {Object} params Parameters
   * @param {string} params.name Name of the Contract
   * @param {string} params.symbol Symbol of the Contract
   * @param {Address} params.tokenAddress token Address of the purchase Token in use
   * @returns {Promise<boolean>} Success the Tx Object if operation was successful
   */
  deploy = async (
    { name, symbol, tokenAddress },
    options,
  ) => {
    const params = [name, symbol, tokenAddress];
    const res = await this.__deploy(params, options);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };

  /**
   * @function
   * @return ERC20Contract|undefined
   */
  getERC20Contract() {
    return this.params.ERC20Contract;
  }
}

export default OpenerRealFvr;
