"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require("babel-runtime/regenerator");var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _freeze = require("babel-runtime/core-js/object/freeze");var _freeze2 = _interopRequireDefault(_freeze);var _web = require("web3");var _web2 = _interopRequireDefault(_web);
var _index = require("./models/index");







var _Account = require("./utils/Account");var _Account2 = _interopRequireDefault(_Account);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var ETH_URL_MAINNET =
"https://mainnet.infura.io/v3/37ec248f2a244e3ab9c265d0919a6cbc";
var ETH_URL_TESTNET =
"https://rinkeby.infura.io/v3/811fe4fa5c4b41cb9b92f9656aaeaa3b";
//you can find this in "./truffle-config.js" file and should match ganache/ganache-cli local server settings too
var ETH_URL_LOCAL_TEST = "http://localhost:8545";
var TEST_PRIVATE_KEY =
"0x7f76de05082c4d578219ca35a905f8debe922f1f00b99315ebf0706afc97f132";
//const LOCAL_TEST_PRIVATE_KEY = '4f4f26f4a82351b1f9a98623f901ad5fb2f3e38ac92ff39955ee8e124c718fa7';

var networksEnum = (0, _freeze2.default)({
	1: "Ethereum Main",
	2: "Morden",
	3: "Ropsten",
	4: "Rinkeby",
	56: "BSC Main",
	97: "BSC Test",
	42: "Kovan" });



/**
                  * Application Object
                  * @class Application
                  * @param {Object} params Parameters
                  * @param {Bool} params.test Default : False
                  * @param {Bool} params.localtest Default : False
                  * @param {Bool} params.mainnet Default : True (If Ethereum Mainnet)
                  * @param {Object} params.opt Optional Chain Web3 Connection Object (Default ETH)
                  * @param {String} params.opt.web3Connection Web3 Connection String (Ex : https://data-seed-prebsc-1-s1.binance.org:8545)
                  */var
Application =
function Application(_ref)






