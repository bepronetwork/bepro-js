import { expect, assert } from "chai";
import moment from "moment";
import delay from "delay";
import { mochaAsync } from "../utils";
import { ERC20Contract, OpenerClashOfCards } from "../../build";
import Numbers from "../../build/utils/Numbers";

const testConfig = {test : true, localtest : true, name: "test", symbol: "test"};

context("Opener Clash of Cards Contract", async () => {
  let erc20Contract;
  let xContract;
  let deployed_tokenAddress, contractAddress, deployed_contractAddress;
  let userAddress;

  before(async () => {
    xContract = new OpenerClashOfCards(testConfig);
    userAddress = await xContract.getUserAddress(); // local test with ganache
  });

  it(
    "should deploy a new ERC20Contract",
    mochaAsync(async () => {
      // Create Contract
      erc20Contract = new ERC20Contract(testConfig);
      expect(erc20Contract).to.not.equal(null);
      // Deploy
      let res = await erc20Contract.deploy({
        name: "test",
        symbol: "test",
        cap: Numbers.toSmartContractDecimals(100000000, 18),
        distributionAddress: userAddress, 
      });
      await erc20Contract.__assert();
      deployed_tokenAddress = erc20Contract.getAddress();
      expect(res).to.not.equal(false);
      expect(deployed_tokenAddress).to.equal(res.contractAddress);
    })
  );

  it(
    "should start",
    mochaAsync(async () => {
      xContract = new OpenerClashOfCards(testConfig);
      expect(xContract).to.not.equal(null);
    })
  );
  
  it(
    "should deploy Contract",
    mochaAsync(async () => {
      // Create Contract
      let testConfig2 = { ...testConfig, tokenAddress : deployed_tokenAddress };
      xContract = new OpenerClashOfCards(testConfig2);
      // Deploy
      let res = await xContract.deploy({tokenAddress : deployed_tokenAddress, name : "test", symbol : "test"});
      await xContract.__assert();
      
      expect(res).to.not.equal(false);
    })
  );
  
  
  it(
    "Create Pack",
    mochaAsync(async () => {
      // maxTokenAmount = 7000;
      let res = await xContract.createPack({
        packNumber : 2,
        nftAmount : 1,
        price : 1000,
        serie : "x",
        packType : "x",
        drop : "x",
        saleStart : new Date(),
        saleDistributionAddresses : [deployed_tokenAddress],
        saleDistributionAmounts : [100],
      });
      
      expect(res).to.not.equal(false);
    })
  );

  // more tests need to be created
});