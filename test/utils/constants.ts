import Web3 from 'web3';

export function bn(n: number) { return Web3.utils.toBN(n) }
export function pow(n: number, exp: number) { return bn(n).mul(bn(10).pow(bn(exp))) }

export const AMOUNT_1M = 1000000;
export const SALARY = 3600;
export const AMOUNT_1M_18D = pow(AMOUNT_1M, 18).toString();

export const DECIMALS = bn(1e18);
export const STANDARD_SALARY = bn(SALARY).mul(DECIMALS)

export const FIVE_UNITS = bn(5).mul(DECIMALS).toString();
export const FIVE_UNITS_CTOKEN = bn(5).mul(DECIMALS).toString();
export const GAS_LIMIT = 6721975;
export const INITIAL_EXCHANGE_RATE = pow(2, 26).toString();
export const INITIAL_SUPPLY = STANDARD_SALARY.mul(bn(100)).toString();
export const ONE_PERCENT_MANTISSA = pow(1, 16).toString();
export const ONE_UNIT = bn(1).mul(DECIMALS).toString();
export const ONE_UNIT_CTOKEN = bn(1).mul(DECIMALS).toString();
export const STANDARD_RATE_PER_SECOND = bn(1).mul(DECIMALS).toString();
export const STANDARD_RATE_PER_SECOND_CTOKEN = bn(1).mul(DECIMALS).toString();
export const STANDARD_RECIPIENT_SHARE_PERCENTAGE = 50;
export const STANDARD_SABLIER_FEE = 10;
export const STANDARD_SENDER_SHARE_PERCENTAGE = 50;
export const START_TIME_OFFSET = 300;
export const START_TIME_DELTA = 3600;

export const ZERO_ADDRESS = `0x0000000000000000000000000000000000000000`;

export const FEE_3_PERCENT = 3000 // .3% -- uniswap has parts per million
