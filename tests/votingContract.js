import { expect } from 'chai';
import { mochaAsync } from './utils';
import { ERC20Contract, VotingContract } from '../build';
import Numbers from '../build/utils/Numbers';

let deployed_tokenAddress;
const testConfig = {
  test: true,
  localtest: true, // ganache local blockchain
};

context('Voting Contract', async () => {
  let erc20;
  let contract;
  let userAddress;
  let app;

  before(async () => {
    contract = new VotingContract(testConfig);
    userAddress = await contract.getUserAddress(); // local test with ganache
  });

  /// this function is needed in all contracts working with an ERC20Contract token
  /// NOTE: it deploys a new ERC20Contract token for individual contract functionality testing
  it(
    'should deploy the transactional ERC20Contract',
    mochaAsync(async () => {
      // Create Contract
      erc20 = new ERC20Contract(testConfig);
      expect(erc20).to.not.equal(null);
      // Deploy
      const res = await erc20.deploy({
        name: 'Token Transactional',
        symbol: 'TKNT',
        cap: Numbers.toSmartContractDecimals(100000000, 18),
        distributionAddress: userAddress,
      });
      await erc20.__assert();
      deployed_tokenAddress = erc20.getAddress();
      expect(res).to.not.equal(false);
      expect(deployed_tokenAddress).to.equal(res.contractAddress);
    }),
  );

  it(
    'should start the Voting Contract',
    mochaAsync(async () => {
      contract = new VotingContract(testConfig);
      expect(app).to.not.equal(null);
    }),
  );

  it(
    'should deploy Voting Contract',
    mochaAsync(async () => {
      /* Create Contract */
      contract = new VotingContract(testConfig); // ganache local test
      /* Deploy */
      const res = await contract.deploy({
        erc20Contract: erc20.getAddress(),
      });

      expect(res).to.not.equal(false);
    }),
  );
});
