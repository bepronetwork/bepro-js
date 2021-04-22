

import chai from 'chai';
import { mochaAsync } from './utils';
import { Application } from '..';
import Numbers from '../src/utils/Numbers';

const { expect } = chai;
let contractAddress = '0x949d274F63127bEd53e21Ed1Dd83dD6ACAfF7f64';

context('ERC20', async () => {
  let erc20Contract;
  let app;

  before(async () => {
    app = new Application({ test: true, mainnet: false });
  });

  it('should start the Application', mochaAsync(async () => {
    app = new Application({ test: true, mainnet: false });
    expect(app).to.not.equal(null);
  }));


  it('should deploy a ERC20 contract', mochaAsync(async () => {
    /* Create Contract */
    erc20Contract = app.getERC20Contract({});
    /* Deploy */
    const res = await erc20Contract.deploy({
      name: 'test',
      symbol: 'B.E.P.R.O',
      cap: Numbers.toSmartContractDecimals(100000000, 18),
      distributionAddress: app.account.getAddress(),
    });
    await erc20Contract.__assert();
    contractAddress = erc20Contract.getAddress();
    expect(res).to.not.equal(false);
    expect(contractAddress).to.equal(res.contractAddress);
  }));
});
