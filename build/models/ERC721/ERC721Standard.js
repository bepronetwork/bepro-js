"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require("babel-runtime/regenerator");var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _extends2 = require("babel-runtime/helpers/extends");var _extends3 = _interopRequireDefault(_extends2);var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require("babel-runtime/helpers/createClass");var _createClass3 = _interopRequireDefault(_createClass2);var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);var _inherits2 = require("babel-runtime/helpers/inherits");var _inherits3 = _interopRequireDefault(_inherits2);var _interfaces = require("../../interfaces");
var _lodash = require("lodash");var _lodash2 = _interopRequireDefault(_lodash);
var _IContract2 = require("../IContract");var _IContract3 = _interopRequireDefault(_IContract2);
var _ERC20Contract = require("../ERC20/ERC20Contract");var _ERC20Contract2 = _interopRequireDefault(_ERC20Contract);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}
/**
                                                                                                                                                                                                                   * ERC721Contract Object
                                                                                                                                                                                                                   * @constructor ERC721Contract
                                                                                                                                                                                                                   * @param {Web3} web3
                                                                                                                                                                                                                   * @param {Address} contractAddress ? (opt)
                                                                                                                                                                                                                   */var

ERC721Standard = function (_IContract) {(0, _inherits3.default)(ERC721Standard, _IContract);
	function ERC721Standard(params) {(0, _classCallCheck3.default)(this, ERC721Standard);var _this = (0, _possibleConstructorReturn3.default)(this, (ERC721Standard.__proto__ || (0, _getPrototypeOf2.default)(ERC721Standard)).call(this, (0, _extends3.default)({
			abi: _interfaces.erc721standard }, params)));_initialiseProps.call(_this);return _this;
	}

	/**
     * @override 
     */(0, _createClass3.default)(ERC721Standard, [{ key: "exists",


















		/**
                                                                     * @function exists
                                                                     * @description Verify if token ID exists 
                                                                     * @returns {Integer} Token Id
                                                                     */value: function () {var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2) {var
				tokenID = _ref2.tokenID;return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (
									this.params.contract.
									getContract().
									methods.exists(tokenID).
									call());case 2:return _context.abrupt("return", _context.sent);case 3:case "end":return _context.stop();}}}, _callee, this);}));function exists(_x) {return _ref.apply(this, arguments);}return exists;}()


		/**
                                                                                                                                                                                                                     * @function getURITokenID
                                                                                                                                                                                                                     * @description Verify what is the getURITokenID
                                                                                                                                                                                                                     * @returns {String} URI
                                                                                                                                                                                                                     */ }, { key: "getURITokenID", value: function () {var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_ref4) {var
				tokenID = _ref4.tokenID;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return (
									this.params.contract.
									getContract().
									methods.tokenURI(tokenID).
									call());case 2:return _context2.abrupt("return", _context2.sent);case 3:case "end":return _context2.stop();}}}, _callee2, this);}));function getURITokenID(_x2) {return _ref3.apply(this, arguments);}return getURITokenID;}()

		/**
                                                                                                                                                                                                                                         * @function baseURI
                                                                                                                                                                                                                                         * @description Verify what is the baseURI
                                                                                                                                                                                                                                         * @returns {String} URI
                                                                                                                                                                                                                                         */ }, { key: "baseURI", value: function () {var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.next = 2;return (

									this.params.contract.
									getContract().
									methods.baseURI().
									call());case 2:return _context3.abrupt("return", _context3.sent);case 3:case "end":return _context3.stop();}}}, _callee3, this);}));function baseURI() {return _ref5.apply(this, arguments);}return baseURI;}()


		/**
                                                                                                                                                                                                                         * @function setBaseTokenURI
                                                                                                                                                                                                                         * @description Set Base Token URI
                                                                                                                                                                                                                           */ }, { key: "mint",






		/**
                                                                                                                                                                                                                                                 * @function mint
                                                                                                                                                                                                                                                 * @description Mint created TokenID 
                                                                                                                                                                                                                                                 * @param {Address} to
                                                                                                                                                                                                                                                 * @param {Integer} tokenID
                                                                                                                                                                                                                                                */value: function () {var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(_ref7) {var
				tokenID = _ref7.tokenID;return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return (
									this.__sendTx(
									this.params.contract.getContract().methods.mint(tokenID)));case 2:return _context4.abrupt("return", _context4.sent);case 3:case "end":return _context4.stop();}}}, _callee4, this);}));function mint(_x3) {return _ref6.apply(this, arguments);}return mint;}() }]);return ERC721Standard;}(_IContract3.default);var _initialiseProps = function _initialiseProps() {var _this2 = this;this.__assert = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:if (_this2.getAddress()) {_context5.next = 2;break;}throw new Error("Contract is not deployed, first deploy it and provide a contract address");case 2: /* Use ABI */_this2.params.contract.use(erc721collectibles, _this2.getAddress()); /* Set Token Address Contract for easy access */_context5.t0 = _ERC20Contract2.default;_context5.t1 = _this2.web3;_context5.next = 7;return _this2.purchaseToken();case 7:_context5.t2 = _context5.sent;_context5.t3 = _this2.acc;_context5.t4 = { web3: _context5.t1, contractAddress: _context5.t2, acc: _context5.t3 };_this2.params.ERC20Contract = new _context5.t0(_context5.t4);_context5.next = 13;return _this2.params.ERC20Contract.__assert();case 13:case "end":return _context5.stop();}}}, _callee5, _this2);}));this.setBaseTokenURI = function () {var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(_ref10) {var URI = _ref10.URI;return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:_context6.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.setBaseURI(URI));case 2:return _context6.abrupt("return", _context6.sent);case 3:case "end":return _context6.stop();}}}, _callee6, _this2);}));return function (_x4) {return _ref9.apply(this, arguments);};}();this.



	deploy = function () {var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(_ref12) {var name = _ref12.name,symbol = _ref12.symbol,callback = _ref12.callback;var params, res;return _regenerator2.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:if (

							name) {_context7.next = 2;break;}throw (
								new Error("Please provide a name"));case 2:if (


							symbol) {_context7.next = 4;break;}throw (
								new Error("Please provide a symbol"));case 4:

							params = [name, symbol];_context7.next = 7;return (
								_this2.__deploy(params, callback));case 7:res = _context7.sent;
							_this2.params.contractAddress = res.contractAddress;
							/* Call to Backend API */_context7.next = 11;return (
								_this2.__assert());case 11:return _context7.abrupt("return",
							res);case 12:case "end":return _context7.stop();}}}, _callee7, _this2);}));return function (_x5) {return _ref11.apply(this, arguments);};}();this.


	getERC20Contract = function () {return _this2.params.ERC20Contract;};};exports.default =



ERC721Standard;