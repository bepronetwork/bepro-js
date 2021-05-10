"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _regenerator = require("babel-runtime/regenerator");var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _extends2 = require("babel-runtime/helpers/extends");var _extends3 = _interopRequireDefault(_extends2);var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require("babel-runtime/helpers/createClass");var _createClass3 = _interopRequireDefault(_createClass2);var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);var _inherits2 = require("babel-runtime/helpers/inherits");var _inherits3 = _interopRequireDefault(_inherits2);var _interfaces = require("../../interfaces");
var _Numbers = require("../../utils/Numbers");var _Numbers2 = _interopRequireDefault(_Numbers);
var _lodash = require("lodash");var _lodash2 = _interopRequireDefault(_lodash);
var _IContract2 = require("../IContract");var _IContract3 = _interopRequireDefault(_IContract2);
var _ERC20Contract = require("../ERC20/ERC20Contract");var _ERC20Contract2 = _interopRequireDefault(_ERC20Contract);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}


var beproAddress = "0xCF3C8Be2e2C42331Da80EF210e9B1b307C03d36A";

/**
                                                                  * BEPRONetwork Object
                                                                  * @class BEPRONetwork
                                                                  * @param {Boolean} params.mainnet
                                                                  * @param {Boolean} params.test
                                                                  * @param {Boolean} params.localtest, ganache local blockchain
                                                                  * @param {Web3Connection} params.web3Connection ? (opt), created from above params
                                                                  * @param params.contractAddress {Address}
                                                                  * @param params.abi {beproNetwork}
                                                                  */var
