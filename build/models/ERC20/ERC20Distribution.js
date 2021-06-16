'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _extends2 = require('babel-runtime/helpers/extends');var _extends3 = _interopRequireDefault(_extends2);var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require('babel-runtime/helpers/createClass');var _createClass3 = _interopRequireDefault(_createClass2);var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);var _inherits2 = require('babel-runtime/helpers/inherits');var _inherits3 = _interopRequireDefault(_inherits2);var _moment = require('moment');var _moment2 = _interopRequireDefault(_moment);
var _interfaces = require('../../interfaces');
var _ERC20Contract = require('./ERC20Contract');var _ERC20Contract2 = _interopRequireDefault(_ERC20Contract);
var _IContract2 = require('../IContract');var _IContract3 = _interopRequireDefault(_IContract2);
var _Numbers = require('../../utils/Numbers');var _Numbers2 = _interopRequireDefault(_Numbers);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

/**
                                                                                                                                                                                              * @typedef {Object} ERC20Distribution~Options
                                                                                                                                                                                              * @property {Boolean} test
                                                                                                                                                                                              * @property {Boolean} localtest ganache local blockchain
                                                                                                                                                                                              * @property {Web3Connection} [web3Connection=Web3Connection] created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
                                                                                                                                                                                              * @property {string} [contractAddress]
                                                                                                                                                                                              */

/**
                                                                                                                                                                                                  * ERC20 Token Distribution Contract Object
                                                                                                                                                                                                  * @class ERC20Distribution
                                                                                                                                                                                                  * @param {ERC20Distribution~Options} options
                                                                                                                                                                                                  */var
