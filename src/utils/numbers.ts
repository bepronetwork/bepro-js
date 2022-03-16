/* eslint-disable complexity */
import Web3 from 'web3';

const toBn = Web3.utils.toBN;

export function toSmartContractDecimals(value: string|number, decimals = 18) {
  return toBn(value).mul(toBn(10).pow(toBn(decimals))).toString() as any as number;
}

export function fromSmartContractDecimals(value: string|number, decimals = 18) {
  return +fromDecimals(value, decimals) as number;
}

export function fromDecimals(value: string|number, decimals = 18) {
  return toBn(value).div(toBn(10).pow(toBn(decimals))).toNumber();
}

export function toSmartContractDate(date: number|Date) {
  return parseInt(`${+new Date(date) / 1000}`)
}

export function fromSmartContractDate(date: number) {
  return +new Date(date*1000);
}