BEPRONetwork = function (_IContract) {(0, _inherits3.default)(BEPRONetwork, _IContract);
  function BEPRONetwork(params) {(0, _classCallCheck3.default)(this, BEPRONetwork);var _this = (0, _possibleConstructorReturn3.default)(this, (BEPRONetwork.__proto__ || (0, _getPrototypeOf2.default)(BEPRONetwork)).call(this, (0, _extends3.default)({
      abi: _interfaces.beproNetwork }, params)));_initialiseProps.call(_this);return _this;
  }(0, _createClass3.default)(BEPRONetwork, [{ key: "getIssuesByAddress",



















    /**
                                                                           * @function
                                                                           * @description Get Open Issues Available
                                                                           * @param {Address} address
                                                                           * @returns {Integer | Array}
                                                                           */value: function () {var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(
      address) {var res;return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (
                  this.params.contract.
                  getContract().
                  methods.getIssuesByAddress(address).
                  call());case 2:res = _context.sent;return _context.abrupt("return",

                res.map(function (r) {return parseInt(r);}));case 4:case "end":return _context.stop();}}}, _callee, this);}));function getIssuesByAddress(_x) {return _ref.apply(this, arguments);}return getIssuesByAddress;}()


    /**
                                                                                                                                                                                                                                  * @function
                                                                                                                                                                                                                                  * @description Get Amount of Issues Opened in the network
                                                                                                                                                                                                                                  * @returns {Integer}
                                                                                                                                                                                                                                  */ }, { key: "getAmountofIssuesOpened", value: function () {var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.t0 =

                parseInt;_context2.next = 3;return this.params.contract.getContract().methods.incrementIssueID().call();case 3:_context2.t1 = _context2.sent;return _context2.abrupt("return", (0, _context2.t0)(_context2.t1));case 5:case "end":return _context2.stop();}}}, _callee2, this);}));function getAmountofIssuesOpened() {return _ref2.apply(this, arguments);}return getAmountofIssuesOpened;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                                                * @function
                                                                                                                                                                                                                                                                                                                                                                                                                * @description Get Amount of Issues Closed in the network
                                                                                                                                                                                                                                                                                                                                                                                                                * @returns {Integer}
                                                                                                                                                                                                                                                                                                                                                                                                                */ }, { key: "getAmountofIssuesClosed", value: function () {var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {return _regenerator2.default.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.t0 =

                parseInt;_context3.next = 3;return this.params.contract.getContract().methods.closedIdsCount().call();case 3:_context3.t1 = _context3.sent;return _context3.abrupt("return", (0, _context3.t0)(_context3.t1));case 5:case "end":return _context3.stop();}}}, _callee3, this);}));function getAmountofIssuesClosed() {return _ref3.apply(this, arguments);}return getAmountofIssuesClosed;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                                              * @function
                                                                                                                                                                                                                                                                                                                                                                                                              * @description Get Amount of Needed for Approve
                                                                                                                                                                                                                                                                                                                                                                                                              * @returns {Integer}
                                                                                                                                                                                                                                                                                                                                                                                                              */ }, { key: "percentageNeededForApprove", value: function () {var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {return _regenerator2.default.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_context4.t0 =

                parseInt;_context4.next = 3;return this.params.contract.getContract().methods.percentageNeededForApprove().call();case 3:_context4.t1 = _context4.sent;return _context4.abrupt("return", (0, _context4.t0)(_context4.t1));case 5:case "end":return _context4.stop();}}}, _callee4, this);}));function percentageNeededForApprove() {return _ref4.apply(this, arguments);}return percentageNeededForApprove;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                                                                * @function
                                                                                                                                                                                                                                                                                                                                                                                                                                * @description Get Amount of Needed for Merge
                                                                                                                                                                                                                                                                                                                                                                                                                                * @returns {Integer}
                                                                                                                                                                                                                                                                                                                                                                                                                                */ }, { key: "percentageNeededForMerge", value: function () {var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {return _regenerator2.default.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:_context5.t0 =

                parseInt;_context5.next = 3;return this.params.contract.getContract().methods.percentageNeededForMerge().call();case 3:_context5.t1 = _context5.sent;return _context5.abrupt("return", (0, _context5.t0)(_context5.t1));case 5:case "end":return _context5.stop();}}}, _callee5, this);}));function percentageNeededForMerge() {return _ref5.apply(this, arguments);}return percentageNeededForMerge;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                                                          * @function
                                                                                                                                                                                                                                                                                                                                                                                                                          * @description Get Total Amount of BEPRO Staked for Tickets in the network
                                                                                                                                                                                                                                                                                                                                                                                                                          * @returns {Integer}
                                                                                                                                                                                                                                                                                                                                                                                                                          */ }, { key: "getBEPROStaked", value: function () {var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {return _regenerator2.default.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:_context6.t0 =

                _Numbers2.default;_context6.next = 3;return this.params.contract.getContract().methods.totalStaked().call();case 3:_context6.t1 = _context6.sent;return _context6.abrupt("return", _context6.t0.fromDecimals.call(_context6.t0, _context6.t1, 18));case 5:case "end":return _context6.stop();}}}, _callee6, this);}));function getBEPROStaked() {return _ref6.apply(this, arguments);}return getBEPROStaked;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                                                                 * @function
                                                                                                                                                                                                                                                                                                                                                                                                                                 * @description GetTotal amount of time where an issue has to be approved
                                                                                                                                                                                                                                                                                                                                                                                                                                 * @returns {Date}
                                                                                                                                                                                                                                                                                                                                                                                                                                 */ }, { key: "timeOpenForIssueApprove", value: function () {var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {return _regenerator2.default.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:_context7.t0 =

                _Numbers2.default;_context7.next = 3;return this.params.contract.getContract().methods.timeOpenForIssueApprove().call();case 3:_context7.t1 = _context7.sent;return _context7.abrupt("return", _context7.t0.fromSmartContractTimeToMinutes.call(_context7.t0, _context7.t1));case 5:case "end":return _context7.stop();}}}, _callee7, this);}));function timeOpenForIssueApprove() {return _ref7.apply(this, arguments);}return timeOpenForIssueApprove;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @function
                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @description Get Total Amount of BEPRO Staked for Tickets in the network
                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * @returns {Integer}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                             */ }, { key: "beproVotesStaked", value: function () {var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {return _regenerator2.default.wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:_context8.t0 =

                _Numbers2.default;_context8.next = 3;return this.params.contract.getContract().methods.beproVotesStaked().call();case 3:_context8.t1 = _context8.sent;return _context8.abrupt("return", _context8.t0.fromDecimals.call(_context8.t0, _context8.t1, 18));case 5:case "end":return _context8.stop();}}}, _callee8, this);}));function beproVotesStaked() {return _ref8.apply(this, arguments);}return beproVotesStaked;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                                                                          * @function
                                                                                                                                                                                                                                                                                                                                                                                                                                          * @description Get Total Amount of BEPRO Staked for Council in the network
                                                                                                                                                                                                                                                                                                                                                                                                                                          * @returns {Integer}
                                                                                                                                                                                                                                                                                                                                                                                                                                          */ }, { key: "COUNCIL_BEPRO_AMOUNT", value: function () {var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {return _regenerator2.default.wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:_context9.t0 =

                _Numbers2.default;_context9.next = 3;return this.params.contract.getContract().methods.COUNCIL_BEPRO_AMOUNT().call();case 3:_context9.t1 = _context9.sent;return _context9.abrupt("return", _context9.t0.fromDecimals.call(_context9.t0, _context9.t1, 18));case 5:case "end":return _context9.stop();}}}, _callee9, this);}));function COUNCIL_BEPRO_AMOUNT() {return _ref9.apply(this, arguments);}return COUNCIL_BEPRO_AMOUNT;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @function
                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @description Get Total Amount of BEPRO Staked for Operator in the network
                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @returns {Integer}
                                                                                                                                                                                                                                                                                                                                                                                                                                                      */ }, { key: "OPERATOR_BEPRO_AMOUNT", value: function () {var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10() {return _regenerator2.default.wrap(function _callee10$(_context10) {while (1) {switch (_context10.prev = _context10.next) {case 0:_context10.t0 =

                _Numbers2.default;_context10.next = 3;return this.params.contract.getContract().methods.OPERATOR_BEPRO_AMOUNT().call();case 3:_context10.t1 = _context10.sent;return _context10.abrupt("return", _context10.t0.fromDecimals.call(_context10.t0, _context10.t1, 18));case 5:case "end":return _context10.stop();}}}, _callee10, this);}));function OPERATOR_BEPRO_AMOUNT() {return _ref10.apply(this, arguments);}return OPERATOR_BEPRO_AMOUNT;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * @function
                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * @description Get Total Amount of BEPRO Staked for Developer in the network
                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * @returns {Integer}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                   */ }, { key: "DEVELOPER_BEPRO_AMOUNT", value: function () {var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11() {return _regenerator2.default.wrap(function _callee11$(_context11) {while (1) {switch (_context11.prev = _context11.next) {case 0:_context11.t0 =

                _Numbers2.default;_context11.next = 3;return this.params.contract.getContract().methods.DEVELOPER_BEPRO_AMOUNT().call();case 3:_context11.t1 = _context11.sent;return _context11.abrupt("return", _context11.t0.fromDecimals.call(_context11.t0, _context11.t1, 18));case 5:case "end":return _context11.stop();}}}, _callee11, this);}));function DEVELOPER_BEPRO_AMOUNT() {return _ref11.apply(this, arguments);}return DEVELOPER_BEPRO_AMOUNT;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @function
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @description Is issue Approved
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @param {Integer} issueId
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @returns {Bool}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */ }, { key: "isIssueApproved", value: function () {var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(_ref13) {var
        issueId = _ref13.issueId;return _regenerator2.default.wrap(function _callee12$(_context12) {while (1) {switch (_context12.prev = _context12.next) {case 0:_context12.next = 2;return (
                  this.params.contract.getContract().methods.isIssueApproved(issueId).call());case 2:return _context12.abrupt("return", _context12.sent);case 3:case "end":return _context12.stop();}}}, _callee12, this);}));function isIssueApproved(_x2) {return _ref12.apply(this, arguments);}return isIssueApproved;}()


    /**
                                                                                                                                                                                                                                                                                                                               * @function
                                                                                                                                                                                                                                                                                                                               * @description Is issue available to be approved (time wise)
                                                                                                                                                                                                                                                                                                                               * @param {Integer} issueId
                                                                                                                                                                                                                                                                                                                               * @returns {Bool}
                                                                                                                                                                                                                                                                                                                               */ }, { key: "isIssueApprovable", value: function () {var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(_ref15) {var
        issueId = _ref15.issueId;return _regenerator2.default.wrap(function _callee13$(_context13) {while (1) {switch (_context13.prev = _context13.next) {case 0:_context13.next = 2;return (
                  this.params.contract.getContract().methods.isIssueApprovable(issueId).call());case 2:return _context13.abrupt("return", _context13.sent);case 3:case "end":return _context13.stop();}}}, _callee13, this);}));function isIssueApprovable(_x3) {return _ref14.apply(this, arguments);}return isIssueApprovable;}()



    /**
                                                                                                                                                                                                                                                                                                                                     * @function
                                                                                                                                                                                                                                                                                                                                     * @description Is issue mergeable
                                                                                                                                                                                                                                                                                                                                     * @param {Integer} issueId
                                                                                                                                                                                                                                                                                                                                     * @param {Integer} mergeId
                                                                                                                                                                                                                                                                                                                                     * @returns {Bool}
                                                                                                                                                                                                                                                                                                                                     */ }, { key: "isIssueMergeable", value: function () {var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(_ref17) {var
        issueId = _ref17.issueId,mergeId = _ref17.mergeId;return _regenerator2.default.wrap(function _callee14$(_context14) {while (1) {switch (_context14.prev = _context14.next) {case 0:_context14.next = 2;return (
                  this.params.contract.getContract().methods.isIssueMergeable(issueId, mergeId).call());case 2:return _context14.abrupt("return", _context14.sent);case 3:case "end":return _context14.stop();}}}, _callee14, this);}));function isIssueMergeable(_x4) {return _ref16.apply(this, arguments);}return isIssueMergeable;}()


    /**
                                                                                                                                                                                                                                                                                                                                           * @function
                                                                                                                                                                                                                                                                                                                                           * @description Is issue mergeable
                                                                                                                                                                                                                                                                                                                                           * @param {Integer} issueId
                                                                                                                                                                                                                                                                                                                                           * @param {Integer} mergeId
                                                                                                                                                                                                                                                                                                                                           * @returns {Bool}
                                                                                                                                                                                                                                                                                                                                           */ }, { key: "isMergeTheOneWithMoreVotes", value: function () {var _ref18 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15(_ref19) {var
        issueId = _ref19.issueId,mergeId = _ref19.mergeId;return _regenerator2.default.wrap(function _callee15$(_context15) {while (1) {switch (_context15.prev = _context15.next) {case 0:_context15.next = 2;return (
                  this.params.contract.getContract().methods.isMergeTheOneWithMoreVotes(issueId, mergeId).call());case 2:return _context15.abrupt("return", _context15.sent);case 3:case "end":return _context15.stop();}}}, _callee15, this);}));function isMergeTheOneWithMoreVotes(_x5) {return _ref18.apply(this, arguments);}return isMergeTheOneWithMoreVotes;}()


    /**
                                                                                                                                                                                                                                                                                                                                                                         * @function
                                                                                                                                                                                                                                                                                                                                                                         * @description Get Issue Id Info
                                                                                                                                                                                                                                                                                                                                                                         * @param {Address} address
                                                                                                                                                                                                                                                                                                                                                                         * @returns {Integer} votes
                                                                                                                                                                                                                                                                                                                                                                         */ }, { key: "getVotesByAddress", value: function () {var _ref20 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16(_ref21) {var

        address = _ref21.address;var r;return _regenerator2.default.wrap(function _callee16$(_context16) {while (1) {switch (_context16.prev = _context16.next) {case 0:_context16.next = 2;return (
                  this.params.contract.getContract().methods.getVotesByAddress(address).call());case 2:r = _context16.sent;return _context16.abrupt("return",
                _Numbers2.default.fromDecimals(r, 18));case 4:case "end":return _context16.stop();}}}, _callee16, this);}));function getVotesByAddress(_x6) {return _ref20.apply(this, arguments);}return getVotesByAddress;}()


    /**
                                                                                                                                                                                                                                 * @function
                                                                                                                                                                                                                                 * @description Get Issue Id Info
                                                                                                                                                                                                                                 * @param {Integer} issue_id
                                                                                                                                                                                                                                 * @returns {Integer} _id
                                                                                                                                                                                                                                 * @returns {Integer} beproStaked
                                                                                                                                                                                                                                 * @returns {Date} creationDate
                                                                                                                                                                                                                                 * @returns {Address} issueGenerator
                                                                                                                                                                                                                                 * @returns {Integer} votesForApprove
                                                                                                                                                                                                                                 * @returns {Integer} mergeProposalsAmount
                                                                                                                                                                                                                                 * @returns {Bool} finalized
                                                                                                                                                                                                                                 * @returns {Bool} canceled
                                                                                                                                                                                                                                 */ }, { key: "getIssueById", value: function () {var _ref22 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee17(_ref23) {var

        issue_id = _ref23.issue_id;var r;return _regenerator2.default.wrap(function _callee17$(_context17) {while (1) {switch (_context17.prev = _context17.next) {case 0:_context17.next = 2;return (

                  this.__sendTx(
                  this.params.contract.getContract().methods.getIssueById(issue_id),
                  true));case 2:r = _context17.sent;return _context17.abrupt("return",


                {
                  _id: _Numbers2.default.fromHex(r[0]),
                  beproStaked: _Numbers2.default.fromDecimals(r[1], 18),
                  creationDate: _Numbers2.default.fromSmartContractTimeToMinutes(r[2]),
                  issueGenerator: r[3],
                  votesForApprove: _Numbers2.default.fromDecimals(r[4], 18),
                  mergeProposalsAmount: parseInt(r[5]),
                  finalized: r[6],
                  canceled: r[7] });case 4:case "end":return _context17.stop();}}}, _callee17, this);}));function getIssueById(_x7) {return _ref22.apply(this, arguments);}return getIssueById;}()



    /**
                                                                                                                                                                                                    * @function
                                                                                                                                                                                                    * @description Get Issue Id Info
                                                                                                                                                                                                    * @param {Integer} issue_id
                                                                                                                                                                                                    * @param {Integer} merge_id
                                                                                                                                                                                                    * @returns {Integer} _id
                                                                                                                                                                                                    * @returns {Integer} votes
                                                                                                                                                                                                    * @returns {Address | Array} prAddresses
                                                                                                                                                                                                    * @returns {Integer | Array} prAmounts
                                                                                                                                                                                                    * @returns {Address} proposalAddress
                                                                                                                                                                                                    */ }, { key: "getMergeById", value: function () {var _ref24 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee18(_ref25) {var

        issue_id = _ref25.issue_id,merge_id = _ref25.merge_id;var r;return _regenerator2.default.wrap(function _callee18$(_context18) {while (1) {switch (_context18.prev = _context18.next) {case 0:_context18.next = 2;return (

                  this.__sendTx(
                  this.params.contract.getContract().methods.getMergeById(issue_id, merge_id),
                  true));case 2:r = _context18.sent;return _context18.abrupt("return",


                {
                  _id: _Numbers2.default.fromHex(r[0]),
                  votes: _Numbers2.default.fromDecimals(r[1], 18),
                  prAddresses: r[3],
                  prAmounts: r[4] ? r[4].map(function (a) {return _Numbers2.default.fromDecimals(a, 18);}) : 0,
                  proposalAddress: r[5] });case 4:case "end":return _context18.stop();}}}, _callee18, this);}));function getMergeById(_x8) {return _ref24.apply(this, arguments);}return getMergeById;}()




    /**
                                                                                                                                                                                                           * @function
                                                                                                                                                                                                           * @description Approve ERC20 Allowance
                                                                                                                                                                                                           */








    /**
                                                                                                                                                                                                               * @function
                                                                                                                                                                                                               * @description Verify if Approved
                                                                                                                                                                                                               */ }, { key: "lockBepro",









    /**
                                                                                                                                                                                                                                          * @function
                                                                                                                                                                                                                                          * @description lock BEPRO for oracles
                                                                                                                                                                                                                                          * @param {integer} beproAmount
                                                                                                                                                                                                                                          */value: function () {var _ref26 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee19(_ref27) {var
        beproAmount = _ref27.beproAmount;return _regenerator2.default.wrap(function _callee19$(_context19) {while (1) {switch (_context19.prev = _context19.next) {case 0:if (!(

                beproAmount <= 0)) {_context19.next = 2;break;}throw (
                  new Error("Bepro Amount has to be higher than 0"));case 2:_context19.next = 4;return (


                  this.isApprovedERC20({ amount: amount, address: address }));case 4:if (_context19.sent) {_context19.next = 6;break;}throw (
                  new Error("Bepro not approve for tx, first use 'approveERC20'"));case 6:_context19.next = 8;return (


                  this.__sendTx(
                  this.params.contract.getContract().methods.lockBepro(beproAmount)));case 8:return _context19.abrupt("return", _context19.sent);case 9:case "end":return _context19.stop();}}}, _callee19, this);}));function lockBepro(_x9) {return _ref26.apply(this, arguments);}return lockBepro;}()



    /**
                                                                                                                                                                                                                                                                                                           * @function
                                                                                                                                                                                                                                                                                                           * @description Unlock BEPRO for oracles
                                                                                                                                                                                                                                                                                                           * @param {integer} beproAmount
                                                                                                                                                                                                                                                                                                           * @param {address} from
                                                                                                                                                                                                                                                                                                           */ }, { key: "unlockBepro", value: function () {var _ref28 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee20(_ref29) {var
        beproAmount = _ref29.beproAmount,from = _ref29.from;return _regenerator2.default.wrap(function _callee20$(_context20) {while (1) {switch (_context20.prev = _context20.next) {case 0:if (!(

                beproAmount <= 0)) {_context20.next = 2;break;}throw (
                  new Error("Bepro Amount has to be higher than 0"));case 2:_context20.next = 4;return (


                  this.__sendTx(
                  this.params.contract.getContract().methods.unlockBepro(beproAmount, from)));case 4:return _context20.abrupt("return", _context20.sent);case 5:case "end":return _context20.stop();}}}, _callee20, this);}));function unlockBepro(_x10) {return _ref28.apply(this, arguments);}return unlockBepro;}()



    /**
                                                                                                                                                                                                                                                                                                                        * @function
                                                                                                                                                                                                                                                                                                                        * @description Delegated Oracles to others
                                                                                                                                                                                                                                                                                                                        * @param {integer} beproAmount
                                                                                                                                                                                                                                                                                                                        * @param {address} delegatedTo
                                                                                                                                                                                                                                                                                                                        */ }, { key: "delegateOracles", value: function () {var _ref30 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee21(_ref31) {var
        beproAmount = _ref31.beproAmount,delegatedTo = _ref31.delegatedTo;return _regenerator2.default.wrap(function _callee21$(_context21) {while (1) {switch (_context21.prev = _context21.next) {case 0:if (!(

                beproAmount <= 0)) {_context21.next = 2;break;}throw (
                  new Error("Bepro Amount has to be higher than 0"));case 2:_context21.next = 4;return (


                  this.__sendTx(
                  this.params.contract.getContract().methods.unlockBepro(beproAmount, delegatedTo)));case 4:return _context21.abrupt("return", _context21.sent);case 5:case "end":return _context21.stop();}}}, _callee21, this);}));function delegateOracles(_x11) {return _ref30.apply(this, arguments);}return delegateOracles;}()



    /**
                                                                                                                                                                                                                                                                                                                                       * @function
                                                                                                                                                                                                                                                                                                                                       * @description open Issue
                                                                                                                                                                                                                                                                                                                                       * @param {integer} beproAmount
                                                                                                                                                                                                                                                                                                                                       * @param {address} address
                                                                                                                                                                                                                                                                                                                                       */ }, { key: "openIssue", value: function () {var _ref32 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee22(_ref33) {var
        beproAmount = _ref33.beproAmount,address = _ref33.address;return _regenerator2.default.wrap(function _callee22$(_context22) {while (1) {switch (_context22.prev = _context22.next) {case 0:if (!(

                beproAmount < 0)) {_context22.next = 2;break;}throw (
                  new Error("Bepro Amount has to be higher than 0"));case 2:_context22.next = 4;return (


                  this.isApprovedERC20({ amount: amount, address: address }));case 4:if (_context22.sent) {_context22.next = 6;break;}throw (
                  new Error("Bepro not approve for tx, first use 'approveERC20'"));case 6:_context22.next = 8;return (


                  this.__sendTx(
                  this.params.contract.getContract().methods.openIssue(beproAmount)));case 8:return _context22.abrupt("return", _context22.sent);case 9:case "end":return _context22.stop();}}}, _callee22, this);}));function openIssue(_x12) {return _ref32.apply(this, arguments);}return openIssue;}()



    /**
                                                                                                                                                                                                                                                                                                            * @function
                                                                                                                                                                                                                                                                                                            * @description open Issue
                                                                                                                                                                                                                                                                                                            * @param {integer} issueId
                                                                                                                                                                                                                                                                                                            */ }, { key: "approveIssue", value: function () {var _ref34 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee23(_ref35) {var
        issueId = _ref35.issueId;return _regenerator2.default.wrap(function _callee23$(_context23) {while (1) {switch (_context23.prev = _context23.next) {case 0:_context23.next = 2;return (
                  this.__sendTx(
                  this.params.contract.getContract().methods.approveIssue(issueId)));case 2:return _context23.abrupt("return", _context23.sent);case 3:case "end":return _context23.stop();}}}, _callee23, this);}));function approveIssue(_x13) {return _ref34.apply(this, arguments);}return approveIssue;}()



    /**
                                                                                                                                                                                                                                                                                                                 * @function
                                                                                                                                                                                                                                                                                                                 * @description redeem Issue
                                                                                                                                                                                                                                                                                                                 */ }, { key: "redeemIssue", value: function () {var _ref36 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee24(_ref37) {var
        issueId = _ref37.issueId;return _regenerator2.default.wrap(function _callee24$(_context24) {while (1) {switch (_context24.prev = _context24.next) {case 0:_context24.next = 2;return (
                  this.__sendTx(
                  this.params.contract.getContract().methods.redeemIssue(issueId)));case 2:return _context24.abrupt("return", _context24.sent);case 3:case "end":return _context24.stop();}}}, _callee24, this);}));function redeemIssue(_x14) {return _ref36.apply(this, arguments);}return redeemIssue;}()



    /**
                                                                                                                                                                                                                                                                                                              * @function
                                                                                                                                                                                                                                                                                                              * @description open Issue
                                                                                                                                                                                                                                                                                                              * @param {integer} issueId
                                                                                                                                                                                                                                                                                                              * @param {integer} mergeId
                                                                                                                                                                                                                                                                                                              */ }, { key: "approveMerge", value: function () {var _ref38 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee25(_ref39) {var
        issueId = _ref39.issueId,mergeId = _ref39.mergeId;return _regenerator2.default.wrap(function _callee25$(_context25) {while (1) {switch (_context25.prev = _context25.next) {case 0:_context25.next = 2;return (
                  this.__sendTx(
                  this.params.contract.getContract().methods.approveMerge(issueId, mergeId)));case 2:return _context25.abrupt("return", _context25.sent);case 3:case "end":return _context25.stop();}}}, _callee25, this);}));function approveMerge(_x15) {return _ref38.apply(this, arguments);}return approveMerge;}()



    /**
                                                                                                                                                                                                                                                                                                                          * @function
                                                                                                                                                                                                                                                                                                                          * @description open Issue
                                                                                                                                                                                                                                                                                                                          * @param {integer} issueID
                                                                                                                                                                                                                                                                                                                          * @param {integer} beproAmount
                                                                                                                                                                                                                                                                                                                          * @param {address} address
                                                                                                                                                                                                                                                                                                                          */ }, { key: "updateIssue", value: function () {var _ref40 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee26(_ref41) {var
        issueID = _ref41.issueID,beproAmount = _ref41.beproAmount,address = _ref41.address;return _regenerator2.default.wrap(function _callee26$(_context26) {while (1) {switch (_context26.prev = _context26.next) {case 0:if (!(

                beproAmount < 0)) {_context26.next = 2;break;}throw (
                  new Error("Bepro Amount has to be higher than 0"));case 2:_context26.next = 4;return (


                  this.isApprovedERC20({ amount: amount, address: address }));case 4:if (_context26.sent) {_context26.next = 6;break;}throw (
                  new Error("Bepro not approve for tx, first use 'approveERC20'"));case 6:_context26.next = 8;return (


                  this.__sendTx(
                  this.params.contract.getContract().methods.updateIssue(issueID, beproAmount, address)));case 8:return _context26.abrupt("return", _context26.sent);case 9:case "end":return _context26.stop();}}}, _callee26, this);}));function updateIssue(_x16) {return _ref40.apply(this, arguments);}return updateIssue;}()



    /**
                                                                                                                                                                                                                                                                                                                                    * @function
                                                                                                                                                                                                                                                                                                                                    * @description Propose Merge of Issue
                                                                                                                                                                                                                                                                                                                                    * @param {integer} issueID
                                                                                                                                                                                                                                                                                                                                    * @param {address | Array} prAddresses
                                                                                                                                                                                                                                                                                                                                    * @param {address | Integer} prAmounts
                                                                                                                                                                                                                                                                                                                                    */ }, { key: "proposeIssueMerge", value: function () {var _ref42 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee27(_ref43) {var
        issueID = _ref43.issueID,prAddresses = _ref43.prAddresses,prAmounts = _ref43.prAmounts;return _regenerator2.default.wrap(function _callee27$(_context27) {while (1) {switch (_context27.prev = _context27.next) {case 0:if (!(
                prAddresses.length != prAmounts.length)) {_context27.next = 2;break;}throw (
                  new Error("prAddresses dont match prAmounts size"));case 2:_context27.next = 4;return (

                  this.__sendTx(
                  this.params.contract.getContract().methods.proposeIssueMerge(issueID, prAddresses, prAmounts)));case 4:return _context27.abrupt("return", _context27.sent);case 5:case "end":return _context27.stop();}}}, _callee27, this);}));function proposeIssueMerge(_x17) {return _ref42.apply(this, arguments);}return proposeIssueMerge;}()



    /**
                                                                                                                                                                                                                                                                                                                                                        * @function
                                                                                                                                                                                                                                                                                                                                                        * @description close Issue
                                                                                                                                                                                                                                                                                                                                                        * @param {integer} issueID
                                                                                                                                                                                                                                                                                                                                                        * @param {integer} mergeID
                                                                                                                                                                                                                                                                                                                                                        */ }, { key: "closeIssue", value: function () {var _ref44 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee28(_ref45) {var
        issueID = _ref45.issueID,mergeID = _ref45.mergeID;return _regenerator2.default.wrap(function _callee28$(_context28) {while (1) {switch (_context28.prev = _context28.next) {case 0:_context28.next = 2;return (
                  this.__sendTx(
                  this.params.contract.getContract().methods.closeIssue(issueID, mergeID)));case 2:return _context28.abrupt("return", _context28.sent);case 3:case "end":return _context28.stop();}}}, _callee28, this);}));function closeIssue(_x18) {return _ref44.apply(this, arguments);}return closeIssue;}() }]);return BEPRONetwork;}(_IContract3.default);var _initialiseProps = function _initialiseProps() {var _this2 = this;this.__assert = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee29() {return _regenerator2.default.wrap(function _callee29$(_context29) {while (1) {switch (_context29.prev = _context29.next) {case 0:if (_this2.getAddress()) {_context29.next = 2;break;}throw new Error("Contract is not deployed, first deploy it and provide a contract address");case 2: // Use ABI
            _this2.params.contract.use(_interfaces.beproNetwork, _this2.getAddress()); // Set Token Address Contract for easy access
            _this2.params.ERC20Contract = new _ERC20Contract2.default({ web3Connection: _this2.web3Connection, contractAddress: beproAddress }); // Assert Token Contract
            _context29.next = 6;return _this2.params.ERC20Contract.__assert();case 6:case "end":return _context29.stop();}}}, _callee29, _this2);}));this.approveERC20 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee30() {var totalMaxAmount;return _regenerator2.default.wrap(function _callee30$(_context30) {while (1) {switch (_context30.prev = _context30.next) {case 0:_context30.next = 2;return _this2.getERC20Contract().totalSupply();case 2:totalMaxAmount = _context30.sent;_context30.next = 5;return _this2.getERC20Contract().approve({ address: _this2.getAddress(), amount: totalMaxAmount });case 5:return _context30.abrupt("return", _context30.sent);case 6:case "end":return _context30.stop();}}}, _callee30, _this2);}));this.isApprovedERC20 = function () {var _ref48 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee31(_ref49) {var amount = _ref49.amount,address = _ref49.address;return _regenerator2.default.wrap(function _callee31$(_context31) {while (1) {switch (_context31.prev = _context31.next) {case 0:_context31.next = 2;return _this2.getERC20Contract().isApproved({ address: address, amount: amount, spenderAddress: _this2.getAddress() });case 2:return _context31.abrupt("return", _context31.sent);case 3:case "end":return _context31.stop();}}}, _callee31, _this2);}));return function (_x19) {return _ref48.apply(this, arguments);};}();this.

  deploy = function () {var _ref50 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee32(_ref51) {var tokenAddress = _ref51.tokenAddress,callback = _ref51.callback;var params, res;return _regenerator2.default.wrap(function _callee32$(_context32) {while (1) {switch (_context32.prev = _context32.next) {case 0:
              params = [tokenAddress];_context32.next = 3;return (
                _this2.__deploy(params, callback));case 3:res = _context32.sent;
              _this2.params.contractAddress = res.contractAddress;
              /* Call to Backend API */_context32.next = 7;return (
                _this2.__assert());case 7:return _context32.abrupt("return",
              res);case 8:case "end":return _context32.stop();}}}, _callee32, _this2);}));return function (_x20) {return _ref50.apply(this, arguments);};}();this.


  getERC20Contract = function () {return _this2.params.ERC20Contract;};};exports.default =



BEPRONetwork;