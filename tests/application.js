import chai from "chai";
import { mochaAsync } from "./utils";
import { Application } from "..";
//import Numbers from '../src/utils/Numbers';
const expect = chai.expect;

context("Application", async () => {
  var app;
  var userAddress;

  before(async () => {
    //app = new Application({ test : true, localtest: true });
  });

  it(
    "should start the Application",
    mochaAsync(async () => {
      let app = new Application({ test: true, localtest: true });
      expect(app).to.not.equal(null);
      let userAddr = await app.getAddress();
      console.log("---app.userAddress: " + userAddr);

      let networkName = await app.getETHNetwork();
      console.log("---app.networkName: " + networkName);
    })
  );
});
