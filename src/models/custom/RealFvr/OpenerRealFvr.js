import _ from 'lodash';
import { openerRealFvr } from '../../../interfaces';
import Numbers from '../../../utils/Numbers';
import IContract from '../../IContract';
import ERC20Contract from '../../ERC20/ERC20Contract';

/**
 * OpenerRealFvr Object
 * @class OpenerRealFvr
 * @param {Object} params Parameters
 * @param {Address} params.contractAddress Contract Address (If Deployed)
 * @param {Address} params.tokenAddress Token Purchase Address
 */
class OpenerRealFvr extends IContract {
  constructor(params = {}) {
    super({ abi: openerRealFvr, ...params });
  }

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
      web3: this.web3,
      contractAddress: this.params.tokenAddress,
      acc: this.acc,
    });
    try {
      // Assert Token Contract
      await this.params.ERC20Contract.__assert();
    } catch (err) {
      throw new Error(`Problem on ERC20 Assert, confirm ERC20 'tokenAddress'${err}`);
    }
  };

  /**
   * @function
   * @description Buy Pack
   * @param {Object} params Parameters
   * @param {Integer} params.packId Pack Id
   * @returns {Transaction} Transaction
   */
  buyPack = async ({ packId }) => await this.__sendTx(
    this.params.contract.getContract().methods.buyPack(packId),
  );

  /**
   * @function
   * @description Open Pack
   * @param {Object} params Parameters
   * @param {Integer} params.packId Pack Id
   * @returns {Transaction} Transaction
   */
   openPack = async ({ packId }) => await this.__sendTx(
     this.params.contract.getContract().methods.openPack(packId),
   );

  /**
   * @function
   * @description Offer Pack
   * @param {Object} params Parameters
   * @param {Integer} params.packId Pack Id
   * @param {Address} params.receivingAddress Pack Id Integer
   * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
  offerPack = async ({ packId, receivingAddress }) => await this.__sendTx(
    this.params.contract
      .getContract()
      .methods.offerPack(packId, receivingAddress),
  );

  /**
   * @function
   * @description Create Pack
   * @param {Object} params Parameters
   * @param {Integer} params.nftAmount Amount of NFTs/Tokens
   * @param {Integer} params.price Price of Pack (100 = $1; 1 = $0.01)
   * @param {String} params.serie Serie of Pack
   * @param {String} params.packType Pack Type
   * @param {String} params.drop Pack Drop
   * @param {Date} params.saleStart Start Date
   * @param {Address | Array} params.saleDistributionAddresses Revenue Addresses of the First Purchase
   * @param {Integer | Array} params.saleDistributionAmounts Revenue Amounts of the First Purchase
   * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
  createPack = async ({
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
        parseInt(nftAmount, 10),
        Numbers.toSmartContractDecimals(price, 3),
        serie,
        packType,
        drop,
        Numbers.timeToSmartContractTime(saleStart),
        saleDistributionAddresses,
        saleDistributionAmounts,
      ),
  );

  /**
   * @function
   * @description Edit Pack Info
   * @param {Object} params Parameters
   * @param {Integer} params.packId Pack Number
   * @param {Date} params.saleStart Time of Start of the Sale
   * @param {String} params.serie Serie of Pack
   * @param {String} params.packType Pack Type
   * @param {String} params.drop Pack Drop
   * @param {Integer} params.price Pack Price
   * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
  editPackInfo = async ({
    packId, saleStart, price, serie, packType, drop,
  }) => await this.__sendTx(
    this.params.contract
      .getContract()
      .methods.editPackInfo(
        packId,
        Numbers.timeToSmartContractTime(saleStart),
        serie,
        packType,
        drop,
        Numbers.toSmartContractDecimals(price, 3)
      ),
  );

  /**
   * @function
   * @description Delete Pack
   * @param {Object} params Parameters
   * @param {Integer} params.packId Pack Id Integer
   * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
  deletePackById = async ({ packId }) => await this.__sendTx(
    this.params.contract.getContract().methods.deletePackById(packId),
  );

  /**
   * @function
   * @description Mint Token Id (After buying a pack)
   * @param {Object} params Parameters
   * @param {Integer} params.tokenId Token ID
   * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
  mint = async ({ tokenId }) => await this.__sendTx(
    this.params.contract.getContract().methods.mint(tokenId),
  );

  /**
   * @function
   * @description Set Purchase Token
   * @param {Object} params Parameters
   * @param {Address} params.address Token Address
   * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
  setPurchaseTokenAddress = async ({ address }) => await this.__sendTx(
    this.params.contract
      .getContract()
      .methods.setPurchaseTokenAddress(address),
  );

  /**
   * @function
   * @description Lock the Contract
   * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
  lock = async () => await this.__sendTx(this.params.contract.getContract().methods.lock());

  /**
   * @function
   * @description Unlock the Contract
   * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
  unlock = async () => await this.__sendTx(this.params.contract.getContract().methods.unlock());

  /**
   * @function
   * @description Set Token Price of Real Fvr in USD --> 1*10**18 as input means 1 Real Fvr = $0.000001
   * @param {Object} params Parameters
   * @param {Price} params.price Token Price
   * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
  setTokenWorthof1USD = async ({ price }) => await this.__sendTx(
    this.params.contract
      .getContract()
      .methods.setTokenPriceInUSD(price),
  );

  /**
   * @function
   * @description Set Base Id URI
   * @param {Object} params Parameters
   * @param {String} params.uri URI of the Token Id Metadata JSON
   * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
  setBaseURI = async ({ uri }) => await this.__sendTx(
    this.params.contract.getContract().methods.setBaseURI(uri),
  );

  /**
   * @function
   * @description Set Specific Token Id URI
   * @param {Object} params Parameters
   * @param {Integer} params.tokenId Token ID
   * @param {String} params.uri URI of the Token Id Metadata JSON
   * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
  setTokenURI = async ({ tokenId, uri }) => await this.__sendTx(
    this.params.contract.getContract().methods.setTokenURI(tokenId, uri),
  );

  /**
   * @function
   * @description Get Pack If Information
   * @param {Object} params Parameters
   * @param {Integer} params.packId
   * @returns {Integer} packId
   * @returns {Integer} price
   * @returns {String} serie
   * @returns {String} drop
   * @returns {String} packType
   * @returns {Address} buyer
   * @returns {Array | Address} saleDistributionAddresses
   * @returns {Array | Integer} saleDistributionAmounts
   * @returns {Bool} opened
   */
  getPackbyId = async ({ packId }) => {
    const res = await this.params.contract
      .getContract()
      .methods.getPackbyId(packId)
      .call();

    return {
      packId,
      initialNFTId: parseInt(res[1], 10),
      price: Numbers.fromDecimals(res[2], 3),
      serie: res[3],
      drop: res[4],
      packType: res[5],
      buyer: res[6],
      saleDistributionAddresses: res[7],
      saleDistributionAmounts: res[8] ? res[8].map(a => parseInt(a, 10)) : [],
      opened: res[9],
    };
  };

  /**
   * @function
   * @description Get Token IDs that were already bought via a pack
   * @returns {Array | Integer} TokensRegistered
   */
  getRegisteredTokens = async () => {
    const res = await this.params.contract
      .getContract()
      .methods.getRegisteredIDs()
      .call();

    return res.map(a => parseInt(a, 10));
  };

  /**
   * @function
   * @description Verify if a Token was already minted
   * @param {Object} params Parameters
   * @param {Integer} params.tokenId
   * @returns {Bool} wasMinted
   */
  exists = async ({ tokenId }) => await this.params.contract.getContract().methods.exists(tokenId).call();


  /**
   * @function
   * @description Get Purchase Token Address
   * @returns {Address} Token Address
   */
  getPurchaseToken = async () => await this.params.contract.getContract().methods._purchaseToken().call();

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
   * @function
   * @description Get Cost in Fvr Tokens of the Pack
   * @param {Object} params Parameters
   * @param {Integer} params.packId
   * @returns {Integer} Price in Real Fvr Tokens
   */
  getPackPriceInFVR = async ({ packId }) => Numbers.fromDecimals(
    await this.params.contract
      .getContract()
      .methods.getPackPriceInFVR(packId)
      .call(),
    this.getERC20Contract().getDecimals(),
  );

  /**
   * @function
   * @description Get Amount of Packs Created
   * @returns {Integer} packsAmount
   */
  getAmountOfPacksCreated = async () => parseInt(
    await this.params.contract.getContract().methods.packIncrementId().call(), 10,
  );

  /**
   * @function
   * @description Get Amount of Packs Opened
   * @returns {Integer} packsAmount
   */
  getAmountOfPacksOpened = async () => parseInt(
    await this.params.contract.getContract().methods._openedPacks().call(), 10,
  );

  /**
   * @function
   * @description Get Amount of Tokens/NFTs Created (Inherent to the Packs)
   * @returns {Integer} tokensAmount
   */
  getAmountOfTokensCreated = async () => parseInt(
    await this.params.contract.getContract().methods.lastNFTID().call(), 10,
  );

  /**
   * @function
   * @description User deploys the contract
   * @param {Object} params Parameters
   * @param {String} params.name Name of the Contract
   * @param {String} params.symbol Symbol of the Contract
   * @param {Address} params.tokenAddress token Address of the purchase Token in use
   * @returns {Boolean} Success the Tx Object if operation was successful
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

  getERC20Contract = () => this.params.ERC20Contract;
}

export default OpenerRealFvr;
