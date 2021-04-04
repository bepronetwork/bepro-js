'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require('babel-runtime/helpers/createClass');var _createClass3 = _interopRequireDefault(_createClass2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var Account = function () {

    function Account(web3, account) {(0, _classCallCheck3.default)(this, Account);
        this.web3 = web3;
        this.account = account;
    }(0, _createClass3.default)(Account, [{ key: 'getBalance', value: function () {var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {var wei;return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (



                                    this.web3.eth.getBalance(this.getAddress()));case 2:wei = _context.sent;return _context.abrupt('return',
                                this.web3.utils.fromWei(wei, 'ether'));case 4:case 'end':return _context.stop();}}}, _callee, this);}));function getBalance() {return _ref.apply(this, arguments);}return getBalance;}() }, { key: 'getAddress', value: function getAddress()


        {
            return this.account.address;
        } }, { key: 'getPrivateKey', value: function getPrivateKey()

        {
            return this.account.privateKey;
        } }, { key: 'getAccount', value: function getAccount()

        {
            return this.account;
        } }, { key: 'sendEther', value: function () {var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(

            amount, address) {var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;var tx, result, transaction;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:
                                tx = {
                                    data: data,
                                    from: this.getAddress(),
                                    to: address,
                                    gas: 443000,
                                    value: amount };_context2.next = 3;return (

                                    this.account.signTransaction(tx));case 3:result = _context2.sent;_context2.next = 6;return (
                                    this.web3.eth.sendSignedTransaction(result.rawTransaction));case 6:transaction = _context2.sent;return _context2.abrupt('return',
                                transaction);case 8:case 'end':return _context2.stop();}}}, _callee2, this);}));function sendEther(_x, _x2) {return _ref2.apply(this, arguments);}return sendEther;}() }]);return Account;}();exports.default =




Account;