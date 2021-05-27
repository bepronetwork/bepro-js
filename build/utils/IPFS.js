'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncIterator2 = require('babel-runtime/helpers/asyncIterator');var _asyncIterator3 = _interopRequireDefault(_asyncIterator2);var _promise = require('babel-runtime/core-js/promise');var _promise2 = _interopRequireDefault(_promise);var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
var _ipfsHttpClient = require('ipfs-http-client');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var

DexStorage =
function DexStorage() {var _this = this;var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { ipfsClientHTTP: { host: 'ipfs.infura.io', port: 5001, protocol: 'https' } },ipfsClientHTTP = _ref.ipfsClientHTTP;(0, _classCallCheck3.default)(this, DexStorage);this.






  save = function () {var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref3) {var data = _ref3.data;var _ref4, path, cid, size;return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (
                _this.ipfs.add(data));case 2:_ref4 = _context.sent;path = _ref4.path;cid = _ref4.cid;size = _ref4.size;return _context.abrupt('return',
              { path: path, cid: cid, size: size });case 7:case 'end':return _context.stop();}}}, _callee, _this);}));return function (_x2) {return _ref2.apply(this, arguments);};}();this.


  get = function () {var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(_ref6) {var cid = _ref6.cid;return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:return _context3.abrupt('return',
              new _promise2.default(function () {var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(resolve, reject) {var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, file, content, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _value2, chunk;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.prev = 0;_iteratorNormalCompletion = true;_didIteratorError = false;_iteratorError = undefined;_context2.prev = 4;_iterator = (0, _asyncIterator3.default)(

                          _this.ipfs.get(cid));case 6:_context2.next = 8;return _iterator.next();case 8:_step = _context2.sent;_iteratorNormalCompletion = _step.done;_context2.next = 12;return _step.value;case 12:_value = _context2.sent;if (_iteratorNormalCompletion) {_context2.next = 56;break;}file = _value;if (
                          file.content) {_context2.next = 17;break;}return _context2.abrupt('continue', 53);case 17:
                          content = [];_iteratorNormalCompletion2 = true;_didIteratorError2 = false;_iteratorError2 = undefined;_context2.prev = 21;_iterator2 = (0, _asyncIterator3.default)(
                          file.content);case 23:_context2.next = 25;return _iterator2.next();case 25:_step2 = _context2.sent;_iteratorNormalCompletion2 = _step2.done;_context2.next = 29;return _step2.value;case 29:_value2 = _context2.sent;if (_iteratorNormalCompletion2) {_context2.next = 36;break;}chunk = _value2;
                          content.push(chunk);case 33:_iteratorNormalCompletion2 = true;_context2.next = 23;break;case 36:_context2.next = 42;break;case 38:_context2.prev = 38;_context2.t0 = _context2['catch'](21);_didIteratorError2 = true;_iteratorError2 = _context2.t0;case 42:_context2.prev = 42;_context2.prev = 43;if (!(!_iteratorNormalCompletion2 && _iterator2.return)) {_context2.next = 47;break;}_context2.next = 47;return _iterator2.return();case 47:_context2.prev = 47;if (!_didIteratorError2) {_context2.next = 50;break;}throw _iteratorError2;case 50:return _context2.finish(47);case 51:return _context2.finish(42);case 52:

                          resolve(content.toString());case 53:_iteratorNormalCompletion = true;_context2.next = 6;break;case 56:_context2.next = 62;break;case 58:_context2.prev = 58;_context2.t1 = _context2['catch'](4);_didIteratorError = true;_iteratorError = _context2.t1;case 62:_context2.prev = 62;_context2.prev = 63;if (!(!_iteratorNormalCompletion && _iterator.return)) {_context2.next = 67;break;}_context2.next = 67;return _iterator.return();case 67:_context2.prev = 67;if (!_didIteratorError) {_context2.next = 70;break;}throw _iteratorError;case 70:return _context2.finish(67);case 71:return _context2.finish(62);case 72:_context2.next = 77;break;case 74:_context2.prev = 74;_context2.t2 = _context2['catch'](0);


                          reject(_context2.t2);case 77:case 'end':return _context2.stop();}}}, _callee2, _this, [[0, 74], [4, 58, 62, 72], [21, 38, 42, 52], [43,, 47, 51], [63,, 67, 71]]);}));return function (_x4, _x5) {return _ref7.apply(this, arguments);};}()));case 1:case 'end':return _context3.stop();}}}, _callee3, _this);}));return function (_x3) {return _ref5.apply(this, arguments);};}();if (!ipfsClientHTTP) {throw new Error("Please provide a valid ipfsClientHTTP, you can find one at infura.io");}this.ipfs = (0, _ipfsHttpClient.create)(ipfsClientHTTP);}; /* eslint-disable */exports.default =





DexStorage;