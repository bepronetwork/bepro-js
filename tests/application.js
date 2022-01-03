import { assert, expect } from 'chai';
import { mochaAsync } from './utils';
import { Application } from '../build';

context('Application', async () => {
  let app;

  before(async () => {
    // app = new Application({ test : true, localtest: true });
  });

  it(
    'should start the Application on ganache-cli local blockchain',
    mochaAsync(async () => {
      app = new Application({ test: true, localtest: true });
      expect(app).to.not.equal(null);

      await app.getAddress();
      await app.getETHNetwork();
    }),
  );

  it(
    'should start the Application on RINKEBY TESTNET',
    mochaAsync(async () => {
      app = new Application({ test: true });
      expect(app).to.not.equal(null);

      await app.getAddress();

      const networkName = await app.getETHNetwork();
      expect(networkName).to.equal('Rinkeby');
    }),
  );

  it(
    'no-params constructor should fail to start the Application at all',
    mochaAsync(async () => {
      // this should fail because we are not on TEST net and are NOT connected to MAIN net either
      try {
        app = new Application();
        assert.fail();
      }
      catch (err) {
        assert(
          err.message.indexOf('undefined') >= 0,
          'new Application() should fail with expected error',
        );
      }
    }),
  );

  it(
    'should fail to start the Application on MAINNET from test',
    mochaAsync(async () => {
      app = new Application({
        opt: {
          web3Connection:
            'https://mainnet.infura.io/v3/37ec248f2a244e3ab9c265d0919a6cbc',
        },
      });
      expect(app).to.not.equal(null);

      // this should fail
      const logedIn = await app.login();
      expect(logedIn).to.equal(false);
    }),
  );
});
