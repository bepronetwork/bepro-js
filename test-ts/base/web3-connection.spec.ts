import 'dotenv/config';
import {expect} from 'chai';
import {Web3Connection} from '@base/web3-connection';
import {Web3ConnectionOptions} from '@interfaces/web3-connection-options';
import {Errors} from '@interfaces/error-enum';

describe(`Web3Connection`, () => {
  it(`start() fails because missing web3host`, () => {
    const web3Connection = new Web3Connection({});
    expect(() => web3Connection.start()).to.throw(Errors.MissingWeb3ProviderHost);
  });

  describe(`start() works`, () => {
    let web3Connection: Web3Connection;
    before(() => {
      const options: Web3ConnectionOptions = {
        web3Host: process.env.WEB3_HOST_PROVIDER,
        privateKey: process.env.WALLET_PRIVATE_KEY,
        skipWindowAssignment: true,
      }

      web3Connection = new Web3Connection(options);
    });

    it(`Starts`, () => {
      expect(() => web3Connection.start()).to.not.throw();
      expect(web3Connection.started).to.be.true;
    });

    it(`Has account Address`, () => {
      expect(web3Connection.Account.address).to.not.be.empty;
    })

    it(`gets balance`, async () => {
      expect(await web3Connection.getBalance()).to.not.be.empty;
    });

    it(`getETHNetworkId matches .env`, async () => {
      expect(await web3Connection.getETHNetworkId()).to.not.eq(+process.env.WEB3_ETH_NETWORK_ID!);
    });
  })
})
