import { assert, expect } from 'chai';
import { mochaAsync } from './utils';
import { ERC20Contract } from '../build';
import Account from '../build/utils/Account';

const ETH_URL_LOCAL_TEST = 'http://localhost:8545';

const { Application } = require('..');

const testConfig = {
  test: true,
  localtest: true, // ganache local blockchain
};

const validateWallet = wallet => {
  assert.notEqual(wallet, undefined, 'undefined wallet');
  assert.notEqual(wallet, null, 'null wallet');
};

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
      }
      catch (err) {
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
      }
      catch (err) {
        assert(
          err.message.indexOf('undefined') >= 0,
          'erc20.getUserAddress should fail with expected error',
        );
      }
    }),
  );

  it('should switch wallet - ganache local test', async () => {
    const erc20test = new ERC20Contract(testConfig);
    expect(erc20test).to.not.equal(null);

    const [ wallet0, wallet1, wallet2, wallet3 ] = await erc20test.getAccounts();

    // assert we have all these wallets and we are NOT on a test net like rinkeby with a single account
    validateWallet(wallet0);
    validateWallet(wallet1);
    validateWallet(wallet2);
    validateWallet(wallet3);
  });

  it('should switch wallet - private key accounts test', async () => {
    const pubk1 = '0xd766942671Dc3f32510a7762E086f1B52a838bF3';
    const pk1 = '0x1dcc1d24e039ee0c5329f2ae9cd0b7a7b6db6c8fba37cb67d84a428710a086af';
    const pubk2 = '0x8c554Ed11fbb480a750e27F0671788A9cA78c975';
    const pk2 = '0x43a594a8d8a442fb3811100abb6ce2dfd65ae33795779a513dc2a969ea4e12c5';

    const erc20test = new ERC20Contract({ test: true, opt: { web3Connection: ETH_URL_LOCAL_TEST, privateKey: pk1 } });
    expect(erc20test).to.not.equal(null);

    // const wallet0 = wallets[0];
    // const wallet1 = wallets[1];
    // const wallet2 = wallets[2];
    // const wallet3 = wallets[3];
    const [ wallet0, wallet1 ] = await erc20test.getAccounts();
    // console.log('wallet1: ', wallet1);
    // assert we have all these wallets and we are NOT on a test net like rinkeby with a single account
    validateWallet(wallet0);
    expect(wallet0).to.equal(pubk1);

    // non existent wallet should be null
    expect(wallet1 === undefined || wallet1 == null).to.equal(true);

    const acc0Read = await erc20test.getUserAddress();
    expect(acc0Read).to.equal(pubk1);

    // create and switch to a new account from private key
    const acc2 = new Account(
      erc20test.web3Connection.getWeb3(),
      erc20test.web3Connection.getWeb3().eth.accounts.privateKeyToAccount(pk2),
    );
    expect(acc2.getAddress()).to.equal(pubk2);
  });
});
