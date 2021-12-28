import moment from 'moment';
import accounting from 'accounting';
import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';

const noExponents = value => {
  const number = Number(value);
  const data = String(number).split(/[eE]/);
  if (data.length === 1) {
    return data[0];
  }

  let z = '';
  const sign = number < 0 ? '-' : '';
  const str = data[0].replace('.', '');
  let mag = Number(data[1]) + 1;

  if (mag < 0) {
    z = `${sign}0.`;
    // eslint-disable-next-line no-plusplus
    while (mag++) z += '0';
    return z + str.replace(/^-/, '');
  }
  mag -= str.length;
  // eslint-disable-next-line no-plusplus
  while (mag--) z += '0';
  return str + z;
};

const Numbers = {
  fromDayMonthYear(date) {
    const mom = moment().dayOfYear(date.day);
    mom.set('hour', date.hour);
    mom.set('year', date.year);
    return mom.format('ddd, hA');
  },

  fromSmartContractTimeToMinutes(time) {
    return dayjs.unix(time).toDate();
  },

  fromMinutesToSmartContracTime(time) {
    return time;
  },

  fromHex(hex) {
    return hex.toString();
  },

  toFloat(number) {
    return parseFloat(parseFloat(number).toFixed(2));
  },

  timeToSmartContractTime(time) {
    return parseInt(new Date(time).getTime() / 1000, 10);
  },

  toDate(date) {
    const mom = moment().dayOfYear(date.day);
    mom.set('hour', date.hour);
    mom.set('year', date.year);
    return mom.unix();
  },

  toMoney(number) {
    return accounting.formatMoney(number, { symbol: 'EUR', format: '%v' });
  },

  toFormatBet(number) {
    return parseFloat(parseFloat(number).toFixed(6));
  },

  formatNumber(number) {
    return accounting.formatNumber(number);
  },

  // original version
  toSmartContractDecimals(value, decimals) {
    const numberWithNoExponents = noExponents((Number(value) * 10 ** decimals).toFixed(0));
    return numberWithNoExponents;
  },

  // convert BigNumber value to smart contract value because Number loose precision.
  // value can be BigNumber, number or string, if string it will be converted to BigNumber
  // returns a string
  fromBNToDecimals(value, decimals) {
    let val;
    const decimalsNr = Number(decimals);
    const types = ['string', 'number'];
    if (types.includes(typeof (value))) val = new BigNumber(value);
    else val = value;

    const tokens = val.shiftedBy(decimalsNr); // can have exponent like 1.2345e18
    const tokens2 = tokens.toFixed(); // this removes exponent and has all digits
    return tokens2;
  },

  fromBigNumberToInteger(value, decimals = 18) {
    return (value / 10 ** decimals) * 1000000000000000000;
  },

  fromDecimals(value, decimals) {
    return noExponents(parseFloat(value / 10 ** decimals).toPrecision(decimals));
  },

  // parse value from smart contract to BigNumber because Number loose precision.
  // value can be BigNumber, number or string, if string it will be converted to BigNumber
  fromDecimalsToBN(value, decimals) {
    let val;
    const decimalsNr = Number(decimals);
    const types = ['string', 'number'];
    if (types.includes(typeof (value))) val = new BigNumber(value);
    else val = value;

    return val.shiftedBy(-decimalsNr);
  },

  fromTokens(value, decimals) {
    const precision = `1e${decimals}`;
    return noExponents(value / precision);
  },

  fromExponential(x) {
    let ret = x;
    if (Math.abs(x) < 1.0) {
      const e = parseInt(x.toString().split('e-')[1], 10);
      if (e) {
        ret *= 10 ** (e - 1);
        ret = `0.${new Array(e).join('0')}${ret.toString().substring(2)}`;
      }
    }
    else {
      let e = parseInt(x.toString().split('+')[1], 10);
      if (e > 20) {
        e -= 20;
        ret /= 10 ** e;
        ret += new Array(e + 1).join('0');
      }
    }
    return ret;
  },
};

export default Numbers;
