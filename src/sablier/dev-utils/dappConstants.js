const BigNumber = require('bignumber.js');

const STANDARD_SALARY = new BigNumber(3600); // .multipliedBy(1e18);
const STANDARD_SCALE_CTOKEN = new BigNumber(1); // 1e8);

module.exports = {
  FIVE_UNITS: new BigNumber(5), // .multipliedBy(1e18),
  FIVE_UNITS_CTOKEN: new BigNumber(5), // .multipliedBy(1e8),
  GAS_LIMIT: 6721975,
  // INITIAL_EXCHANGE_RATE: new BigNumber(2e8), // 26-18 //new BigNumber(2e26),
  INITIAL_SUPPLY: STANDARD_SALARY.multipliedBy(1000),
  ONE_PERCENT_MANTISSA: new BigNumber(1), // new BigNumber(1e16),
  ONE_UNIT: new BigNumber(1), // .multipliedBy(1e18),
  ONE_UNIT_CTOKEN: new BigNumber(1), // .multipliedBy(1e8),
  RPC_URL: 'http://127.0.0.1:8545',
  RPC_PORT: 8545,
  STANDARD_RATE_PER_SECOND: new BigNumber(1), // .multipliedBy(1e18),
  STANDARD_RATE_PER_SECOND_CTOKEN: new BigNumber(1), // .multipliedBy(1e8),
  STANDARD_RECIPIENT_SHARE_PERCENTAGE: new BigNumber(50),
  STANDARD_SABLIER_FEE: new BigNumber(10),
  STANDARD_SALARY,
  STANDARD_SALARY_CTOKEN: new BigNumber(3600), // .multipliedBy(1e8),
  STANDARD_SCALE: new BigNumber(1), // 1e18),
  STANDARD_SCALE_CTOKEN,
  STANDARD_SCALE_INTEREST: STANDARD_SCALE_CTOKEN.multipliedBy(0.1),
  STANDARD_SENDER_SHARE_PERCENTAGE: new BigNumber(50),
  STANDARD_SUPPLY_AMOUNT: STANDARD_SALARY.multipliedBy(0.1),
  STANDARD_TIME_DELTA: new BigNumber(3600),
  STANDARD_TIME_OFFSET: new BigNumber(300),
  ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
  TOKEN_DECIMALS: 18,
};
