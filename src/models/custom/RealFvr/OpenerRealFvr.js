import { openerRealFvr } from "../../interfaces";
import Numbers from "../../utils/Numbers";
import _ from "lodash";
import IContract from '../IContract';
import ERC20Contract from '../ERC20/ERC20Contract';

/**
 * OpenerRealFvr Object
 * @class OpenerRealFvr
 * @param params.web3 {Web3}
 * @param params.contractAddress {Address}
 * @param params.acc {*}
 * @param params.realFvrAddress {*}
 * @param params.abi {realFvr}
 */
class OpenerRealFvr extends IContract {
  constructor(params) {
    super({abi: openerRealFvr, ...params});
  }

  __assert = async () => {
    if (!this.getAddress()) {
      throw new Error("Contract is not deployed, first deploy it and provide a contract address");
    }

    // Use ABI
    this.params.contract.use(openerRealFvr, this.getAddress());

    // Set Token Address Contract for easy access
    this.params.ERC20Contract = new ERC20Contract({
      web3: this.web3,
      contractAddress: this.realFvrAddress,
      acc: this.acc
    });

    // Assert Token Contract
    await this.params.ERC20Contract.__assert();
  }

  /**
	 * @description Buy Pack 
	 * @param {Integer} packId Pack Id Integer
	 * @returns {TransactionObject} Success the Tx Object if operation was successful
	 */
   buyPack = async ({packId}) => {
    return await this.__sendTx(this.params.contract.getContract().methods.buyPack(packId));
  };

  /**
   * @description Offer Pack 
   * @param {Integer} packId Pack Id Integer
   * @param {Address} receivingAddress Pack Id Integer
   * @returns {TransactionObject} Success the Tx Object if operation was successful
  */
  offerPack = async ({packId, receivingAddress}) => {
    return await this.__sendTx(this.params.contract.getContract().methods.offerPack(packId, receivingAddress));
  };

  /**
	 * @description Create Pack 
	 * @param {Integer} packNumber Pack Number
	 * @param {Integer} nftAmount Amount of NFTs/Tokens
	 * @param {Integer} price Price of Pack
	 * @param {String} serie Serie of Pack
	 * @param {String} packType Pack Type
	 * @param {String} drop Pack Drop
	 * @param {Date} saleStart Start Date
	 * @param {Address} saleDistributionAddresses Revenue Addresses of the First Purchase
	 * @param {Integer} saleDistributionAmounts Revenue Amounts of the First Purchase
	 * @returns {TransactionObject} Success the Tx Object if operation was successful
	 */
   createPack = async ({packNumber, nftAmount, price, serie, packType, drop, 
    saleStart, saleDistributionAddresses, saleDistributionAmounts}) => {
    return await this.__sendTx(this.params.contract.getContract().methods.createPack(
      packNumber, 
      parseInt(nftAmount),
      String(price).toString(),
      serie,
      packType,
      drop,
      Numbers.timeToSmartContractTime(saleStart),
      saleDistributionAddresses,
      saleDistributionAmounts
    ));
  };

  /**
	 * @description Edit Pack Info 
	 * @param {Integer} packId Pack Number
	 * @param {Date} saleStart Time of Start of the Sale
	 * @param {String} serie Serie of Pack
	 * @param {String} packType Pack Type
	 * @param {String} drop Pack Drop
	 * @param {Integer} price Pack Price
	 * @returns {TransactionObject} Success the Tx Object if operation was successful
	 */
  editPackInfo = async ({packId, saleStart, price, serie, packType, drop}) => {
    return await this.__sendTx(this.params.contract.getContract().methods.createPack(
      packId, 
      Numbers.timeToSmartContractTime(saleStart),
      serie,
      packType,
      drop,
      String(price).toString()
    ));
  };

  /**
   * @description Delete Pack 
   * @param {Integer} packId Pack Id Integer
   * @returns {TransactionObject} Success the Tx Object if operation was successful
  */
   deletePackById = async ({packId}) => {
    return await this.__sendTx(this.params.contract.getContract().methods.deletePackById(packId));
  };

  /**
   * @description Mint Token Id (After buying a pack)
   * @param {Integer} tokenId Token ID
   * @returns {TransactionObject} Success the Tx Object if operation was successful
  */
  mint = async ({tokenId}) => {
    return await this.__sendTx(this.params.contract.getContract().methods.mint(tokenId));
  };

  /**
   * @description Set Purchase Token 
   * @param {Address} address Token Address
   * @returns {TransactionObject} Success the Tx Object if operation was successful
  */
   setPurchaseTokenAddress = async ({address}) => {
    return await this.__sendTx(this.params.contract.getContract().methods.setPurchaseTokenAddress(address));
  };

  /**
   * @description Lock the Contract
   * @returns {TransactionObject} Success the Tx Object if operation was successful
  */
   lock = async () => {
    return await this.__sendTx(this.params.contract.getContract().methods.lock());
  };

