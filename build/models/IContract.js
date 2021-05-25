'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _promise = require('babel-runtime/core-js/promise');var _promise2 = _interopRequireDefault(_promise);var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require('babel-runtime/helpers/createClass');var _createClass3 = _interopRequireDefault(_createClass2);var _lodash = require('lodash');var _lodash2 = _interopRequireDefault(_lodash);
var _Contract = require('../utils/Contract');var _Contract2 = _interopRequireDefault(_Contract);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

/**
                                                                                                                                                                                               * Contract Object Interface
                                                                                                                                                                                               * @class IContract
                                                                                                                                                                                               * @param {Web3} web3
                                                                                                                                                                                               * @param {Address} contractAddress ? (opt)
                                                                                                                                                                                               * @param {ABI} abi
                                                                                                                                                                                               * @param {Account} acc ? (opt)
                                                                                                                                                                                               * @param {Address} tokenAddress ? (opt)
                                                                                                                                                                                               */var

IContract = function () {
  function IContract(_ref)





  {var web3 = _ref.web3,_ref$contractAddress = _ref.contractAddress,contractAddress = _ref$contractAddress === undefined ? null : _ref$contractAddress,abi = _ref.abi,acc = _ref.acc,tokenAddress = _ref.tokenAddress;(0, _classCallCheck3.default)(this, IContract);_initialiseProps.call(this);
    try {
      if (!abi) {
        throw new Error('No ABI Interface provided');
      }
      if (!web3) {
        throw new Error('Please provide a valid web3 provider');
      }

      this.web3 = web3;

      if (acc) {
        this.acc = acc;
      }
      this.params = {
        web3: web3,
        abi: abi,
        contractAddress: contractAddress,
        tokenAddress: tokenAddress,
        contract: new _Contract2.default(web3, abi, contractAddress) };

    } catch (err) {
      throw err;
    }
  }





















































































  /**
     * @function
     * @description Deploy the Contract
     */(0, _createClass3.default)(IContract, [{ key: 'getWeb3Contract',









    /**
                                                                         * @function
                                                                         * @description Get Web3 Contract to interact directly with the web3 library functions like events (https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html?highlight=events#contract-events)
                                                                         */value: function getWeb3Contract()
    {
      return this.params.contract.getContract();
    }

    /**
       * @function
       * @description Set New Owner of the Contract
       * @param {string} address
       */ }, { key: 'setNewOwner', value: function () {var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref3) {var
        address = _ref3.address;return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (
                  this.__sendTx(
                  this.params.contract.getContract().methods.transferOwnership(address)));case 2:return _context.abrupt('return', _context.sent);case 3:case 'end':return _context.stop();}}}, _callee, this);}));function setNewOwner(_x) {return _ref2.apply(this, arguments);}return setNewOwner;}()



    /**
                                                                                                                                                                                                                                                                                                         * @function
                                                                                                                                                                                                                                                                                                         * @description Get Owner of the Contract
                                                                                                                                                                                                                                                                                                         * @returns {string} address
                                                                                                                                                                                                                                                                                                         */ }, { key: 'owner', value: function () {var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return (

                  this.params.contract.getContract().methods.owner().call());case 2:return _context2.abrupt('return', _context2.sent);case 3:case 'end':return _context2.stop();}}}, _callee2, this);}));function owner() {return _ref4.apply(this, arguments);}return owner;}()


    /**
                                                                                                                                                                                                                                                                                  * @function
                                                                                                                                                                                                                                                                                  * @description Get Owner of the Contract
                                                                                                                                                                                                                                                                                  * @returns {boolean}
                                                                                                                                                                                                                                                                                  */ }, { key: 'isPaused', value: function () {var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.next = 2;return (

                  this.params.contract.getContract().methods.paused().call());case 2:return _context3.abrupt('return', _context3.sent);case 3:case 'end':return _context3.stop();}}}, _callee3, this);}));function isPaused() {return _ref5.apply(this, arguments);}return isPaused;}()


    /**
                                                                                                                                                                                                                                                                                         * @function
                                                                                                                                                                                                                                                                                         * @type admin
                                                                                                                                                                                                                                                                                         * @description Pause Contract
                                                                                                                                                                                                                                                                                         */ }, { key: 'pauseContract', value: function () {var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return (

                  this.__sendTx(
                  this.params.contract.getContract().methods.pause()));case 2:return _context4.abrupt('return', _context4.sent);case 3:case 'end':return _context4.stop();}}}, _callee4, this);}));function pauseContract() {return _ref6.apply(this, arguments);}return pauseContract;}()



    /**
                                                                                                                                                                                                                                                                                            * @function
                                                                                                                                                                                                                                                                                            * @type admin
                                                                                                                                                                                                                                                                                            * @description Unpause Contract
                                                                                                                                                                                                                                                                                            */ }, { key: 'unpauseContract', value: function () {var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:_context5.next = 2;return (

                  this.__sendTx(
                  this.params.contract.getContract().methods.unpause()));case 2:return _context5.abrupt('return', _context5.sent);case 3:case 'end':return _context5.stop();}}}, _callee5, this);}));function unpauseContract() {return _ref7.apply(this, arguments);}return unpauseContract;}()



    /* Optional */

    /**
                    * @function
                    * @description Remove Tokens from other ERC20 Address (in case of accident)
                    * @param {Address} tokenAddress
                    * @param {Address} toAddress
                    */ }, { key: 'removeOtherERC20Tokens', value: function () {var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(_ref9) {var
        tokenAddress = _ref9.tokenAddress,toAddress = _ref9.toAddress;return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:_context6.next = 2;return (
                  this.__sendTx(
                  this.params.contract.
                  getContract().
                  methods.removeOtherERC20Tokens(tokenAddress, toAddress)));case 2:return _context6.abrupt('return', _context6.sent);case 3:case 'end':return _context6.stop();}}}, _callee6, this);}));function removeOtherERC20Tokens(_x2) {return _ref8.apply(this, arguments);}return removeOtherERC20Tokens;}()



    /**
                                                                                                                                                                                                                                                                                                                      * @function
                                                                                                                                                                                                                                                                                                                      * @description Remove all tokens for the sake of bug or problem in the smart contract, contract has to be paused first, only Admin
                                                                                                                                                                                                                                                                                                                      * @param {Address} toAddress
                                                                                                                                                                                                                                                                                                                      */ }, { key: 'safeGuardAllTokens', value: function () {var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(_ref11) {var
        toAddress = _ref11.toAddress;return _regenerator2.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:_context7.next = 2;return (
                  this.__sendTx(
                  this.params.contract.getContract().methods.safeGuardAllTokens(toAddress)));case 2:return _context7.abrupt('return', _context7.sent);case 3:case 'end':return _context7.stop();}}}, _callee7, this);}));function safeGuardAllTokens(_x3) {return _ref10.apply(this, arguments);}return safeGuardAllTokens;}()



    /**
                                                                                                                                                                                                                                                                                                                                * @function
                                                                                                                                                                                                                                                                                                                                * @description Change Token Address of Application
                                                                                                                                                                                                                                                                                                                                * @param {Address} newTokenAddress
                                                                                                                                                                                                                                                                                                                                */ }, { key: 'changeTokenAddress', value: function () {var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(_ref13) {var
        newTokenAddress = _ref13.newTokenAddress;return _regenerator2.default.wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:_context8.next = 2;return (
                  this.__sendTx(
                  this.params.contract.
                  getContract().
                  methods.changeTokenAddress(newTokenAddress)));case 2:return _context8.abrupt('return', _context8.sent);case 3:case 'end':return _context8.stop();}}}, _callee8, this);}));function changeTokenAddress(_x4) {return _ref12.apply(this, arguments);}return changeTokenAddress;}()



    /**
                                                                                                                                                                                                                                                                                                   * @function
                                                                                                                                                                                                                                                                                                   * @description Get Balance of Contract
                                                                                                                                                                                                                                                                                                   * @param {Integer} Balance
                                                                                                                                                                                                                                                                                                   */ }, { key: 'getAddress', value: function getAddress()
    {
      return this.params.contractAddress;
    }

    /**
       * @function
       * @description Get Balance of Contract
       * @param {Integer} Balance
       */ }, { key: 'getBalance', value: function () {var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {var wei;return _regenerator2.default.wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:_context9.next = 2;return (

                  this.web3.eth.getBalance(this.getAddress()));case 2:wei = _context9.sent;return _context9.abrupt('return',
                this.web3.utils.fromWei(wei, 'ether'));case 4:case 'end':return _context9.stop();}}}, _callee9, this);}));function getBalance() {return _ref14.apply(this, arguments);}return getBalance;}()


    /**
                                                                                                                                                                                                              * @function
                                                                                                                                                                                                              * @description Get contract current user/sender address
                                                                                                                                                                                                              * @param {Address} User address
                                                                                                                                                                                                              */ }, { key: 'getUserAddress', value: function () {var _ref15 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10() {var accounts;return _regenerator2.default.wrap(function _callee10$(_context10) {while (1) {switch (_context10.prev = _context10.next) {case 0:if (!

                this.acc) {_context10.next = 2;break;}return _context10.abrupt('return', this.acc.getAddress());case 2:_context10.next = 4;return (

                  this.params.web3.eth.getAccounts());case 4:accounts = _context10.sent;return _context10.abrupt('return',
                accounts[0]);case 6:case 'end':return _context10.stop();}}}, _callee10, this);}));function getUserAddress() {return _ref15.apply(this, arguments);}return getUserAddress;}()


    /**
                                                                                                                                                                                              * @function
                                                                                                                                                                                              * @description Verify that current user/sender is admin, throws an error otherwise
                                                                                                                                                                                              * @throws {Error}
                                                                                                                                                                                              */ }, { key: 'onlyOwner', value: function () {var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11() {var adminAddress, userAddress, isAdmin;return _regenerator2.default.wrap(function _callee11$(_context11) {while (1) {switch (_context11.prev = _context11.next) {case 0:_context11.next = 2;return (


                  this.owner());case 2:adminAddress = _context11.sent;_context11.next = 5;return (
                  this.getUserAddress());case 5:userAddress = _context11.sent;
                isAdmin = adminAddress === userAddress;if (
                isAdmin) {_context11.next = 9;break;}throw (
                  new Error('Only admin can perform this operation'));case 9:case 'end':return _context11.stop();}}}, _callee11, this);}));function onlyOwner() {return _ref16.apply(this, arguments);}return onlyOwner;}()



    /**
                                                                                                                                                                                                                             * @function
                                                                                                                                                                                                                             * @description Verify that contract is not paused before sending a transaction, throws an error otherwise
                                                                                                                                                                                                                             * @throws {Error}
                                                                                                                                                                                                                             */ }, { key: 'whenNotPaused', value: function () {var _ref17 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12() {var paused;return _regenerator2.default.wrap(function _callee12$(_context12) {while (1) {switch (_context12.prev = _context12.next) {case 0:_context12.next = 2;return (


                  this.isPaused());case 2:paused = _context12.sent;if (!
                paused) {_context12.next = 5;break;}throw (
                  new Error('Contract is paused'));case 5:case 'end':return _context12.stop();}}}, _callee12, this);}));function whenNotPaused() {return _ref17.apply(this, arguments);}return whenNotPaused;}() }]);return IContract;}();var _initialiseProps = function _initialiseProps() {var _this = this;this.__init__ = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13() {return _regenerator2.default.wrap(function _callee13$(_context13) {while (1) {switch (_context13.prev = _context13.next) {case 0:_context13.prev = 0;if (_this.getAddress()) {_context13.next = 3;break;}throw new Error('Please add a Contract Address');case 3:_context13.next = 5;return _this.__assert();case 5:_context13.next = 10;break;case 7:_context13.prev = 7;_context13.t0 = _context13['catch'](0);throw _context13.t0;case 10:case 'end':return _context13.stop();}}}, _callee13, _this, [[0, 7]]);}));this.__metamaskCall = function () {var _ref19 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(_ref20) {var f = _ref20.f,acc = _ref20.acc,value = _ref20.value,_ref20$callback = _ref20.callback,callback = _ref20$callback === undefined ? function () {} : _ref20$callback;return _regenerator2.default.wrap(function _callee14$(_context14) {while (1) {switch (_context14.prev = _context14.next) {case 0:return _context14.abrupt('return', new _promise2.default(function (resolve, reject) {f.send({ from: acc, value: value, gasPrice: 20000000000, // temp test
                  gas: 5913388 // 6721975 //temp test
                }).on('confirmation', function (confirmationNumber, receipt) {callback(confirmationNumber);if (confirmationNumber > 0) {resolve(receipt);}}).on('error', function (err) {reject(err);});}));case 1:case 'end':return _context14.stop();}}}, _callee14, _this);}));return function (_x5) {return _ref19.apply(this, arguments);};}();this.__sendTx = function () {var _ref21 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15(f) {var call = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;var value = arguments[2];var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {};var res, accounts, data;return _regenerator2.default.wrap(function _callee15$(_context15) {while (1) {switch (_context15.prev = _context15.next) {case 0:_context15.prev = 0;res = void 0;if (!(!_this.acc && !call)) {_context15.next = 12;break;}_context15.next = 5;return _this.params.web3.eth.getAccounts();case 5:accounts = _context15.sent;console.log('---__sendTx.bp0');_context15.next = 9;return _this.__metamaskCall({ f: f, acc: accounts[0], value: value, callback: callback });case 9:res = _context15.sent;_context15.next = 28;break;case 12:if (!(_this.acc && !call)) {_context15.next = 19;break;}data = f.encodeABI();_context15.next = 16;return _this.params.contract.send(_this.acc.getAccount(), data, value).catch(function (err) {throw err;});case 16:res = _context15.sent;_context15.next = 28;break;case 19:if (!(_this.acc && call)) {_context15.next = 25;break;}_context15.next = 22;return f.call({ from: _this.acc.getAddress() }).catch(function (err) {throw err;});case 22:res = _context15.sent;_context15.next = 28;break;case 25:_context15.next = 27;return f.call().catch(function (err) {throw err;});case 27:res = _context15.sent;case 28:return _context15.abrupt('return', res);case 31:_context15.prev = 31;_context15.t0 = _context15['catch'](0);throw _context15.t0;case 34:case 'end':return _context15.stop();}}}, _callee15, _this, [[0, 31]]);}));return function (_x6) {return _ref21.apply(this, arguments);};}();this.__deploy = function () {var _ref22 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16(params, callback) {return _regenerator2.default.wrap(function _callee16$(_context16) {while (1) {switch (_context16.prev = _context16.next) {case 0:_context16.next = 2;return _this.params.contract.deploy(_this.acc, _this.params.contract.getABI(), _this.params.contract.getJSON().bytecode, params, callback);case 2:return _context16.abrupt('return', _context16.sent);case 3:case 'end':return _context16.stop();}}}, _callee16, _this);}));return function (_x9, _x10) {return _ref22.apply(this, arguments);};}();this.__assert = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee17() {return _regenerator2.default.wrap(function _callee17$(_context17) {while (1) {switch (_context17.prev = _context17.next) {case 0:if (_this.getAddress()) {_context17.next = 2;break;}throw new Error('Contract is not deployed, first deploy it and provide a contract address');case 2: /* Use ABI */_this.params.contract.use(_this.params.abi, _this.getAddress());case 3:case 'end':return _context17.stop();}}}, _callee17, _this);}));this.deploy = function () {var _ref24 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee18(_ref25) {var callback = _ref25.callback;var params, res;return _regenerator2.default.wrap(function _callee18$(_context18) {while (1) {switch (_context18.prev = _context18.next) {case 0:params = [];_context18.next = 3;return _this.__deploy(params, callback);case 3:res = _context18.sent;_this.params.contractAddress = res.contractAddress; /* Call to Backend API */_context18.next = 7;return _this.__assert();case 7:return _context18.abrupt('return', res);case 8:case 'end':return _context18.stop();}}}, _callee18, _this);}));return function (_x11) {return _ref24.apply(this, arguments);};}();};exports.default =


IContract;