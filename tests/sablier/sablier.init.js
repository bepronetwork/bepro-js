import { expect } from 'chai';
import { Sablier } from '../../build';

// let contractAddress = '0x949d274F63127bEd53e21Ed1Dd83dD6ACAfF7f64';
// this is already deployed on rinkeby network for testing
// var deployed_contractAddress = '0xf7177df4a4797304cf59aa1e2dd4718cb390cbad';
// let deployed_contractAddress = '0xeAE93A3C4d74C469B898C345DEAD456C8Db06194';

// const lockSeconds = 30; // lock tokens for x amount of seconds
// let endDate = moment().add(lockSeconds, "seconds");
const testConfig = {
  test: true,
  localtest: true, // ganache local blockchain
};

context('sablier.init.context', async () => {
  let sablier;

  describe('when initializing', () => {
    it('should start the Sablier contract', async () => {
      sablier = new Sablier(testConfig);
      expect(sablier).to.not.equal(null);
    });

    it('should deploy Sablier Contract', async () => {
      // Create Contract
      // let testConfig2 = { ...testConfig, tokenAddress: deployed_tokenAddress };
      sablier = new Sablier(testConfig);
      // Deploy
      const res = await sablier.deploy();
      await sablier.__assert();
      // deployed_contractAddress = sablier.getAddress();
      // console.log(`Deployed Sablier address: ${deployed_contractAddress}`);
      expect(res).to.not.equal(false);
      // console.log('---sablier.userAddress: ', await sablier.getUserAddress());
    });

    it('Sablier Contract should have expected initial values', async () => {
      // console.log('***init.sablier.bp0');
      const res = await sablier.nextStreamId();
      // const res2 = await sablier.fee().mantissa;
      // console.log("***init.sablier.bp1");
      // console.log('***init.nextStreamId : ', res);
      // console.log("***init.fee [0 to 100] : " + res2);
      expect(Number(res)).to.equal(1); // "nextStreamId should be one by default");
      // expect(Number(res2)).to.equal(0);
    });
  });
});
