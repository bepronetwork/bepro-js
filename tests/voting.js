import { expect, assert } from "chai";
import moment from "moment";
import delay from "delay";
import { mochaAsync } from "../utils";
import { ERC20Contract, Voting } from "../../index";
import Numbers from "../../src/utils/Numbers";

let deployed_tokenAddress;
const testConfig = {
  test: true,
  localtest: true, //ganache local blockchain
};

context("Voting Contract", async () => {
  let votingERC20Contract;
  let contract;
  let userAddress;
  let app;


  before(async () => {
    contract = new Network(testConfig);
    userAddress = await contract.getUserAddress(); //local test with ganache
  });

  ///this function is needed in all contracts working with an ERC20Contract token
  ///NOTE: it deploys a new ERC20Contract token for individual contract functionality testing
  it(
    "should deploy the transactional ERC20Contract",
    mochaAsync(async () => {
      // Create Contract
      transactionalERC20Contract = new ERC20Contract(testConfig);
      expect(transactionalERC20Contract).to.not.equal(null);
      // Deploy
      const res = await transactionalERC20Contract.deploy({
        name: "Token Transactional",
        symbol: "TKNT",
        cap: Numbers.toSmartContractDecimals(100000000, 18),
        distributionAddress: userAddress, 
      });
      await transactionalERC20Contract.__assert();
      deployed_tokenAddress = transactionalERC20Contract.getAddress();
      expect(res).to.not.equal(false);
      expect(deployed_tokenAddress).to.equal(res.contractAddress);
      console.log(
        "ERC20Contract.deployed_tokenAddress: " + deployed_tokenAddress
      );
    })
  );

  it(
    "should start the Voting Contract",
    mochaAsync(async () => {
      networkContract = new Network(testConfig);
      expect(app).to.not.equal(null);
    })
  );

  it(
    "should deploy Voting Contract",
    mochaAsync(async () => {
      /* Create Contract */
      networkContract = new Network(testConfig); //ganache local test
      /* Deploy */
      const res = await networkContract.deploy({
        settlerTokenAddress : settlerERC20Contract.getAddress(), 
        transactionTokenAddress : transactionalERC20Contract.getAddress(), 
        governanceAddress : await networkContract.getUserAddress()
      });

      contractAddress = networkContract.getAddress();
      expect(res).to.not.equal(false);
    })
  );

});
