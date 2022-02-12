import { expect, assert } from 'chai';
import { mochaAsync } from '../utils';
import { ERC20Contract, Network, NetworkFactory, ETHUtils } from '../../build';
import { ERC20Mock }  from '../../build';
import Numbers from '../../build/utils/Numbers';
import beproAssert from '../../build/utils/beproAssert';

const truffleAssert = require("truffle-assertions");

const traveler = require("ganache-time-traveler");

const BigNumber = require("bignumber.js");
const chai = require("chai");
const chaiBigNumber = require("chai-bignumber");

chai.should();
chai.use(chaiBigNumber(BigNumber));



// global web3 object is needed for ganache-time-traveler to work
global.web3 = undefined; // = web3Conn.web3;

let snapshotId;

let deployed_tokenAddress;
const testConfig = {
  test: true,
  localtest: true, //ganache local blockchain
};

const TOKENS_AMOUNT_1K = 1000;
const TOKENS_AMOUNT_1M = 1000000;



context("NetworkFactory Contract", async () => {
  let transactionalERC20;
  let settlerERC20;
  let beproERC20;
  let networkFactory;
  let networkFactoryAddress;
  let network;
  let networkAddress;
  let network2;
  let networkAddress2;
  let userAddress; //=user1
  let user1, user2, user3, user4;
  let app;


  // load users/addresses/signers from connected wallet via contract
  const loadSigners = async (contract) => { //contract is IContract
    console.log('...loadSigners');
    [user1, user2, user3, user4] = await contract.getSigners();
    userAddress = user1;
  }


  before('NetworkFactory::before_hook', async () => {
    const token = new ERC20Mock(testConfig);
    
    if (testConfig.localtest) {
      /// set global web3 object for ganache time traveler testing
      web3 = token.web3Connection.web3;
      console.log('---networkFactory.before.web3: ', (web3 != null));
      ///
      
      /// take blockchain snapshot
      const snapshot = await traveler.takeSnapshot();
      snapshotId = snapshot.result;
      console.log('+++networkFactory.before.');
      console.log('--- take blockchain snapshot ---');
      ///
    }
    else {
      console.log('--- we only take blockchain snapshot for localtest ---');
    }
  });


  before(async () => {
    networkFactory = new NetworkFactory(testConfig);
    //console.log("NetworkFactory", networkFactory)
    userAddress = await networkFactory.getUserAddress(); //local test with ganache
    console.log("networkFactory.userAddress: " + userAddress);
  });


  ///this function is needed in all contracts working with an ERC20Contract token
  ///NOTE: it deploys a new ERC20Contract token for individual contract functionality testing
  it(
    "should deploy the transactional ERC20Contract",
    mochaAsync(async () => {
      // Create Contract
      transactionalERC20 = new ERC20Contract(testConfig);
      expect(transactionalERC20).to.not.equal(null);
      // Deploy
      const res = await transactionalERC20.deploy({
        name: "Token Transactional",
        symbol: "TKNT",
        cap: Numbers.toSmartContractDecimals(100 * TOKENS_AMOUNT_1M, 18),
        distributionAddress: userAddress, 
      });
      await transactionalERC20.__assert();
      expect(res).to.not.equal(false);
      console.log(
        "TransactionalERC20Contract.deployed_tokenAddress: " + transactionalERC20.getAddress()
      );
    })
  );


  ///this function is needed in all contracts working with an ERC20Contract token
  ///NOTE: it deploys a new ERC20Contract token for individual contract functionality testing
  it(
    "should deploy the settler ERC20Contract",
    mochaAsync(async () => {
      // Create Contract
      settlerERC20 = new ERC20Contract(testConfig);
      expect(settlerERC20).to.not.equal(null);
      // Deploy
      const res = await settlerERC20.deploy({
        name: "Token Settler",
        symbol: "TKNS",
        cap: Numbers.toSmartContractDecimals(100 * TOKENS_AMOUNT_1M, 18),
        distributionAddress: userAddress, 
      });
      await settlerERC20.__assert();
      expect(res).to.not.equal(false);
      console.log(
        "SettlerERC20Contract.deployed_tokenAddress: " + settlerERC20.getAddress()
      );
    })
  );


  it(
    "should deploy the BEPRO ERC20Contract",
    mochaAsync(async () => {
      // Create Contract
      beproERC20 = new ERC20Contract(testConfig);
      expect(beproERC20).to.not.equal(null);
      // Deploy
      const res = await beproERC20.deploy({
        name: "B.E.P.R.O",
        symbol: "BEPRO",
        cap: Numbers.toSmartContractDecimals(100 * TOKENS_AMOUNT_1M, 18),
        distributionAddress: userAddress, 
      });
      await beproERC20.__assert();
      expect(res).to.not.equal(false);
      console.log(
        "BeproERC20Contract.deployed_tokenAddress: " + beproERC20.getAddress()
      );
    })
  );


  it(
    "should start the NetworkFactory Contract",
    mochaAsync(async () => {
      networkFactory = new NetworkFactory(testConfig);
      expect(networkFactory).to.not.equal(null);
    })
  );


  it(
    "should deploy NetworkFactory Contract",
    mochaAsync(async () => {
      /* Create Contract */
      networkFactory = new NetworkFactory(testConfig); //ganache local test
      expect(networkFactory).to.not.equal(null);
      /* Deploy */
      const res = await networkFactory.deploy({
        beproAddress: beproERC20.getAddress()
      });

      networkFactoryAddress = networkFactory.getAddress();
      expect(res).to.not.equal(false);
      expect(networkFactoryAddress).to.equal(res.contractAddress);
      console.log(
        "NetworkFactory.contractAddress: " + networkFactoryAddress
      );

      // get/read more wallets for testing
      await loadSigners(networkFactory);
    })
  );


  it(
    "should have NetworkFactory initial expected values after deployment",
    mochaAsync(async () => {
      const beproAddress = await networkFactory.beproAddress();
      beproAddress.should.be.equal(beproERC20.getAddress());
      
      const operatorAmount = BigNumber(await networkFactory.OPERATOR_AMOUNT());
      const operatorAmountExpected = 1000000;
      operatorAmount.should.be.bignumber.equal(operatorAmountExpected);
      
      const tokensLockedTotal = await networkFactory.tokensLockedTotal();
      tokensLockedTotal.should.be.bignumber.equal(0);

      const networksAmount = await networkFactory.networksAmount();
      networksAmount.should.be.bignumber.equal(0);
    })
  );


  it(
    "should revert when creating Network if operator has LESS THAN required locked bepro tokens",
    mochaAsync(async () => {
      //require(tokensLocked[msg.sender] >= OPERATOR_AMOUNT, "Operator has to lock +1M BEPRO to fork the Network");
      await beproAssert.reverts(
        networkFactory.createNetwork({
          settlerToken: settlerERC20.getAddress(),
          transactionalToken: transactionalERC20.getAddress(),
        }),
        "Operator has to lock +1M BEPRO to fork the Network"
      );
    })
  );


  it(
    "should revert when trying to lock zero tokens",
    mochaAsync(async () => {
      // reverts
      await beproAssert.fails(
        networkFactory.lock({ tokenAmount: 0 }),
        //"Token Amount needs to be higher than 0"
        "Token Amount has to be higher than 0"
      );
    })
  );


  it(
    "should revert when trying to lock tokens without prior approval for transferFrom",
    mochaAsync(async () => {
      await beproAssert.reverts(
        networkFactory.lock({ tokenAmount: TOKENS_AMOUNT_1K })
        //"Needs Allowance"
      );
    })
  );


  it(
    "should lock required bepro tokens as operator to create Network",
    mochaAsync(async () => {
      const userBalance1 = await beproERC20.balanceOf(userAddress);
      const networkFactoryBalance1 = await beproERC20.balanceOf(networkFactoryAddress);

      await beproERC20.approve({ address: networkFactoryAddress, amount: TOKENS_AMOUNT_1M });
      await networkFactory.lock({ tokenAmount: TOKENS_AMOUNT_1M });

      const userBalance2 = await beproERC20.balanceOf(userAddress);
      const networkFactoryBalance2 = await beproERC20.balanceOf(networkFactoryAddress);

      //checks
      const tokensExpected = TOKENS_AMOUNT_1M;
      const tokensLocked = await networkFactory.getTokensLocked(userAddress);
      tokensLocked.should.be.bignumber.equal(tokensExpected);
      const tokensLockedTotal = await networkFactory.tokensLockedTotal();
      tokensLockedTotal.should.be.bignumber.equal(tokensExpected);

      userBalance2.should.be.bignumber.equal(userBalance1.minus(TOKENS_AMOUNT_1M));
      networkFactoryBalance2.should.be.bignumber.equal(networkFactoryBalance1.plus(TOKENS_AMOUNT_1M));
    })
  );


  it(
    "should create Network",
    mochaAsync(async () => {
      const tx = await networkFactory.createNetwork({
        settlerToken: settlerERC20.getAddress(),
        transactionalToken: transactionalERC20.getAddress(),
      });

      //checks
      const networksAmount = await networkFactory.networksAmount();
      networksAmount.should.be.bignumber.equal(1);

      const networkAddress1 = await networkFactory.getNetworkById(0);
      const networkAddress2 = await networkFactory.getNetworkByAddress(userAddress);
      networkAddress1.should.be.equal(networkAddress2);

      // should emit event CreatedNetwork(uint256 indexed id, address indexed opener);
      const networkId = BigNumber(tx.events.CreatedNetwork.returnValues.id);
      const opener = tx.events.CreatedNetwork.returnValues.opener;
      networkId.should.be.bignumber.equal(0);
      opener.should.be.equal(userAddress);
    })
  );


  it(
    "should revert when creating a 2nd Network by the same operator",
    mochaAsync(async () => {
      //require(networksByAddress[msg.sender] == address(0), "Only one Network per user at a time");
      
      await beproAssert.reverts(
        networkFactory.createNetwork({
          settlerToken: settlerERC20.getAddress(),
          transactionalToken: transactionalERC20.getAddress(),
        }),
        "Only one Network per user at a time"
      );
    })
  );


  it(
    "should create 2nd Network by user2",
    mochaAsync(async () => {
      
      //send user2 required tokens to create Network
      await beproERC20.transferTokenAmount({ toAddress: user2, tokenAmount: TOKENS_AMOUNT_1M });
      
      beproERC20.switchWallet(user2);
      await beproERC20.approve({ address: networkFactoryAddress, amount: TOKENS_AMOUNT_1M });
      networkFactory.switchWallet(user2);
      await networkFactory.lock({ tokenAmount: TOKENS_AMOUNT_1M });

      const tx = await networkFactory.createNetwork({
        settlerToken: settlerERC20.getAddress(),
        transactionalToken: transactionalERC20.getAddress(),
      });

      //checks
      const networksAmount = await networkFactory.networksAmount();
      networksAmount.should.be.bignumber.equal(2);

      const networkAddress1 = await networkFactory.getNetworkById(0);
      const networkAddress2 = await networkFactory.getNetworkByAddress(userAddress);
      networkAddress1.should.be.equal(networkAddress2);

      const networkAddress3 = await networkFactory.getNetworkById(1);
      const networkAddress4 = await networkFactory.getNetworkByAddress(user2);
      networkAddress3.should.be.equal(networkAddress4);

      networkAddress1.should.not.be.equal(networkAddress3);

      //check tokensLockedTotal
      const tokensLockedTotal = await networkFactory.tokensLockedTotal();
      const tokensLockedTotalExpected = 2 * Number(TOKENS_AMOUNT_1M);
      tokensLockedTotal.should.be.bignumber.equal(tokensLockedTotalExpected);

      beproERC20.switchWallet(userAddress);
      networkFactory.switchWallet(userAddress);
    })
  );


  it(
    "should revert when trying to unlock zero tokens",
    mochaAsync(async () => {
      
      //user3 has no bepro tokens locked, can not unlock any
      networkFactory.switchWallet(user3);
      
      await beproAssert.reverts(
        networkFactory.unlock(),
        "Needs to have tokens locked"
      );
    })
  );


  it(
    "should identify deployed Network Contracts via NetworkFactory",
    mochaAsync(async () => {
      /* Create Contract */
      networkAddress = await networkFactory.getNetworkById(0);
      networkAddress2 = await networkFactory.getNetworkById(1);
      
      network = new Network({
        ...testConfig, //ganache local test
        contractAddress: networkAddress
      });
      await network.__assert();
      
      network2 = new Network({
        ...testConfig, //ganache local test
        contractAddress: networkAddress2
      });
      await network2.__assert();
      
      const networkAddressNew = network.getAddress();
      networkAddressNew.should.be.equal(networkAddress);
      
      const networkAddressNew2 = network2.getAddress();
      networkAddressNew2.should.be.equal(networkAddress2);
    })
  );


  it(
    "should lock settler tokens on Network 1",
    mochaAsync(async () => {

      settlerERC20.switchWallet(user1);
      await settlerERC20.approve({ address: networkAddress, amount: TOKENS_AMOUNT_1M });

      network.switchWallet(user1);
      await network.lock({ tokenAmount: TOKENS_AMOUNT_1M });
    })
  );

  
  it(
    "should revert when trying to unlock bepro tokens if Network has some settler tokens",
    mochaAsync(async () => {
      //require(Network(networksByAddress[msg.sender]).oraclesStaked() == 0, "Network has to have 0 Settler Tokens");
      
      networkFactory.switchWallet(user1);
      await beproAssert.reverts(
        networkFactory.unlock(),
        "Network has to have 0 Settler Tokens"
      );
    })
  );


  it(
    "should unlock settler tokens from Network 1",
    mochaAsync(async () => {

      const oraclesStaked1 = await network.oraclesStaked();
      const settlerBalance1 = await settlerERC20.balanceOf(user1);

      network.switchWallet(user1);
      await network.unlock({ tokenAmount: TOKENS_AMOUNT_1M, from: user1 });

      //checks
      const oraclesStaked2 = await network.oraclesStaked();
      const settlerBalance2 = await settlerERC20.balanceOf(user1);

      oraclesStaked2.should.be.bignumber.equal(oraclesStaked1.minus(TOKENS_AMOUNT_1M));
      settlerBalance2.should.be.bignumber.equal(settlerBalance1.plus(TOKENS_AMOUNT_1M));
    })
  );


  it(
    "should open an issue on Network 1 to lock transactional tokens",
    mochaAsync(async () => {

      network.switchWallet(user1);
      // approve tokens
      let tx = await network.approveTransactionalERC20Token();
      // open issue
      tx = await network.openIssue({
        cid : 'openissue1',
        tokenAmount : TOKENS_AMOUNT_1K
      });
    })
  );


  it(
    "should revert when trying to unlock bepro tokens if Network has some transactional tokens",
    mochaAsync(async () => {
      //require(Network(networksByAddress[msg.sender]).totalStaked() == 0, "Network has to have 0 Transactional Tokens");

      networkFactory.switchWallet(user1);
      await beproAssert.reverts(
        networkFactory.unlock(),
        "Network has to have 0 Transactional Tokens"
      );
    })
  );


  it(
    "should unlock all bepro tokens from Network 2, user2 exits Network 2 he created",
    mochaAsync(async () => {
      
      const tokensLockedTotal1 = await networkFactory.tokensLockedTotal();
      const beproBalance1 = await beproERC20.balanceOf(user2);

      networkFactory.switchWallet(user2);
      await networkFactory.unlock();

      //checks
      const tokensLockedTotal2 = await networkFactory.tokensLockedTotal();
      tokensLockedTotal2.should.be.bignumber.equal(tokensLockedTotal1.minus(TOKENS_AMOUNT_1M));

      const tokensLocked = await networkFactory.getTokensLocked(user2);
      tokensLocked.should.be.bignumber.equal(0);
      
      const networksByAddress = await networkFactory.getNetworkByAddress(user2);
      networksByAddress.should.be.bignumber.equal(0);

      const beproBalance2 = await beproERC20.balanceOf(user2);
      beproBalance2.should.be.bignumber.equal(beproBalance1.plus(TOKENS_AMOUNT_1M));
    })
  );


  it(
    "user2 should be able to create another Network as he closed the previous one",
    mochaAsync(async () => {
      
      // approve and lock bepro tokens
      beproERC20.switchWallet(user2);
      await beproERC20.approve({ address: networkFactoryAddress, amount: TOKENS_AMOUNT_1M });

      networkFactory.switchWallet(user2);
      await networkFactory.lock({ tokenAmount: TOKENS_AMOUNT_1M });

      // create another Network
      const tx = await networkFactory.createNetwork({
        settlerToken: settlerERC20.getAddress(),
        transactionalToken: transactionalERC20.getAddress(),
      });
      
      //checks
      const networksAmount = await networkFactory.networksAmount();
      networksAmount.should.be.bignumber.equal(3);

      const networkAddress1 = await networkFactory.getNetworkById(2);
      const networkAddress2 = await networkFactory.getNetworkByAddress(user2);
      networkAddress1.should.be.equal(networkAddress2);

      // should emit event CreatedNetwork(uint256 indexed id, address indexed opener);
      const networkId = BigNumber(tx.events.CreatedNetwork.returnValues.id);
      const opener = tx.events.CreatedNetwork.returnValues.opener;
      networkId.should.be.bignumber.equal(2);
      opener.should.be.equal(user2);
    })
  );



  after('NetworkFactory::after_hook', async () => {
    if (testConfig.localtest) {
      await traveler.revertToSnapshot(snapshotId);
      console.log('+++networkFactory.after.');
      console.log('--- revert blockchain to initial snapshot ---');
    }
    else {
      console.log('--- we only revert blockchain to initial snapshot for localtest ---');
    }
  });
});
