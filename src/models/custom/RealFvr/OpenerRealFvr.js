import { openerRealFvr } from '../../../interfaces';
import Numbers from '../../../utils/Numbers';
import IContract from '../../IContract';
import ERC20Contract from '../../ERC20/ERC20Contract';

/**
 * @typedef {Object} OpenerRealFvr~Options
 * @property {Web3} web3
 * @property {string} [contractAddress]
 * @property {Account} [acc]
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

    // Set Token Address Contract for easy access
    this.params.ERC20Contract = new ERC20Contract({
      web3: this.web3,
      contractAddress: this.tokenAddress,
      acc: this.acc,
    });

    // Assert Token Contract
    await this.params.ERC20Contract.__assert();
  };

  /**
   * Buy Pack
   * @function
   * @param {Object} params Parameters
   * @param {number} params.packId Pack Id
   * @returns {Promise<Transaction>} Transaction
   */
  buyPack = async ({ packId }) => await this.__sendTx(
    this.params.contract.getContract().methods.buyPack(packId),
  );

  /**
   * Offer Pack
   * @function
   * @param {Object} params Parameters
   * @param {number} params.packId Pack Id
   * @param {Address} params.receivingAddress Pack Id number
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  offerPack = async ({ packId, receivingAddress }) => await this.__sendTx(
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
  createPack = async ({
    packNumber,
    nftAmount,
    price,
    serie,
    packType,
    drop,
    saleStart,
    saleDistributionAddresses,
    saleDistributionAmounts,
  }) => await this.__sendTx(
    this.params.contract
      .getContract()
      .methods.createPack(
        packNumber,
        parseInt(nftAmount, 10),
        String(price).toString(),
        serie,
        packType,
        drop,
        Numbers.timeToSmartContractTime(saleStart),
        saleDistributionAddresses,
        saleDistributionAmounts,
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
  editPackInfo = async ({
    packId, saleStart, price, serie, packType, drop,
  }) => await this.__sendTx(
    this.params.contract
      .getContract()
      .methods.createPack(
        packId,
        Numbers.timeToSmartContractTime(saleStart),
        serie,
        packType,
        drop,
        String(price).toString(),
      ),
  );

  /**
   * Delete Pack
   * @function
   * @param {Object} params Parameters
   * @param {number} params.packId Pack Id number
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  deletePackById = async ({ packId }) => await this.__sendTx(
    this.params.contract.getContract().methods.deletePackById(packId),
  );

  /**
   * Mint Token Id (After buying a pack)
   * @function
   * @param {Object} params Parameters
   * @param {number} params.tokenId Token ID
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  mint = async ({ tokenId }) => await this.__sendTx(
    this.params.contract.getContract().methods.mint(tokenId),
  );

  /**
   * Set Purchase Token
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.address Token Address
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  setPurchaseTokenAddress = async ({ address }) => await this.__sendTx(
    this.params.contract
      .getContract()
      .methods.setPurchaseTokenAddress(address),
  );

  /**
   * Lock the Contract
   * @function
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  lock = async () => await this.__sendTx(this.params.contract.getContract().methods.lock());

  /**
   * Unlock the Contract
   * @function
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  unlock = async () => await this.__sendTx(this.params.contract.getContract().methods.unlock());

  /**
   * Set Token Price of Real Fvr in USD --> 1*10**18 as input means 1 Real Fvr = $0.000001
   * @function
   * @param {Object} params Parameters
   * @param {Address} params.address Token Address
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  setTokenPriceInUSD = async ({ address }) => await this.__sendTx(
    this.params.contract
      .getContract()
      .methods.setPurchaseTokenAddress(address),
  );

  /**
   * Set Base Id URI
   * @function
   * @param {Object} params Parameters
   * @param {string} params.uri URI of the Token Id Metadata JSON
   * @returns {Promise<TransactionObject>} Success the Tx Object if operation was successful
   */
  setBaseURI = async ({ uri }) => await this.__sendTx(
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
  setTokenURI = async ({ tokenId, uri }) => await this.__sendTx(
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
      packNumber: parseInt(res[1], 10),
      initialNFTId: parseInt(res[2], 10),
      price: Numbers.fromDecimals(res[3], 6),
      serie: res[4],
      drop: res[5],
      packType: res[6],
      buyer: res[7],
      saleDistributionAddresses: res[8],
      saleDistributionAmounts: res[9] ? res[9].map(a => parseInt(a, 10)) : [],
    };
  };

  /**
   * Get Token IDs that were already bought via a pack
   * @function
   * @returns {Promise<number[] | number>} TokensRegistered
   */
  getRegisteredTokens = async () => {
    const res = await
    this.params.contract.getContract()
      .methods.getRegisteredIDs().call();

    return res.map(a => parseInt(a, 10));
  };

  /**
   * Verify if a Token was already minted
   * @function
   * @param {Object} params Parameters
   * @param {number} params.tokenId
   * @returns {Promise<boolean>} wasMinted
   */
  exists = async ({ tokenId }) => await
  this.params.contract.getContract()
    .methods.exists(tokenId).call();


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
    await this.params.contract.getContract().methods.packIncrementId().call(), 10,
  );

  /**
   * Get Amount of Packs Opened
   * @function
   * @returns {Promise<number>} packsAmount
   */
  getAmountOfPacksOpened = async () => parseInt(
    await this.params.contract.getContract().methods._openedPacks().call(), 10,
  );

  /**
   * Get Amount of Tokens/NFTs Created (Inherent to the Packs)
   * @function
   * @returns {Promise<number>} tokensAmount
   */
  getAmountOfTokensCreated = async () => parseInt(
    await this.params.contract.getContract().methods.lastNFTID().call(), 10,
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
