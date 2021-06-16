'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _extends2 = require('babel-runtime/helpers/extends');var _extends3 = _interopRequireDefault(_extends2);var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);var _inherits2 = require('babel-runtime/helpers/inherits');var _inherits3 = _interopRequireDefault(_inherits2);var _lodash = require('lodash');var _lodash2 = _interopRequireDefault(_lodash);
var _interfaces = require('../../../interfaces');
var _Numbers = require('../../../utils/Numbers');var _Numbers2 = _interopRequireDefault(_Numbers);
var _IContract2 = require('../../IContract');var _IContract3 = _interopRequireDefault(_IContract2);
var _ERC20Contract = require('../../ERC20/ERC20Contract');var _ERC20Contract2 = _interopRequireDefault(_ERC20Contract);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

/**
                                                                                                                                                                                                                      * OpenerRealFvr Object
                                                                                                                                                                                                                      * @class OpenerRealFvr
                                                                                                                                                                                                                      * @param {Object} params Parameters
                                                                                                                                                                                                                      * @param {Address} params.contractAddress Contract Address (If Deployed)
                                                                                                                                                                                                                      * @param {Address} params.tokenAddress Token Purchase Address
                                                                                                                                                                                                                      */var
OpenerRealFvr = function (_IContract) {(0, _inherits3.default)(OpenerRealFvr, _IContract);
  function OpenerRealFvr() {var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};(0, _classCallCheck3.default)(this, OpenerRealFvr);var _this = (0, _possibleConstructorReturn3.default)(this, (OpenerRealFvr.__proto__ || (0, _getPrototypeOf2.default)(OpenerRealFvr)).call(this, (0, _extends3.default)({
      abi: _interfaces.openerRealFvr }, params)));_initialiseProps.call(_this);return _this;
  }



























  /**
     * @function
     * @description Buy Pack
     * @param {Object} params Parameters
     * @param {Integer} params.packId Pack Id
     * @returns {Transaction} Transaction
     */




  /**
         * @function
         * @description Buy Packs
         * @param {Object} params Parameters
         * @param {Array | Integer} params.packIds Pack Id
         * @returns {Transaction} Transaction
         */




  /**
            * @function
            * @description Open Pack
            * @param {Object} params Parameters
            * @param {Integer} params.packId Pack Id
            * @returns {Transaction} Transaction
            */




  /**
               * @function
               * @description Open Packs
               * @param {Object} params Parameters
               * @param {Array | Integer} params.packIds Pack Id
               * @returns {Transaction} Transaction
               */




  /**
                   * @function
                   * @description Offer Pack
                   * @param {Object} params Parameters
                   * @param {Integer} params.packId Pack Id
                   * @param {Address} params.receivingAddress Pack Id Integer
                   * @returns {TransactionObject} Success the Tx Object if operation was successful
                   */






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
                       * @param {Address | Array} params.marketplaceDistributionAddresses Revenue Addresses of the Marketplace Sales
                       * @param {Integer | Array} params.marketplaceDistributionAmounts Revenue Amounts of the Marketplace Sales
                       * @returns {TransactionObject} Success the Tx Object if operation was successful
                       */




























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















  /**
                               * @function
                               * @description Delete Pack
                               * @param {Object} params Parameters
                               * @param {Integer} params.packId Pack Id Integer
                               * @returns {TransactionObject} Success the Tx Object if operation was successful
                               */




  /**
                                   * @function
                                   * @description Mint Token Id (After buying a pack)
                                   * @param {Object} params Parameters
                                   * @param {Integer} params.tokenId Token ID
                                   * @returns {TransactionObject} Success the Tx Object if operation was successful
                                   */




  /**
                                       * @function
                                       * @description Set Purchase Token
                                       * @param {Object} params Parameters
                                       * @param {Address} params.address Token Address
                                       * @returns {TransactionObject} Success the Tx Object if operation was successful
                                       */






  /**
                                           * @function
                                           * @description Lock the Contract
                                           * @returns {TransactionObject} Success the Tx Object if operation was successful
                                           */


  /**
                                               * @function
                                               * @description Unlock the Contract
                                               * @returns {TransactionObject} Success the Tx Object if operation was successful
                                               */


  /**
                                                   * @function
                                                   * @description Set Token Price of Real Fvr in USD --> 1*10**18 as input means 1 Real Fvr = $0.000001
                                                   * @param {Object} params Parameters
                                                   * @param {Price} params.price Token Price
                                                   * @returns {TransactionObject} Success the Tx Object if operation was successful
                                                   */






  /**
                                                       * @function
                                                       * @description Set Base Id URI
                                                       * @param {Object} params Parameters
                                                       * @param {String} params.uri URI of the Token Id Metadata JSON
                                                       * @returns {TransactionObject} Success the Tx Object if operation was successful
                                                       */




  /**
                                                           * @function
                                                           * @description Set Specific Token Id URI
                                                           * @param {Object} params Parameters
                                                           * @param {Integer} params.tokenId Token ID
                                                           * @param {String} params.uri URI of the Token Id Metadata JSON
                                                           * @returns {TransactionObject} Success the Tx Object if operation was successful
                                                           */




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




















  /**
                                                                   * @function
                                                                   * @description Get Token IDs that were already bought via a pack
                                                                   * @param {Object} params Parameters
                                                                   * @param {Address} params.address
                                                                   * @returns {Array | Integer} TokensRegistered
                                                                   */









  /**
                                                                       * @function
                                                                       * @description Get Distribution Sales Description for ERC721 Marketplace Sales
                                                                       * @param {Object} params Parameters
                                                                       * @param {Integer} params.tokenid Token Id
                                                                       * @returns {Array | Integer} Distribution Amounts
                                                                       * @returns {Array | Address} Distribution Addresses
                                                                       */












  /**
                                                                           * @function
                                                                           * @description Verify if a Token was already minted
                                                                           * @param {Object} params Parameters
                                                                           * @param {Integer} params.tokenId
                                                                           * @returns {Bool} wasMinted
                                                                           */



  /**
                                                                               * @function
                                                                               * @description Get Purchase Token Address
                                                                               * @returns {Address} Token Address
                                                                               */


  /**
                                                                                   * @function
                                                                                   * @description Get Real Fvr Cost in USD
                                                                                   * @returns {Integer} Price in Real Fvr Tokens
                                                                                   */









  /**
                                                                                       * @function
                                                                                       * @description Get Cost in Fvr Tokens of the Pack
                                                                                       * @param {Object} params Parameters
                                                                                       * @param {Integer} params.packId
                                                                                       * @returns {Integer} Price in Real Fvr Tokens
                                                                                       */








  /**
                                                                                           * @function
                                                                                           * @description Get Amount of Packs Created
                                                                                           * @returns {Integer} packsAmount
                                                                                           */




  /**
                                                                                               * @function
                                                                                               * @description Get Amount of Packs Opened
                                                                                               * @returns {Integer} packsAmount
                                                                                               */




  /**
                                                                                                   * @function
                                                                                                   * @description Get Amount of Tokens/NFTs Created (Inherent to the Packs)
                                                                                                   * @returns {Integer} tokensAmount
                                                                                                   */




  /**
                                                                                                       * @function
                                                                                                       * @description User deploys the contract
                                                                                                       * @param {Object} params Parameters
                                                                                                       * @param {String} params.name Name of the Contract
                                                                                                       * @param {String} params.symbol Symbol of the Contract
                                                                                                       * @param {Address} params.tokenAddress token Address of the purchase Token in use
                                                                                                       * @returns {Boolean} Success the Tx Object if operation was successful
                                                                                                       */return OpenerRealFvr;}(_IContract3.default);var _initialiseProps = function _initialiseProps() {var _this2 = this;this.__assert = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:if (_this2.getAddress()) {_context.next = 2;break;}throw new Error('Contract is not deployed, first deploy it and provide a contract address');case 2: // Use ABI
            _this2.params.contract.use(_interfaces.openerRealFvr, _this2.getAddress());if (_this2.params.tokenAddress) {_context.next = 5;break;}throw new Error("Problem on ERC20 Assert, 'tokenAddress' not provided");case 5: // Set Token Address Contract for easy access
            _this2.params.ERC20Contract = new _ERC20Contract2.default({ web3: _this2.web3, contractAddress: _this2.params.tokenAddress, acc: _this2.acc });_context.prev = 6;_context.next = 9;return _this2.params.ERC20Contract.__assert();case 9:_context.next = 14;break;case 11:_context.prev = 11;_context.t0 = _context['catch'](6);throw new Error('Problem on ERC20 Assert, confirm ERC20 \'tokenAddress\'' + _context.t0);case 14:case 'end':return _context.stop();}}}, _callee, _this2, [[6, 11]]);}));this.buyPack = function () {var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_ref3) {var packId = _ref3.packId;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.buyPack(packId));case 2:return _context2.abrupt('return', _context2.sent);case 3:case 'end':return _context2.stop();}}}, _callee2, _this2);}));return function (_x2) {return _ref2.apply(this, arguments);};}();this.buyPacks = function () {var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(_ref5) {var packIds = _ref5.packIds;return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.buyPacks(packIds));case 2:return _context3.abrupt('return', _context3.sent);case 3:case 'end':return _context3.stop();}}}, _callee3, _this2);}));return function (_x3) {return _ref4.apply(this, arguments);};}();this.openPack = function () {var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(_ref7) {var packId = _ref7.packId;return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.openPack(packId));case 2:return _context4.abrupt('return', _context4.sent);case 3:case 'end':return _context4.stop();}}}, _callee4, _this2);}));return function (_x4) {return _ref6.apply(this, arguments);};}();this.openPacks = function () {var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(_ref9) {var packIds = _ref9.packIds;return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:_context5.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.openPacks(packIds));case 2:return _context5.abrupt('return', _context5.sent);case 3:case 'end':return _context5.stop();}}}, _callee5, _this2);}));return function (_x5) {return _ref8.apply(this, arguments);};}();this.offerPack = function () {var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(_ref11) {var packId = _ref11.packId,receivingAddress = _ref11.receivingAddress;return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:_context6.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.offerPack(packId, receivingAddress));case 2:return _context6.abrupt('return', _context6.sent);case 3:case 'end':return _context6.stop();}}}, _callee6, _this2);}));return function (_x6) {return _ref10.apply(this, arguments);};}();this.createPack = function () {var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(_ref13) {var nftAmount = _ref13.nftAmount,price = _ref13.price,serie = _ref13.serie,packType = _ref13.packType,drop = _ref13.drop,saleStart = _ref13.saleStart,saleDistributionAddresses = _ref13.saleDistributionAddresses,saleDistributionAmounts = _ref13.saleDistributionAmounts,marketplaceDistributionAddresses = _ref13.marketplaceDistributionAddresses,marketplaceDistributionAmounts = _ref13.marketplaceDistributionAmounts;return _regenerator2.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:_context7.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.createPack(parseInt(nftAmount, 10), _Numbers2.default.toSmartContractDecimals(price, 3), serie, packType, drop, _Numbers2.default.timeToSmartContractTime(saleStart), saleDistributionAddresses, saleDistributionAmounts, marketplaceDistributionAddresses, marketplaceDistributionAmounts));case 2:return _context7.abrupt('return', _context7.sent);case 3:case 'end':return _context7.stop();}}}, _callee7, _this2);}));return function (_x7) {return _ref12.apply(this, arguments);};}();this.editPackInfo = function () {var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(_ref15) {var packId = _ref15.packId,saleStart = _ref15.saleStart,price = _ref15.price,serie = _ref15.serie,packType = _ref15.packType,drop = _ref15.drop;return _regenerator2.default.wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:_context8.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.editPackInfo(packId, _Numbers2.default.timeToSmartContractTime(saleStart), serie, packType, drop, _Numbers2.default.toSmartContractDecimals(price, 3)));case 2:return _context8.abrupt('return', _context8.sent);case 3:case 'end':return _context8.stop();}}}, _callee8, _this2);}));return function (_x8) {return _ref14.apply(this, arguments);};}();this.deletePackById = function () {var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(_ref17) {var packId = _ref17.packId;return _regenerator2.default.wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:_context9.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.deletePackById(packId));case 2:return _context9.abrupt('return', _context9.sent);case 3:case 'end':return _context9.stop();}}}, _callee9, _this2);}));return function (_x9) {return _ref16.apply(this, arguments);};}();this.mint = function () {var _ref18 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(_ref19) {var tokenId = _ref19.tokenId;return _regenerator2.default.wrap(function _callee10$(_context10) {while (1) {switch (_context10.prev = _context10.next) {case 0:_context10.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.mint(tokenId));case 2:return _context10.abrupt('return', _context10.sent);case 3:case 'end':return _context10.stop();}}}, _callee10, _this2);}));return function (_x10) {return _ref18.apply(this, arguments);};}();this.setPurchaseTokenAddress = function () {var _ref20 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(_ref21) {var address = _ref21.address;return _regenerator2.default.wrap(function _callee11$(_context11) {while (1) {switch (_context11.prev = _context11.next) {case 0:_context11.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.setPurchaseTokenAddress(address));case 2:return _context11.abrupt('return', _context11.sent);case 3:case 'end':return _context11.stop();}}}, _callee11, _this2);}));return function (_x11) {return _ref20.apply(this, arguments);};}();this.lock = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12() {return _regenerator2.default.wrap(function _callee12$(_context12) {while (1) {switch (_context12.prev = _context12.next) {case 0:_context12.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.lock());case 2:return _context12.abrupt('return', _context12.sent);case 3:case 'end':return _context12.stop();}}}, _callee12, _this2);}));this.unlock = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13() {return _regenerator2.default.wrap(function _callee13$(_context13) {while (1) {switch (_context13.prev = _context13.next) {case 0:_context13.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.unlock());case 2:return _context13.abrupt('return', _context13.sent);case 3:case 'end':return _context13.stop();}}}, _callee13, _this2);}));this.setTokenWorthof1USD = function () {var _ref24 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(_ref25) {var price = _ref25.price;return _regenerator2.default.wrap(function _callee14$(_context14) {while (1) {switch (_context14.prev = _context14.next) {case 0:_context14.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.setTokenPriceInUSD(price));case 2:return _context14.abrupt('return', _context14.sent);case 3:case 'end':return _context14.stop();}}}, _callee14, _this2);}));return function (_x12) {return _ref24.apply(this, arguments);};}();this.setBaseURI = function () {var _ref26 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15(_ref27) {var uri = _ref27.uri;return _regenerator2.default.wrap(function _callee15$(_context15) {while (1) {switch (_context15.prev = _context15.next) {case 0:_context15.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.setBaseURI(uri));case 2:return _context15.abrupt('return', _context15.sent);case 3:case 'end':return _context15.stop();}}}, _callee15, _this2);}));return function (_x13) {return _ref26.apply(this, arguments);};}();this.setTokenURI = function () {var _ref28 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16(_ref29) {var tokenId = _ref29.tokenId,uri = _ref29.uri;return _regenerator2.default.wrap(function _callee16$(_context16) {while (1) {switch (_context16.prev = _context16.next) {case 0:_context16.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.setTokenURI(tokenId, uri));case 2:return _context16.abrupt('return', _context16.sent);case 3:case 'end':return _context16.stop();}}}, _callee16, _this2);}));return function (_x14) {return _ref28.apply(this, arguments);};}();this.getPackbyId = function () {var _ref30 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee17(_ref31) {var packId = _ref31.packId;var res;return _regenerator2.default.wrap(function _callee17$(_context17) {while (1) {switch (_context17.prev = _context17.next) {case 0:_context17.next = 2;return _this2.params.contract.getContract().methods.getPackbyId(packId).call();case 2:res = _context17.sent;return _context17.abrupt('return', { packId: packId, initialNFTId: parseInt(res[1], 10), price: _Numbers2.default.fromDecimals(res[2], 3), serie: res[3], drop: res[4], packType: res[5], buyer: res[6], saleDistributionAddresses: res[7], saleDistributionAmounts: res[8] ? res[8].map(function (a) {return parseInt(a, 10);}) : [], opened: res[9] });case 4:case 'end':return _context17.stop();}}}, _callee17, _this2);}));return function (_x15) {return _ref30.apply(this, arguments);};}();this.getRegisteredTokens = function () {var _ref32 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee18(_ref33) {var address = _ref33.address;var res;return _regenerator2.default.wrap(function _callee18$(_context18) {while (1) {switch (_context18.prev = _context18.next) {case 0:_context18.next = 2;return _this2.params.contract.getContract().methods.getRegisteredIDs(address).call();case 2:res = _context18.sent;return _context18.abrupt('return', res.map(function (a) {return parseInt(a, 10);}));case 4:case 'end':return _context18.stop();}}}, _callee18, _this2);}));return function (_x16) {return _ref32.apply(this, arguments);};}();this.getMarketplaceDistributionForERC721 = function () {var _ref34 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee19(_ref35) {var tokenId = _ref35.tokenId;var res;return _regenerator2.default.wrap(function _callee19$(_context19) {while (1) {switch (_context19.prev = _context19.next) {case 0:_context19.next = 2;return _this2.params.contract.getContract().methods.getMarketplaceDistributionForERC721(tokenId).call();case 2:res = _context19.sent;return _context19.abrupt('return', { distributionAmounts: res[0].map(function (a) {return parseInt(a, 10);}), distributionAddresses: res[1] });case 4:case 'end':return _context19.stop();}}}, _callee19, _this2);}));return function (_x17) {return _ref34.apply(this, arguments);};}();this.exists = function () {var _ref36 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee20(_ref37) {var tokenId = _ref37.tokenId;return _regenerator2.default.wrap(function _callee20$(_context20) {while (1) {switch (_context20.prev = _context20.next) {case 0:_context20.next = 2;return _this2.params.contract.getContract().methods.exists(tokenId).call();case 2:return _context20.abrupt('return', _context20.sent);case 3:case 'end':return _context20.stop();}}}, _callee20, _this2);}));return function (_x18) {return _ref36.apply(this, arguments);};}();this.getPurchaseToken = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee21() {return _regenerator2.default.wrap(function _callee21$(_context21) {while (1) {switch (_context21.prev = _context21.next) {case 0:_context21.next = 2;return _this2.params.contract.getContract().methods._purchaseToken().call();case 2:return _context21.abrupt('return', _context21.sent);case 3:case 'end':return _context21.stop();}}}, _callee21, _this2);}));this.getTokenWorthof1USD = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee22() {return _regenerator2.default.wrap(function _callee22$(_context22) {while (1) {switch (_context22.prev = _context22.next) {case 0:_context22.t0 = _Numbers2.default;_context22.next = 3;return _this2.params.contract.getContract().methods._realFvrTokenPriceUSD().call();case 3:_context22.t1 = _context22.sent;_context22.t2 = _this2.getERC20Contract().getDecimals();return _context22.abrupt('return', _context22.t0.fromDecimals.call(_context22.t0, _context22.t1, _context22.t2));case 6:case 'end':return _context22.stop();}}}, _callee22, _this2);}));this.getPackPriceInFVR = function () {var _ref40 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee23(_ref41) {var packId = _ref41.packId;return _regenerator2.default.wrap(function _callee23$(_context23) {while (1) {switch (_context23.prev = _context23.next) {case 0:_context23.t0 = _Numbers2.default;_context23.next = 3;return _this2.params.contract.getContract().methods.getPackPriceInFVR(packId).call();case 3:_context23.t1 = _context23.sent;_context23.t2 = _this2.getERC20Contract().getDecimals();return _context23.abrupt('return', _context23.t0.fromDecimals.call(_context23.t0, _context23.t1, _context23.t2));case 6:case 'end':return _context23.stop();}}}, _callee23, _this2);}));return function (_x19) {return _ref40.apply(this, arguments);};}();this.getAmountOfPacksCreated = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee24() {return _regenerator2.default.wrap(function _callee24$(_context24) {while (1) {switch (_context24.prev = _context24.next) {case 0:_context24.t0 = parseInt;_context24.next = 3;return _this2.params.contract.getContract().methods.packIncrementId().call();case 3:_context24.t1 = _context24.sent;return _context24.abrupt('return', (0, _context24.t0)(_context24.t1, 10));case 5:case 'end':return _context24.stop();}}}, _callee24, _this2);}));this.getAmountOfPacksOpened = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee25() {return _regenerator2.default.wrap(function _callee25$(_context25) {while (1) {switch (_context25.prev = _context25.next) {case 0:_context25.t0 = parseInt;_context25.next = 3;return _this2.params.contract.getContract().methods._openedPacks().call();case 3:_context25.t1 = _context25.sent;return _context25.abrupt('return', (0, _context25.t0)(_context25.t1, 10));case 5:case 'end':return _context25.stop();}}}, _callee25, _this2);}));this.getAmountOfTokensCreated = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee26() {return _regenerator2.default.wrap(function _callee26$(_context26) {while (1) {switch (_context26.prev = _context26.next) {case 0:_context26.t0 = parseInt;_context26.next = 3;return _this2.params.contract.getContract().methods.lastNFTID().call();case 3:_context26.t1 = _context26.sent;return _context26.abrupt('return', (0, _context26.t0)(_context26.t1, 10));case 5:case 'end':return _context26.stop();}}}, _callee26, _this2);}));this.deploy = function () {var _ref45 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee27(_ref46) {var name = _ref46.name,symbol = _ref46.symbol,tokenAddress = _ref46.tokenAddress,callback = _ref46.callback;var params, res;return _regenerator2.default.wrap(function _callee27$(_context27) {while (1) {switch (_context27.prev = _context27.next) {case 0:

              params = [name, symbol, tokenAddress];_context27.next = 3;return (
                _this2.__deploy(params, callback));case 3:res = _context27.sent;
              _this2.params.contractAddress = res.contractAddress;
              /* Call to Backend API */_context27.next = 7;return (
                _this2.__assert());case 7:return _context27.abrupt('return',
              res);case 8:case 'end':return _context27.stop();}}}, _callee27, _this2);}));return function (_x20) {return _ref45.apply(this, arguments);};}();this.


  getERC20Contract = function () {return _this2.params.ERC20Contract;};};exports.default =


OpenerRealFvr;