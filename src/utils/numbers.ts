import BigNumber from 'bignumber.js';

export function toSmartContractDecimals(value: string|number, decimals = 18) {
  return new BigNumber(value).shiftedBy(+decimals).toFixed() as any as number;
}

export function fromSmartContractDecimals(value: string|number|BigNumber, decimals = 18) {
  return new BigNumber(value).shiftedBy(-(+decimals)).toNumber();
}

export function fromDecimals(value: string|number, decimals = 18) {
  return fromSmartContractDecimals(value, decimals);
}

export function toSmartContractDate(date: number|Date) {
  return parseInt(`${+new Date(date) / 1000}`)
}

export function fromSmartContractDate(date: number) {
  return +new Date(date*1000);
}
