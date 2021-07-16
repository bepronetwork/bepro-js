'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _promise = require('babel-runtime/core-js/promise');var _promise2 = _interopRequireDefault(_promise);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require('babel-runtime/helpers/createClass');var _createClass3 = _interopRequireDefault(_createClass2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var Contract = function () {
  function Contract(web3, contract_json, address) {var _this = this;(0, _classCallCheck3.default)(this, Contract);this.















































    __metamaskDeploy = function () {var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref2) {var
        byteCode = _ref2.byteCode,args = _ref2.args,acc = _ref2.acc,_ref2$callback = _ref2.callback,callback = _ref2$callback === undefined ? function () {} : _ref2$callback;return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:return _context.abrupt('return',
                new _promise2.default(function (resolve, reject) {
                  try {
                    console.log('Contract.__metamaskDeploy.acc: ' + acc);
                    _this.getContract().
                    deploy({
                      data: byteCode,
                      arguments: args }).

                    send({
                      from: acc,
                      // BUGFIX: without gas and gasPrice set here, we get the following error:
                      // Error: Node error: {"message":"base fee exceeds gas limit","code":-32000,"data":{"stack":"Error: base fee exceeds gas limit
                      // ,gasPrice : 180000000000
                      // ,gas : 5913388
                      gasPrice: 500000000,
                      gas: 5913388 // 6721975
                    }).
                    on('confirmation', function (confirmationNumber, receipt) {
                      console.log('Contract.__metamaskDeploy.confirmationNumber: ' +

                      confirmationNumber);

                      callback(confirmationNumber);
                      if (confirmationNumber > 0) {
                        resolve(receipt);
                      }
                    }).
                    on('error', function (err) {
                      console.log('Contract.__metamaskDeploy.error: ' + err);
                      reject(err);
                    });
                  } catch (err) {
                    console.log('Contract.__metamaskDeploy.catch.error: ' + err);
                    reject(err);
                  }
                }));case 1:case 'end':return _context.stop();}}}, _callee, _this);}));return function (_x) {return _ref.apply(this, arguments);};}();this.web3 = web3;this.json = contract_json;this.abi = contract_json.abi;this.address = address;this.contract = new web3.eth.Contract(contract_json.abi, address);}(0, _createClass3.default)(Contract, [{ key: 'deploy', value: function () {var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(account, abi, byteCode) {var _this2 = this;var args = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];var callback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : function () {};return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:return _context3.abrupt('return', new _promise2.default(function () {var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(resolve, reject) {var txSigned, accounts, res;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.prev = 0;_this2.contract = new _this2.web3.eth.Contract(abi);if (!account) {_context2.next = 9;break;}_context2.next = 5;return account.getAccount().signTransaction({ data: _this2.contract.deploy({ data: byteCode, arguments: args }).encodeABI(), from: account.getAddress(), gasPrice: 5000000000, gas: 8913388 });case 5:txSigned = _context2.sent;_this2.web3.eth.sendSignedTransaction(txSigned.rawTransaction).on('confirmation', function (confirmationNumber, receipt) {if (confirmationNumber > 1) {resolve(receipt);}});_context2.next = 17;break;case 9:_context2.next = 11;return _this2.web3.eth.getAccounts();case 11:accounts = _context2.sent;_context2.next = 14;return _this2.__metamaskDeploy({ byteCode: byteCode, args: args, acc: accounts[0], callback: callback });case 14:res = _context2.sent;_this2.address = res.contractAddress;resolve(res);case 17:_context2.next = 22;break;case 19:_context2.prev = 19;_context2.t0 = _context2['catch'](0);reject(_context2.t0);case 22:case 'end':return _context2.stop();}}}, _callee2, _this2, [[0, 19]]);}));return function (_x7, _x8) {return _ref4.apply(this, arguments);};}()));case 1:case 'end':return _context3.stop();}}}, _callee3, this);}));function deploy(_x2, _x3, _x4) {return _ref3.apply(this, arguments);}return deploy;}() }, { key: 'use', value: function () {var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(

      contract_json, address) {return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:
                this.json = contract_json;
                this.abi = contract_json.abi;
                this.address = address || this.address;
                this.contract = new this.web3.eth.Contract(contract_json.abi, this.address);case 4:case 'end':return _context4.stop();}}}, _callee4, this);}));function use(_x9, _x10) {return _ref5.apply(this, arguments);}return use;}() }, { key: 'send', value: function () {var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(


      account, byteCode) {var _this3 = this;var value = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '0x0';var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {};return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:return _context6.abrupt('return',
                new _promise2.default(function () {var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(resolve, reject) {var tx, result;return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:
                            tx = {
                              data: byteCode,
                              from: account.address,
                              to: _this3.address,
                              gas: 4430000,
                              gasPrice: 5000000000,
                              value: value || '0x0' };_context5.next = 3;return (


                              account.signTransaction(tx));case 3:result = _context5.sent;
                            _this3.web3.eth.
                            sendSignedTransaction(result.rawTransaction).
                            on('confirmation', function (confirmationNumber, receipt) {
                              callback(confirmationNumber);
                              if (confirmationNumber > 0) {
                                resolve(receipt);
                              }
                            }).
                            on('error', function (err) {
                              reject(err);
                            });case 5:case 'end':return _context5.stop();}}}, _callee5, _this3);}));return function (_x15, _x16) {return _ref7.apply(this, arguments);};}()));case 1:case 'end':return _context6.stop();}}}, _callee6, this);}));function send(_x11, _x12) {return _ref6.apply(this, arguments);}return send;}() }, { key: 'getContract', value: function getContract()



    {
      return this.contract;
    } }, { key: 'getABI', value: function getABI()

    {
      return this.abi;
    } }, { key: 'getJSON', value: function getJSON()

    {
      return this.json;
    } }, { key: 'getAddress', value: function getAddress()

    {
      return this.address;
    } }]);return Contract;}();exports.default =


Contract;