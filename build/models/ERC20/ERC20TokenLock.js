'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _extends2 = require('babel-runtime/helpers/extends');var _extends3 = _interopRequireDefault(_extends2);var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require('babel-runtime/helpers/createClass');var _createClass3 = _interopRequireDefault(_createClass2);var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);var _inherits2 = require('babel-runtime/helpers/inherits');var _inherits3 = _interopRequireDefault(_inherits2);var _interfaces = require('../../interfaces');
var _ERC20Contract = require('./ERC20Contract');var _ERC20Contract2 = _interopRequireDefault(_ERC20Contract);
var _IContract2 = require('../IContract');var _IContract3 = _interopRequireDefault(_IContract2);
var _lodash = require('lodash');var _lodash2 = _interopRequireDefault(_lodash);
var _Numbers = require('../../utils/Numbers');var _Numbers2 = _interopRequireDefault(_Numbers);
var _moment = require('moment');var _moment2 = _interopRequireDefault(_moment);
var _dayjs = require('dayjs');var _dayjs2 = _interopRequireDefault(_dayjs);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}
var assert = require('assert');

/**
                                 * ERC20 Token Lock Contract Object
                                 * @constructor ERC20TokenLock
                                 * @param {Web3} web3
                                 * @param {Address} tokenAddress
                                 * @param {Address} contractAddress ? (opt)
                                 */var

