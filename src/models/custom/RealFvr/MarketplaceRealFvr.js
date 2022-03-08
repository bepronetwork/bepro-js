import { marketplaceRealFvr } from '../../../interfaces';
import Numbers from '../../../utils/Numbers';
import IContract from '../../IContract';
import ERC20Contract from '../../ERC20/ERC20Contract';
import ERC721Standard from '../../ERC721/ERC721Standard';

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

    if (!this.isETHTransaction) {
      // Set Token Address Contract for easy access
      this.params.ERC20Contract = new ERC20Contract({
        acc: this.acc,
        contractAddress: this.params.tokenAddress,
        web3Connection: this.web3Connection,
      });

      try {
        // Assert Token Contract
        await this.params.ERC20Contract.__assert();
      } catch (err) {
        throw new Error(`Problem on ERC20 Assert, confirm ERC20 'tokenAddress'${err}`);
      }
    }

    // Set Token Address Contract for easy access
    this.params.ERC721Standard = new ERC721Standard({
      acc: this.acc,
      contractAddress: this.params.tokenAddress,
      web3Connection: this.web3Connection,
    });

    try {
      // Assert Token Contract
      await this.params.ERC721Standard.__assert();
    } catch (err) {
      throw new Error(`Problem on ERC721 Assert, confirm ERC721 'tokenAddress'${err}`);
    }
  };

  isETHTransaction() {
    return this.params.tokenAddress === '0x0000000000000000000000000000000000000000';
  }

  /**
   * @function
   * @description Put ERC721 on Sale
   * @param {Object} params Parameters
   * @param {String} params.tokenId Token Id
   * @param {String} params.price Price (Token Amount)
   * @param {IContract~TxOptions} options
   * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
  async putERC721OnSale({ tokenId, price }, options) {
    const valueWithDecimals = Numbers.toSmartContractDecimals(
      price,
      await this.isETHTransaction() ? 18 : this.getERC20Contract().getDecimals(),
    );

    return await this.__sendTx(
      this.getWeb3Contract().methods.putERC721OnSale(tokenId, valueWithDecimals),
      options,
    );
  }

  /**
   * @function
   * @description Remove ERC721 from Sale
   * @param {Object} params Parameters
   * @param {String} params.tokenId Token Id
   * @param {IContract~TxOptions} options
   * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
  async removeERC721FromSale({ tokenId }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.removeERC721FromSale(tokenId),
      options,
    );
  }

  /**
   * @function
   * @description Buy ERC721 from Sale
   * @param {Object} params Parameters
   * @param {String} params.tokenId Token Id
   * @param {Integer} params.value If Native ETH, value = 0.1 ETH; if ERC20 value is 0 or optional
   * @param {IContract~TxOptions} options
   * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
  async buyERC721({ tokenId, value = 0 }, options) {
    const valueWithDecimals = Numbers.toSmartContractDecimals(
      value,
      await this.isETHTransaction() ? 18 : this.getERC20Contract().getDecimals(),
    );

    return await this.__sendTx(
      this.getWeb3Contract().methods.buyERC721(tokenId),
      {
        value: valueWithDecimals,
        ...options,
      },
    );
  }

  /**
   * @function
   * @description Change ERC20 Address
   * @param {Object} params Parameters
   * @param {String} params.erc20TokenAddress ERC20TokenAddress
   * @param {IContract~TxOptions} options
   * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
  async changeERC20({ erc20TokenAddress }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.changeERC20(erc20TokenAddress),
      options,
    );
  }

  /**
   * @function
   * @description Change ERC20 Address
   * @param {Object} params Parameters
   * @param {String} params.erc721TokenAddress ERC721TokenAddress
   * @param {IContract~TxOptions} options
   * @returns {TransactionObject} Success the Tx Object if operation was successful
    */
  async changeERC721({ erc721TokenAddress }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.changeERC721(erc721TokenAddress),
      options,
    );
  }

  /**
   * @function
   * @description Change ERC20 Address
   * @param {Object} params Parameters
   * @param {String} params.feeAddress Fee Address
   * @param {String} params.feePercentage Fee Percentage (1 = 1%)
   * @param {IContract~TxOptions} options
   * @returns {TransactionObject} Success the Tx Object if operation was successful
    */
  async setFixedFees({ feeAddress, feePercentage }, options) {
    return await this.__sendTx(
      this.getWeb3Contract().methods.setFixedFees(feeAddress, feePercentage),
      options,
    );
  }

  /**
   * @function
   * @description Get ERC20 Token Address
   * @returns {Address} Token Address
   */
  async getERC20TokenAddress() {
    return await this.getWeb3Contract().methods.erc20Address().call();
  }

  /**
   * @function
   * @description Get ERC721 Token Address
   * @returns {Address} Token Address
   */
  async getERC721TokenAddress() {
    return await this.getWeb3Contract().methods.erc721Address().call();
  }

  /**
   * @function
   * @description Get FeeAddress
   * @returns {Address} Fee Address
   */
  async getFeeAddress() {
    return await this.getWeb3Contract().methods.feeAddress().call();
  }

  /**
   * @function
   * @description Get Amount of ERC721s ever in sale
   * @returns {Integer} Amount of NFTs in Sale
   */
  async getAmountofNFTsEverInSale() {
    return parseInt(
      await this.getWeb3Contract().methods.saleIncrementId().call(),
      10,
    ) - 1;
  }

  /**
   * @function
   * @description Approve ERC721 to be put on Sale
   * @param {Object} params Parameters
   * @param {Address} params.to Address To
   * @param {Bool} params.approve If to Approve
   * @param {IContract~TxOptions} options
   * @returns {TransactionObject} Success the Tx Object if operation was successful
   */
  async approveERC721use({ to, approve = true }, options) {
    return await this.getERC721Standard().setApprovalForAll(
      { to, approve },
      options,
    );
  }

  /**
   * @function
   * @description User deploys the contract
   * @param {Object} params Parameters
   * @param {Address} params.erc20TokenAddress Address of the Contract - Optional (Dont insert if you want to use ETH or BNB or the native currency)
   * @param {Address} params.erc721TokenAddress Address of the Contract
   * @param {IContract~TxOptions} options
   * @returns {Boolean} Success the Tx Object if operation was successful
   */
  deploy = async ({
    erc20TokenAddress = '0x0000000000000000000000000000000000000000',
    erc721TokenAddress,
  },
    options,
  ) => {
    const params = [erc20TokenAddress, erc721TokenAddress];
    const res = await this.__deploy(params, options);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };

  getERC20Contract() {
    return this.params.ERC20Contract;
  }

  getERC721Standard() {
    return this.params.ERC721Standard;
  }
}

export default MarketplaceRealFvr;
