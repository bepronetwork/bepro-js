import chai from "chai";
import moment from "moment";
import delay from "delay";
import { mochaAsync } from "./utils";
import {
  Application,
  ERC20Contract,
  ExchangeContract,
  StakingContract,
  ERC20TokenLock,
  ERC721Collectibles,
  ERC721Standard,
} from "..";
var userPrivateKey =
  "0x7f76de05082c4d578219ca35a905f8debe922f1f00b99315ebf0706afc97f132";

const { expect } = chai;
const ethAmount = 0.1;
var contractAddress = "0x949d274F63127bEd53e21Ed1Dd83dD6ACAfF7f64";
const testConfig = {
  test: true,
  localtest: true, //ganache local blockchain
};

context("Exchange Contract", async () => {
  let exchangeContract;
  let eventId;

  before(async () => {
    exchangeContract = new ExchangeContract(testConfig);
    userAddress = await exchangeContract.getUserAddress(); //local test with ganache
    console.log("exchangeContract.userAddress: " + userAddress);
  });

  it(
    "should start the ExchangeContract",
    mochaAsync(async () => {
      exchangeContract = new ExchangeContract(testConfig);
      expect(exchangeContract).to.not.equal(null);
    })
  );

  it(
    "should deploy Exchange Contract",
    mochaAsync(async () => {
      /* Create Contract */
      exchangeContract = new ExchangeContract({ contractAddress });
      /* Deploy */
      let res = await exchangeContract.deploy({});
      contractAddress = exchangeContract.getAddress();
      expect(res).to.not.equal(false);
    })
  );

  it(
    "should create an Event",
    mochaAsync(async () => {
      /* Create Event */
      let res = await exchangeContract.createEvent({
        resultSpaceIds: [2, 3],
        urlOracle: "asd",
        eventName: "Porto vs Benfica",
        ethAmount,
      });
      expect(res).to.not.equal(false);
      /* Get If Event was created */
      res = await exchangeContract.getEvents();
      expect(res.length).to.equal(1);
      eventId = res[0];
    })
  );

  it(
    "should get event data",
    mochaAsync(async () => {
      /* Get If Event was created */
      const res = await exchangeContract.getEventData({ event_id: eventId });
    })
  );

  it(
    "should get result space data",
    mochaAsync(async () => {
      /* Get If Event was created */
      const res = await exchangeContract.getResultSpaceData({
        event_id: eventId,
        resultSpace_id: 1,
      });
    })
  );

  it(
    "should be able to add liquidity",
    mochaAsync(async () => {
      /* Get If Event was created */
      const res = await exchangeContract.addLiquidity({
        event_id: eventId,
        ethAmount,
      });
    })
  );

  it(
    "should be able to buy fractions",
    mochaAsync(async () => {
      /* Get If Event was created */
      const res = await exchangeContract.buy({
        event_id: eventId,
        fractions_amount: 0.0001,
        resultSpace_id: 1,
      });
    })
  );
});
