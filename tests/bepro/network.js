import { expect, assert } from "chai";
import moment from "moment";
import delay from "delay";
import { mochaAsync } from "../utils";
import { ERC20Contract, Network } from "../../build";
import Numbers from "../../build/utils/Numbers";

let deployed_tokenAddress;
const testConfig = {
  test: true,
  localtest: true, //ganache local blockchain
};

context("Network Contract", async () => {
  let transactionalERC20Contract;
  let settlerERC20Contract;
  let networkContract;
  let userAddress;
  let contractAddress;
  let app;


  before(async () => {
    networkContract = new Network(testConfig);
    userAddress = await networkContract.getUserAddress(); //local test with ganache
    console.log("stakingContract.userAddress: " + userAddress);
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

  ///this function is needed in all contracts working with an ERC20Contract token
  ///NOTE: it deploys a new ERC20Contract token for individual contract functionality testing
  it(
    "should deploy the settler ERC20Contract",
    mochaAsync(async () => {
      // Create Contract
      settlerERC20Contract = new ERC20Contract(testConfig);
      expect(settlerERC20Contract).to.not.equal(null);
      // Deploy
      const res = await settlerERC20Contract.deploy({
        name: "Token Settler",
        symbol: "TKNS",
        cap: Numbers.toSmartContractDecimals(100000000, 18),
        distributionAddress: userAddress, 
      });
      await settlerERC20Contract.__assert();
      deployed_tokenAddress = settlerERC20Contract.getAddress();
      expect(res).to.not.equal(false);
      expect(deployed_tokenAddress).to.equal(res.contractAddress);
      console.log(
        "ERC20Contract.deployed_tokenAddress: " + deployed_tokenAddress
      );
    })
  );


  it(
    "should start the Network Contract",
    mochaAsync(async () => {
      networkContract = new Network(testConfig);
      expect(app).to.not.equal(null);
    })
  );

  it(
    "should deploy Network Contract",
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

  it(
    "should lock the setttler Token",
    mochaAsync(async () => {
      /* Approve tokens lock */
      var res = await networkContract.approveSettlerERC20Token();
      expect(res).to.not.equal(false);
      /* Call the function */
      res = await networkContract.lock({
        tokenAmount : 1000
      });
      expect(res).to.not.equal(false);
      /* Get result */
    })
  );

  it(
    "should open an issue",
    mochaAsync(async () => {
      /* Approve tokens lock */
      var res = await networkContract.approveTransactionalERC20Token();
      expect(res).to.not.equal(false);
      /* Call the function */
      res = await networkContract.openIssue({
        cid : 'sdfgs',
        tokenAmount : 1000
      });
      expect(res).to.not.equal(false);
      /* Get result */
    })
  );


  it(
    "verify if issue is in Draft",
    mochaAsync(async () => {
      /* Approve tokens lock */
      var res = await networkContract.approveTransactionalERC20Token();
      expect(res).to.not.equal(false);
      /* Call the function */
      res = await networkContract.isIssueInDraft({
        issueId : 1
      });
      expect(res).to.equal(true);
      /* Get result */
    })
  );
});
