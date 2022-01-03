import { expect } from 'chai';
import { mochaAsync } from './utils';
import { DexStorage } from '../build';

const base_data = 'hello';

context('DexStorage', async () => {
  let cid; let app; let
    data;

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
      cid = await app.save({ data: base_data });
      expect(cid).to.not.equal(null);
    }),
  );

  it(
    'should retrieve cid',
    mochaAsync(async () => {
      data = await app.get({ cid: cid.path });
      expect(data).to.equal(base_data);
    }),
  );
});
