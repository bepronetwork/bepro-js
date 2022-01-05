import Web3 from 'web3';

export function bn(n: number) { return Web3.utils.toBN(n) }

export const AMOUNT_1M = 1000000;

export const DECIMALS = bn(1e18);
export const STANDARD_SALARY = bn(3600).mul(DECIMALS)

export const FIVE_UNITS = bn(5).mul(DECIMALS).toString();
export const FIVE_UNITS_CTOKEN = bn(5).mul(DECIMALS).toString();
export const GAS_LIMIT = 6721975;
export const INITIAL_EXCHANGE_RATE = bn(2e26).toString();
export const INITIAL_SUPPLY = STANDARD_SALARY.mul(bn(100)).toString();
export const ONE_PERCENT_MANTISSA = bn(1e16).toString();
export const ONE_UNIT = bn(1).mul(DECIMALS).toString();
export const ONE_UNIT_CTOKEN = bn(1).mul(DECIMALS).toString();
export const STANDARD_RATE_PER_SECOND = bn(1).mul(DECIMALS).toString();
export const STANDARD_RATE_PER_SECOND_CTOKEN = bn(1).mul(DECIMALS).toString();
export const STANDARD_RECIPIENT_SHARE_PERCENTAGE = bn(50).toString();
export const STANDARD_SABLIER_FEE = bn(10).toString();
export const STANDARD_SALARY_CTOKEN = STANDARD_SALARY.toString();
export const STANDARD_SCALE = DECIMALS.toString();
export const STANDARD_SCALE_CTOKEN = DECIMALS.toString();
export const STANDARD_SCALE_INTEREST = STANDARD_SALARY.mul(bn(0.1*+DECIMALS.toString())).toString();
export const STANDARD_SENDER_SHARE_PERCENTAGE = bn(50).toString();
export const STANDARD_SUPPLY_AMOUNT = STANDARD_SALARY.mul(bn(0.1*+DECIMALS.toString())).toString();
export const STANDARD_TIME_DELTA = bn(3600).toString();
export const STANDARD_TIME_OFFSET = bn(300).toString();
export const ZERO_ADDRESS = `0x0000000000000000000000000000000000000000`;
