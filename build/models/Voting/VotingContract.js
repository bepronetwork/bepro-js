'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _extends2 = require('babel-runtime/helpers/extends');var _extends3 = _interopRequireDefault(_extends2);var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require('babel-runtime/helpers/createClass');var _createClass3 = _interopRequireDefault(_createClass2);var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);var _inherits2 = require('babel-runtime/helpers/inherits');var _inherits3 = _interopRequireDefault(_inherits2);var _lodash = require('lodash');var _lodash2 = _interopRequireDefault(_lodash);
var _interfaces = require('../../interfaces');
var _ERC20Contract = require('../ERC20/ERC20Contract');var _ERC20Contract2 = _interopRequireDefault(_ERC20Contract);
var _IContract2 = require('../IContract');var _IContract3 = _interopRequireDefault(_IContract2);
var _Numbers = require('../../utils/Numbers');var _Numbers2 = _interopRequireDefault(_Numbers);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

/**
                                                                                                                                                                                              * @typedef {Object} VotingContract~Options
                                                                                                                                                                                              * @property {Boolean} test
                                                                                                                                                                                              * @property {Boolean} localtest ganache local blockchain
                                                                                                                                                                                              * @property {Web3Connection} [web3Connection=Web3Connection] created from params: 'test', 'localtest' and optional 'web3Connection' string and 'privateKey'
                                                                                                                                                                                              * @property {string} [contractAddress]
                                                                                                                                                                                              */

/**
                                                                                                                                                                                                  * Voting Contract Object
                                                                                                                                                                                                  * @class VotingContract
                                                                                                                                                                                                  * @param {VotingContract~Options} options
                                                                                                                                                                                                  */var
