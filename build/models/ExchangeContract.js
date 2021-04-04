"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require("babel-runtime/regenerator");var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _extends2 = require("babel-runtime/helpers/extends");var _extends3 = _interopRequireDefault(_extends2);var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require("babel-runtime/helpers/createClass");var _createClass3 = _interopRequireDefault(_createClass2);var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);var _inherits2 = require("babel-runtime/helpers/inherits");var _inherits3 = _interopRequireDefault(_inherits2);var _interfaces = require("../interfaces");
var _Numbers = require("../utils/Numbers");var _Numbers2 = _interopRequireDefault(_Numbers);
var _lodash = require("lodash");var _lodash2 = _interopRequireDefault(_lodash);
var _IContract2 = require("./IContract");var _IContract3 = _interopRequireDefault(_IContract2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

/**
                                                                                                                                                                                              * Exchange Contract Object
                                                                                                                                                                                              * @constructor ExchangeContract
                                                                                                                                                                                              * @param {Web3} web3
                                                                                                                                                                                              * @param {Address} tokenAddress
                                                                                                                                                                                              * @param {Integer} decimals
                                                                                                                                                                                              * @param {Address} contractAddress ? (opt)
                                                                                                                                                                                              */var

ExchangeContract = function (_IContract) {(0, _inherits3.default)(ExchangeContract, _IContract);
	function ExchangeContract(params) {(0, _classCallCheck3.default)(this, ExchangeContract);var _this = (0, _possibleConstructorReturn3.default)(this, (ExchangeContract.__proto__ || (0, _getPrototypeOf2.default)(ExchangeContract)).call(this, (0, _extends3.default)({
			abi: _interfaces.exchange }, params)));_initialiseProps.call(_this);return _this;
	}

	/* Get Functions */
	/**
                      * @function getEvents
                      * @description Get Events 
                      * @returns {Integer | Array} Get Events ID
                      */(0, _createClass3.default)(ExchangeContract, [{ key: "getEvents", value: function () {var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {var res;return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (

									this.params.contract.
									getContract().
									methods.getEvents().
									call());case 2:res = _context.sent;return _context.abrupt("return",
								res.map(function (id) {return _Numbers2.default.fromHex(id);}));case 4:case "end":return _context.stop();}}}, _callee, this);}));function getEvents() {return _ref.apply(this, arguments);}return getEvents;}()



		/**
                                                                                                                                                                                                                         * @function getMyEvents
                                                                                                                                                                                                                         * @description Get Events 
                                                                                                                                                                                                                         * @returns {Integer | Array} Get Events ID
                                                                                                                                                                                                                        */ }, { key: "getMyEvents", value: function () {var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {var res;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return (

									this.__sendTx(
									this.params.contract.getContract().methods.getMyEvents(),
									true));case 2:res = _context2.sent;return _context2.abrupt("return",

								res.map(function (id) {return _Numbers2.default.fromHex(id);}));case 4:case "end":return _context2.stop();}}}, _callee2, this);}));function getMyEvents() {return _ref2.apply(this, arguments);}return getMyEvents;}()


		/**
                                                                                                                                                                                                                                * @function getEventData
                                                                                                                                                                                                                                * @description Get EventData 
                                                                                                                                                                                                                                * @param {Integer} event_id
                                                                                                                                                                                                                                * @returns {String} Event Name
                                                                                                                                                                                                                                * @returns {Integer} Result Id
                                                                                                                                                                                                                                * @returns {String} URL Oracle
                                                                                                                                                                                                                                * @returns {Boolean} Is Resolved
                                                                                                                                                                                                                                */ }, { key: "getEventData", value: function () {var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(_ref4) {var
				event_id = _ref4.event_id;var r;return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.next = 2;return (

									this.__sendTx(
									this.params.contract.getContract().methods.getEventData(event_id),
									true));case 2:r = _context3.sent;return _context3.abrupt("return",


								{
									name: r[0],
									_resultId: _Numbers2.default.fromHex(r[1]),
									urlOracle: r[2],
									isResolved: r[3] });case 4:case "end":return _context3.stop();}}}, _callee3, this);}));function getEventData(_x) {return _ref3.apply(this, arguments);}return getEventData;}()




		/**
                                                                                                                                                                                         * @function getMyEventHoldings
                                                                                                                                                                                         * @description Get My Event Holdings 
                                                                                                                                                                                         * @param {Integer} event_id
                                                                                                                                                                                         * @returns {Integer} 1 In Pool Balances
                                                                                                                                                                                         * @returns {Integer} 1 Out Pool Balances
                                                                                                                                                                                         * @returns {Integer} 1 Liquidity Balances
                                                                                                                                                                                         * @returns {Integer} 2 In Pool Balances
                                                                                                                                                                                         * @returns {Integer} 2 Out Pool Balances
                                                                                                                                                                                         * @returns {Integer} 2 Liquidity Balances
                                                                                                                                                                                         */ }, { key: "getMyEventHoldings", value: function () {var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(_ref6) {var

				event_id = _ref6.event_id;var r;return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return (

									this.__sendTx(
									this.params.contract.getContract().methods.getMyEventHoldings(event_id),
									true));case 2:r = _context4.sent;return _context4.abrupt("return",


								{
									inPoolBalancesA: r[0],
									outPoolBalancesA: r[1],
									liquidityA: r[2],
									inPoolBalancesB: r[3],
									outPoolBalancesB: r[4],
									liquidityB: r[5] });case 4:case "end":return _context4.stop();}}}, _callee4, this);}));function getMyEventHoldings(_x2) {return _ref5.apply(this, arguments);}return getMyEventHoldings;}()



		/**
                                                                                                                                                                                                      * @function getResultSpaceData
                                                                                                                                                                                                      * @description Get Result Space Data
                                                                                                                                                                                                      * @param {Integer} event_id
                                                                                                                                                                                                      * @param {Integer} resultSpace_id
                                                                                                                                                                                                      * @returns {Integer} _id
                                                                                                                                                                                                      * @returns {Integer} _resultId
                                                                                                                                                                                                      * @returns {Integer} pool
                                                                                                                                                                                                      * @returns {Integer} cost
                                                                                                                                                                                                      * @returns {Integer} odd
                                                                                                                                                                                                      * @returns {Integer} amount
                                                                                                                                                                                                      * @returns {Integer} inPool
                                                                                                                                                                                                      * @returns {Integer} outPool
                                                                                                                                                                                                      * @returns {Integer} fees
                                                                                                                                                                                                      * @returns {Integer} liqAmount
                                                                                                                                                                                                      */ }, { key: "getResultSpaceData", value: function () {var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(_ref8) {var

				event_id = _ref8.event_id,resultSpace_id = _ref8.resultSpace_id;var r;return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:_context5.next = 2;return (

									this.__sendTx(
									this.params.contract.getContract().methods.getResultSpaceData(event_id, resultSpace_id),
									true));case 2:r = _context5.sent;return _context5.abrupt("return",


								{
									_id: _Numbers2.default.fromHex(r[0]),
									_resultId: _Numbers2.default.fromHex(r[1]),
									pool: _Numbers2.default.fromDecimals(r[2], 18),
									cost: _Numbers2.default.fromDecimals(r[3], 7),
									odd: _Numbers2.default.fromDecimals(r[4], 4),
									amount: _Numbers2.default.fromDecimals(r[5], 7),
									inPool: _Numbers2.default.fromDecimals(r[6], 7),
									outPool: _Numbers2.default.fromDecimals(r[7], 7),
									fees: _Numbers2.default.fromDecimals(r[8], 7),
									liqAmount: _Numbers2.default.fromDecimals(r[9], 7) });case 4:case "end":return _context5.stop();}}}, _callee5, this);}));function getResultSpaceData(_x3) {return _ref7.apply(this, arguments);}return getResultSpaceData;}()



		/**
                                                                                                                                                                                                                                       * @function isEventOpen
                                                                                                                                                                                                                                       * @description To see if Event is open
                                                                                                                                                                                                                                       * @returns {Boolean}
                                                                                                                                                                                                                                       */ }, { key: "isEventOpen", value: function () {var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:_context6.next = 2;return (

									this.params.contract.getContract().methods.isEventOpen().call());case 2:return _context6.abrupt("return", _context6.sent);case 3:case "end":return _context6.stop();}}}, _callee6, this);}));function isEventOpen() {return _ref9.apply(this, arguments);}return isEventOpen;}()



		/**
                                                                                                                                                                                                                                                                                           * @function getFractionsCost
                                                                                                                                                                                                                                                                                           * @description Get Fractions Cost
                                                                                                                                                                                                                                                                                           * @param {Integer} event_id
                                                                                                                                                                                                                                                                                           * @param {Integer} resultSpace_id
                                                                                                                                                                                                                                                                                           * @param {Integer} fractions_amount
                                                                                                                                                                                                                                                                                           * @return {Integer} cost
                                                                                                                                                                                                                                                                                           */ }, { key: "getFractionsCost", value: function () {var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(_ref11) {var

				event_id = _ref11.event_id,resultSpace_id = _ref11.resultSpace_id,fractions_amount = _ref11.fractions_amount;return _regenerator2.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:_context7.t0 =
								_Numbers2.default;_context7.next = 3;return this.__sendTx(
								this.params.contract.getContract().methods.getFractionsCost(event_id, resultSpace_id, fractions_amount), true);case 3:_context7.t1 = _context7.sent;return _context7.abrupt("return", _context7.t0.fromDecimals.call(_context7.t0, _context7.t1, 18));case 5:case "end":return _context7.stop();}}}, _callee7, this);}));function getFractionsCost(_x4) {return _ref10.apply(this, arguments);}return getFractionsCost;}()


		/**
                                                                                                                                                                                                                                                                                                                                                                                                                                   * @function getSlipageOnBuy
                                                                                                                                                                                                                                                                                                                                                                                                                                   * @description Get Slipage on Buy
                                                                                                                                                                                                                                                                                                                                                                                                                                   * @param {Integer} event_id
                                                                                                                                                                                                                                                                                                                                                                                                                                   * @param {Integer} resultSpace_id
                                                                                                                                                                                                                                                                                                                                                                                                                                   * @param {Integer} fractions_amount
                                                                                                                                                                                                                                                                                                                                                                                                                                   * @returns {Integer} _id
                                                                                                                                                                                                                                                                                                                                                                                                                                   */ }, { key: "getSlipageOnBuy", value: function () {var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(_ref13) {var
				event_id = _ref13.event_id,resultSpace_id = _ref13.resultSpace_id,fractions_amount = _ref13.fractions_amount;return _regenerator2.default.wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:_context8.next = 2;return (
									this.params.contract.getContract().methods.getSlipageOnBuy(event_id, resultSpace_id, fractions_amount).call());case 2:return _context8.abrupt("return", _context8.sent);case 3:case "end":return _context8.stop();}}}, _callee8, this);}));function getSlipageOnBuy(_x5) {return _ref12.apply(this, arguments);}return getSlipageOnBuy;}()


		/**
                                                                                                                                                                                                                                                                                                                                                     * @function getSlipageOnSell
                                                                                                                                                                                                                                                                                                                                                     * @description Get Slipage on Sell
                                                                                                                                                                                                                                                                                                                                                     * @param {Integer} event_id
                                                                                                                                                                                                                                                                                                                                                     * @param {Integer} resultSpace_id
                                                                                                                                                                                                                                                                                                                                                     * @param {Integer} fractions_amount
                                                                                                                                                                                                                                                                                                                                                     * @returns {Integer} _id
                                                                                                                                                                                                                                                                                                                                                     */ }, { key: "getSlipageOnSell", value: function () {var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(_ref15) {var
				event_id = _ref15.event_id,resultSpace_id = _ref15.resultSpace_id,fractions_amount = _ref15.fractions_amount;return _regenerator2.default.wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:_context9.next = 2;return (
									this.params.contract.getContract().methods.getSlipageOnSell(event_id, resultSpace_id, fractions_amount).call());case 2:return _context9.abrupt("return", _context9.sent);case 3:case "end":return _context9.stop();}}}, _callee9, this);}));function getSlipageOnSell(_x6) {return _ref14.apply(this, arguments);}return getSlipageOnSell;}()


		/* POST User Functions */

		/**
                             * @function createEvent
                             * @description Create an Event
                             * @param {Integer | Array} _resultSpaceIds
                             * @param {String} urlOracle
                             * @param {String} eventName
                            	 */















		/**
                                  * @function resolveEvent
                                  * @description Resolve Event
                                  * @param {Integer} event_id
                                  * @param {Integer} resultSpace_id
                                 	 */








		/**
                                       * @function addLiquidity
                                       * @description Add Liquidity
                                       * @param {Integer} eventId
                                       */










		/**
                                           * @function removeLiquidity
                                           * @description Remove Liquidity
                                           * @param {Integer} eventId
                                           */








		/**
                                               * @function buy
                                               * @description Buy Fractions
                                               * @param {Integer} event_id
                                               * @param {Integer} resultSpace_id
                                               * @param {Integer} fractions_amount
                                               */












		/**
                                                   * @function sell
                                                   * @description Sell Fractions
                                                   * @param {Integer} event_id
                                                   * @param {Integer} resultSpace_id
                                                   * @param {Integer} fractions_amount
                                                   */







		/**
                                                       * @function pullFractions
                                                       * @description Take Fractions out of the pool
                                                       * @param {Integer} event_id
                                                       * @param {Integer} resultSpace_id
                                                       * @param {Integer} fractions_amount
                                                       */







		/**
                                                           * @function pushFractions
                                                           * @description Move Fractions to the Pool
                                                           * @param {Integer} eventId
                                                           * @param {Integer} resultSpace_id
                                                           * @param {Integer} fractions_amount
                                                           */








		/**
                                                               * @function withdrawWins
                                                               * @description Withdraw Wins on end of Event
                                                               * @param {Integer} event_id
                                                               * @param {Integer} resultSpace_id
                                                               */







		/**
                                                                  * @function deploy
                                                                  * @description Deploy the Pool Contract
                                                                  	*/ }]);return ExchangeContract;}(_IContract3.default);var _initialiseProps = function _initialiseProps() {var _this2 = this;this.createEvent = function () {var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(_ref17) {var resultSpaceIds = _ref17.resultSpaceIds,urlOracle = _ref17.urlOracle,eventName = _ref17.eventName,_ref17$ethAmount = _ref17.ethAmount,ethAmount = _ref17$ethAmount === undefined ? 0 : _ref17$ethAmount;var ETHToWei;return _regenerator2.default.wrap(function _callee10$(_context10) {while (1) {switch (_context10.prev = _context10.next) {case 0:if (!(ethAmount == 0)) {_context10.next = 2;break;}throw new Error("Eth Amount has to be > 0");case 2:ETHToWei = _Numbers2.default.toSmartContractDecimals(ethAmount, 18);_context10.next = 5;return _this2.__sendTx(_this2.params.contract.getContract().methods.createEvent(resultSpaceIds, urlOracle, eventName), false, ETHToWei);case 5:return _context10.abrupt("return", _context10.sent);case 6:case "end":return _context10.stop();}}}, _callee10, _this2);}));return function (_x7) {return _ref16.apply(this, arguments);};}();this.resolveEvent = function () {var _ref18 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(_ref19) {var event_id = _ref19.event_id,resultSpace_id = _ref19.resultSpace_id;return _regenerator2.default.wrap(function _callee11$(_context11) {while (1) {switch (_context11.prev = _context11.next) {case 0:_context11.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.resolveEvent(event_id, resultSpace_id));case 2:return _context11.abrupt("return", _context11.sent);case 3:case "end":return _context11.stop();}}}, _callee11, _this2);}));return function (_x8) {return _ref18.apply(this, arguments);};}();this.addLiquidity = function () {var _ref20 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(_ref21) {var event_id = _ref21.event_id,ethAmount = _ref21.ethAmount;var ETHToWei;return _regenerator2.default.wrap(function _callee12$(_context12) {while (1) {switch (_context12.prev = _context12.next) {case 0:ETHToWei = _Numbers2.default.toSmartContractDecimals(ethAmount, 18);_context12.next = 3;return _this2.__sendTx(_this2.params.contract.getContract().methods.addLiquidity(event_id), false, ETHToWei);case 3:return _context12.abrupt("return", _context12.sent);case 4:case "end":return _context12.stop();}}}, _callee12, _this2);}));return function (_x9) {return _ref20.apply(this, arguments);};}();this.removeLiquidity = function () {var _ref22 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(_ref23) {var event_id = _ref23.event_id;return _regenerator2.default.wrap(function _callee13$(_context13) {while (1) {switch (_context13.prev = _context13.next) {case 0:_context13.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.removeLiquidity(event_id));case 2:return _context13.abrupt("return", _context13.sent);case 3:case "end":return _context13.stop();}}}, _callee13, _this2);}));return function (_x10) {return _ref22.apply(this, arguments);};}();this.buy = function () {var _ref24 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(_ref25) {var event_id = _ref25.event_id,resultSpace_id = _ref25.resultSpace_id,fractions_amount = _ref25.fractions_amount;var ETHCost, ETHToWei;return _regenerator2.default.wrap(function _callee14$(_context14) {while (1) {switch (_context14.prev = _context14.next) {case 0:fractions_amount = _Numbers2.default.toSmartContractDecimals(fractions_amount, 7);_context14.next = 3;return _this2.getFractionsCost({ event_id: event_id, resultSpace_id: resultSpace_id, fractions_amount: fractions_amount });case 3:ETHCost = _context14.sent;ETHToWei = _Numbers2.default.toSmartContractDecimals(ETHCost, 18);_context14.next = 7;return _this2.__sendTx(_this2.params.contract.getContract().methods.buy(event_id, resultSpace_id, fractions_amount), false, ETHToWei);case 7:return _context14.abrupt("return", _context14.sent);case 8:case "end":return _context14.stop();}}}, _callee14, _this2);}));return function (_x11) {return _ref24.apply(this, arguments);};}();this.sell = function () {var _ref26 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15(_ref27) {var event_id = _ref27.event_id,resultSpace_id = _ref27.resultSpace_id,fractions_amount = _ref27.fractions_amount;return _regenerator2.default.wrap(function _callee15$(_context15) {while (1) {switch (_context15.prev = _context15.next) {case 0:_context15.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.sell(event_id, resultSpace_id, fractions_amount));case 2:return _context15.abrupt("return", _context15.sent);case 3:case "end":return _context15.stop();}}}, _callee15, _this2);}));return function (_x12) {return _ref26.apply(this, arguments);};}();this.pullFractions = function () {var _ref28 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16(_ref29) {var event_id = _ref29.event_id,resultSpace_id = _ref29.resultSpace_id,fractions_amount = _ref29.fractions_amount;return _regenerator2.default.wrap(function _callee16$(_context16) {while (1) {switch (_context16.prev = _context16.next) {case 0:_context16.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.pullFractions(event_id, resultSpaceId, fractions_amount));case 2:return _context16.abrupt("return", _context16.sent);case 3:case "end":return _context16.stop();}}}, _callee16, _this2);}));return function (_x13) {return _ref28.apply(this, arguments);};}();this.pushFractions = function () {var _ref30 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee17(_ref31) {var event_id = _ref31.event_id,resultSpace_id = _ref31.resultSpace_id,fractions_amount = _ref31.fractions_amount;return _regenerator2.default.wrap(function _callee17$(_context17) {while (1) {switch (_context17.prev = _context17.next) {case 0:_context17.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.pushFractions(event_id, resultSpace_id, fractions_amount));case 2:return _context17.abrupt("return", _context17.sent);case 3:case "end":return _context17.stop();}}}, _callee17, _this2);}));return function (_x14) {return _ref30.apply(this, arguments);};}();this.withdrawWins = function () {var _ref32 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee18(_ref33) {var event_id = _ref33.event_id,resultSpace_id = _ref33.resultSpace_id;return _regenerator2.default.wrap(function _callee18$(_context18) {while (1) {switch (_context18.prev = _context18.next) {case 0:_context18.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.withdrawWins(event_id, resultSpace_id));case 2:return _context18.abrupt("return", _context18.sent);case 3:case "end":return _context18.stop();}}}, _callee18, _this2);}));return function (_x15) {return _ref32.apply(this, arguments);};}();this.

	deploy = function () {var _ref34 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee19(_ref35) {var callback = _ref35.callback;var params, res;return _regenerator2.default.wrap(function _callee19$(_context19) {while (1) {switch (_context19.prev = _context19.next) {case 0:
							params = [];_context19.next = 3;return (
								_this2.__deploy(params, callback));case 3:res = _context19.sent;
							_this2.params.contractAddress = res.contractAddress;
							/* Call to Backend API */
							_this2.__assert();return _context19.abrupt("return",
							res);case 7:case "end":return _context19.stop();}}}, _callee19, _this2);}));return function (_x16) {return _ref34.apply(this, arguments);};}();};exports.default =



ExchangeContract;