ERC20Distribution = function (_IContract) {(0, _inherits3.default)(ERC20Distribution, _IContract);
  function ERC20Distribution() {var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};(0, _classCallCheck3.default)(this, ERC20Distribution);
    try {var _this = (0, _possibleConstructorReturn3.default)(this, (ERC20Distribution.__proto__ || (0, _getPrototypeOf2.default)(ERC20Distribution)).call(this, (0, _extends3.default)({},
      params, { abi: _interfaces.erc20distribution })));_initialiseProps.call(_this);
    } catch (err) {
      throw err;
    }return _this;
  }

  /**
     * Get ERC20 Address of the Token Contract managed
     * @returns {Promise<Address>}
     */(0, _createClass3.default)(ERC20Distribution, [{ key: 'erc20', value: function () {var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (

                  this.params.contract.getContract().methods.erc20().call());case 2:return _context.abrupt('return', _context.sent);case 3:case 'end':return _context.stop();}}}, _callee, this);}));function erc20() {return _ref.apply(this, arguments);}return erc20;}()


    /**
                                                                                                                                                                                                                                                                             * Get Token Amount of ERC20 Address
                                                                                                                                                                                                                                                                             * @function
                                                                                                                                                                                                                                                                             * @param {Object} params
                                                                                                                                                                                                                                                                             * @param {Address} params.address
                                                                                                                                                                                                                                                                             * @returns {Promise<number>} Token Amount
                                                                                                                                                                                                                                                                             */


    /**
                                                                                                                                                                                                                                                                                 * (Admin only) Set Token address
                                                                                                                                                                                                                                                                                 * @function
                                                                                                                                                                                                                                                                                 * @param {Object} params
                                                                                                                                                                                                                                                                                 * @param {Address} params.address ERC20 Address
                                                                                                                                                                                                                                                                                 * @returns {Promise<boolean>} Success True if operation was successful
                                                                                                                                                                                                                                                                                 */






    /**
                                                                                                                                                                                                                                                                                    * (Admin only) Get All tokens from the Distribution Contract
                                                                                                                                                                                                                                                                                    * @function
                                                                                                                                                                                                                                                                                    * @param {Object} params
                                                                                                                                                                                                                                                                                    * @param {Address} params.address Address to transfer the ERC20 tokens to
                                                                                                                                                                                                                                                                                    * @returns {Promise<boolean>} Success True if operation was successful
                                                                                                                                                                                                                                                                                    */






    /**
                                                                                                                                                                                                                                                                                       * (Admin only) Set the Token Generation Event
                                                                                                                                                                                                                                                                                       * @function
                                                                                                                                                                                                                                                                                       * @param {Object} params
                                                                                                                                                                                                                                                                                       * @param {Integer} params.time Time to set the TGE to (Token Generation Event)
                                                                                                                                                                                                                                                                                       * @returns {Promise<boolean>} Success True if operation was successful
                                                                                                                                                                                                                                                                                       */






    /**
                                                                                                                                                                                                                                                                                          * (Admin only) Set Initial Distribution (Call the amount of times necessary)
                                                                                                                                                                                                                                                                                          * @function
                                                                                                                                                                                                                                                                                          * @param {Object} params
                                                                                                                                                                                                                                                                                          * @param {Address} params.address Address of the recipient
                                                                                                                                                                                                                                                                                          * @param {Integer} params.tokenAmount Token amount for this tranche
                                                                                                                                                                                                                                                                                          * @param {Integer} params.unlockTime Time to when this tokens unlock
                                                                                                                                                                                                                                                                                          * @returns {Promise<boolean>} Success True if operation was successful
                                                                                                                                                                                                                                                                                          */












    /**
                                                                                                                                                                                                                                                                                             * Trigger Token - should be called every month
                                                                                                                                                                                                                                                                                             * @function
                                                                                                                                                                                                                                                                                             * @param {Object} params
                                                                                                                                                                                                                                                                                             * @returns {Promise<boolean>} Success True if operation was successful
                                                                                                                                                                                                                                                                                             */






    /**
                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                 * @return {Promise<void>}
                                                                                                                                                                                                                                                                                                 * @throws {Error} Contract is not deployed, first deploy it and provide a contract address
                                                                                                                                                                                                                                                                                                 */





















    /**
                                                                                                                                                                                                                                                                                                     * Deploy the Contract
                                                                                                                                                                                                                                                                                                     * @function
                                                                                                                                                                                                                                                                                                     * @param {Object} params
                                                                                                                                                                                                                                                                                                     * @param {function():void} params.callback
                                                                                                                                                                                                                                                                                                     * @return {Promise<*|undefined>}
                                                                                                                                                                                                                                                                                                     * @throws {Error} No Token Address Provided
                                                                                                                                                                                                                                                                                                     */









    /**
                                                                                                                                                                                                                                                                                                         * @function
                                                                                                                                                                                                                                                                                                         * @return ERC20Contract|undefined
                                                                                                                                                                                                                                                                                                         */ }]);return ERC20Distribution;}(_IContract3.default);var _initialiseProps = function _initialiseProps() {var _this2 = this;this.getTokenAmount = function () {var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_ref3) {var address = _ref3.address;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return _this2.getERC20Contract().getTokenAmount(address);case 2:return _context2.abrupt('return', _context2.sent);case 3:case 'end':return _context2.stop();}}}, _callee2, _this2);}));return function (_x2) {return _ref2.apply(this, arguments);};}();this.setTokenAddress = function () {var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(_ref5) {var address = _ref5.address;return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.setTokenAddress(address));case 2:return _context3.abrupt('return', _context3.sent);case 3:case 'end':return _context3.stop();}}}, _callee3, _this2);}));return function (_x3) {return _ref4.apply(this, arguments);};}();this.safeGuardAllTokens = function () {var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(_ref7) {var address = _ref7.address;return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.safeGuardAllTokens(address));case 2:return _context4.abrupt('return', _context4.sent);case 3:case 'end':return _context4.stop();}}}, _callee4, _this2);}));return function (_x4) {return _ref6.apply(this, arguments);};}();this.setTGEDate = function () {var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(_ref9) {var time = _ref9.time;return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:_context5.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.setTGEDate(_Numbers2.default.timeToSmartContractTime(time)));case 2:return _context5.abrupt('return', _context5.sent);case 3:case 'end':return _context5.stop();}}}, _callee5, _this2);}));return function (_x5) {return _ref8.apply(this, arguments);};}();this.setInitialDistribution = function () {var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(_ref11) {var address = _ref11.address,tokenAmount = _ref11.tokenAmount,unlockTime = _ref11.unlockTime;var tokenAmountWithDecimals;return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:tokenAmountWithDecimals = _Numbers2.default.toSmartContractDecimals(tokenAmount, _this2.getERC20Contract().getDecimals());_context6.next = 3;return _this2.__sendTx(_this2.params.contract.getContract().methods.setInitialDistribution(address, tokenAmountWithDecimals, _Numbers2.default.timeToSmartContractTime(unlockTime)));case 3:return _context6.abrupt('return', _context6.sent);case 4:case 'end':return _context6.stop();}}}, _callee6, _this2);}));return function (_x6) {return _ref10.apply(this, arguments);};}();this.triggerTokenSend = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {return _regenerator2.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:_context7.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.triggerTokenSend());case 2:return _context7.abrupt('return', _context7.sent);case 3:case 'end':return _context7.stop();}}}, _callee7, _this2);}));this.__assert = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {return _regenerator2.default.wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:if (_this2.getAddress()) {_context8.next = 2;break;}throw new Error('Contract is not deployed, first deploy it and provide a contract address');case 2: /* Use ABI */_this2.params.contract.use(_interfaces.erc20distribution, _this2.getAddress()); /* Set Token Address Contract for easy access */if (_this2.params.ERC20Contract) {_context8.next = 11;break;}_context8.t0 = _ERC20Contract2.default;_context8.t1 = _this2.web3Connection;_context8.next = 8;return _this2.erc20();case 8:_context8.t2 = _context8.sent;_context8.t3 = { web3Connection: _context8.t1, contractAddress: _context8.t2 };_this2.params.ERC20Contract = new _context8.t0(_context8.t3);case 11:_context8.next = 13;return _this2.params.ERC20Contract.__assert();case 13:case 'end':return _context8.stop();}}}, _callee8, _this2);}));this.deploy = function () {var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {var _ref15 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},callback = _ref15.callback;var params, res;return _regenerator2.default.wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:params = [];_context9.next = 3;return _this2.__deploy(params, callback);case 3:res = _context9.sent;_this2.params.contractAddress = res.contractAddress; /* Call to Backend API */_context9.next = 7;return _this2.__assert();case 7:return _context9.abrupt('return', res);case 8:case 'end':return _context9.stop();}}}, _callee9, _this2);}));return function () {return _ref14.apply(this, arguments);};}();this.
  getERC20Contract = function () {return _this2.params.ERC20Contract;};};exports.default =


ERC20Distribution;