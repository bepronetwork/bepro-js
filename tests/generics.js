const { Application } = require('..');
import { assert, expect } from "chai";
import { mochaAsync } from "./utils";
import { ERC20Contract } from "..";
import Numbers from "../src/utils/Numbers";


//var contractAddress = '0x949d274F63127bEd53e21Ed1Dd83dD6ACAfF7f64';
// this is already deployed on rinkeby network for testing
var contractAddress = "0x4197A48d240B104f2bBbb11C0a43fA789f2A5675";
var deployed_tokenAddress = contractAddress;
const testConfig = {
  test: true,
  localtest: true, //ganache local blockchain
};

// NOTE: We only test ERC20contract because all the other models are similar
// We want to test generic behaviour like connect to RINKEBY TESTNET and MAINNET and check expected values
context("Generics", async () => {
  let erc20;

  before(async () => {
    //erc20 = new ERC20Contract(testConfig);
  });

  it(
    "should be able to import directly via require(..)",
    mochaAsync(async () => {
      console.log("app", Application);
      expect(Application).to.not.equal(null);
    })
  );



  it(
    "should start the ERC20Contract on RINKEBY TESTNET",
    mochaAsync(async () => {
      erc20 = new ERC20Contract({ test: true });
      expect(erc20).to.not.equal(null);

      let userAddr = await erc20.getUserAddress();
      console.log("---erc20.userAddress: " + userAddr);

      let networkName = await erc20.getETHNetwork();
      console.log("---erc20.networkName: " + networkName);
      expect(networkName).to.equal("Rinkeby");
    })
  );

  it(
    "no-params constructor should fail to start a new ERC20Contract correctly",
    mochaAsync(async () => {
      // this should fail because we are not on TEST net and are NOT connected to MAIN net either
      erc20 = new ERC20Contract();
      expect(erc20).to.not.equal(null);

      try {
        // load web3 connection
        await erc20.start();

        assert.fail();
        console.log("---log erc20.start() this should not be reached");
      } catch (err) {
        console.log("---log erc20.start().error: " + err.message);
        assert(
          err.message.indexOf(
            "Please Use an Ethereum Enabled Browser like Metamask or Coinbase Wallet"
          ) >= 0,
          "erc20.start() should fail with expected error"
        );
      }

      let userAddr = await erc20.getUserAddress();
      console.log("---erc20.userAddress: " + userAddr);
      expect(userAddr).to.equal(undefined);
    })
  );

  it(
    "should fail to start a new ERC20Contract on MAINNET from test",
    mochaAsync(async () => {
      erc20 = new ERC20Contract({
        opt: {
          web3Connection:
            "https://mainnet.infura.io/v3/37ec248f2a244e3ab9c265d0919a6cbc",
        },
      });
      expect(erc20).to.not.equal(null);

      // should fail to login on MAINNET since we are testing and have no wallet
      let logedIn = await erc20.login();
      expect(logedIn).to.equal(false);

      // should fail to get any data since we have no web3 connection
      try {
        let userAddr = await erc20.getUserAddress();
        console.log("---erc20.userAddress: " + userAddr);

        assert.fail();
      } catch (err) {
        console.log("---log erc20.getUserAddress().error: " + err.message);
        assert(
          err.message.indexOf("undefined") >= 0,
          "erc20.getUserAddress should fail with expected error"
        );
      }
    })
  );
});