VotingContract = function (_IContract) {(0, _inherits3.default)(VotingContract, _IContract);
  function VotingContract() {var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};(0, _classCallCheck3.default)(this, VotingContract);
    try {var _this = (0, _possibleConstructorReturn3.default)(this, (VotingContract.__proto__ || (0, _getPrototypeOf2.default)(VotingContract)).call(this, (0, _extends3.default)({},
      params, { abi: _interfaces.voting })));_initialiseProps.call(_this);
    } catch (err) {
      throw err;
    }return _this;
  }

  /**
     * Get ERC20 Address of the Contract
     * @returns {Promise<Address>}
     */(0, _createClass3.default)(VotingContract, [{ key: 'erc20', value: function () {var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (

                  this.__sendTx(
                  this.params.contract.getContract().methods.erc20(),
                  true));case 2:return _context.abrupt('return', _context.sent);case 3:case 'end':return _context.stop();}}}, _callee, this);}));function erc20() {return _ref.apply(this, arguments);}return erc20;}()



    /**
                                                                                                                                                                                                                         * Creates a Pool
                                                                                                                                                                                                                         * @param {String} params.description
                                                                                                                                                                                                                         * @param {Integer} params.expirationTime
                                                                                                                                                                                                                         * @param {Array | Integer} params.options
                                                                                                                                                                                                                         * @return {Promise<TransactionObject>}
                                                                                                                                                                                                                         */ }, { key: 'createPool', value: function () {var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_ref3) {var

        description = _ref3.description,
        expirationTime = _ref3.expirationTime,
        options = _ref3.options;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return (

                  this.__sendTx(
                  this.params.contract.
                  getContract().
                  methods.createPoll(
                  description,
                  _Numbers2.default.timeToSmartContractTime(expirationTime),
                  options)));case 2:return _context2.abrupt('return', _context2.sent);case 3:case 'end':return _context2.stop();}}}, _callee2, this);}));function createPool(_x2) {return _ref2.apply(this, arguments);}return createPool;}()




    /**
                                                                                                                                                                                                                                               * Creates a Pool
                                                                                                                                                                                                                                               * @param {Integer} params.poolId
                                                                                                                                                                                                                                               * @return {Promise<TransactionObject>}
                                                                                                                                                                                                                                               */ }, { key: 'endPool', value: function () {var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(_ref5) {var

        poolId = _ref5.poolId;return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.next = 2;return (

                  this.__sendTx(
                  this.params.contract.
                  getContract().
                  methods.endPool(
                  poolId)));case 2:return _context3.abrupt('return', _context3.sent);case 3:case 'end':return _context3.stop();}}}, _callee3, this);}));function endPool(_x3) {return _ref4.apply(this, arguments);}return endPool;}()




    /**
                                                                                                                                                                                                                                          * Cast Vote
                                                                                                                                                                                                                                          * @param {Integer} params.poolId Pool Id
                                                                                                                                                                                                                                          * @param {Integer} params.voteId Vote Position on Length
                                                                                                                                                                                                                                          * @return {Promise<TransactionObject>}
                                                                                                                                                                                                                                          */ }, { key: 'castVote', value: function () {var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(_ref7) {var

        poolId = _ref7.poolId,
        voteId = _ref7.voteId;return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return (

                  this.__sendTx(
                  this.params.contract.
                  getContract().
                  methods.castVote(
                  poolId,
                  voteId)));case 2:return _context4.abrupt('return', _context4.sent);case 3:case 'end':return _context4.stop();}}}, _callee4, this);}));function castVote(_x4) {return _ref6.apply(this, arguments);}return castVote;}()




    /**
                                                                                                                                                                                                                                            * Stake Voting Tokens
                                                                                                                                                                                                                                            * @param {Integer} params.tokens Tokens
                                                                                                                                                                                                                                            * @return {Promise<TransactionObject>}
                                                                                                                                                                                                                                            */ }, { key: 'stakeVotingTokens', value: function () {var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(_ref9) {var

        tokens = _ref9.tokens;return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:_context5.next = 2;return (

                  this.__sendTx(
                  this.params.contract.
                  getContract().
                  methods.stakeVotingTokens(
                  _Numbers2.default.toSmartContractDecimals(
                  tokens,
                  this.getERC20Contract().getDecimals()))));case 2:return _context5.abrupt('return', _context5.sent);case 3:case 'end':return _context5.stop();}}}, _callee5, this);}));function stakeVotingTokens(_x5) {return _ref8.apply(this, arguments);}return stakeVotingTokens;}()





    /**
                                                                                                                                                                                                                                                                                            * @typedef {Object} VotingContract~Pool
                                                                                                                                                                                                                                                                                            * @property {Address} creator
                                                                                                                                                                                                                                                                                            * @property {Bool} status
                                                                                                                                                                                                                                                                                            * @property {Integer} optionsSize
                                                                                                                                                                                                                                                                                            * @property {String} description
                                                                                                                                                                                                                                                                                            * @property {Array | Address} voters
                                                                                                                                                                                                                                                                                            * @property {Date} expirationTime
                                                                                                                                                                                                                                                                                            */

    /**
                                                                                                                                                                                                                                                                                                * Get Pool Information
                                                                                                                                                                                                                                                                                                * @function
                                                                                                                                                                                                                                                                                                * @param {Object} params
                                                                                                                                                                                                                                                                                                * @param {Integer} params.poolId
                                                                                                                                                                                                                                                                                                * @return {Promise<VotingContract~Pool>}
                                                                                                                                                                                                                                                                                                */

















    /**
                                                                                                                                                                                                                                                                                                    * Get Pool Winner
                                                                                                                                                                                                                                                                                                    * @function
                                                                                                                                                                                                                                                                                                    * @param {Object} params
                                                                                                                                                                                                                                                                                                    * @param {Integer} params.poolId
                                                                                                                                                                                                                                                                                                    * @return {Integer} Winner Id
                                                                                                                                                                                                                                                                                                    * @return {Integer} Winner Id Index
                                                                                                                                                                                                                                                                                                    */












    /**
                                                                                                                                                                                                                                                                                                       * Get Pool Winner
                                                                                                                                                                                                                                                                                                       * @function
                                                                                                                                                                                                                                                                                                       * @param {Object} params
                                                                                                                                                                                                                                                                                                       * @param {Integer} params.poolId Pool Id
                                                                                                                                                                                                                                                                                                       * @param {Integer} params.optionIndex Option Id for Pool
                                                                                                                                                                                                                                                                                                       * @return {Integer} Option Id
                                                                                                                                                                                                                                                                                                       */









    /**
                                                                                                                                                                                                                                                                                                          * Get Pool History for Address
                                                                                                                                                                                                                                                                                                          * @function
                                                                                                                                                                                                                                                                                                          * @param {Object} params
                                                                                                                                                                                                                                                                                                          * @param {Address} params.address
                                                                                                                                                                                                                                                                                                          * @return {Array | Integer} Pool Ids
                                                                                                                                                                                                                                                                                                          */











    /**
                                                                                                                                                                                                                                                                                                              * Get Pool Info for Voter
                                                                                                                                                                                                                                                                                                              * @function
                                                                                                                                                                                                                                                                                                              * @param {Object} params
                                                                                                                                                                                                                                                                                                              * @param {Integer} params.poolId
                                                                                                                                                                                                                                                                                                              * @param {Address} params.voter
                                                                                                                                                                                                                                                                                                              * @return {Integer} Vote
                                                                                                                                                                                                                                                                                                              * @return {Integer} Weigth (Token Value)
                                                                                                                                                                                                                                                                                                              */















    /**
                                                                                                                                                                                                                                                                                                                  * Check if a User has voted
                                                                                                                                                                                                                                                                                                                  * @function
                                                                                                                                                                                                                                                                                                                  * @param {Object} params
                                                                                                                                                                                                                                                                                                                  * @param {Integer} params.poolId
                                                                                                                                                                                                                                                                                                                  * @param {Address} params.voter
                                                                                                                                                                                                                                                                                                                  * @return {Bool} HasVoted
                                                                                                                                                                                                                                                                                                                  */










    /**
                                                                                                                                                                                                                                                                                                                     * Get Locked Amount
                                                                                                                                                                                                                                                                                                                     * @function
                                                                                                                                                                                                                                                                                                                     * @param {Object} params
                                                                                                                                                                                                                                                                                                                     * @param {Address} params.voter
                                                                                                                                                                                                                                                                                                                     * @return {Integer} Locked Amount
                                                                                                                                                                                                                                                                                                                     */ }, { key: 'withdrawTokens',












    /**
                                                                                                                                                                                                                                                                                                                                                    * Withdraw Tokens from Voting
                                                                                                                                                                                                                                                                                                                                                    * @param {Integer} params.tokens Tokens
                                                                                                                                                                                                                                                                                                                                                    * @return {Promise<TransactionObject>}
                                                                                                                                                                                                                                                                                                                                                    */value: function () {var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(_ref11) {var

        tokens = _ref11.tokens;return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:_context6.next = 2;return (

                  this.__sendTx(
                  this.params.contract.
                  getContract().
                  methods.withdrawTokens(
                  _Numbers2.default.toSmartContractDecimals(
                  tokens,
                  this.getERC20Contract().getDecimals()))));case 2:return _context6.abrupt('return', _context6.sent);case 3:case 'end':return _context6.stop();}}}, _callee6, this);}));function withdrawTokens(_x6) {return _ref10.apply(this, arguments);}return withdrawTokens;}()





    /**
                                                                                                                                                                                                                                                                                       * @async
                                                                                                                                                                                                                                                                                       * @function
                                                                                                                                                                                                                                                                                       * @throws {Error} Contract is not deployed, first deploy it and provide a contract address
                                                                                                                                                                                                                                                                                       * @void
                                                                                                                                                                                                                                                                                       */























    /**
                                                                                                                                                                                                                                                                                           * Deploy the Staking Contract
                                                                                                                                                                                                                                                                                           * @function
                                                                                                                                                                                                                                                                                           * @param [Object] params
                                                                                                                                                                                                                                                                                           * @param {Address} params.erc20Contract
                                                                                                                                                                                                                                                                                           * @param {function():void} params.callback
                                                                                                                                                                                                                                                                                           * @return {Promise<*>}
                                                                                                                                                                                                                                                                                           */









    /**
                                                                                                                                                                                                                                                                                               * @function
                                                                                                                                                                                                                                                                                               * @return ERC20Contract|undefined
                                                                                                                                                                                                                                                                                               */ }]);return VotingContract;}(_IContract3.default);var _initialiseProps = function _initialiseProps() {var _this2 = this;this.getPoolInformation = function () {var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(_ref13) {var poolId = _ref13.poolId;var res;return _regenerator2.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:_context7.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.getPoolInformation(poolId), true);case 2:res = _context7.sent;return _context7.abrupt('return', { _id: poolId, creator: res[0], status: res[1], optionsSize: parseInt(res[2], 10), descripton: res[3], voters: res[4], expirationTime: _Numbers2.default.fromSmartContractTimeToMinutes(res[5]) });case 4:case 'end':return _context7.stop();}}}, _callee7, _this2);}));return function (_x7) {return _ref12.apply(this, arguments);};}();this.getPoolWinner = function () {var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(_ref15) {var poolId = _ref15.poolId;var res;return _regenerator2.default.wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:_context8.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.getPoolWinner(poolId), true);case 2:res = _context8.sent;return _context8.abrupt('return', { winnerId: parseInt(res[0], 10), optionId: parseInt(res[1], 10) });case 4:case 'end':return _context8.stop();}}}, _callee8, _this2);}));return function (_x8) {return _ref14.apply(this, arguments);};}();this.getPollOptionById = function () {var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(_ref17) {var poolId = _ref17.poolId,optionIndex = _ref17.optionIndex;var res;return _regenerator2.default.wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:_context9.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.getPollOptionById(poolId, optionIndex), true);case 2:res = _context9.sent;return _context9.abrupt('return', parseInt(res[0], 10));case 4:case 'end':return _context9.stop();}}}, _callee9, _this2);}));return function (_x9) {return _ref16.apply(this, arguments);};}();this.getPollHistory = function () {var _ref18 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(_ref19) {var address = _ref19.address;var res;return _regenerator2.default.wrap(function _callee10$(_context10) {while (1) {switch (_context10.prev = _context10.next) {case 0:_context10.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.getPollHistory(address), true);case 2:res = _context10.sent;return _context10.abrupt('return', { pools: res[0].map(function (r) {return parseInt(r, 10);}) });case 4:case 'end':return _context10.stop();}}}, _callee10, _this2);}));return function (_x10) {return _ref18.apply(this, arguments);};}();this.getPollInfoForVoter = function () {var _ref20 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(_ref21) {var poolId = _ref21.poolId,voter = _ref21.voter;var res;return _regenerator2.default.wrap(function _callee11$(_context11) {while (1) {switch (_context11.prev = _context11.next) {case 0:_context11.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.getPollInfoForVoter(poolId, voter), true);case 2:res = _context11.sent;return _context11.abrupt('return', { vote: parseInt(res[0], 10), weigth: _Numbers2.default.toSmartContractDecimals(res[1], _this2.getERC20Contract().getDecimals()) });case 4:case 'end':return _context11.stop();}}}, _callee11, _this2);}));return function (_x11) {return _ref20.apply(this, arguments);};}();this.userHasVoted = function () {var _ref22 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(_ref23) {var poolId = _ref23.poolId,voter = _ref23.voter;var res;return _regenerator2.default.wrap(function _callee12$(_context12) {while (1) {switch (_context12.prev = _context12.next) {case 0:_context12.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.userHasVoted(poolId, voter), true);case 2:res = _context12.sent;return _context12.abrupt('return', res[0]);case 4:case 'end':return _context12.stop();}}}, _callee12, _this2);}));return function (_x12) {return _ref22.apply(this, arguments);};}();this.getLockedAmount = function () {var _ref24 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(_ref25) {var voter = _ref25.voter;var res;return _regenerator2.default.wrap(function _callee13$(_context13) {while (1) {switch (_context13.prev = _context13.next) {case 0:_context13.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.getLockedAmount(voter), true);case 2:res = _context13.sent;return _context13.abrupt('return', _Numbers2.default.toSmartContractDecimals(res[0], _this2.getERC20Contract().getDecimals()));case 4:case 'end':return _context13.stop();}}}, _callee13, _this2);}));return function (_x13) {return _ref24.apply(this, arguments);};}();this.__assert = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14() {return _regenerator2.default.wrap(function _callee14$(_context14) {while (1) {switch (_context14.prev = _context14.next) {case 0:if (_this2.getAddress()) {_context14.next = 2;break;}throw new Error('Contract is not deployed, first deploy it and provide a contract address');case 2: /* Use ABI */_this2.params.contract.use(_interfaces.voting, _this2.getAddress()); /* Set Token Address Contract for easy access */if (_this2.params.ERC20Contract) {_context14.next = 11;break;}_context14.t0 = _ERC20Contract2.default;_context14.t1 = _this2.web3Connection;_context14.next = 8;return _this2.erc20();case 8:_context14.t2 = _context14.sent;_context14.t3 = { web3Connection: _context14.t1, contractAddress: _context14.t2 };_this2.params.ERC20Contract = new _context14.t0(_context14.t3);case 11:_context14.next = 13;return _this2.params.ERC20Contract.login();case 13:_context14.next = 15;return _this2.params.ERC20Contract.__assert();case 15:case 'end':return _context14.stop();}}}, _callee14, _this2);}));this.deploy = function () {var _ref27 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15() {var _ref28 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},erc20Contract = _ref28.erc20Contract,callback = _ref28.callback;var params, res;return _regenerator2.default.wrap(function _callee15$(_context15) {while (1) {switch (_context15.prev = _context15.next) {case 0:params = [erc20Contract];_context15.next = 3;return _this2.__deploy(params, callback);case 3:res = _context15.sent;_this2.params.contractAddress = res.contractAddress; /* Call to Backend API */_context15.next = 7;return _this2.__assert();case 7:return _context15.abrupt('return', res);case 8:case 'end':return _context15.stop();}}}, _callee15, _this2);}));return function () {return _ref27.apply(this, arguments);};}();this.
  getERC20Contract = function () {return _this2.params.ERC20Contract;};};exports.default =


VotingContract;