import _ from 'lodash';
import { marketplaceRealFvr } from '../../../interfaces';
import Numbers from '../../../utils/Numbers';
import IContract from '../../IContract';
import ERC20Contract from '../../ERC20/ERC20Contract';
import ERC721Standard from '../../ERC721/ERC721Contract';

/**
 * MarketplaceRealFvr Object
 * @class MarketplaceRealFvr
 * @param {Object} params Parameters
 * @param {Address} params.contractAddress Contract Address (If Deployed)
 */
class MarketplaceRealFvr extends IContract {
  constructor(params = {}) {
    super({ abi: marketplaceRealFvr, ...params });
  }

  __assert = async () => {
    if (!this.getAddress()) {
      throw new Error(
        'Contract is not deployed, first deploy it and provide a contract address',
      );
    }
    // Use ABI
    this.params.contract.use(marketplaceRealFvr, this.getAddress());

    this.params.tokenAddress = await this.getERC20TokenAddress();
    this.params.erc721Address = await this.getERC721TokenAddress();

    // Set Token Address Contract for easy access
    this.params.ERC20Contract = new ERC20Contract({
      web3: this.web3,
      contractAddress: this.params.tokenAddress,
      acc: this.acc,
    });


    // Set Token Address Contract for easy access
    this.params.ERC721Contract = new ERC721Standard({
      web3: this.web3,
      contractAddress: this.params.tokenAddress,
      acc: this.acc,
    });

    try {
      // Assert Token Contract
      await this.params.ERC20Contract.__assert();
      await this.params.ERC721Contract.__assert();
    } catch (err) {
      throw new Error(`Problem on ERC20 Assert, confirm ERC20 'tokenAddress'${err}`);
    }
  };

  /**
   * @function
   * @description Put ERC721 on Sale
   * @param {Object} params Parameters
   * @param {String} params.tokenId Token Id
   * @param {String} params.price Price (Token Amount)
   * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
  putERC721OnSale = async ({ tokenId, price }) => await this.__sendTx(
    this.params.contract.getContract().methods.putERC721OnSale(tokenId,
      Numbers.toSmartContractDecimals(
        price,
        this.getERC20Contract().getDecimals(),
      )),
  );

  /**
     * @function
     * @description Remove ERC721 from Sale
     * @param {Object} params Parameters
     * @param {String} params.tokenId Token Id
     * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
    removeERC721FromSale = async ({ tokenId }) => await this.__sendTx(
      this.params.contract.getContract().methods.removeERC721FromSale(tokenId),
    );

    /**
     * @function
     * @description Buy ERC721 from Sale
     * @param {Object} params Parameters
     * @param {String} params.tokenId Token Id
     * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
    buyERC721 = async ({ tokenId }) => await this.__sendTx(
      this.params.contract.getContract().methods.buyERC721(tokenId),
    );

    /**
     * @function
     * @description Change ERC20 Address
     * @param {Object} params Parameters
     * @param {String} params.erc20TokenAddress ERC20TokenAddress
     * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
    changeERC20 = async ({ erc20TokenAddress }) => await this.__sendTx(
      this.params.contract.getContract().methods.changeERC20(erc20TokenAddress),
    );

    /**
     * @function
     * @description Change ERC20 Address
     * @param {Object} params Parameters
     * @param {String} params.erc721TokenAddress ERC721TokenAddress
     * @returns {TransactionObject} Success the Tx Object if operation was successful
    */
     changeERC721 = async ({ erc721TokenAddress }) => await this.__sendTx(
       this.params.contract.getContract().methods.changeERC721(erc721TokenAddress),
     );

    /**
     * @function
     * @description Change ERC20 Address
     * @param {Object} params Parameters
     * @param {String} params.feeAddress Fee Address
     * @param {String} params.feePercentage Fee Percentage (1 = 1%)
     * @returns {TransactionObject} Success the Tx Object if operation was successful
    */
    setFixedFees = async ({ feeAddress, feePercentage }) => await this.__sendTx(
      this.params.contract.getContract().methods.setFixedFees(feeAddress, feePercentage),
    );

    /**
     * @function
     * @description Get ERC20 Token Address
     * @returns {Address} Token Address
     */
    getERC20TokenAddress = async () => await this.params.contract.getContract().methods.erc20Address().call();

    /**
     * @function
     * @description Get ERC721 Token Address
     * @returns {Address} Token Address
     */
    getERC721TokenAddress = async () => await this.params.contract.getContract().methods.erc721Address().call();

    /**
     * @function
     * @description Get FeeAddress
     * @returns {Address} Fee Address
    */
    getFeeAddress = async () => await this.params.contract.getContract().methods.feeAddress().call();

    /**
     * @function
     * @description Get Amount of ERC721s ever in sale
     * @returns {Integer} Amount of NFTs in Sale
     */
    getAmountofNFTsEverInSale = async () => {
      parseInt(
        await this.params.contract.getContract().methods.saleIncrementId().call(), 10,
      ) - 1;
    }


    /**
     * @function
     * @description Approve ERC721 to be put on Sale
     * @param {Object} params Parameters
     * @param {Address} params.to Address To
     * @param {String} params.tokenId Token Id
     * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
    approveERC721use = async ({ to, tokenId }) => await this.getERC721Contract().approve({ to, tokenId })

    /**
     * @function
     * @description User deploys the contract
     * @param {Object} params Parameters
     * @param {Address} params.erc20TokenAddress Address of the Contract - Optional (Dont insert if you want to use ETH or BNB or the native currency)
     * @param {Address} params.erc721TokenAddress Address of the Contract
     * @returns {Boolean} Success the Tx Object if operation was successful
     */
    deploy = async ({
      erc20TokenAddress = '0x0000000000000000000000000000000000000000', erc721TokenAddress, callback,
    }) => {
      const params = [erc20TokenAddress, erc721TokenAddress];
      const res = await this.__deploy(params, callback);
      this.params.contractAddress = res.contractAddress;
      /* Call to Backend API */
      await this.__assert();
      return res;
    };

    getERC20Contract = () => this.params.ERC20Contract;

    getERC721Contract = () => this.params.ERC721Contract;
}

export default MarketplaceRealFvr;
