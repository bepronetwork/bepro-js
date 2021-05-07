"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require("babel-runtime/helpers/createClass");var _createClass3 = _interopRequireDefault(_createClass2);var _moment = require("moment");var _moment2 = _interopRequireDefault(_moment);
var _accounting = require("accounting");var _accounting2 = _interopRequireDefault(_accounting);
var _dayjs = require("dayjs");var _dayjs2 = _interopRequireDefault(_dayjs);
var _bn = require("bn.js");var _bn2 = _interopRequireDefault(_bn);
var _web = require("web3");var _web2 = _interopRequireDefault(_web);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}
var Web3 = new _web2.default();

Number.prototype.noExponents = function () {
  var data = String(this).split(/[eE]/);
  if (data.length == 1) return data[0];

  var z = "",
  sign = this < 0 ? "-" : "",
  str = data[0].replace(".", ""),
  mag = Number(data[1]) + 1;

  if (mag < 0) {
    z = sign + "0.";
    while (mag++) {z += "0";}
    return z + str.replace(/^\-/, "");
  }
  mag -= str.length;
  while (mag--) {z += "0";}
  return str + z;
};var

numbers = function () {
  function numbers() {(0, _classCallCheck3.default)(this, numbers);}(0, _createClass3.default)(numbers, [{ key: "fromDayMonthYear", value: function fromDayMonthYear(

    date) {
      var mom = (0, _moment2.default)().dayOfYear(date.day);
      mom.set("hour", date.hour);
      mom.set("year", date.year);
      return mom.format("ddd, hA");
    } }, { key: "fromSmartContractTimeToMinutes", value: function fromSmartContractTimeToMinutes(

    time) {
      return _dayjs2.default.unix(time).toDate();
    } }, { key: "fromMinutesToSmartContracTime", value: function fromMinutesToSmartContracTime(

    time) {
      return time;
    } }, { key: "fromHex", value: function fromHex(

    hex) {
      return hex.toString();
    } }, { key: "toFloat", value: function toFloat(

    number) {
      return parseFloat(parseFloat(number).toFixed(2));
    } }, { key: "timeToSmartContractTime", value: function timeToSmartContractTime(

    time) {
      return parseInt(new Date(time).getTime() / 1000);
    } }, { key: "toDate", value: function toDate(

    date) {
      var mom = (0, _moment2.default)().dayOfYear(date.day);
      mom.set("hour", date.hour);
      mom.set("year", date.year);
      return mom.unix();
    } }, { key: "toMoney", value: function toMoney(

    number) {
      return _accounting2.default.formatMoney(number, { symbol: "EUR", format: "%v" });
    } }, { key: "toFormatBet", value: function toFormatBet(

    number) {
      return parseFloat(parseFloat(number).toFixed(6));
    } }, { key: "formatNumber", value: function formatNumber(

    number) {
      return _accounting2.default.formatNumber(number);
    } }, { key: "toSmartContractDecimals", value: function toSmartContractDecimals(

    value, decimals) {
      var numberWithNoExponents = new Number(
      (Number(value) * Math.pow(10, decimals)).toFixed(0)).
      noExponents();
      return numberWithNoExponents;
    } }, { key: "fromBigNumberToInteger", value: function fromBigNumberToInteger(

    value) {var decimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 18;
      return value / Math.pow(10, decimals) * 1000000000000000000;
    } }, { key: "fromDecimals", value: function fromDecimals(

    value, decimals) {
      return Number(
      parseFloat(value / Math.pow(10, decimals)).toPrecision(decimals)).
      noExponents();
    } }, { key: "fromExponential", value: function fromExponential(

    x) {
      if (Math.abs(x) < 1.0) {
        var e = parseInt(x.toString().split("e-")[1]);
        if (e) {
          x *= Math.pow(10, e - 1);
          x = "0." + new Array(e).join("0") + x.toString().substring(2);
        }
      } else {
        var e = parseInt(x.toString().split("+")[1]);
        if (e > 20) {
          e -= 20;
          x /= Math.pow(10, e);
          x += new Array(e + 1).join("0");
        }
      }
      return x;
    } }]);return numbers;}();


var Numbers = new numbers();exports.default =

Numbers;