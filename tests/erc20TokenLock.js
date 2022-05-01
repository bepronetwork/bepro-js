import { expect, assert } from 'chai';
import moment from 'moment';
import { mochaAsync } from './utils';
import { ERC20Contract, ERC20TokenLock } from '../build';
import Numbers from '../build/utils/Numbers';

let deployed_tokenAddress;
// let deployed_contractAddress = '0xeAE93A3C4d74C469B898C345DEAD456C8Db06194';

// rinkeby test network needs about 15-20 seconds to confirm transactions so pick something greater
const lockSeconds = 30; // lock tokens for x amount of seconds
let endDate = moment().add(lockSeconds, 'seconds');
const maxTokenAmount = 7000;
const minTokenAmount = 1000;
const testConfig = {
  test: true,
  localtest: true, // ganache local blockchain
};

context('ERC20TokenLock Contract', async () => {
  let erc20Contract;
  let erc20Lock;
  let userAddress;

  before(async () => {
    erc20Lock = new ERC20TokenLock(testConfig);
    userAddress = await erc20Lock.getUserAddress(); // local test with ganache
  });

  /// this function is needed in all contracts working with an ERC20Contract token
  /// NOTE: it deploys a new ERC20Contract token for individual contract functionality testing
  it(
    'should deploy a new ERC20Contract',
    mochaAsync(async () => {
      // Create Contract
      erc20Contract = new ERC20Contract(testConfig);
      expect(erc20Contract).to.not.equal(null);
      // Deploy
      const res = await erc20Contract.deploy({
        name: 'test',
        symbol: 'B.E.P.R.O',
        cap: Numbers.toSmartContractDecimals(100000000, 18),
        distributionAddress: userAddress, // await app.getAddress()
      });
      await erc20Contract.__assert();
      deployed_tokenAddress = erc20Contract.getAddress();
      expect(res).to.not.equal(false);
      expect(deployed_tokenAddress).to.equal(res.contractAddress);
    }),
  );

  it(
    'should start the ERC20TokenLock',
    mochaAsync(async () => {
      erc20Lock = new ERC20TokenLock(testConfig);
      expect(erc20Lock).to.not.equal(null);
    }),
  );

  /// =>
  // DEPLOY-ONCE to keep a reference of deployed contracts address for further use in unit tests
  // DEPLOYS new ERC20TokenLock Contract with already deployed ERC20 token contract
  /* it(
    'should deploy ERC20TokenLock Contract',
    mochaAsync(async () => {
      // Create Contract
      erc20Lock = app.getERC20TokenLock({ tokenAddress: deployed_tokenAddress });
      // Deploy
      let res = await erc20Lock.deploy();
      await erc20Lock.__assert();
      contractAddress = erc20Lock.getAddress();
      deployed_contractAddress = erc20Lock.getAddress();
      console.log('Deployed ERC20TokenLock address: ' + deployed_contractAddress);
      assert.equal(deployed_tokenAddress, erc20Lock.getERC20Contract().getAddress(), 'token address should match');
      expect(res).to.not.equal(false);
    })
  ); */
  /// <=

  /// => test already DEPLOYED contracts
  /* it(
    'test deployed ERC20TokenLock contract: testing ERC20Contract',
    mochaAsync(async () => {
      // test already deployed Contract
      erc20Lock = app.getERC20TokenLock({ contractAddress: deployed_contractAddress, tokenAddress: deployed_tokenAddress });
      await erc20Lock.__assert();
      assert.equal(deployed_tokenAddress, erc20Lock.getERC20Contract().getAddress(), 'token address should match');
      let res = await erc20Lock.erc20();
      assert.equal(res, deployed_tokenAddress, 'erc20 token address should match');

      let res2 = await erc20Lock.maxAmountToLock();
      let res3 = await erc20Lock.minAmountToLock();
      let res4 = await erc20Lock.totalAmountStaked();
      let res5 = await erc20Lock.getLockedTokens({address: userAddress});
      console.log('***load.maxAmountToLock : ' + res2);
      console.log('***load.minAmountToLock : ' + res3);
      console.log('***load.totalAmountStaked : ' + res4);
      console.log('***load.userLockedTokens : ' + res5);

      // test ERC20Contract is working and referenced correctly
      let dec = erc20Lock.getERC20Contract().getDecimals();
      console.log('erc20Lock.getERC20TokenDecimals: ' + dec);
      let decAsync = await erc20Lock.getERC20Contract().getDecimalsAsync();
      console.log('erc20Lock.getERC20TokenDecimalsAsync: ' + decAsync);
    })
  ); */
  // /<=

  // /=> release locked tokens
  /* it(
    'should release tokens',
    mochaAsync(async () => {
      // release and withdraw unlocked tokens
      let res = await erc20Lock.release({ address: userAddress });
      //expect(res).to.equal(true);
      let tokens = await erc20Lock.getLockedTokens({ address: userAddress });
      assert(Number(tokens) == 0, "tokens should have been released by now");
    })
  ); */
  /// <=

  it(
    'should deploy ERC20TokenLock Contract',
    mochaAsync(async () => {
      // Create Contract
      const testConfig2 = { ...testConfig, tokenAddress: deployed_tokenAddress };
      erc20Lock = new ERC20TokenLock(testConfig2);
      // Deploy
      const res = await erc20Lock.deploy();
      await erc20Lock.__assert();
      // deployed_contractAddress = erc20Lock.getAddress();
      assert.equal(
        deployed_tokenAddress,
        erc20Lock.getERC20Contract().getAddress(),
        'token address should match',
      );
      expect(res).to.not.equal(false);
    }),
  );

  it(
    'ERC20TokenLock Contract should have initial variables expected values',
    mochaAsync(async () => {
      const res = await erc20Lock.erc20();
      assert.equal(
        res,
        deployed_tokenAddress,
        'Token address should match expected value',
      );
      const res2 = await erc20Lock.maxAmountToLock();
      const res3 = await erc20Lock.minAmountToLock();
      const res4 = await erc20Lock.totalAmountStaked();
      // const res5 = await erc20Lock.getLockedTokens({ address: userAddress });
      // console.log("***init.maxAmountToLock : " + res2);
      // console.log("***init.minAmountToLock : " + res3);
      // console.log("***init.totalAmountStaked : " + res4);
      // console.log("***init.userLockedTokens : " + res5);
      assert(res2 === '0', true, 'maxAmountToLock should be zero');
      expect(Number(res3)).to.equal(0);
      expect(Number(res4)).to.equal(0);

      // console.log(
      //   "Init tests: \n* erc20                 : " +
      //     res +
      //     "\n* deployed_tokenAddress : " +
      //     deployed_tokenAddress
      // );
    }),
  );

  it(
    'should set max tokens to lock per user',
    mochaAsync(async () => {
      // maxTokenAmount = 7000;
      let res = await erc20Lock.setMaxAmountToLock({
        tokenAmount: maxTokenAmount,
      });
      // console.log('set max tokens to lock:\n' + JSON.stringify(res));
      expect(res).to.not.equal(false);
      // Check if max token amount was set
      res = await erc20Lock.maxAmountToLock();
      expect(Numbers.fromExponential(res).toString()).to.equal(
        Number(7000).toString(),
      );
    }),
  );

  it(
    'should set min tokens to lock per user',
    mochaAsync(async () => {
      // minTokenAmount = 1000;
      let res = await erc20Lock.setMinAmountToLock({
        tokenAmount: minTokenAmount,
      });
      // console.log('set min tokens to lock:\n' + JSON.stringify(res));
      expect(res).to.not.equal(false);
      // Check if min token amount was set
      res = await erc20Lock.minAmountToLock();
      expect(Numbers.fromExponential(res).toString()).to.equal(
        Number(1000).toString(),
      );
    }),
  );

  it(
    'should lock user tokens',
    mochaAsync(async () => {
      // Approve Tx
      let res = await erc20Lock.approveERC20Transfer();
      expect(res).to.not.equal(false);
      endDate = moment().add(lockSeconds, 'seconds');
      const smEndDate = Numbers.timeToSmartContractTime(endDate);

      // lock tokens
      res = await erc20Lock.lock({
        address: userAddress,
        amount: minTokenAmount,
        endDate,
      });
      expect(res).to.not.equal(false);

      // Check if user locked tokens successfully
      res = await erc20Lock.getLockedTokensInfo({ address: userAddress });
      const retEndDate = Numbers.timeToSmartContractTime(res.endDate);

      assert(res.startDate != null, 'startDate should be valid');
      assert(retEndDate === smEndDate, 'should match endDate');
      assert(
        Numbers.fromExponential(res.amount).toString() === Numbers.fromExponential(minTokenAmount).toString(),
        'should match locked tokens',
      );
    }),
  );

  it(
    `should get totalAmountStaked == ${minTokenAmount}`,
    mochaAsync(async () => {
      // Create Event
      const res = await erc20Lock.totalAmountStaked();
      expect(Numbers.fromExponential(res).toString()).to.equal(
        Number(minTokenAmount).toString(),
      );
    }),
  );

  it(
    'should fail to release tokens before release date',
    mochaAsync(async () => {
      // release and withdraw unlocked tokens
      try {
        await erc20Lock.release({ address: userAddress });
        assert.fail();
      }
      catch (err) {
        assert(
          err.message.indexOf('tokens release date not reached') >= 0,
          'ERC20TokenLock.release should fail with expected error',
        );
      }
    }),
  );

  it(
    'should release and withdraw unlocked tokens',
    mochaAsync(async () => {
      // wait the time needed until tokens are released
      // TODO: replace setTimeout with 'runAfter' function from utils
      setTimeout(async () => {
        // release and withdraw unlocked tokens
        let res = await erc20Lock.release({ address: userAddress });
        expect(res).to.not.equal(false);

        // Check if user had withdrawn unlocked tokens successfully
        res = await erc20Lock.getLockedTokens({ address: userAddress });

        expect(Numbers.fromExponential(res).toString()).to.equal(
          Number(0).toString(),
        );

        // 'should get totalAmountStaked == 0 (all withdrawn)'
        res = await erc20Lock.totalAmountStaked();
        expect(Numbers.fromExponential(res).toString()).to.equal(
          Number(0).toString(),
        );
      }, lockSeconds * 1000);
    }),
  );

  /// => reset max and min tokens to lock to zero
  it(
    'should set min tokens to lock to zero',
    mochaAsync(async () => {
      let res = await erc20Lock.setMinAmountToLock({
        tokenAmount: 0,
      });
      expect(res).to.not.equal(false);
      // Check if min token amount was set
      res = await erc20Lock.minAmountToLock();
      expect(Numbers.fromExponential(res).toString()).to.equal(
        Number(0).toString(),
      );
    }),
  );

  it(
    'should set max tokens to lock to zero',
    mochaAsync(async () => {
      let res = await erc20Lock.setMaxAmountToLock({
        tokenAmount: 0,
      });
      expect(res).to.not.equal(false);
      // Check if max token amount was set
      res = await erc20Lock.maxAmountToLock();
      expect(Numbers.fromExponential(res).toString()).to.equal(
        Number(0).toString(),
      );
    }),
  );
  /// <=

  /* it('should get totalAmountStaked == 0 (all withdrawn)', mochaAsync(async () => {
        // Create Event
        let res = await erc20Lock.totalAmountStaked();
        expect(Numbers.fromExponential(res).toString()).to.equal(Number(0).toString());
    })); */
});