{var _this = this;var _ref$test = _ref.test,test = _ref$test === undefined ? false : _ref$test,_ref$localtest = _ref.localtest,localtest = _ref$localtest === undefined ? false : _ref$localtest,_ref$mainnet = _ref.mainnet,mainnet = _ref$mainnet === undefined ? true : _ref$mainnet,_ref$opt = _ref.opt,opt = _ref$opt === undefined ? { web3Connection: ETH_URL_MAINNET } : _ref$opt;(0, _classCallCheck3.default)(this, Application);this.



















	start = function () {
		//this.web3 = new Web3(
		//	new Web3.providers.HttpProvider(this.mainnet == true ? this.opt.web3Connection : ETH_URL_TESTNET)
		//);
		if (_this.mainnet)
		_this.web3 = new _web2.default(new _web2.default.providers.HttpProvider(_this.opt.web3Connection));else
		if (_this.test && _this.localtest)
		_this.web3 = new _web2.default(new _web2.default.providers.HttpProvider(ETH_URL_LOCAL_TEST)
		//NOTE: depending on your web3 version, you may need to set a number of confirmation blocks
		, null, { transactionConfirmationBlocks: 1 });else

			//if (this.test)
			_this.web3 = new _web2.default(new _web2.default.providers.HttpProvider(ETH_URL_TESTNET));
		if (typeof window !== 'undefined') {
			window.web3 = _this.web3;
		} else {
			if (!_this.test) {
				throw new Error('Please Use an Ethereum Enabled Browser like Metamask or Coinbase Wallet');
			}
		}
	};this.





	login = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.prev = 0;if (!(

						typeof window === 'undefined')) {_context.next = 3;break;}return _context.abrupt("return",
						false);case 3:if (!

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
				acc: _this.test && !_this.localtest ? _this.account : null });

		} catch (err) {
			throw err;
		}
	};this.









	getOpenRealFvrContract = function () {var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},_ref4$contractAddress = _ref4.contractAddress,contractAddress = _ref4$contractAddress === undefined ? null : _ref4$contractAddress,_ref4$tokenAddress = _ref4.tokenAddress,tokenAddress = _ref4$tokenAddress === undefined ? null : _ref4$tokenAddress;
		try {
			return new _index.OpenerRealFvr({
				web3: _this.web3,
				contractAddress: contractAddress,
				tokenAddress: tokenAddress,
				acc: _this.test && !_this.localtest ? _this.account : null });

		} catch (err) {
			throw err;
		}
	};this.









	getStakingContract = function () {var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},_ref5$contractAddress = _ref5.contractAddress,contractAddress = _ref5$contractAddress === undefined ? null : _ref5$contractAddress,_ref5$tokenAddress = _ref5.tokenAddress,tokenAddress = _ref5$tokenAddress === undefined ? null : _ref5$tokenAddress;
		try {
			return new _index.StakingContract({
				web3: _this.web3,
				contractAddress: contractAddress,
				tokenAddress: tokenAddress,
				acc: _this.test && !_this.localtest ? _this.account : null });

		} catch (err) {
			throw err;
		}
	};this.









	getERC20TokenLock = function () {var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},_ref6$contractAddress = _ref6.contractAddress,contractAddress = _ref6$contractAddress === undefined ? null : _ref6$contractAddress,_ref6$tokenAddress = _ref6.tokenAddress,tokenAddress = _ref6$tokenAddress === undefined ? null : _ref6$tokenAddress;
		try {
			return new _index.ERC20TokenLock({
				web3: _this.web3,
				contractAddress: contractAddress,
				tokenAddress: tokenAddress,
				acc: _this.test && !_this.localtest ? _this.account : null });

		} catch (err) {
			throw err;
		}
	};this.








	getERC721Collectibles = function () {var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},_ref7$contractAddress = _ref7.contractAddress,contractAddress = _ref7$contractAddress === undefined ? null : _ref7$contractAddress;
		try {
			return new _index.ERC721Collectibles({
				web3: _this.web3,
				contractAddress: contractAddress,
				acc: _this.test && !_this.localtest ? _this.account : null });

		} catch (err) {
			throw err;
		}
	};this.








	getERC20Contract = function (_ref8) {var _ref8$contractAddress = _ref8.contractAddress,contractAddress = _ref8$contractAddress === undefined ? null : _ref8$contractAddress;
		try {
			return new _index.ERC20Contract({
				web3: _this.web3,
				contractAddress: contractAddress,
				acc: _this.test && !_this.localtest ? _this.account : null });

		} catch (err) {
			throw err;
		}
	};this.










	getETHNetwork = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {var netId, networkName;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return (
							_this.web3.eth.net.getId());case 2:netId = _context2.sent;
						networkName = networksEnum.hasOwnProperty(netId) ? networksEnum[netId] : 'Unknown';return _context2.abrupt("return",
						networkName);case 5:case "end":return _context2.stop();}}}, _callee2, _this);}));this.







	getAddress = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {var accounts;return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.next = 2;return (
							_this.web3.eth.getAccounts());case 2:accounts = _context3.sent;return _context3.abrupt("return",
						accounts[0]);case 4:case "end":return _context3.stop();}}}, _callee3, _this);}));this.








	getETHBalance = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {var wei;return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.t0 =
						_this.web3.eth;_context4.next = 3;return _this.getAddress();case 3:_context4.t1 = _context4.sent;_context4.next = 6;return _context4.t0.getBalance.call(_context4.t0, _context4.t1);case 6:wei = _context4.sent;return _context4.abrupt("return",
						_this.web3.utils.fromWei(wei, 'ether'));case 8:case "end":return _context4.stop();}}}, _callee4, _this);}));this.test = test;this.localtest = localtest;this.opt = opt;this.mainnet = mainnet;if (this.test) {this.start();this.login();if (!this.localtest) {this.account = new _Account2.default(this.web3, this.web3.eth.accounts.privateKeyToAccount(TEST_PRIVATE_KEY));console.log('My address: ' + this.account.getAddress());} ///this.account = new Account(this.web3, this.web3.eth.accounts.privateKeyToAccount(LOCAL_TEST_PRIVATE_KEY));
	}} /**
     * @function
     * @description Connect to Web3 injected in the constructor
     */ /**
         * @function
         * @description Login with Metamask/Web3 Wallet - substitutes start()
         */ /**
             * @function
             * @description Create a Exchange Contract
             * @param {Object} params
             * @param {Address} params.ContractAddress (Opt) If it is deployed
             * @return {ExchangeContract} ExchangeContract
             */ /**
                 * @function
                 * @description Create a OpenerRealFvr Object
                 * @param {Object} params
                 * @param {Address} params.contractAddress (Opt) If it is deployed
                 * @param {Address} params.tokenAddress (Opt) If it is deployed
                 * @return {OpenerRealFvr} OpenerRealFvr
                 */ /**
                     * @function
                     * @description Create a StakingContract Object
                     * @param {Object} params
                     * @param {Address} params.contractAddress (Opt) If it is deployed
                     * @param {Address} params.tokenAddress (Opt) If it is deployed
                     * @return {StakingContract} StakingContract
                     */ /**
                         * @function
                         * @description Create a ERC20TokenLock Object
                         * @param {Object} params
                         * @param {Address} params.contractAddress (Opt) If it is deployed
                         * @param {Address} params.tokenAddress (Opt) If it is deployed
                         * @return {ERC20TokenLock} ERC20TokenLock
                         */ /**
                             * @function
                             * @description Create a ERC721Collectibles Object
                             * @param {Object} params
                             * @param {Address} params.contractAddress (Opt) If it is deployed
                             * @return {ERC721Collectibles} ERC721Collectibles
                             */ /**
                                 * @function
                                 * @description Create a ERC20Contract Object
                                 * @param {Object} params
                                 * @param {Address} params.contractAddress (Opt) If it is deployed
                                 * @return {ERC20Contract} ERC20Contract
                                 */ /******* */ /** UTILS */ /******* */ /**
                                                                          * @function
                                                                          * @description Get ETH Network
                                                                          * @return {String} Network Name (Ex : Kovan)
                                                                          */ /**
                                                                              * @function
                                                                              * @description Get Address connected via login()
                                                                              * @return {Address} Address in Use
                                                                              */ /**
                                                                                  * @function
                                                                                  * @description Get ETH Balance of Address connected via login()
                                                                                  * @return {Integer} ETH Balance
                                                                                  */;exports.default = Application;