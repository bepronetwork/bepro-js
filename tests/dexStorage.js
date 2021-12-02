import chai from 'chai';
import { mochaAsync } from './utils';
import { DexStorage } from "../build";

const { expect } = chai;
// var contractAddress = '0x949d274F63127bEd53e21Ed1Dd83dD6ACAfF7f64';
// this is already deployed on rinkeby network for testing

const base_data = "hello";

context('DexStorage', async () => {
  let cid, app, data;

  it(
    'should start the DexStorage Object',
    mochaAsync(async () => {
      app = new DexStorage();
      expect(app).to.not.equal(null);
    }),
  );

  it(
    'should save in IPFS',
    mochaAsync(async () => {
      cid = await app.save({data : base_data});
      expect(cid).to.not.equal(null);
    }),
  );

  it(
    'should retrieve cid',
    mochaAsync(async () => {
      data = await app.get({cid : cid.path});
      expect(data).to.equal(base_data);
    }),
  );

});
