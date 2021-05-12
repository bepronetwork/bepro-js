import chai from 'chai';
import { mochaAsync } from './utils';
import { Application } from '..';
import Numbers from '../src/utils/Numbers';

const { expect } = chai;
// var contractAddress = '0x949d274F63127bEd53e21Ed1Dd83dD6ACAfF7f64';
// this is already deployed on rinkeby network for testing
export var contractAddress = '0x4197A48d240B104f2bBbb11C0a43fA789f2A5675';
export var deployed_tokenAddress = contractAddress;

context('ERC20', async () => {
  let erc20Contract;
  let app;
  let userAddress;

  before(async () => {
    app = new Application({ test: true, localtest: true, mainnet: false });
  });

  it(
    'should start the Application',
    mochaAsync(async () => {
      app = new Application({ test: true, localtest: true, mainnet: false });
      expect(app).to.not.equal(null);
    }),
  );

  it(
    'should deploy a ERC20 contract',
    mochaAsync(async () => {
      userAddress = await app.getAddress();
      console.log('---should deploy a ERC20 contract...');
      console.log(`---userAddress: ${userAddress}`);
      /* Create Contract */
      erc20Contract = app.getERC20Contract({});
      console.log('---erc20Contract bp0');
      /* Deploy */
      const res = await erc20Contract.deploy({
        name: 'test',
        symbol: 'B.E.P.R.O',
        cap: Numbers.toSmartContractDecimals(100000000, 18),
        // /distributionAddress : app.account.getAddress() //original
        distributionAddress: userAddress, // local test with ganache
      });
      console.log('---erc20Contract bp1');
      await erc20Contract.__assert();
      console.log('---erc20Contract bp2');
      contractAddress = erc20Contract.getAddress();
      expect(res).to.not.equal(false);
      expect(contractAddress).to.equal(res.contractAddress);
      console.log(`Deployed ERC20Contract address: ${contractAddress}`);
      deployed_tokenAddress = contractAddress;
    }),
  );
});
