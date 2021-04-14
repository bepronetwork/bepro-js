"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require("babel-runtime/regenerator");var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _freeze = require("babel-runtime/core-js/object/freeze");var _freeze2 = _interopRequireDefault(_freeze);var _web = require("web3");var _web2 = _interopRequireDefault(_web);
var _index = require("./models/index");
var _Account = require("./utils/Account");var _Account2 = _interopRequireDefault(_Account);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var ETH_URL_MAINNET = "https://mainnet.infura.io/v3/811fe4fa5c4b41cb9b92f9656aaeaa3b";
var ETH_URL_TESTNET = "https://rinkeby.infura.io/v3/811fe4fa5c4b41cb9b92f9656aaeaa3b";
var TEST_PRIVATE_KEY = "0x7f76de05082c4d578219ca35a905f8debe922f1f00b99315ebf0706afc97f132";

var networksEnum = (0, _freeze2.default)({
	1: "Main",
	2: "Morden",
	3: "Ropsten",
	4: "Rinkeby",
	42: "Kovan" });var


Application =
function Application(_ref)

{var _this = this;var _ref$test = _ref.test,test = _ref$test === undefined ? false : _ref$test,_ref$mainnet = _ref.mainnet,mainnet = _ref$mainnet === undefined ? true : _ref$mainnet,_ref$opt = _ref.opt,opt = _ref$opt === undefined ? { web3Connection: ETH_URL_MAINNET } : _ref$opt;(0, _classCallCheck3.default)(this, Application);this.


















	start = function () {
		_this.web3 = new _web2.default(
		new _web2.default.providers.HttpProvider(
		_this.mainnet == true ? _this.opt.web3Connection : ETH_URL_TESTNET));


		if (typeof window !== "undefined") {
			window.web3 = _this.web3;
		} else {
			if (!_this.test) {
				throw new Error("Please Use an Ethereum Enabled Browser like Metamask or Coinbase Wallet");
			}
		}
	};this.





	login = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.prev = 0;if (!(

						typeof window === "undefined")) {_context.next = 3;break;}return _context.abrupt("return", false);case 3:if (!
						window.ethereum) {_context.next = 9;break;}
						window.web3 = new _web2.default(window.ethereum);
						_this.web3 = window.web3;_context.next = 8;return (
							window.ethereum.enable());case 8:return _context.abrupt("return",
						true);case 9:return _context.abrupt("return",

						false);case 12:_context.prev = 12;_context.t0 = _context["catch"](0);throw _context.t0;case 15:case "end":return _context.stop();}}}, _callee, _this, [[0, 12]]);}));this.














	getExchangeContract = function () {var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},_ref3$contractAddress = _ref3.contractAddress,contractAddress = _ref3$contractAddress === undefined ? null : _ref3$contractAddress;
		try {
			return new _index.ExchangeContract({
				web3: _this.web3,
				contractAddress: contractAddress,
				acc: _this.test ? _this.account : null });

		} catch (err) {
			throw err;
		}
	};this.






	getStakingContract = function () {var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},_ref4$contractAddress = _ref4.contractAddress,contractAddress = _ref4$contractAddress === undefined ? null : _ref4$contractAddress,_ref4$tokenAddress = _ref4.tokenAddress,tokenAddress = _ref4$tokenAddress === undefined ? null : _ref4$tokenAddress;
		try {
			return new _index.StakingContract({
				web3: _this.web3,
				contractAddress: contractAddress,
				tokenAddress: tokenAddress,
				acc: _this.test ? _this.account : null });

		} catch (err) {
			throw err;
		}
	};this.






	getERC721Collectibles = function () {var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},_ref5$contractAddress = _ref5.contractAddress,contractAddress = _ref5$contractAddress === undefined ? null : _ref5$contractAddress,_ref5$tokenAddress = _ref5.tokenAddress,tokenAddress = _ref5$tokenAddress === undefined ? null : _ref5$tokenAddress;
		try {
			return new _index.ERC721Collectibles({
				web3: _this.web3,
				contractAddress: contractAddress,
				acc: _this.test ? _this.account : null });

		} catch (err) {
			throw err;
		}
	};this.






	getERC20Contract = function (_ref6) {var _ref6$contractAddress = _ref6.contractAddress,contractAddress = _ref6$contractAddress === undefined ? null : _ref6$contractAddress;
		try {
			return new _index.ERC20Contract({
				web3: _this.web3,
				contractAddress: contractAddress,
				acc: _this.test ? _this.account : null });

		} catch (err) {
			throw err;
		}
	};this.










	getETHNetwork = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {var netId, networkName;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return (
							_this.web3.eth.net.getId());case 2:netId = _context2.sent;
						networkName = networksEnum.hasOwnProperty(netId) ?
						networksEnum[netId] :
						"Unknown";return _context2.abrupt("return",
						networkName);case 5:case "end":return _context2.stop();}}}, _callee2, _this);}));this.







	getAddress = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {var accounts;return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.next = 2;return (
							_this.web3.eth.getAccounts());case 2:accounts = _context3.sent;return _context3.abrupt("return",
						accounts[0]);case 4:case "end":return _context3.stop();}}}, _callee3, _this);}));this.







	getETHBalance = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {var wei;return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.t0 =
						_this.web3.eth;_context4.next = 3;return _this.getAddress();case 3:_context4.t1 = _context4.sent;_context4.next = 6;return _context4.t0.getBalance.call(_context4.t0, _context4.t1);case 6:wei = _context4.sent;return _context4.abrupt("return",
						_this.web3.utils.fromWei(wei, "ether"));case 8:case "end":return _context4.stop();}}}, _callee4, _this);}));this.test = test;this.opt = opt;this.mainnet = mainnet;if (this.test) {this.start();this.login();this.account = new _Account2.default(this.web3, this.web3.eth.accounts.privateKeyToAccount(TEST_PRIVATE_KEY));}} /****** */ /*** CORE */ /****** */ /**
                                                                                                                                                                                                                                                                                                                                                                        * @name start
                                                                                                                                                                                                                                                                                                                                                                        * @description Start the Application
                                                                                                                                                                                                                                                                                                                                                                        */ /**
                                                                                                                                                                                                                                                                                                                                                                            * @name login
                                                                                                                                                                                                                                                                                                                                                                            * @description Login with Metamask or a web3 provider
                                                                                                                                                                                                                                                                                                                                                                            */ /****** */ /** GETTERS */ /****** */ /**
                                                                                                                                                                                                                                                                                                                                                                                                                     * @name getExchangeContract
                                                                                                                                                                                                                                                                                                                                                                                                                     * @param {Address} ContractAddress (Opt) If it is deployed
                                                                                                                                                                                                                                                                                                                                                                                                                     * @description Create a Exchange Contract
                                                                                                                                                                                                                                                                                                                                                                                                                     */ /**
                                                                                                                                                                                                                                                                                                                                                                                                                        * @name getStakingContract
                                                                                                                                                                                                                                                                                                                                                                                                                        * @param {Address} ContractAddress (Opt) If it is deployed
                                                                                                                                                                                                                                                                                                                                                                                                                        * @description Create a Staking Contract
                                                                                                                                                                                                                                                                                                                                                                                                                        */ /**
                                                                                                                                                                                                                                                                                                                                                                                                                               * @name getERC721Collectibles
                                                                                                                                                                                                                                                                                                                                                                                                                               * @param {Address} ContractAddress (Opt) If it is deployed
                                                                                                                                                                                                                                                                                                                                                                                                                               * @description Create a ERC721Collectibles Contract
                                                                                                                                                                                                                                                                                                                                                                                                                               */ /**
                                                                                                                                                                                                                                                                                                                                                                                                                                  * @name getERC20Contract
                                                                                                                                                                                                                                                                                                                                                                                                                                  * @param {Address} ContractAddress (Opt) If it is deployed
                                                                                                                                                                                                                                                                                                                                                                                                                                  * @description Create a ERC20 Contract
                                                                                                                                                                                                                                                                                                                                                                                                                                  */ /******* */ /** UTILS */ /******* */ /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @name getETHNetwork
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @description Access current ETH Network used
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @returns {String} Eth Network
                                                                                                                                                                                                                                                                                                                                                                                                                                                                             */ /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * @name getAddress
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * @description Access current Address Being Used under Web3 Injector (ex : Metamask)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * @returns {Address} Address
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   */ /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @name getETHBalance
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @description Access current ETH Balance Available for the Injected Web3 Address
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @returns {Integer} Balance
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         */;exports.default = Application;