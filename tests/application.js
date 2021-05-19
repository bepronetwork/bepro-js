import chai, { assert } from "chai";
import { mochaAsync } from "./utils";
import { Application } from "..";
//import Numbers from '../src/utils/Numbers';
const expect = chai.expect;

context("Application", async () => {
  var app;

  before(async () => {
    //app = new Application({ test : true, localtest: true });
  });

  it(
    "should start the Application on ganache-cli local blockchain",
    mochaAsync(async () => {
      let app = new Application({ test: true, localtest: true });
      expect(app).to.not.equal(null);

      let userAddr = await app.getAddress();
      console.log("---app.userAddress: " + userAddr);

      let networkName = await app.getETHNetwork();
      console.log("---app.networkName: " + networkName);
    })
  );

  it(
    "should start the Application on RINKEBY TESTNET",
    mochaAsync(async () => {
      let app = new Application({ test: true });
      expect(app).to.not.equal(null);

      let userAddr = await app.getAddress();
      console.log("---app.userAddress: " + userAddr);

      let networkName = await app.getETHNetwork();
      console.log("---app.networkName: " + networkName);
      expect(networkName).to.equal("Rinkeby");
    })
  );

  it(
    "default no-params constructor should fail to start the Application at all",
    mochaAsync(async () => {
      // this should fail because we are not on TEST net and are NOT connected to MAIN net either
      try {
        let app = new Application();
        assert.fail();
        console.log("---log new Application() this should not be reached");
      } catch (err) {
        assert(
          err.message.indexOf("undefined") >= 0,
          "new Application() should fail with expected error"
        );
        console.log("---log new Application().error: " + err.message);
      }
    })
  );

  it(
    "should fail to start the Application on MAINNET from test",
    mochaAsync(async () => {
      let app = new Application({
        opt: {
          web3Connection:
            "https://mainnet.infura.io/v3/37ec248f2a244e3ab9c265d0919a6cbc",
        },
      });
      expect(app).to.not.equal(null);

      try {
        // this should fail
        app.start();
        assert.fail();
      } catch (err) {
        assert(
          err.message.indexOf(
            "Please Use an Ethereum Enabled Browser like Metamask or Coinbase Wallet"
          ) >= 0,
          "app.start should fail with expected error"
        );
        console.log("---log app.start.error: " + err.message);
      }

      let userAddr = await app.getAddress();
      console.log("---app.userAddress: " + userAddr);
      expect(userAddr).to.equal(undefined);

      let networkName = await app.getETHNetwork();
      console.log("---app.networkName: " + networkName);
      expect(networkName).to.equal("Ethereum Main");
    })
  );
});
