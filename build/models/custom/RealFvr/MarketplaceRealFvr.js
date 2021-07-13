'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _extends2 = require('babel-runtime/helpers/extends');var _extends3 = _interopRequireDefault(_extends2);var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);var _inherits2 = require('babel-runtime/helpers/inherits');var _inherits3 = _interopRequireDefault(_inherits2);var _lodash = require('lodash');var _lodash2 = _interopRequireDefault(_lodash);
var _interfaces = require('../../../interfaces');
var _Numbers = require('../../../utils/Numbers');var _Numbers2 = _interopRequireDefault(_Numbers);
var _IContract2 = require('../../IContract');var _IContract3 = _interopRequireDefault(_IContract2);
var _ERC20Contract = require('../../ERC20/ERC20Contract');var _ERC20Contract2 = _interopRequireDefault(_ERC20Contract);
var _ERC721Contract = require('../../ERC721/ERC721Contract');var _ERC721Contract2 = _interopRequireDefault(_ERC721Contract);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

/**
                                                                                                                                                                                                                           * MarketplaceRealFvr Object
                                                                                                                                                                                                                           * @class MarketplaceRealFvr
                                                                                                                                                                                                                           * @param {Object} params Parameters
                                                                                                                                                                                                                           * @param {Address} params.contractAddress Contract Address (If Deployed)
                                                                                                                                                                                                                           */var
