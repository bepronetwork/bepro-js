import { assert, expect } from 'chai';
import { mochaAsync } from './utils';
import { ERC20Contract } from '../build';

const { Application } = require('..');

// NOTE: We only test ERC20contract because all the other models are similar
// We want to test generic behaviour like connect to RINKEBY TESTNET and MAINNET and check expected values
context('Generics', async () => {
  let erc20;

  it(
    'should be able to import directly via require(..)',
    mochaAsync(async () => {
      expect(Application).to.not.equal(null);
    }),
  );

  it(
    'should start the ERC20Contract on RINKEBY TESTNET',
    mochaAsync(async () => {
      erc20 = new ERC20Contract({ test: true });
      expect(erc20).to.not.equal(null);

      const networkName = await erc20.getETHNetwork();
      expect(networkName).to.equal('Rinkeby');
    }),
  );

  it(
    'no-params constructor should fail to start a new ERC20Contract correctly',
    mochaAsync(async () => {
      // this should fail because we are not on TEST net and are NOT connected to MAIN net either
      erc20 = new ERC20Contract();
      expect(erc20).to.not.equal(null);

      try {
        // load web3 connection
        await erc20.start();

        assert.fail();
      } catch (err) {
        assert(
          err.message.indexOf(
            'Please Use an Ethereum Enabled Browser like Metamask or Coinbase Wallet',
          ) >= 0,
          'erc20.start() should fail with expected error',
        );
      }

      const userAddr = await erc20.getUserAddress();
      expect(userAddr).to.equal(undefined);
    }),
  );

  it(
    'should fail to start a new ERC20Contract on MAINNET from test',
    mochaAsync(async () => {
      erc20 = new ERC20Contract({
        opt: {
          web3Connection:
            'https://mainnet.infura.io/v3/37ec248f2a244e3ab9c265d0919a6cbc',
        },
      });
      expect(erc20).to.not.equal(null);

      // should fail to login on MAINNET since we are testing and have no wallet
      const logedIn = await erc20.login();
      expect(logedIn).to.equal(false);

      // should fail to get any data since we have no web3 connection
      try {
        await erc20.getUserAddress();
        assert.fail();
      } catch (err) {
        assert(
          err.message.indexOf('undefined') >= 0,
          'erc20.getUserAddress should fail with expected error',
        );
      }
    }),
  );
});
