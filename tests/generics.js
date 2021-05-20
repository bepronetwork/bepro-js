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
context("ERC20", async () => {
  let erc20;

  before(async () => {
    //erc20 = new ERC20Contract(testConfig);
  });

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
        let userAddr = await erc20.getUserAddress();
        console.log("---erc20.userAddress: " + userAddr);

        assert.fail();
        console.log("---log erc20.getUserAddress() this should not be reached");
      } catch (err) {
        console.log("---log erc20.getUserAddress().error: " + err.message);
        assert(
          err.message.indexOf("undefined") >= 0,
          "erc20.getUserAddress() should fail with expected error"
        );
      }
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