MarketplaceRealFvr = function (_IContract) {(0, _inherits3.default)(MarketplaceRealFvr, _IContract);
  function MarketplaceRealFvr() {var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};(0, _classCallCheck3.default)(this, MarketplaceRealFvr);var _this = (0, _possibleConstructorReturn3.default)(this, (MarketplaceRealFvr.__proto__ || (0, _getPrototypeOf2.default)(MarketplaceRealFvr)).call(this, (0, _extends3.default)({
      abi: _interfaces.marketplaceRealFvr }, params)));_initialiseProps.call(_this);return _this;
  }





































  /**
     * @function
     * @description Put ERC721 on Sale
     * @param {Object} params Parameters
     * @param {String} params.tokenId Token Id
     * @param {String} params.price Price (Token Amount)
     * @returns {TransactionObject} Success the Tx Object if operation was successful
     */








  /**
           * @function
           * @description Remove ERC721 from Sale
           * @param {Object} params Parameters
           * @param {String} params.tokenId Token Id
           * @returns {TransactionObject} Success the Tx Object if operation was successful
         */




  /**
             * @function
             * @description Buy ERC721 from Sale
             * @param {Object} params Parameters
             * @param {String} params.tokenId Token Id
             * @returns {TransactionObject} Success the Tx Object if operation was successful
            */




  /**
                * @function
                * @description Change ERC20 Address
                * @param {Object} params Parameters
                * @param {String} params.erc20TokenAddress ERC20TokenAddress
                * @returns {TransactionObject} Success the Tx Object if operation was successful
               */




  /**
                   * @function
                   * @description Change ERC20 Address
                   * @param {Object} params Parameters
                   * @param {String} params.erc721TokenAddress ERC721TokenAddress
                   * @returns {TransactionObject} Success the Tx Object if operation was successful
                  */




  /**
                      * @function
                      * @description Change ERC20 Address
                      * @param {Object} params Parameters
                      * @param {String} params.feeAddress Fee Address
                      * @param {String} params.feePercentage Fee Percentage (1 = 1%)
                      * @returns {TransactionObject} Success the Tx Object if operation was successful
                     */




  /**
                         * @function
                         * @description Get ERC20 Token Address
                         * @returns {Address} Token Address
                         */


  /**
                             * @function
                             * @description Get ERC721 Token Address
                             * @returns {Address} Token Address
                             */


  /**
                                 * @function
                                 * @description Get FeeAddress
                                 * @returns {Address} Fee Address
                                */


  /**
                                    * @function
                                    * @description Get Amount of ERC721s ever in sale
                                    * @returns {Integer} Amount of NFTs in Sale
                                    */







  /**
                                        * @function
                                        * @description Approve ERC721 to be put on Sale
                                        * @param {Object} params Parameters
                                        * @param {Address} params.to Address To
                                        * @param {String} params.tokenId Token Id
                                        * @returns {TransactionObject} Success the Tx Object if operation was successful
                                       */


  /**
                                           * @function
                                           * @description User deploys the contract
                                           * @param {Object} params Parameters
                                           * @param {Address} params.erc20TokenAddress Address of the Contract
                                           * @param {Address} params.erc721TokenAddress Address of the Contract
                                           * @returns {Boolean} Success the Tx Object if operation was successful
                                           */return MarketplaceRealFvr;}(_IContract3.default);var _initialiseProps = function _initialiseProps() {var _this2 = this;this.__assert = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:if (_this2.getAddress()) {_context.next = 2;break;}throw new Error('Contract is not deployed, first deploy it and provide a contract address');case 2: // Use ABI
            _this2.params.contract.use(_interfaces.marketplaceRealFvr, _this2.getAddress());_context.next = 5;return _this2.getERC20TokenAddress();case 5:_this2.params.tokenAddress = _context.sent;_context.next = 8;return _this2.getERC721TokenAddress();case 8:_this2.params.erc721Address = _context.sent; // Set Token Address Contract for easy access
            _this2.params.ERC20Contract = new _ERC20Contract2.default({ web3: _this2.web3, contractAddress: _this2.params.tokenAddress, acc: _this2.acc }); // Set Token Address Contract for easy access
            _this2.params.ERC721Contract = new _ERC721Contract2.default({ web3: _this2.web3, contractAddress: _this2.params.tokenAddress, acc: _this2.acc });_context.prev = 11;_context.next = 14;return _this2.params.ERC20Contract.__assert();case 14:_context.next = 16;return _this2.params.ERC721Contract.__assert();case 16:_context.next = 21;break;case 18:_context.prev = 18;_context.t0 = _context['catch'](11);throw new Error('Problem on ERC20 Assert, confirm ERC20 \'tokenAddress\'' + _context.t0);case 21:case 'end':return _context.stop();}}}, _callee, _this2, [[11, 18]]);}));this.putERC721OnSale = function () {var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_ref3) {var tokenId = _ref3.tokenId,price = _ref3.price;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.putERC721OnSale(tokenId, _Numbers2.default.toSmartContractDecimals(price, _this2.getERC20Contract().getDecimals())));case 2:return _context2.abrupt('return', _context2.sent);case 3:case 'end':return _context2.stop();}}}, _callee2, _this2);}));return function (_x2) {return _ref2.apply(this, arguments);};}();this.removeERC721FromSale = function () {var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(_ref5) {var tokenId = _ref5.tokenId;return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.removeERC721FromSale(tokenId));case 2:return _context3.abrupt('return', _context3.sent);case 3:case 'end':return _context3.stop();}}}, _callee3, _this2);}));return function (_x3) {return _ref4.apply(this, arguments);};}();this.buyERC721 = function () {var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(_ref7) {var tokenId = _ref7.tokenId;return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.buyERC721(tokenId));case 2:return _context4.abrupt('return', _context4.sent);case 3:case 'end':return _context4.stop();}}}, _callee4, _this2);}));return function (_x4) {return _ref6.apply(this, arguments);};}();this.changeERC20 = function () {var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(_ref9) {var erc20TokenAddress = _ref9.erc20TokenAddress;return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:_context5.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.changeERC20(erc20TokenAddress));case 2:return _context5.abrupt('return', _context5.sent);case 3:case 'end':return _context5.stop();}}}, _callee5, _this2);}));return function (_x5) {return _ref8.apply(this, arguments);};}();this.changeERC721 = function () {var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(_ref11) {var erc721TokenAddress = _ref11.erc721TokenAddress;return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:_context6.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.changeERC721(erc721TokenAddress));case 2:return _context6.abrupt('return', _context6.sent);case 3:case 'end':return _context6.stop();}}}, _callee6, _this2);}));return function (_x6) {return _ref10.apply(this, arguments);};}();this.setFixedFees = function () {var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(_ref13) {var feeAddress = _ref13.feeAddress,feePercentage = _ref13.feePercentage;return _regenerator2.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:_context7.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.setFixedFees(feeAddress, feePercentage));case 2:return _context7.abrupt('return', _context7.sent);case 3:case 'end':return _context7.stop();}}}, _callee7, _this2);}));return function (_x7) {return _ref12.apply(this, arguments);};}();this.getERC20TokenAddress = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {return _regenerator2.default.wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:_context8.next = 2;return _this2.params.contract.getContract().methods.erc20Address().call();case 2:return _context8.abrupt('return', _context8.sent);case 3:case 'end':return _context8.stop();}}}, _callee8, _this2);}));this.getERC721TokenAddress = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {return _regenerator2.default.wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:_context9.next = 2;return _this2.params.contract.getContract().methods.erc721Address().call();case 2:return _context9.abrupt('return', _context9.sent);case 3:case 'end':return _context9.stop();}}}, _callee9, _this2);}));this.getFeeAddress = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10() {return _regenerator2.default.wrap(function _callee10$(_context10) {while (1) {switch (_context10.prev = _context10.next) {case 0:_context10.next = 2;return _this2.params.contract.getContract().methods.feeAddress().call();case 2:return _context10.abrupt('return', _context10.sent);case 3:case 'end':return _context10.stop();}}}, _callee10, _this2);}));this.getAmountofNFTsEverInSale = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11() {return _regenerator2.default.wrap(function _callee11$(_context11) {while (1) {switch (_context11.prev = _context11.next) {case 0:_context11.t0 = parseInt;_context11.next = 3;return _this2.params.contract.getContract().methods.saleIncrementId().call();case 3:_context11.t1 = _context11.sent;_context11.t2 = (0, _context11.t0)(_context11.t1, 10);_context11.t2 - 1;case 6:case 'end':return _context11.stop();}}}, _callee11, _this2);}));this.approveERC721use = function () {var _ref18 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(_ref19) {var to = _ref19.to,tokenId = _ref19.tokenId;return _regenerator2.default.wrap(function _callee12$(_context12) {while (1) {switch (_context12.prev = _context12.next) {case 0:_context12.next = 2;return _this2.getERC721Contract().approve({ to: to, tokenId: tokenId });case 2:return _context12.abrupt('return', _context12.sent);case 3:case 'end':return _context12.stop();}}}, _callee12, _this2);}));return function (_x8) {return _ref18.apply(this, arguments);};}();this.deploy = function () {var _ref20 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(_ref21) {var _ref21$erc20TokenAddr = _ref21.erc20TokenAddress,erc20TokenAddress = _ref21$erc20TokenAddr === undefined ? '0x0000000000000000000000000000000000000000' : _ref21$erc20TokenAddr,erc721TokenAddress = _ref21.erc721TokenAddress,callback = _ref21.callback;var params, res;return _regenerator2.default.wrap(function _callee13$(_context13) {while (1) {switch (_context13.prev = _context13.next) {case 0:
              params = [erc20TokenAddress, erc721TokenAddress];_context13.next = 3;return (
                _this2.__deploy(params, callback));case 3:res = _context13.sent;
              _this2.params.contractAddress = res.contractAddress;
              /* Call to Backend API */_context13.next = 7;return (
                _this2.__assert());case 7:return _context13.abrupt('return',
              res);case 8:case 'end':return _context13.stop();}}}, _callee13, _this2);}));return function (_x9) {return _ref20.apply(this, arguments);};}();this.


  getERC20Contract = function () {return _this2.params.ERC20Contract;};this.

  getERC721Contract = function () {return _this2.params.ERC721Contract;};};exports.default =


MarketplaceRealFvr;