  /**
   * @description Unlock the Contract
   * @returns {TransactionObject} Success the Tx Object if operation was successful
  */
   unlock = async () => {
    return await this.__sendTx(this.params.contract.getContract().methods.unlock());
  };

  /**
   * @description Set Token Price of Real Fvr in USD --> 1*10**18 as input means 1 Real Fvr = $0.000001
   * @param {Address} address Token Address
   * @returns {TransactionObject} Success the Tx Object if operation was successful
  */
   setTokenPriceInUSD = async ({address}) => {
    return await this.__sendTx(this.params.contract.getContract().methods.setPurchaseTokenAddress(address));
  };

  /**
   * @description Set Base Id URI
   * @param {String} uri URI of the Token Id Metadata JSON
   * @returns {TransactionObject} Success the Tx Object if operation was successful
  */
   setBaseURI = async ({uri}) => {
    return await this.__sendTx(this.params.contract.getContract().methods.setBaseURI(uri));
  };

  /**
   * @description Set Specific Token Id URI
   * @param {Integer} tokenId Token ID
   * @param {String} uri URI of the Token Id Metadata JSON
   * @returns {TransactionObject} Success the Tx Object if operation was successful
  */
   setTokenURI = async ({tokenId, uri}) => {
    return await this.__sendTx(this.params.contract.getContract().methods.setTokenURI(tokenId, uri));
  };

  /**
   * @function
   * @description Get Pack If Information
   * @param {Integer} packId
   * @returns {Integer} packId
   * @returns {Integer} packNumber
   * @returns {Integer} price
   * @returns {String} serie
   * @returns {String} drop
   * @returns {String} packType
   * @returns {Address} buyer
   * @returns {Array | Address} saleDistributionAddresses
   * @returns {Array | Integer} saleDistributionAmounts
  */
   getPackbyId = async ({ packId }) => {
    let res = await 
      this.params.contract.getContract()
      .methods.getPackbyId(packId).call();

    return {
        packId : packId,
        packNumber: parseInt(res[1]),
        initialNFTId: parseInt(res[2]),
        price: Numbers.fromDecimals(res[3], 6),
        serie: res[4],
        drop: res[5],
        packType: res[6],
        buyer: res[7],
        saleDistributionAddresses: res[8],
        saleDistributionAmounts: res[9] ? res[9].map( a => parseInt(a)) : [],
    }
  }

  /**
   * @function
   * @description Get Token IDs that were already bought via a pack
   * @returns {Array | Integer} TokensRegistered
  */
   getRegisteredTokens = async () => {
    let res = await 
      this.params.contract.getContract()
      .methods.getRegisteredIDs().call();

    return res.map( a => parseInt(a))
  }

  /**
   * @function
   * @description Verify if a Token was already minted
   * @param {Integer} tokenId 
   * @returns {Bool} wasMinted
  */
   exists = async ({tokenId}) => {
    return await 
      this.params.contract.getContract()
      .methods.exists(tokenId).call();
  }

   /**
   * @function
   * @description Get Cost in Fvr Tokens of the Pack
   * @param {Integer} packId 
   * @returns {Integer} Price in Real Fvr Tokens
  */
  getPackPriceInFVR = async ({packId}) => {
    return Numbers.fromDecimals(await 
      this.params.contract.getContract()
      .methods.getPackPriceInFVR(packId).call(), this.getERC20Contract().getDecimals());
  }

  /**
   * @function
   * @description Get Amount of Packs Created
   * @returns {Integer} packsAmount
  */
  getAmountOfPacksCreated = async () => {
    return parseInt(await 
      this.params.contract.getContract()
      .methods.packIncrementId().call());
  }

  /**
   * @function
   * @description Get Amount of Packs Opened
   * @returns {Integer} packsAmount
  */
   getAmountOfPacksOpened = async () => {
    return parseInt(await 
      this.params.contract.getContract()
      .methods._openedPacks().call());
  }

  /**
   * @function
   * @description Get Amount of Tokens/NFTs Created (Inherent to the Packs)
   * @returns {Integer} tokensAmount
  */
  getAmountOfTokensCreated = async () => {
    return parseInt(await 
      this.params.contract.getContract()
      .methods.lastNFTID().call());
  }

	/**
	 * @description User deploys the contract
	 * @param {String} name Name of the Contract
	 * @param {String} symbol Symbol of the Contract
	 * @param {Address} tokenAddress token Address of the purchase Token in use
	 * @returns {Boolean} Success the Tx Object if operation was successful
	 */
  deploy = async ({name, symbol, tokenAddress, callback}) => {
    let params = [name, symbol, tokenAddress];
    let res = await this.__deploy(params, callback);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };

  getERC20Contract = () => this.params.ERC20Contract;

}

export default OpenerRealFvr;
