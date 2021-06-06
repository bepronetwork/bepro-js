'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _extends2 = require('babel-runtime/helpers/extends');var _extends3 = _interopRequireDefault(_extends2);var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require('babel-runtime/helpers/createClass');var _createClass3 = _interopRequireDefault(_createClass2);var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);var _inherits2 = require('babel-runtime/helpers/inherits');var _inherits3 = _interopRequireDefault(_inherits2);var _lodash = require('lodash');var _lodash2 = _interopRequireDefault(_lodash);
var _interfaces = require('../../interfaces');
var _IContract2 = require('../IContract');var _IContract3 = _interopRequireDefault(_IContract2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}
/**
                                                                                                                                                                                               * ERC721Contract Object
                                                                                                                                                                                               * @class ERC721Contract
                                                                                                                                                                                               * @param {Web3} web3
                                                                                                                                                                                               * @param {Address} contractAddress ? (opt)
                                                                                                                                                                                               */var

ERC721Contract = function (_IContract) {(0, _inherits3.default)(ERC721Contract, _IContract);
  function ERC721Contract() {var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};(0, _classCallCheck3.default)(this, ERC721Contract);var _this = (0, _possibleConstructorReturn3.default)(this, (ERC721Contract.__proto__ || (0, _getPrototypeOf2.default)(ERC721Contract)).call(this, (0, _extends3.default)({
      abi: _interfaces.erc721contract }, params)));_initialiseProps.call(_this);return _this;
  }(0, _createClass3.default)(ERC721Contract, [{ key: 'exists',











    /**
                                                                 * @function
                                                                 * @description Verify if token ID exists
                                                                 * @returns {Integer} Token Id
                                                                 */value: function () {var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2) {var
        tokenID = _ref2.tokenID;return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (
                  this.params.contract.
                  getContract().
                  methods.exists(tokenID).
                  call());case 2:return _context.abrupt('return', _context.sent);case 3:case 'end':return _context.stop();}}}, _callee, this);}));function exists(_x2) {return _ref.apply(this, arguments);}return exists;}()


    /**
                                                                                                                                                                                                                               * @function
                                                                                                                                                                                                                               * @description Verify what is the getURITokenID
                                                                                                                                                                                                                               * @returns {String} URI
                                                                                                                                                                                                                               */ }, { key: 'getURITokenID', value: function () {var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_ref4) {var
        tokenID = _ref4.tokenID;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return (
                  this.params.contract.
                  getContract().
                  methods.tokenURI(tokenID).
                  call());case 2:return _context2.abrupt('return', _context2.sent);case 3:case 'end':return _context2.stop();}}}, _callee2, this);}));function getURITokenID(_x3) {return _ref3.apply(this, arguments);}return getURITokenID;}()


    /**
                                                                                                                                                                                                                                                  * @function
                                                                                                                                                                                                                                                  * @description Verify what is the baseURI
                                                                                                                                                                                                                                                  * @returns {String} URI
                                                                                                                                                                                                                                                  */ }, { key: 'baseURI', value: function () {var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.next = 2;return (

                  this.params.contract.getContract().methods.baseURI().call());case 2:return _context3.abrupt('return', _context3.sent);case 3:case 'end':return _context3.stop();}}}, _callee3, this);}));function baseURI() {return _ref5.apply(this, arguments);}return baseURI;}()


    /**
                                                                                                                                                                                                                                                                                        * @function
                                                                                                                                                                                                                                                                                        * @description Get name
                                                                                                                                                                                                                                                                                        * @returns {String} Name
                                                                                                                                                                                                                                                                                        */ }, { key: 'name', value: function () {var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return (

                  this.params.contract.getContract().methods.name().call());case 2:return _context4.abrupt('return', _context4.sent);case 3:case 'end':return _context4.stop();}}}, _callee4, this);}));function name() {return _ref6.apply(this, arguments);}return name;}()


    /**
                                                                                                                                                                                                                                                                               * @function
                                                                                                                                                                                                                                                                               * @description Get Symbol
                                                                                                                                                                                                                                                                               * @returns {String} Symbol
                                                                                                                                                                                                                                                                               */ }, { key: 'symbol', value: function () {var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:_context5.next = 2;return (

                  this.params.contract.getContract().methods.symbol().call());case 2:return _context5.abrupt('return', _context5.sent);case 3:case 'end':return _context5.stop();}}}, _callee5, this);}));function symbol() {return _ref7.apply(this, arguments);}return symbol;}()


    /**
                                                                                                                                                                                                                                                                                     * @function
                                                                                                                                                                                                                                                                                     * @description Set Base Token URI
                                                                                                                                                                                                                                                                                     */ }, { key: 'mint',




    /**
                                                                                                                                                                                                                                                                                                           * @function
                                                                                                                                                                                                                                                                                                           * @description Mint created TokenID
                                                                                                                                                                                                                                                                                                           * @param {Object} params
                                                                                                                                                                                                                                                                                                           * @param {Address} to Address to send to
                                                                                                                                                                                                                                                                                                           * @param {Integer} tokenId Token Id to use
                                                                                                                                                                                                                                                                                                           */value: function () {var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(_ref9) {var
        to = _ref9.to,tokenId = _ref9.tokenId;return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:_context6.next = 2;return (
                  this.__sendTx(
                  this.params.contract.getContract().methods.mint(to, tokenId)));case 2:return _context6.abrupt('return', _context6.sent);case 3:case 'end':return _context6.stop();}}}, _callee6, this);}));function mint(_x4) {return _ref8.apply(this, arguments);}return mint;}() }]);return ERC721Contract;}(_IContract3.default);var _initialiseProps = function _initialiseProps() {var _this2 = this;this.__assert = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {return _regenerator2.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:if (_this2.getAddress()) {_context7.next = 2;break;}throw new Error('Contract is not deployed, first deploy it and provide a contract address');case 2: /* Use ABI */_this2.params.contract.use(_interfaces.erc721contract, _this2.getAddress());case 3:case 'end':return _context7.stop();}}}, _callee7, _this2);}));this.setBaseTokenURI = function () {var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(_ref12) {var URI = _ref12.URI;return _regenerator2.default.wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:_context8.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.setBaseURI(URI));case 2:return _context8.abrupt('return', _context8.sent);case 3:case 'end':return _context8.stop();}}}, _callee8, _this2);}));return function (_x5) {return _ref11.apply(this, arguments);};}();this.



  deploy = function () {var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(_ref14) {var name = _ref14.name,symbol = _ref14.symbol,callback = _ref14.callback;var params, res;return _regenerator2.default.wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:if (
              name) {_context9.next = 2;break;}throw (
                new Error('Please provide a name'));case 2:if (


              symbol) {_context9.next = 4;break;}throw (
                new Error('Please provide a symbol'));case 4:

              params = [name, symbol];_context9.next = 7;return (
                _this2.__deploy(params, callback));case 7:res = _context9.sent;
              _this2.params.contractAddress = res.contractAddress;
              /* Call to Backend API */_context9.next = 11;return (
                _this2.__assert());case 11:return _context9.abrupt('return',
              res);case 12:case 'end':return _context9.stop();}}}, _callee9, _this2);}));return function (_x6) {return _ref13.apply(this, arguments);};}();};exports.default =



ERC721Contract;