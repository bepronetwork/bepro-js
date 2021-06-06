'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require('babel-runtime/helpers/createClass');var _createClass3 = _interopRequireDefault(_createClass2);var _freeze = require('babel-runtime/core-js/object/freeze');var _freeze2 = _interopRequireDefault(_freeze);var _web = require('web3');var _web2 = _interopRequireDefault(_web);
var _Account = require('./utils/Account');var _Account2 = _interopRequireDefault(_Account);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var ETH_URL_TESTNET = 'https://rinkeby.infura.io/v3/811fe4fa5c4b41cb9b92f9656aaeaa3b';
// you can find this in "./truffle-config.js" file and should match ganache/ganache-cli local server settings too
var ETH_URL_LOCAL_TEST = 'http://localhost:8545';
var TEST_PRIVATE_KEY = '0x7f76de05082c4d578219ca35a905f8debe922f1f00b99315ebf0706afc97f132';
// const LOCAL_TEST_PRIVATE_KEY = '4f4f26f4a82351b1f9a98623f901ad5fb2f3e38ac92ff39955ee8e124c718fa7';

var networksEnum = (0, _freeze2.default)({
  1: 'Ethereum Main',
  2: 'Morden',
  3: 'Ropsten',
  4: 'Rinkeby',
  56: 'BSC Main',
  97: 'BSC Test',
  42: 'Kovan' });


/**
                   * @typedef {Object} Web3Connection~Optional
                   * @property {string} web3Connection Web3 Connection String (Ex : https://data-seed-prebsc-1-s1.binance.org:8545)
                   * @property {string} privateKey Private key (0x....) used for server side use
                   */

/**
                       * @typedef {Object} Web3Connection~Options
                       * @property {boolean} [test=false] Automated Tests
                       * @property {boolean} [localtest=false] Ganache Local Blockchain
                       * @property {Web3Connection~Optional} [opt] Optional Chain Connection Object (Default ETH)
                       */

/**
                           * Web3Connection Object
                           * @class Web3Connection
                           * @param {Web3Connection~Options} options
                           */var
Web3Connection = function () {
  function Web3Connection(_ref)



  {var _ref$test = _ref.test,test = _ref$test === undefined ? false : _ref$test,_ref$localtest = _ref.localtest,localtest = _ref$localtest === undefined ? false : _ref$localtest,_ref$opt = _ref.opt,opt = _ref$opt === undefined ? { web3Connection: ETH_URL_TESTNET, privateKey: TEST_PRIVATE_KEY } : _ref$opt;(0, _classCallCheck3.default)(this, Web3Connection);
    this.test = test;
    this.localtest = localtest;
    this.opt = opt;
    if (this.test) {
      this.start();
      this.login();
      if (!this.localtest) {
        this.account = new _Account2.default(
        this.web3,
        this.web3.eth.accounts.privateKeyToAccount(opt.privateKey));

      }
    }
  }

  /** **** */
  /** * CORE */
  /** **** */

  /**
               * Connect to Web3 injected in the constructor
               * @function
               * @throws {Error} Please Use an Ethereum Enabled Browser like Metamask or Coinbase Wallet
               * @void
               */(0, _createClass3.default)(Web3Connection, [{ key: 'start', value: function start()
    {
      if (this.localtest) {
        this.web3 = new _web2.default(
        new _web2.default.providers.HttpProvider(ETH_URL_LOCAL_TEST),
        // NOTE: depending on your web3 version, you may need to set a number of confirmation blocks
        null,
        { transactionConfirmationBlocks: 1 });

      } else if (this.opt.web3Connection.toLowerCase().includes('http')) {
        this.web3 = new _web2.default(new _web2.default.providers.HttpProvider(this.opt.web3Connection));
      } else {
        this.web3 = new _web2.default(new _web2.default.providers.WebsocketProvider(this.opt.web3Connection));
      }

      if (!this.localtest && this.test) {
        this.account = new _Account2.default(
        this.web3,
        this.web3.eth.accounts.privateKeyToAccount(this.opt.privateKey));

      }

      if (typeof window !== 'undefined') {
        window.web3 = this.web3;
      } else if (!this.test) {
        throw new Error(
        'Please Use an Ethereum Enabled Browser like Metamask or Coinbase Wallet');

      }
    }

    /**
       * Login with Metamask/Web3 Wallet - substitutes start()
       * @function
       * @return {Promise<boolean>}
       */ }, { key: 'login', value: function () {var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.prev = 0;if (!(


                typeof window === 'undefined')) {_context.next = 3;break;}return _context.abrupt('return',
                false);case 3:if (!

                window.ethereum) {_context.next = 9;break;}
                window.web3 = new _web2.default(window.ethereum);
                this.web3 = window.web3;_context.next = 8;return (
                  window.ethereum.enable());case 8:return _context.abrupt('return',
                true);case 9:return _context.abrupt('return',

                false);case 12:_context.prev = 12;_context.t0 = _context['catch'](0);throw _context.t0;case 15:case 'end':return _context.stop();}}}, _callee, this, [[0, 12]]);}));function login() {return _ref2.apply(this, arguments);}return login;}()





    /** ***** */
    /** UTILS */
    /** ***** */

    /**
                  * Get ETH Network
                  * @function
                  * @return {Promise<string>} Network Name (Ex : Kovan)
                  */ }, { key: 'getETHNetwork', value: function () {var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {var netId, networkName;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return (

                  this.web3.eth.net.getId());case 2:netId = _context2.sent;if (!

                networksEnum.hasOwnProperty(netId)) {_context2.next = 7;break;}_context2.t0 =
                networksEnum[netId];_context2.next = 10;break;case 7:_context2.next = 9;return (
                  this.web3.currentProvider.host);case 9:_context2.t0 = _context2.sent;case 10:networkName = _context2.t0;return _context2.abrupt('return',
                networkName);case 12:case 'end':return _context2.stop();}}}, _callee2, this);}));function getETHNetwork() {return _ref3.apply(this, arguments);}return getETHNetwork;}()


    /**
                                                                                                                                                                                          * Get Address connected via login()
                                                                                                                                                                                          * @function
                                                                                                                                                                                          * @return {Promise<string>} Address in Use
                                                                                                                                                                                          */ }, { key: 'getAddress', value: function () {var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {var accounts;return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:if (!

                this.account) {_context3.next = 2;break;}return _context3.abrupt('return', this.account.getAddress());case 2:_context3.next = 4;return (

                  this.web3.eth.getAccounts());case 4:accounts = _context3.sent;return _context3.abrupt('return',
                accounts[0]);case 6:case 'end':return _context3.stop();}}}, _callee3, this);}));function getAddress() {return _ref4.apply(this, arguments);}return getAddress;}()


    /**
                                                                                                                                                                                   * Get ETH Balance of Address connected via login()
                                                                                                                                                                                   * @function
                                                                                                                                                                                   * @return {Promise<string>} ETH Balance
                                                                                                                                                                                   */ }, { key: 'getETHBalance', value: function () {var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {var wei;return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.t0 =

                this.web3.eth;_context4.next = 3;return this.getAddress();case 3:_context4.t1 = _context4.sent;_context4.next = 6;return _context4.t0.getBalance.call(_context4.t0, _context4.t1);case 6:wei = _context4.sent;return _context4.abrupt('return',
                this.web3.utils.fromWei(wei, 'ether'));case 8:case 'end':return _context4.stop();}}}, _callee4, this);}));function getETHBalance() {return _ref5.apply(this, arguments);}return getETHBalance;}() }]);return Web3Connection;}();exports.default =



Web3Connection;