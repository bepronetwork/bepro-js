const ERC20Test = artifacts.require('./ERC20Test.sol');
const ERC20TokenLock = artifacts.require('./ERC20TokenLock.sol');

const assert = require('chai').assert;
//const truffleAssert = require('truffle-assertions');
const expect = require('chai').expect;
const moment = require('moment');
//const Numbers = require('../src/utils/Numbers');

const TEST_CONTRACT_NAME = 'ERC20TokenLock'; //require("./common.js");
const TEST_TAG = TEST_CONTRACT_NAME + '-truffle-tests - ';

var name = 'ERC20TokenTest';
var symbol = 'BEPRO';
var cap = 10000000000;
//var cap = toSmartContractDecimals(100000000, 18);
var erc20TokenContract;

var lockTokens;
const lockSeconds = 5; //lock tokens for x amount of seconds
const maxTokenAmount = 7000;
const minTokenAmount = 1000;

function timeToSmartContractTime(time) {
	return moment(time).unix();
}

contract(TEST_CONTRACT_NAME, async (accounts) => {
	let owner = accounts[0];
	let user1 = accounts[1];
	let user2 = accounts[2];
	let app;
	let erc20Test; //erc20 token contract we use for testing
	let erc20Lock; //erc20 token lock contract

	// 'beforeEach' function will run before each test creating a new instance of the contract each time

	before('setup contract for each test', async () => {
		//let ffc = await FiatToken.deployed();

		erc20Test = await ERC20Test.new(name, symbol, cap, { from: owner });
		erc20TokenContract = erc20Test.address;
		erc20Lock = await ERC20TokenLock.new(erc20TokenContract, {
			from: owner,
		});

		console.log('erc20Test.address : ', erc20Test.address);
		console.log('erc20Lock.address : ', erc20Lock.address);

		/* time dev tests
		let now = moment();
		let now_unix = now.unix();
		let smartContractTime = timeToSmartContractTime(now);
		let dt = Date.now(); // equals to moment()
		console.log("now				: " + now);
		console.log("now_unix			: " + now_unix);
		console.log("smartContractTime	: " + smartContractTime);
		console.log("Date.now()			: " + dt);*/
	});

	it(TEST_TAG + 'ERC20TokenLock Contract should have initial variables expected values', async () => {
		let res = await erc20Lock.erc20();
		let ret_tokenAddress = res;
		expect(res).to.equal(erc20TokenContract);
		res = await erc20Lock.maxAmountToLock();
		expect(Number(res).toString()).to.equal(Number(0).toString());
		res = await erc20Lock.minAmountToLock();
		expect(Number(res).toString()).to.equal(Number(0).toString());
		res = await erc20Lock.totalAmountStaked();
		expect(Number(res).toString()).to.equal(Number(0).toString());

		console.log('Init tests: \n* erc20              : ' + ret_tokenAddress +
								'\n* erc20TokenContract : ' + erc20TokenContract);
	});

	it(TEST_TAG + 'should set max tokens to lock per user', async () => {
		// maxTokenAmount = 7000;
		let res = await erc20Lock.setMaxAmountToLock(maxTokenAmount, {
			from: owner,
		});
		expect(res).to.not.equal(false);
		
		//console.log('***setMaxAmountToLock.res.logs[0] >>> ', res.logs[0]);
		// event MaxAmountToLockChanged(address admin, uint256 oldValue, uint256 newValue);
		assert.equal(res.logs.length, 1, 'triggers one event');
		assert.equal(res.logs[0].event, 'MaxAmountToLockChanged', 'should be the "MaxAmountToLockChanged" event');
		assert.equal(res.logs[0].args.admin, owner, 'logs the admin address that performed the operation');
		assert.equal(res.logs[0].args.oldValue, 0, 'logs the old value');
		assert.equal(res.logs[0].args.newValue, maxTokenAmount, 'logs the new value');
		
		// Check if max token amount was set
		res = await erc20Lock.maxAmountToLock();
		expect(Number(res).toString()).to.equal(Number(7000).toString());
	});

	it(TEST_TAG + 'should set min tokens to lock per user', async () => {
		// minTokenAmount = 1000;
		let res = await erc20Lock.setMinAmountToLock(minTokenAmount, {
			from: owner,
		});
		expect(res).to.not.equal(false);
		
		//console.log('***setMinAmountToLock.res.logs[0] >>> ', res.logs[0]);
		// event MinAmountToLockChanged(address admin, uint256 oldValue, uint256 newValue);
		assert.equal(res.logs.length, 1, 'triggers one event');
		assert.equal(res.logs[0].event, 'MinAmountToLockChanged', 'should be the "MinAmountToLockChanged" event');
		assert.equal(res.logs[0].args.admin, owner, 'logs the admin address that performed the operation');
		assert.equal(res.logs[0].args.oldValue, 0, 'logs the old value');
		assert.equal(res.logs[0].args.newValue, minTokenAmount, 'logs the new value');
		
		// Check if min token amount was set
		res = await erc20Lock.minAmountToLock();
		expect(Number(res).toString()).to.equal(Number(1000).toString());
	});

	it(TEST_TAG + 'only Admin should set max tokens to lock per user', async () => {
		//make sure we try to set valid amount different than current value
		let maxTokenAmount2 = 7000 + 1;

		try {
			await erc20Lock.setMaxAmountToLock(maxTokenAmount2, {
				from: user1,
			});
			assert.fail();
		} catch (error) {
			//console.log('error >> ', error);
			assert(error.message.indexOf('revert') >= 0, 'user setMaxAmountToLock should fail');
		}

		// Check if max token amount is still the same
		res = await erc20Lock.maxAmountToLock();
		expect(Number(res).toString()).to.equal(Number(7000).toString());
	});

	it(TEST_TAG + 'only Admin should set min tokens to lock per user', async () => {
		//make sure we try to set valid amount different than current value
		let minTokenAmount2 = 1000 - 1;

		try {
			await erc20Lock.setMinAmountToLock(minTokenAmount2, {
				from: user1,
			});
			assert.fail();
		} catch (error) {
			//console.log('error >> ', error);
			assert(error.message.indexOf('revert') >= 0, 'user setMinAmountToLock should fail');
		}

		// Check if min token amount is still the same
		res = await erc20Lock.minAmountToLock();
		expect(Number(res).toString()).to.equal(Number(1000).toString());
	});

	it(TEST_TAG + 'user should lock tokens', async () => {
		// Approve Tx
		let totalSupply = await erc20Test.totalSupply();
		lockTokens = minTokenAmount; //totalSupply
		let res = await erc20Test.approve(erc20Lock.address, totalSupply, {
			from: owner,
		});
		expect(res).to.not.equal(false);
		// approved tokens should match allowance
		expect((await erc20Test.allowance(owner, erc20Lock.address)).toString()).to.equal(totalSupply.toString());

		let userAddress = owner;

		// lock tokens
		endDate = timeToSmartContractTime(moment().add(lockSeconds, 'seconds'));
		res = await erc20Lock.lock(lockTokens, endDate, { from: userAddress });
		expect(res).to.not.equal(false);
		//console.log('res.logs[0] >>> ', res.logs[0]);
		// event TokensLocked(address user, uint256 amount, uint256 startDate, uint256 endDate);
		assert.equal(res.logs.length, 1, 'triggers one event');
		assert.equal(res.logs[0].event, 'TokensLocked', 'should be the "TokensLocked" event');
		assert.equal(res.logs[0].args.user, userAddress, 'logs the locked tokens owner address');
		//assert.equal(res.logs[0].args.startDate, ..., 'logs the startDate of locked tokens event');
		assert.equal(res.logs[0].args.endDate, endDate, 'logs the endDate of locked tokens event');
		
		// Check if user locked tokens successfully
		res = await erc20Lock.getLockedTokensInfo(userAddress);

		expect(res[0]).to.not.equal(false); //startDate
		expect(res[1] == endDate).to.equal(true); //endDate
		expect(Number(res[2]).toString()).to.equal(Number(lockTokens).toString()); //amount
	});

	it(TEST_TAG + 'should match correct totalAmountStaked', async () => {
		// Create Event
		let res = await erc20Lock.totalAmountStaked();
		expect(Number(res).toString()).to.equal(Number(lockTokens).toString());
	});

	it(TEST_TAG + 'user should fail to release tokens before release date', async () => {
		let userAddress = owner;

		// release and withdraw unlocked tokens
		try {
			await erc20Lock.release({ from: userAddress });
			assert.fail();
		} catch (error) {
			//console.log('error >> ', error);
			assert(error.message.indexOf('revert') >= 0, 'user should fail to release tokens');
		}
	});

	it(TEST_TAG + 'user should release and withdraw unlocked tokens', async () => {
		// wait the time needed until tokens are released
		setTimeout(async () => {
			let userAddress = owner;

			// release and withdraw unlocked tokens
			let res = await erc20Lock.release({ from: userAddress });
			expect(res).to.not.equal(false);
			//console.log('res.logs[0] >>> ', res.logs[0]);
			//event TokensReleased(address user, uint256 amount, uint256 withdrawDate);
			assert.equal(res.logs.length, 1, 'triggers one event');
			assert.equal(res.logs[0].event, 'TokensReleased', 'should be the "TokensReleased" event');
			assert.equal(res.logs[0].args.user, userAddress, 'logs the released tokens owner address');
			assert.equal(res.logs[0].args.amount, lockTokens, 'logs the released tokens amount');
			//assert.equal(res.logs[0].args.withdrawDate, ..., 'logs the withdrawDate of released tokens event');
			
			// Check if user had withdrawn unlocked tokens successfully
			res = await erc20Lock.getLockedTokens(userAddress);

			expect(Number(res).toString()).to.equal(Number(0).toString());

			//'should get totalAmountStaked == 0 (all withdrawn)'
			res = await erc20Lock.totalAmountStaked();
			expect(Number(res).toString()).to.equal(Number(0).toString());
		}, lockSeconds * 1000);
	});

	/*it(TEST_TAG + 'should get totalAmountStaked == 0 (all withdrawn)', async () => {
        // Create Event
        let res = await erc20Lock.totalAmountStaked();
        expect(Number(res).toString()).to.equal(Number(0).toString());
    });*/
});