ERC20TokenLock = function (_IContract) {(0, _inherits3.default)(ERC20TokenLock, _IContract);
	function ERC20TokenLock(_ref) {var tokenAddress = _ref.tokenAddress,params = (0, _objectWithoutProperties3.default)(_ref, ['tokenAddress']);(0, _classCallCheck3.default)(this, ERC20TokenLock);
		try {var _this = (0, _possibleConstructorReturn3.default)(this, (ERC20TokenLock.__proto__ || (0, _getPrototypeOf2.default)(ERC20TokenLock)).call(this, (0, _extends3.default)({},
			params, { abi: _interfaces.tokenlock })));_initialiseProps.call(_this);
			console.log('ERC20TokenLock.ctor.tokenAddress: ' + tokenAddress);
			console.log('ERC20TokenLock.ctor.contractAddress: ' + params.contractAddress);
			if (tokenAddress) {
				_this.params.ERC20Contract = new _ERC20Contract2.default({
					web3: params.web3,
					contractAddress: tokenAddress,
					acc: params.acc });

			}
		} catch (err) {
			throw err;
		}return _this;
	}

	/**
    * @function erc20
    * @description Get ERC20 Address of the Token Contract managed
    * @returns {Address}
    */(0, _createClass3.default)(ERC20TokenLock, [{ key: 'erc20', value: function () {var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (

									this.params.contract.getContract().methods.erc20().call());case 2:return _context.abrupt('return', _context.sent);case 3:case 'end':return _context.stop();}}}, _callee, this);}));function erc20() {return _ref2.apply(this, arguments);}return erc20;}()


		/**
                                                                                                                                                                                                                                                                     * @function getTokenAmount
                                                                                                                                                                                                                                                                     * @description Get Token Amount of ERC20 Address
                                                                                                                                                                                                                                                                     * @returns {Address}
                                                                                                                                                                                                                                                                     */ }, { key: 'totalAmountStaked',




		/**
                                                                                                                                                                                                                                                                                                        * @function totalAmountStaked
                                                                                                                                                                                                                                                                                                        * @description Get All Tokens staked/locked at that specific moment
                                                                                                                                                                                                                                                                                                        * @returns {Integer}
                                                                                                                                                                                                                                                                                                        */value: function () {var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {var res;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return (

									this.params.contract.getContract().methods.totalAmountStaked().call());case 2:res = _context2.sent;return _context2.abrupt('return',
								_Numbers2.default.fromDecimals(res, this.getERC20Contract().getDecimals()));case 4:case 'end':return _context2.stop();}}}, _callee2, this);}));function totalAmountStaked() {return _ref3.apply(this, arguments);}return totalAmountStaked;}()


		/**
                                                                                                                                                                                                                                                        * @function minAmountToLock
                                                                                                                                                                                                                                                        * @description Get minimum amount of tokens to lock per user
                                                                                                                                                                                                                                                        * @returns {Integer}
                                                                                                                                                                                                                                                        */ }, { key: 'minAmountToLock', value: function () {var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {var res;return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.next = 2;return (

									this.params.contract.getContract().methods.minAmountToLock().call());case 2:res = _context3.sent;return _context3.abrupt('return',
								_Numbers2.default.fromDecimals(res, this.getERC20Contract().getDecimals()));case 4:case 'end':return _context3.stop();}}}, _callee3, this);}));function minAmountToLock() {return _ref4.apply(this, arguments);}return minAmountToLock;}()


		/**
                                                                                                                                                                                                                                                    * @function maxAmountToLock
                                                                                                                                                                                                                                                    * @description Get maximum amount of tokens to lock per user
                                                                                                                                                                                                                                                    * @returns {Integer}
                                                                                                                                                                                                                                                    */ }, { key: 'maxAmountToLock', value: function () {var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {var res;return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return (

									this.params.contract.getContract().methods.maxAmountToLock().call());case 2:res = _context4.sent;return _context4.abrupt('return',
								_Numbers2.default.fromDecimals(res, this.getERC20Contract().getDecimals()));case 4:case 'end':return _context4.stop();}}}, _callee4, this);}));function maxAmountToLock() {return _ref5.apply(this, arguments);}return maxAmountToLock;}()


		/**
                                                                                                                                                                                                                                                    * @function canRelease
                                                                                                                                                                                                                                                    * @description Check if locked tokens release date has come and user can withdraw them
                                                                                                                                                                                                                                                    * @returns {Boolean}
                                                                                                                                                                                                                                                    */




		/**
                                                                                                                                                                                                                                                        * @function getLockedTokens
                                                                                                                                                                                                                                                        * @description Get locked tokens amount for a given address
                                                                                                                                                                                                                                                        * @returns {Integer} amount Locked token amount
                                                                                                                                                                                                                                                        */





		/**
                                                                                                                                                                                                                                                            * @function getLockedTokensInfo
                                                                                                                                                                                                                                                            * @description Get locked tokens info for a given address
                                                                                                                                                                                                                                                            * @returns {Date} startDate
                                                                                                                                                                                                                                                            * @returns {Date} endDate
                                                                                                                                                                                                                                                            * @returns {Integer} amount Token amount
                                                                                                                                                                                                                                                            */










		/**
                                                                                                                                                                                                                                                                * @function setMaxAmountToLock
                                                                                                                                                                                                                                                                * @description Admin sets maximum amount of tokens to lock per user
                                                                                                                                                                                                                                                                * @param {Integer} tokenAmount Maximum tokens amount
                                                                                                                                                                                                                                                                * @returns {Boolean} Success True if operation was successful
                                                                                                                                                                                                                                                                */









		/**
                                                                                                                                                                                                                                                                    * @function setMinAmountToLock
                                                                                                                                                                                                                                                                    * @description Admin sets minimum amount of tokens to lock per user
                                                                                                                                                                                                                                                                    * @param {Integer} tokenAmount Minimum tokens amount
                                                                                                                                                                                                                                                                    * @returns {Boolean} Success True if operation was successful
                                                                                                                                                                                                                                                                    */









		/**
                                                                                                                                                                                                                                                                        * @function lock
                                                                                                                                                                                                                                                                        * @description User locks his tokens until specified end date.
                                                                                                                                                                                                                                                                        * @param {Integer} amount Tokens amount to be locked
                                                                                                                                                                                                                                                                        * @param {Date} endDate Lock tokens until this end date
                                                                                                                                                                                                                                                                        * @returns {Boolean} Success True if operation was successful
                                                                                                                                                                                                                                                                        * REQUIREMENTS:
                                                                                                                                                                                                                                                                        *	user must have approved this contract to spend the tokens "amount" he wants to lock before calling this function.
                                                                                                                                                                                                                                                                        */



































		/**
                                                                                                                                                                                                                                                                            * @function release
                                                                                                                                                                                                                                                                            * @description User withdraws his locked tokens after specified end date
                                                                                                                                                                                                                                                                            * @return {Boolean} Success True if operation was successful
                                                                                                                                                                                                                                                                            */













		/**
                                                                                                                                                                                                                                                                                * @function approveERC20Transfer
                                                                                                                                                                                                                                                                                * @description Approve this contract to transfer tokens of the ERC20 token contract on behalf of user
                                                                                                                                                                                                                                                                                * @return {Boolean} Success True if operation was successful
                                                                                                                                                                                                                                                                                */









		/**
                                                                                                                                                                                                                                                                                    * @override
                                                                                                                                                                                                                                                                                    */





















		/**
                                                                                                                                                                                                                                                                                        * @function deploy
                                                                                                                                                                                                                                                                                        * @override
                                                                                                                                                                                                                                                                                        * @description Deploy the ERC20 Token Lock Contract
                                                                                                                                                                                                                                                                                        */ }]);return ERC20TokenLock;}(_IContract3.default);var _initialiseProps = function _initialiseProps() {var _this2 = this;this.getTokenAmount = function () {var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(_ref7) {var address = _ref7.address;return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:_context5.next = 2;return _this2.getERC20Contract().getTokenAmount(address);case 2:return _context5.abrupt('return', _context5.sent);case 3:case 'end':return _context5.stop();}}}, _callee5, _this2);}));return function (_x) {return _ref6.apply(this, arguments);};}();this.canRelease = function () {var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(_ref9) {var address = _ref9.address;return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:_context6.next = 2;return _this2.params.contract.getContract().methods.canRelease(address).call();case 2:return _context6.abrupt('return', _context6.sent);case 3:case 'end':return _context6.stop();}}}, _callee6, _this2);}));return function (_x2) {return _ref8.apply(this, arguments);};}();this.getLockedTokens = function () {var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(_ref11) {var address = _ref11.address;var res;return _regenerator2.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:_context7.next = 2;return _this2.params.contract.getContract().methods.getLockedTokens(address).call();case 2:res = _context7.sent;return _context7.abrupt('return', _Numbers2.default.fromDecimals(res, _this2.getERC20Contract().getDecimals()));case 4:case 'end':return _context7.stop();}}}, _callee7, _this2);}));return function (_x3) {return _ref10.apply(this, arguments);};}();this.getLockedTokensInfo = function () {var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(_ref13) {var address = _ref13.address;var res;return _regenerator2.default.wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:_context8.next = 2;return _this2.params.contract.getContract().methods.getLockedTokensInfo(address).call();case 2:res = _context8.sent;return _context8.abrupt('return', { startDate: _Numbers2.default.fromSmartContractTimeToMinutes(res[0]), endDate: _Numbers2.default.fromSmartContractTimeToMinutes(res[1]), amount: _Numbers2.default.fromDecimals(res[2], _this2.getERC20Contract().getDecimals()) });case 4:case 'end':return _context8.stop();}}}, _callee8, _this2);}));return function (_x4) {return _ref12.apply(this, arguments);};}();this.setMaxAmountToLock = function () {var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(_ref15) {var tokenAmount = _ref15.tokenAmount;var amountWithDecimals;return _regenerator2.default.wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:_this2.onlyOwner(); //verify that user is admin
							/* Get Decimals of Amount */amountWithDecimals = _Numbers2.default.toSmartContractDecimals(tokenAmount, _this2.getERC20Contract().getDecimals());_context9.next = 4;return _this2.__sendTx(_this2.params.contract.getContract().methods.setMaxAmountToLock(amountWithDecimals));case 4:return _context9.abrupt('return', _context9.sent);case 5:case 'end':return _context9.stop();}}}, _callee9, _this2);}));return function (_x5) {return _ref14.apply(this, arguments);};}();this.setMinAmountToLock = function () {var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(_ref17) {var tokenAmount = _ref17.tokenAmount;var amountWithDecimals;return _regenerator2.default.wrap(function _callee10$(_context10) {while (1) {switch (_context10.prev = _context10.next) {case 0:_this2.onlyOwner(); //verify that user is admin
							/* Get Decimals of Amount */amountWithDecimals = _Numbers2.default.toSmartContractDecimals(tokenAmount, _this2.getERC20Contract().getDecimals());_context10.next = 4;return _this2.__sendTx(_this2.params.contract.getContract().methods.setMinAmountToLock(amountWithDecimals));case 4:return _context10.abrupt('return', _context10.sent);case 5:case 'end':return _context10.stop();}}}, _callee10, _this2);}));return function (_x6) {return _ref16.apply(this, arguments);};}();this.lock = function () {var _ref18 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(_ref19) {var address = _ref19.address,amount = _ref19.amount,endDate = _ref19.endDate;var lockedAmount, isApproved;return _regenerator2.default.wrap(function _callee11$(_context11) {while (1) {switch (_context11.prev = _context11.next) {case 0: /// 'address' is current user address
							_this2.whenNotPaused(); // verify that contract is not paused
							_context11.t0 = assert;_context11.t2 = amount > 0;if (!_context11.t2) {_context11.next = 9;break;}_context11.t3 = amount;_context11.next = 7;return _this2.minAmountToLock();case 7:_context11.t4 = _context11.sent;_context11.t2 = _context11.t3 >= _context11.t4;case 9:_context11.t1 = _context11.t2;if (!_context11.t1) {_context11.next = 16;break;}_context11.t5 = amount;_context11.next = 14;return _this2.maxAmountToLock();case 14:_context11.t6 = _context11.sent;_context11.t1 = _context11.t5 <= _context11.t6;case 16:_context11.t7 = _context11.t1;(0, _context11.t0)(_context11.t7, 'Invalid token amount');assert(endDate > (0, _moment2.default)(), 'Invalid end date'); // check if user can lock tokens
							_context11.next = 21;return _this2.getLockedTokens({ address: address });case 21:lockedAmount = _context11.sent;assert(lockedAmount == 0, 'User already has locked tokens'); //otherwise user already locked tokens
							/* Verify if transfer is approved for this amount */_context11.next = 25;return _this2.getERC20Contract().isApproved({ address: address, amount: amount, spenderAddress: _this2.getAddress() });case 25:isApproved = _context11.sent;if (isApproved) {_context11.next = 28;break;}throw new Error("Has to Approve Token Transfer First, use the 'approve' Call");case 28:_context11.next = 30;return _this2.__sendTx(_this2.params.contract.getContract().methods.lock(_Numbers2.default.toSmartContractDecimals(amount, _this2.getERC20Contract().getDecimals()), _Numbers2.default.timeToSmartContractTime(endDate)));case 30:return _context11.abrupt('return', _context11.sent);case 31:case 'end':return _context11.stop();}}}, _callee11, _this2);}));return function (_x7) {return _ref18.apply(this, arguments);};}();this.release = function () {var _ref20 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(_ref21) {var address = _ref21.address;var _ref22, startDate, endDate, amount, lockedAmount;return _regenerator2.default.wrap(function _callee12$(_context12) {while (1) {switch (_context12.prev = _context12.next) {case 0:_context12.next = 2;return _this2.getLockedTokensInfo({ address: address });case 2:_ref22 = _context12.sent;startDate = _ref22.startDate;endDate = _ref22.endDate;amount = _ref22.amount;lockedAmount = amount;assert(lockedAmount > 0, 'ERC20TokenLock.user has no locked tokens');assert((0, _moment2.default)() >= endDate, 'ERC20TokenLock.tokens release date not reached');_context12.next = 11;return _this2.__sendTx(_this2.params.contract.getContract().methods.release());case 11:return _context12.abrupt('return', _context12.sent);case 12:case 'end':return _context12.stop();}}}, _callee12, _this2);}));return function (_x8) {return _ref20.apply(this, arguments);};}();this.approveERC20Transfer = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13() {var totalMaxAmount;return _regenerator2.default.wrap(function _callee13$(_context13) {while (1) {switch (_context13.prev = _context13.next) {case 0:_context13.next = 2;return _this2.getERC20Contract().totalSupply();case 2:totalMaxAmount = _context13.sent;_context13.next = 5;return _this2.getERC20Contract().approve({ address: _this2.getAddress(), amount: _Numbers2.default.toSmartContractDecimals(totalMaxAmount, _this2.getERC20Contract().getDecimals()) });case 5:return _context13.abrupt('return', _context13.sent);case 6:case 'end':return _context13.stop();}}}, _callee13, _this2);}));this.__assert = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14() {return _regenerator2.default.wrap(function _callee14$(_context14) {while (1) {switch (_context14.prev = _context14.next) {case 0:if (_this2.getAddress()) {_context14.next = 2;break;}throw new Error('Contract is not deployed, first deploy it and provide a contract address');case 2: /* Use ABI */_this2.params.contract.use(_interfaces.tokenlock, _this2.getAddress()); /* Set Token Address Contract for easy access */if (_this2.params.ERC20Contract) {_context14.next = 12;break;}_context14.t0 = _ERC20Contract2.default;_context14.t1 = _this2.web3;_context14.next = 8;return _this2.erc20();case 8:_context14.t2 = _context14.sent;_context14.t3 = _this2.acc;_context14.t4 = { web3: _context14.t1, contractAddress: _context14.t2, acc: _context14.t3 };_this2.params.ERC20Contract = new _context14.t0(_context14.t4);case 12:_context14.next = 14;return _this2.params.ERC20Contract.__assert();case 14:case 'end':return _context14.stop();}}}, _callee14, _this2);}));this.deploy = function () {var _ref25 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15() {var _ref26 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},callback = _ref26.callback;var params, res;return _regenerator2.default.wrap(function _callee15$(_context15) {while (1) {switch (_context15.prev = _context15.next) {case 0:if (_this2.getERC20Contract()) {_context15.next = 2;break;}throw new Error('No Token Address Provided');case 2:params = [_this2.getERC20Contract().getAddress()];_context15.next = 5;return (
								_this2.__deploy(params, callback));case 5:res = _context15.sent;
							_this2.params.contractAddress = res.contractAddress;
							/* Call to Backend API */_context15.next = 9;return (
								_this2.__assert());case 9:return _context15.abrupt('return',
							res);case 10:case 'end':return _context15.stop();}}}, _callee15, _this2);}));return function () {return _ref25.apply(this, arguments);};}();this.


	getERC20Contract = function () {return _this2.params.ERC20Contract;};};exports.default =


ERC20TokenLock;