"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require("babel-runtime/regenerator");var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _extends2 = require("babel-runtime/helpers/extends");var _extends3 = _interopRequireDefault(_extends2);var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require("babel-runtime/helpers/createClass");var _createClass3 = _interopRequireDefault(_createClass2);var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);var _inherits2 = require("babel-runtime/helpers/inherits");var _inherits3 = _interopRequireDefault(_inherits2);var _interfaces = require("../../interfaces");
var _Numbers = require("../../utils/Numbers");var _Numbers2 = _interopRequireDefault(_Numbers);
var _IContract2 = require("../IContract");var _IContract3 = _interopRequireDefault(_IContract2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

/**
                                                                                                                                                                                               * @class ERC20Contract
                                                                                                                                                                                               * @param {Object} params Parameters
                                                                                                                                                                                               * @param {Address} params.contractAddress Optional/If Existent
                                                                                                                                                                                               */var
ERC20Contract = function (_IContract) {(0, _inherits3.default)(ERC20Contract, _IContract);
  function ERC20Contract(params) {(0, _classCallCheck3.default)(this, ERC20Contract);var _this = (0, _possibleConstructorReturn3.default)(this, (ERC20Contract.__proto__ || (0, _getPrototypeOf2.default)(ERC20Contract)).call(this, (0, _extends3.default)({
      abi: _interfaces.ierc20 }, params)));_initialiseProps.call(_this);return _this;
  }(0, _createClass3.default)(ERC20Contract, [{ key: "getContract", value: function getContract()






    {
      return this.params.contract.getContract();
    }

    /**
       * @function
      * @description Get Token Address
       * @returns {Address} address
      */ }, { key: "getAddress", value: function getAddress()
    {
      return this.params.contractAddress;
    }

    /**
       * @function
      * @description Transfer Tokens
       * @param {Object} params Parameters
       * @param {Address} params.toAddress To Address
       * @param {Integer} params.tokenAmount Amount of Tokens
       * @returns {Transaction} Transaction
      */












    /**
          * @function
         * @description Get Amount of Tokens User Holds
          * @param {Address} address User Address
          * @returns {Transaction} Transaction
         */







    /**
             * @function
            * @description Get Total Supply of Token
             * @returns {Integer} Total supply
            */ }, { key: "getABI", value: function getABI()







    {
      return this.params.contract;
    }


    /**
       * @function
      * @description Get Decimals of Token
       * @returns {Integer} Total supply
      */ }, { key: "getDecimals", value: function getDecimals()
    {
      return this.params.decimals;
    }





    /**
       * @function
      * @description Verify if Spender is Approved to use tokens
       * @param {Object} params Parameters
       * @param {Address} params.address Sender Address
       * @param {Integer} params.amount Amount of Tokens
       * @param {Address} params.spenderAddress Spender Address
       * @returns {Bool} isApproved
      */














    /**
          * @function
         * @description Approve tokens to be used by another address/contract
          * @param {Object} params Parameters
          * @param {Address} params.address Spender Address/Contract
          * @param {Integer} params.amount Amount of Tokens
          * @returns {Transaction} Transaction
         */




















    /**
             * @function
            * @description Deploy ERC20 Token
             * @param {Object} params Parameters
             * @param {String} params.name Name of token
             * @param {String} params.symbol Symbol of token
             * @param {Integer} params.cap Max supply of Token (ex : 100M)
             * @param {Address} params.distributionAddress Where tokens should be sent to initially
             * @returns {Transaction} Transaction
            */ }]);return ERC20Contract;}(_IContract3.default);var _initialiseProps = function _initialiseProps() {var _this2 = this;this.__assert = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_this2.params.contract.use(_interfaces.ierc20, _this2.getAddress());_context.next = 3;return _this2.getDecimalsAsync();case 3:_this2.params.decimals = _context.sent;case 4:case "end":return _context.stop();}}}, _callee, _this2);}));this.transferTokenAmount = function () {var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_ref3) {var toAddress = _ref3.toAddress,tokenAmount = _ref3.tokenAmount;var amountWithDecimals;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:amountWithDecimals = _Numbers2.default.toSmartContractDecimals(tokenAmount, _this2.getDecimals());_context2.next = 3;return _this2.__sendTx(_this2.params.contract.getContract().methods.transfer(toAddress, amountWithDecimals));case 3:return _context2.abrupt("return", _context2.sent);case 4:case "end":return _context2.stop();}}}, _callee2, _this2);}));return function (_x) {return _ref2.apply(this, arguments);};}();this.getTokenAmount = function () {var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(address) {return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.t0 = _Numbers2.default;_context3.next = 3;return _this2.getContract().methods.balanceOf(address).call();case 3:_context3.t1 = _context3.sent;_context3.t2 = _this2.getDecimals();return _context3.abrupt("return", _context3.t0.fromDecimals.call(_context3.t0, _context3.t1, _context3.t2));case 6:case "end":return _context3.stop();}}}, _callee3, _this2);}));return function (_x2) {return _ref4.apply(this, arguments);};}();this.totalSupply = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.t0 = _Numbers2.default;_context4.next = 3;return _this2.getContract().methods.totalSupply().call();case 3:_context4.t1 = _context4.sent;_context4.t2 = _this2.getDecimals();return _context4.abrupt("return", _context4.t0.fromDecimals.call(_context4.t0, _context4.t1, _context4.t2));case 6:case "end":return _context4.stop();}}}, _callee4, _this2);}));this.getDecimalsAsync = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:_context5.next = 2;return _this2.getContract().methods.decimals().call();case 2:return _context5.abrupt("return", _context5.sent);case 3:case "end":return _context5.stop();}}}, _callee5, _this2);}));this.isApproved = function () {var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(_ref8) {var address = _ref8.address,amount = _ref8.amount,spenderAddress = _ref8.spenderAddress;var approvedAmount;return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:_context6.prev = 0;_context6.t0 = _Numbers2.default;_context6.next = 4;return _this2.getContract().methods.allowance(address, spenderAddress).call();case 4:_context6.t1 = _context6.sent;_context6.t2 = _this2.getDecimals();approvedAmount = _context6.t0.fromDecimals.call(_context6.t0, _context6.t1, _context6.t2);return _context6.abrupt("return", approvedAmount >= amount);case 10:_context6.prev = 10;_context6.t3 = _context6["catch"](0);throw _context6.t3;case 13:case "end":return _context6.stop();}}}, _callee6, _this2, [[0, 10]]);}));return function (_x3) {return _ref7.apply(this, arguments);};}();this.approve = function () {var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(_ref10) {var address = _ref10.address,amount = _ref10.amount,callback = _ref10.callback;var amountWithDecimals, res;return _regenerator2.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:_context7.prev = 0;amountWithDecimals = _Numbers2.default.toSmartContractDecimals(amount, _this2.getDecimals());_context7.next = 4;return _this2.__sendTx(_this2.params.contract.getContract().methods.approve(address, amountWithDecimals), null, null, callback);case 4:res = _context7.sent;return _context7.abrupt("return", res);case 8:_context7.prev = 8;_context7.t0 = _context7["catch"](0);throw _context7.t0;case 11:case "end":return _context7.stop();}}}, _callee7, _this2, [[0, 8]]);}));return function (_x4) {return _ref9.apply(this, arguments);};}();this.
  deploy = function () {var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(_ref12) {var name = _ref12.name,symbol = _ref12.symbol,cap = _ref12.cap,distributionAddress = _ref12.distributionAddress,callback = _ref12.callback;var params, res;return _regenerator2.default.wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:if (
              distributionAddress) {_context8.next = 2;break;}throw (
                new Error("Please provide an Distribution address for distro"));case 2:if (


              name) {_context8.next = 4;break;}throw (
                new Error("Please provide a name"));case 4:if (


              symbol) {_context8.next = 6;break;}throw (
                new Error("Please provide a symbol"));case 6:if (


              cap) {_context8.next = 8;break;}throw (
                new Error("Please provide a cap"));case 8:

              params = [name, symbol, cap, distributionAddress];_context8.next = 11;return (
                _this2.__deploy(params, callback));case 11:res = _context8.sent;
              _this2.params.contractAddress = res.contractAddress;
              /* Call to Backend API */_context8.next = 15;return (
                _this2.__assert());case 15:return _context8.abrupt("return",
              res);case 16:case "end":return _context8.stop();}}}, _callee8, _this2);}));return function (_x5) {return _ref11.apply(this, arguments);};}();};exports.default =



ERC20Contract;