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
      throw new Error(`Problem on ERC20 Assert, confirm ERC20 'tokenAddress'${err}`);
    }
  };

  /**
   * Buy Pack
   * @function
   * @param {Object} params Parameters
   * @param {number} params.packId Pack Id
   * @returns {Promise<Transaction>} Transaction
   */
  buyPack = ({ packId }) => this.__sendTx(
    this.params.contract.getContract().methods.buyPack(packId),
  );

  /**
   * Offer Pack
   * @function
   * @description Buy Packs
   * @param {Object} params Parameters
   * @param {Array | Integer} params.packIds Pack Id
   * @returns {Transaction} Transaction
   */
  buyPacks = ({ packIds }) => this.__sendTx(
    this.params.contract.getContract().methods.buyPacks(packIds),
  );

  /**
   * @function
   * @description Open Pack
   * @param {Object} params Parameters
   * @param {Integer} params.packId Pack Id
   * @returns {Transaction} Transaction
   */
  openPack = ({ packId }) => this.__sendTx(
    this.params.contract.getContract().methods.openPack(packId),
  );

  /**
   * @function
   * @description Open Packs
   * @param {Object} params Parameters
   * @param {Array | Integer} params.packIds Pack Id
   * @returns {Transaction} Transaction
   */
  openPacks = ({ packIds }) => this.__sendTx(
    this.params.contract.getContract().methods.openPacks(packIds),
  );

  /**
   * @function
   * @description Offer Pack
   * @param {Object} params Parameters
   * @param {number} params.packId Pack Id
   * @param {Address} params.receivingAddress Pack Id number
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  offerPack = ({ packId, receivingAddress }) => this.__sendTx(
    this.params.contract
      .getContract()
      .methods.offerPack(packId, receivingAddress),
  );

  /**
   * Create Pack
   * @function
   * @param {Object} params Parameters
   * @param {number} params.packNumber Pack Number
   * @param {number} params.nftAmount Amount of NFTs/Tokens
   * @param {number} params.price Price of Pack
   * @param {string} params.serie Serie of Pack
   * @param {string} params.packType Pack Type
   * @param {string} params.drop Pack Drop
   * @param {Date} params.saleStart Start Date
   * @param {Address | Address[]} params.saleDistributionAddresses Revenue Addresses of the First Purchase
   * @param {number | number[]} params.saleDistributionAmounts Revenue Amounts of the First Purchase
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  createPack = ({
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
  }) => this.__sendTx(
    this.params.contract
      .getContract()
      .methods.createPack(
        parseInt(nftAmount, 10),
        Numbers.toSmartContractDecimals(price, 3),
        serie,
        packType,
        drop,
        Numbers.timeToSmartContractTime(saleStart),
        saleDistributionAddresses,
        saleDistributionAmounts,
        marketplaceDistributionAddresses,
        marketplaceDistributionAmounts,
      ),
  );

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
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  editPackInfo = ({
    packId, saleStart, price, serie, packType, drop,
  }) => this.__sendTx(
    this.params.contract
      .getContract()
      .methods.editPackInfo(
        packId,
        Numbers.timeToSmartContractTime(saleStart),
        serie,
        packType,
        drop,
        Numbers.toSmartContractDecimals(price, 3),
      ),
  );

  /**
   * Delete Pack
   * @function
   * @param {Object} params Parameters
   * @param {number} params.packId Pack Id number
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  deletePackById = ({ packId }) => this.__sendTx(
    this.params.contract.getContract().methods.deletePackById(packId),
  );

  /**
   * Mint Token Id (After buying a pack)
   * @function
   * @param {Object} params Parameters
   * @param {number} params.tokenId Token ID
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  mint = ({ tokenId }) => this.__sendTx(
    this.params.contract.getContract().methods.mint(tokenId),
  );

  /**
   * Set Purchase Token
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.address Token Address
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  setPurchaseTokenAddress = ({ address }) => this.__sendTx(
    this.params.contract
      .getContract()
      .methods.setPurchaseTokenAddress(address),
  );

  /**
   * Lock the Contract
   * @function
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  lock = () => this.__sendTx(this.params.contract.getContract().methods.lock());

  /**
   * Unlock the Contract
   * @function
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  unlock = () => this.__sendTx(this.params.contract.getContract().methods.unlock());

  /**
   * Set Token Price of Real Fvr in USD --> 1*10**18 as input means 1 Real Fvr = $0.000001
   * @function
   * @param {Object} params Parameters
   * @param {Price} params.price Token Price
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  setTokenWorthof1USD = ({ price }) => this.__sendTx(
    this.params.contract
      .getContract()
      .methods.setTokenPriceInUSD(price),
  );

  /**
   * Set Base Id URI
   * @function
   * @param {Object} params Parameters
   * @param {string} params.uri URI of the Token Id Metadata JSON
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  setBaseURI = ({ uri }) => this.__sendTx(
    this.params.contract.getContract().methods.setBaseURI(uri),
  );

  /**
   * Set Specific Token Id URI
   * @function
   * @param {Object} params Parameters
   * @param {number} params.tokenId Token ID
   * @param {string} params.uri URI of the Token Id Metadata JSON
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  setTokenURI = ({ tokenId, uri }) => this.__sendTx(
    this.params.contract.getContract().methods.setTokenURI(tokenId, uri),
  );

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
  getPackbyId = async ({ packId }) => {
    const res = await
    this.params.contract.getContract()
      .methods.getPackbyId(packId).call();

    return {
      packId,
      initialNFTId: parseInt(res[1], 10),
      price: Numbers.fromDecimals(res[2], 3),
      serie: res[3],
      drop: res[4],
      packType: res[5],
      buyer: res[6],
      saleDistributionAddresses: res[7],
      saleDistributionAmounts: res[8] ? res[8].map((a) => parseInt(a, 10)) : [],
      opened: res[9],
    };
  };

  /**
   * Get Token IDs that were already bought via a pack
   * @function
   * @description Get Token IDs that were already bought via a pack
   * @param {Object} params Parameters
   * @param {Address} params.address
   * @returns {Array | Integer} TokensRegistered
   */
  getRegisteredTokens = async ({ address }) => {
    const res = await this.params.contract
      .getContract()
      .methods.getRegisteredIDs(address)
      .call();

    return res.map((a) => parseInt(a, 10));
  };

  /**
   * Verify if a Token was already minted
   * @function
   * @description Get Distribution Sales Description for ERC721 Marketplace Sales
   * @param {Object} params Parameters
   * @param {Integer} params.tokenid Token Id
   * @returns {Array | Integer} Distribution Amounts
   * @returns {Array | Address} Distribution Addresses
   */
  getMarketplaceDistributionForERC721 = async ({ tokenId }) => {
    const res = await this.params.contract
      .getContract()
      .methods.getMarketplaceDistributionForERC721(tokenId)
      .call();

    return {
      distributionAmounts: res[0].map((a) => parseInt(a, 10)),
      distributionAddresses: res[1],
    };
  };

  /**
   * @function
   * @description Verify if a Token was already minted
   * @param {Object} params Parameters
   * @param {number} params.tokenId
   * @returns {Promise<boolean>} wasMinted
   */
  exists = ({ tokenId }) => this.params.contract
    .getContract()
    .methods.exists(tokenId)
    .call();

  /**
   * @function
   * @description Get Purchase Token Address
   * @returns {Address} Token Address
   */
  getPurchaseToken = () => this.params.contract.getContract().methods._purchaseToken().call();

  /**
   * @function
   * @description Get Real Fvr Cost in USD
   * @returns {Integer} Price in Real Fvr Tokens
   */
  getTokenWorthof1USD = async () => Numbers.fromDecimals(
    await this.params.contract
      .getContract()
      .methods._realFvrTokenPriceUSD()
      .call(),
    this.getERC20Contract().getDecimals(),
  );

  /**
   * Get Cost in Fvr Tokens of the Pack
   * @function
   * @param {Object} params Parameters
   * @param {number} params.packId
   * @returns {Promise<number>} Price in Real Fvr Tokens
   */
  getPackPriceInFVR = async ({ packId }) => Numbers.fromDecimals(await
  this.params.contract.getContract()
    .methods.getPackPriceInFVR(packId).call(), this.getERC20Contract().getDecimals());

  /**
   * Get Amount of Packs Created
   * @function
   * @returns {Promise<number>} packsAmount
   */
  getAmountOfPacksCreated = async () => parseInt(
    await this.params.contract.getContract().methods.packIncrementId().call(),
    10,
  );

  /**
   * Get Amount of Packs Opened
   * @function
   * @returns {Promise<number>} packsAmount
   */
  getAmountOfPacksOpened = async () => parseInt(
    await this.params.contract.getContract().methods._openedPacks().call(),
    10,
  );

  /**
   * Get Amount of Tokens/NFTs Created (Inherent to the Packs)
   * @function
   * @returns {Promise<number>} tokensAmount
   */
  getAmountOfTokensCreated = async () => parseInt(
    await this.params.contract.getContract().methods.lastNFTID().call(),
    10,
  );

  /**
   * User deploys the contract
   * @function
   * @param {Object} params Parameters
   * @param {string} params.name Name of the Contract
   * @param {string} params.symbol Symbol of the Contract
   * @param {Address} params.tokenAddress token Address of the purchase Token in use
   * @returns {Promise<boolean>} Success the Tx Object if operation was successful
   */
  deploy = async ({
    name, symbol, tokenAddress, callback,
  }) => {
    const params = [name, symbol, tokenAddress];
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

export default OpenerRealFvr;
