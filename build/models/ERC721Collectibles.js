"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require("babel-runtime/regenerator");var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _extends2 = require("babel-runtime/helpers/extends");var _extends3 = _interopRequireDefault(_extends2);var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require("babel-runtime/helpers/createClass");var _createClass3 = _interopRequireDefault(_createClass2);var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);var _inherits2 = require("babel-runtime/helpers/inherits");var _inherits3 = _interopRequireDefault(_inherits2);var _interfaces = require("../interfaces");
var _Numbers = require("../utils/Numbers");var _Numbers2 = _interopRequireDefault(_Numbers);
var _lodash = require("lodash");var _lodash2 = _interopRequireDefault(_lodash);
var _IContract2 = require("./IContract");var _IContract3 = _interopRequireDefault(_IContract2);
var _ERC20Contract = require("./ERC20Contract");var _ERC20Contract2 = _interopRequireDefault(_ERC20Contract);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}


var baseFeeAddress = "0x6714d41094a264bb4b8fcb74713b42cfee6b4f74";
/**
                                                                    * ERC721Contract Object
                                                                    * @constructor ERC721Contract
                                                                    * @param {Web3} web3
                                                                    * @param {Address} contractAddress ? (opt)
                                                                    */var

ERC721Collectibles = function (_IContract) {(0, _inherits3.default)(ERC721Collectibles, _IContract);
	function ERC721Collectibles(params) {(0, _classCallCheck3.default)(this, ERC721Collectibles);var _this = (0, _possibleConstructorReturn3.default)(this, (ERC721Collectibles.__proto__ || (0, _getPrototypeOf2.default)(ERC721Collectibles)).call(this, (0, _extends3.default)({
			abi: _interfaces.erc721collectibles }, params)));_initialiseProps.call(_this);return _this;
	}

	/**
     * @override 
     */(0, _createClass3.default)(ERC721Collectibles, [{ key: "purchaseToken",



















		/**
                                                                               * @function purchaseToken
                                                                               * @description Get ERC20 Address of the Contract
                                                                               * @returns {Address}
                                                                               */value: function () {var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (

									this.params.contract.getContract().methods._purchaseToken().call());case 2:return _context.abrupt("return", _context.sent);case 3:case "end":return _context.stop();}}}, _callee, this);}));function purchaseToken() {return _ref.apply(this, arguments);}return purchaseToken;}()


		/**
                                                                                                                                                                                                                                                                                             * @function getPricePerPack
                                                                                                                                                                                                                                                                                             * @description Get Price Per Pack 
                                                                                                                                                                                                                                                                                             * @returns {Integer}
                                                                                                                                                                                                                                                                                            */ }, { key: "getPricePerPack", value: function () {var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.t0 =

								_Numbers2.default;_context2.next = 3;return this.params.contract.getContract().methods._pricePerPack().call();case 3:_context2.t1 = _context2.sent;return _context2.abrupt("return", _context2.t0.fromDecimals.call(_context2.t0, _context2.t1, 18));case 5:case "end":return _context2.stop();}}}, _callee2, this);}));function getPricePerPack() {return _ref2.apply(this, arguments);}return getPricePerPack;}()


		/**
                                                                                                                                                                                                                                                                                                                                                                                                                             * @function exists
                                                                                                                                                                                                                                                                                                                                                                                                                             * @description Verify if token ID exists 
                                                                                                                                                                                                                                                                                                                                                                                                                             * @returns {Integer} Token Id
                                                                                                                                                                                                                                                                                                                                                                                                                             */ }, { key: "exists", value: function () {var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(_ref4) {var
				tokenID = _ref4.tokenID;return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.next = 2;return (
									this.params.contract.
									getContract().
									methods.exists(tokenID).
									call());case 2:return _context3.abrupt("return", _context3.sent);case 3:case "end":return _context3.stop();}}}, _callee3, this);}));function exists(_x) {return _ref3.apply(this, arguments);}return exists;}()


		/**
                                                                                                                                                                                                                          * @function isLimited
                                                                                                                                                                                                                          * @description Verify if it is limited
                                                                                                                                                                                                                          * @returns {Bool} 
                                                                                                                                                                                                                          */ }, { key: "isLimited", value: function () {var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.next = 2;return (

									this.params.contract.
									getContract().
									methods._isLimited().
									call());case 2:return _context4.abrupt("return", _context4.sent);case 3:case "end":return _context4.stop();}}}, _callee4, this);}));function isLimited() {return _ref5.apply(this, arguments);}return isLimited;}()


		/**
                                                                                                                                                                                                                              * @function currentTokenId
                                                                                                                                                                                                                              * @description Verify what is the currentTokenId
                                                                                                                                                                                                                              * @returns {Integer} Current Token Id 
                                                                                                                                                                                                                              */ }, { key: "currentTokenId", value: function () {var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:_context5.t0 =


								parseInt;_context5.next = 3;return this.params.contract.
								getContract().
								methods._currentTokenId().
								call();case 3:_context5.t1 = _context5.sent;return _context5.abrupt("return", (0, _context5.t0)(_context5.t1));case 5:case "end":return _context5.stop();}}}, _callee5, this);}));function currentTokenId() {return _ref6.apply(this, arguments);}return currentTokenId;}()


		/**
                                                                                                                                                                                                                                                                                     * @function getURITokenID
                                                                                                                                                                                                                                                                                     * @description Verify what is the getURITokenID
                                                                                                                                                                                                                                                                                     * @returns {String} URI
                                                                                                                                                                                                                                                                                     */ }, { key: "getURITokenID", value: function () {var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(_ref8) {var

				tokenID = _ref8.tokenID;return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:_context6.next = 2;return (
									this.params.contract.
									getContract().
									methods.tokenURI(tokenID).
									call());case 2:return _context6.abrupt("return", _context6.sent);case 3:case "end":return _context6.stop();}}}, _callee6, this);}));function getURITokenID(_x2) {return _ref7.apply(this, arguments);}return getURITokenID;}()


		/**
                                                                                                                                                                                                                                         * @function getRegisteredIDs
                                                                                                                                                                                                                                         * @description Get Ids
                                                                                                                                                                                                                                         * @returns {Integer | Array} ids 
                                                                                                                                                                                                                                         */ }, { key: "getRegisteredIDs", value: function () {var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {var res;return _regenerator2.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:_context7.next = 2;return (

									this.__sendTx(
									this.params.contract.
									getContract().
									methods.getRegisteredIDs(),
									true));case 2:res = _context7.sent;return _context7.abrupt("return",


								res.map(function (r) {return parseInt(r);}));case 4:case "end":return _context7.stop();}}}, _callee7, this);}));function getRegisteredIDs() {return _ref9.apply(this, arguments);}return getRegisteredIDs;}()



		/**
                                                                                                                                                                                                                       * @function isIDRegistered
                                                                                                                                                                                                                       * @description Verify if ID is registered
                                                                                                                                                                                                                       * @returns {Bool} 
                                                                                                                                                                                                                       */ }, { key: "isIDRegistered", value: function () {var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(_ref11) {var
				address = _ref11.address,tokenID = _ref11.tokenID;return _regenerator2.default.wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:_context8.next = 2;return (
									this.params.contract.
									getContract().
									methods.registeredIDs(address, tokenID).
									call());case 2:return _context8.abrupt("return", _context8.sent);case 3:case "end":return _context8.stop();}}}, _callee8, this);}));function isIDRegistered(_x3) {return _ref10.apply(this, arguments);}return isIDRegistered;}()



		/**
                                                                                                                                                                                                                                            * @function pricePerPack
                                                                                                                                                                                                                                            * @description Verify what is the current price per Pack 
                                                                                                                                                                                                                                            * @returns {Integer} Price per pack in tokens
                                                                                                                                                                                                                                            */ }, { key: "pricePerPack", value: function () {var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {return _regenerator2.default.wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:_context9.t0 =


								_Numbers2.default;_context9.next = 3;return this.params.contract.
								getContract().
								methods._pricePerPack().
								call();case 3:_context9.t1 = _context9.sent;return _context9.abrupt("return", _context9.t0.fromDecimals.call(_context9.t0, _context9.t1, 18));case 5:case "end":return _context9.stop();}}}, _callee9, this);}));function pricePerPack() {return _ref12.apply(this, arguments);}return pricePerPack;}()


		/**
                                                                                                                                                                                                                                                                                                                 * @function openedPacks
                                                                                                                                                                                                                                                                                                                 * @description Verify how much opened packs exist
                                                                                                                                                                                                                                                                                                                 * @returns {Integer} packs
                                                                                                                                                                                                                                                                                                                 */ }, { key: "openedPacks", value: function () {var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10() {return _regenerator2.default.wrap(function _callee10$(_context10) {while (1) {switch (_context10.prev = _context10.next) {case 0:_context10.t0 =


								parseInt;_context10.next = 3;return this.params.contract.
								getContract().
								methods._openedPacks().
								call();case 3:_context10.t1 = _context10.sent;return _context10.abrupt("return", (0, _context10.t0)(_context10.t1));case 5:case "end":return _context10.stop();}}}, _callee10, this);}));function openedPacks() {return _ref13.apply(this, arguments);}return openedPacks;}()


		/**
                                                                                                                                                                                                                                                                                      * @function approveERC20
                                                                                                                                                                                                                                                                                      * @description Approve ERC20 Allowance
                                                                                                                                                                                                                                                                                        */








		/**
                                                                                                                                                                                                                                                                                           * @function setBaseTokenURI
                                                                                                                                                                                                                                                                                           * @description Set Base Token URI
                                                                                                                                                                                                                                                                                             */






		/**
                                                                                                                                                                                                                                                                                                 * @function isApproved
                                                                                                                                                                                                                                                                                                 * @description Approve ERC20 Allowance
                                                                                                                                                                                                                                                                                                 * @param {Address} address
                                                                                                                                                                                                                                                                                                 * @param {Integer} amount 
                                                                                                                                                                                                                                                                                                   */ }, { key: "openPack",




		/**
                                                                                                                                                                                                                                                                                                                             * @function openPack
                                                                                                                                                                                                                                                                                                                             * @description open Pack of tokens 
                                                                                                                                                                                                                                                                                                                             * @param {Integer} amount Amount of packs to open
                                                                                                                                                                                                                                                                                                                            */value: function () {var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(_ref15) {var
				amount = _ref15.amount;return _regenerator2.default.wrap(function _callee11$(_context11) {while (1) {switch (_context11.prev = _context11.next) {case 0:_context11.next = 2;return (
									this.__sendTx(
									this.params.contract.getContract().methods.openPack(amount)));case 2:return _context11.abrupt("return", _context11.sent);case 3:case "end":return _context11.stop();}}}, _callee11, this);}));function openPack(_x4) {return _ref14.apply(this, arguments);}return openPack;}()



		/**
                                                                                                                                                                                                                                                                                          * @function mint
                                                                                                                                                                                                                                                                                          * @description Mint created TokenID 
                                                                                                                                                                                                                                                                                          * @param {Address} to
                                                                                                                                                                                                                                                                                          * @param {Integer} tokenID
                                                                                                                                                                                                                                                                                         */ }, { key: "mint", value: function () {var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(_ref17) {var
				tokenID = _ref17.tokenID;return _regenerator2.default.wrap(function _callee12$(_context12) {while (1) {switch (_context12.prev = _context12.next) {case 0:_context12.next = 2;return (
									this.__sendTx(
									this.params.contract.getContract().methods.mint(tokenID)));case 2:return _context12.abrupt("return", _context12.sent);case 3:case "end":return _context12.stop();}}}, _callee12, this);}));function mint(_x5) {return _ref16.apply(this, arguments);}return mint;}()



		/**
                                                                                                                                                                                                                                                                               * @function setPurchaseTokenAddress
                                                                                                                                                                                                                                                                               * @description set Purchase Token Address
                                                                                                                                                                                                                                                                               * @param {Address} purchaseToken 
                                                                                                                                                                                                                                                                              */ }, { key: "setPurchaseTokenAddress", value: function () {var _ref18 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(_ref19) {var
				purchaseToken = _ref19.purchaseToken;return _regenerator2.default.wrap(function _callee13$(_context13) {while (1) {switch (_context13.prev = _context13.next) {case 0:_context13.next = 2;return (
									this.__sendTx(
									this.params.contract.getContract().methods.setPurchaseTokenAddress(purchaseToken)));case 2:return _context13.abrupt("return", _context13.sent);case 3:case "end":return _context13.stop();}}}, _callee13, this);}));function setPurchaseTokenAddress(_x6) {return _ref18.apply(this, arguments);}return setPurchaseTokenAddress;}()



		/**
                                                                                                                                                                                                                                                                                                                                              * @function setStakeAddress
                                                                                                                                                                                                                                                                                                                                              * @description set Stake Address
                                                                                                                                                                                                                                                                                                                                              * @param {Address} purchaseToken 
                                                                                                                                                                                                                                                                                                                                             */ }, { key: "setStakeAddress", value: function () {var _ref20 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(_ref21) {var
				purchaseToken = _ref21.purchaseToken;return _regenerator2.default.wrap(function _callee14$(_context14) {while (1) {switch (_context14.prev = _context14.next) {case 0:_context14.next = 2;return (
									this.__sendTx(
									this.params.contract.getContract().methods.setStakeAddress(purchaseToken)));case 2:return _context14.abrupt("return", _context14.sent);case 3:case "end":return _context14.stop();}}}, _callee14, this);}));function setStakeAddress(_x7) {return _ref20.apply(this, arguments);}return setStakeAddress;}()



		/**
                                                                                                                                                                                                                                                                                                                      * @function setSwapBackAddress
                                                                                                                                                                                                                                                                                                                      * @description set Fee Address
                                                                                                                                                                                                                                                                                                                      * @param {Address} purchaseToken 
                                                                                                                                                                                                                                                                                                                     */ }, { key: "setSwapBackAddress", value: function () {var _ref22 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15(_ref23) {var
				purchaseToken = _ref23.purchaseToken;return _regenerator2.default.wrap(function _callee15$(_context15) {while (1) {switch (_context15.prev = _context15.next) {case 0:_context15.next = 2;return (
									this.__sendTx(
									this.params.contract.getContract().methods.setSwapBackAddress(purchaseToken)));case 2:return _context15.abrupt("return", _context15.sent);case 3:case "end":return _context15.stop();}}}, _callee15, this);}));function setSwapBackAddress(_x8) {return _ref22.apply(this, arguments);}return setSwapBackAddress;}()



		/**
                                                                                                                                                                                                                                                                                                                               * @function setFeeAddress
                                                                                                                                                                                                                                                                                                                               * @description set Fee Address
                                                                                                                                                                                                                                                                                                                               * @param {Address} purchaseToken 
                                                                                                                                                                                                                                                                                                                              */ }, { key: "setFeeAddress", value: function () {var _ref24 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16(_ref25) {var
				purchaseToken = _ref25.purchaseToken;return _regenerator2.default.wrap(function _callee16$(_context16) {while (1) {switch (_context16.prev = _context16.next) {case 0:_context16.next = 2;return (
									this.__sendTx(
									this.params.contract.getContract().methods.setFeeAddress(purchaseToken)));case 2:return _context16.abrupt("return", _context16.sent);case 3:case "end":return _context16.stop();}}}, _callee16, this);}));function setFeeAddress(_x9) {return _ref24.apply(this, arguments);}return setFeeAddress;}()



		/**
                                                                                                                                                                                                                                                                                                                * @function setPricePerPack
                                                                                                                                                                                                                                                                                                                * @description set Price per Pack
                                                                                                                                                                                                                                                                                                                * @param {Amount} newPrice 
                                                                                                                                                                                                                                                                                                               */ }, { key: "setPricePerPack", value: function () {var _ref26 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee17(_ref27) {var
				newPrice = _ref27.newPrice;var newPriceWithDecimals;return _regenerator2.default.wrap(function _callee17$(_context17) {while (1) {switch (_context17.prev = _context17.next) {case 0:
								newPriceWithDecimals = _Numbers2.default.toSmartContractDecimals(
								newPrice,
								18);_context17.next = 3;return (

									this.__sendTx(
									this.params.contract.getContract().methods.setPricePerPack(newPriceWithDecimals)));case 3:return _context17.abrupt("return", _context17.sent);case 4:case "end":return _context17.stop();}}}, _callee17, this);}));function setPricePerPack(_x10) {return _ref26.apply(this, arguments);}return setPricePerPack;}() }]);return ERC721Collectibles;}(_IContract3.default);var _initialiseProps = function _initialiseProps() {var _this2 = this;this.__assert = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee18() {return _regenerator2.default.wrap(function _callee18$(_context18) {while (1) {switch (_context18.prev = _context18.next) {case 0:if (_this2.getAddress()) {_context18.next = 2;break;}throw new Error("Contract is not deployed, first deploy it and provide a contract address");case 2: /* Use ABI */_this2.params.contract.use(_interfaces.erc721collectibles, _this2.getAddress()); /* Set Token Address Contract for easy access */_context18.t0 = _ERC20Contract2.default;_context18.t1 = _this2.web3;_context18.next = 7;return _this2.purchaseToken();case 7:_context18.t2 = _context18.sent;_context18.t3 = _this2.acc;_context18.t4 = { web3: _context18.t1, contractAddress: _context18.t2, acc: _context18.t3 };_this2.params.ERC20Contract = new _context18.t0(_context18.t4);_context18.next = 13;return _this2.params.ERC20Contract.__assert();case 13:case "end":return _context18.stop();}}}, _callee18, _this2);}));this.approveERC20 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee19() {var totalMaxAmount;return _regenerator2.default.wrap(function _callee19$(_context19) {while (1) {switch (_context19.prev = _context19.next) {case 0:_context19.next = 2;return _this2.getERC20Contract().totalSupply();case 2:totalMaxAmount = _context19.sent;_context19.next = 5;return _this2.getERC20Contract().approve({ address: _this2.getAddress(), amount: totalMaxAmount });case 5:return _context19.abrupt("return", _context19.sent);case 6:case "end":return _context19.stop();}}}, _callee19, _this2);}));this.setBaseTokenURI = function () {var _ref30 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee20(_ref31) {var URI = _ref31.URI;return _regenerator2.default.wrap(function _callee20$(_context20) {while (1) {switch (_context20.prev = _context20.next) {case 0:_context20.next = 2;return _this2.__sendTx(_this2.params.contract.getContract().methods.setBaseURI(URI));case 2:return _context20.abrupt("return", _context20.sent);case 3:case "end":return _context20.stop();}}}, _callee20, _this2);}));return function (_x11) {return _ref30.apply(this, arguments);};}();this.isApproved = function () {var _ref32 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee21(_ref33) {var address = _ref33.address,amount = _ref33.amount;return _regenerator2.default.wrap(function _callee21$(_context21) {while (1) {switch (_context21.prev = _context21.next) {case 0:_context21.next = 2;return _this2.getERC20Contract().isApproved({ address: address, amount: amount, spenderAddress: _this2.getAddress() });case 2:return _context21.abrupt("return", _context21.sent);case 3:case "end":return _context21.stop();}}}, _callee21, _this2);}));return function (_x12) {return _ref32.apply(this, arguments);};}();this.



	deploy = function () {var _ref34 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee22(_ref35) {var name = _ref35.name,symbol = _ref35.symbol,_ref35$limitedAmount = _ref35.limitedAmount,limitedAmount = _ref35$limitedAmount === undefined ? 0 : _ref35$limitedAmount,erc20Purchase = _ref35.erc20Purchase,_ref35$feeAddress = _ref35.
			feeAddress,feeAddress = _ref35$feeAddress === undefined ? '0x0000000000000000000000000000000000000001' : _ref35$feeAddress,_ref35$otherAddress = _ref35.
			otherAddress,otherAddress = _ref35$otherAddress === undefined ? '0x0000000000000000000000000000000000000001' : _ref35$otherAddress,callback = _ref35.callback;var params, res;return _regenerator2.default.wrap(function _callee22$(_context22) {while (1) {switch (_context22.prev = _context22.next) {case 0:if (

							erc20Purchase) {_context22.next = 2;break;}throw (
								new Error("Please provide an erc20 address for purchases"));case 2:if (


							name) {_context22.next = 4;break;}throw (
								new Error("Please provide a name"));case 4:if (


							symbol) {_context22.next = 6;break;}throw (
								new Error("Please provide a symbol"));case 6:

							params = [name, symbol, limitedAmount, erc20Purchase, baseFeeAddress, feeAddress, otherAddress];_context22.next = 9;return (
								_this2.__deploy(params, callback));case 9:res = _context22.sent;
							_this2.params.contractAddress = res.contractAddress;
							/* Call to Backend API */_context22.next = 13;return (
								_this2.__assert());case 13:return _context22.abrupt("return",
							res);case 14:case "end":return _context22.stop();}}}, _callee22, _this2);}));return function (_x13) {return _ref34.apply(this, arguments);};}();this.


	getERC20Contract = function () {return _this2.params.ERC20Contract;};};exports.default =



ERC721Collectibles;