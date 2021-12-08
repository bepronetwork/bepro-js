import { expect } from 'chai';
import { mochaAsync } from './utils';
import { ERC20Contract } from '../build';
import Numbers from '../build/utils/Numbers';

const testConfig = {
  test: true,
  localtest: true, // ganache local blockchain
};

context('ERC20', async () => {
  let erc20Contract;
  let userAddress;

  before(async () => {
    erc20Contract = new ERC20Contract(testConfig);
  });

  it(
    'should start the ERC20Contract (on ganache-cli local blockchain)',
    mochaAsync(async () => {
      erc20Contract = new ERC20Contract(testConfig);
      expect(erc20Contract).to.not.equal(null);
    }),
  );

  it(
    'should deploy a new ERC20Contract (on ganache-cli local blockchain)',
    mochaAsync(async () => {
      userAddress = await erc20Contract.getUserAddress();
      // Deploy
      const res = await erc20Contract.deploy({
        name: 'test',
        symbol: 'B.E.P.R.O',
        cap: Numbers.toSmartContractDecimals(100000000, 18),
        distributionAddress: userAddress, // local test with ganache
      });
      await erc20Contract.__assert();
      const contractAddress = erc20Contract.getAddress();
      expect(res).to.not.equal(false);
      expect(contractAddress).to.equal(res.contractAddress);
    }),
  );
});
