import chai from 'chai';
import { mochaAsync } from './utils';
import { Application } from '..';
import moment from 'moment';
import delay from 'delay';
import Numbers from '../src/utils/Numbers';
var assert = require('assert');
var userPrivateKey = '0x7f76de05082c4d578219ca35a905f8debe922f1f00b99315ebf0706afc97f132';
const tokenAddress = '0x7a7748bd6f9bac76c2f3fcb29723227e3376cbb2';
const expect = chai.expect;
const assert = chai.assert;
const ethAmount = 0.1;
var contractAddress = '0x949d274F63127bEd53e21Ed1Dd83dD6ACAfF7f64';
var totalMaxAmount = 100;
var individualMinimumAmount = 10;

var lockTokens;
const lockSeconds = 5; //lock tokens for x amount of seconds
const maxTokenAmount = 7000;
const minTokenAmount = 1000;

context('ERC20TokenLock Contract', async () => {
	var erc20Lock;
	var app;
	var userAddress;

	before(async () => {
		app = new Application({ test: true, mainnet: false });
		userAddress = app.account.getAddress();
	});

	it(
		'should start the Application',
		mochaAsync(async () => {
			app = new Application({ test: true, mainnet: false });
			expect(app).to.not.equal(null);
		})
	);

	it(
		'should deploy ERC20TokenLock Contract',
		mochaAsync(async () => {
			// Create Contract
			erc20Lock = app.getERC20TokenLock({ tokenAddress: tokenAddress });
			// Deploy
			let res = await erc20Lock.deploy();
			await erc20Lock.__assert();
			contractAddress = erc20Lock.getAddress();
			expect(res).to.not.equal(false);
		})
	);

	it(
		'ERC20TokenLock Contract should have initial variables expected values',
		mochaAsync(async () => {
			let res = await erc20Lock.erc20();
			let ret_tokenAddress = res;
			expect(res).to.equal(tokenAddress);
			res = await erc20Lock.maxAmountToLock();
			expect(res).to.equal(0);
			res = await erc20Lock.minAmountToLock();
			expect(res).to.equal(0);
			res = await erc20Lock.totalAmountStaked();
			expect(res).to.equal(0);

			res = await erc20Lock.erc20();
			console.log(
				'Init tests: \n* erc20 			  : ' +
					res +
					'\n* tokenAddress 	  : ' +
					tokenAddress +
					'\n* ret_tokenAddress : ' +
					ret_tokenAddress
			);
			expect(res).to.equal(tokenAddress);
		})
	);

	it(
		'should set max tokens to lock per user',
		mochaAsync(async () => {
			// maxTokenAmount = 7000;
			let res = await erc20Lock.setMaxAmountToLock({
				tokenAmount: maxTokenAmount,
			});
			expect(res).to.not.equal(false);
			// Check if max token amount was set
			res = await erc20Lock.maxAmountToLock();
			expect(Numbers.fromExponential(res).toString()).to.equal(Number(7000).toString());
		})
	);

	it(
		'should set min tokens to lock per user',
		mochaAsync(async () => {
			// minTokenAmount = 1000;
			let res = await erc20Lock.setMinAmountToLock({
				tokenAmount: minTokenAmount,
			});
			expect(res).to.not.equal(false);
			// Check if min token amount was set
			res = await erc20Lock.minAmountToLock();
			expect(Numbers.fromExponential(res).toString()).to.equal(Number(1000).toString());
		})
	);

	it(
		'should lock user tokens',
		mochaAsync(async () => {
			lockTokens = minTokenAmount;
			// Approve Tx
			let res = await erc20Lock.approveERC20Transfer();
			expect(res).to.not.equal(false);

			// lock tokens
			let res = await erc20Lock.lock({
				address: userAddress,
				amount: minTokenAmount,
				endDate: endDate,
			});
			expect(res).to.not.equal(false);

			// Check if user locked tokens successfully
			res = await erc20Lock.getLockedTokensInfo({ address: userAddress });

			expect(res.startDate).to.not.equal(false);
			expect(res.endDate == endDate).to.equal(true);
			expect(Numbers.fromExponential(res.amount).toString()).to.equal(
				Numbers.fromExponential(minTokenAmount).toString()
			);
		})
	);

	it(
		'should get totalAmountStaked == ' + minTokenAmount,
		mochaAsync(async () => {
			// Create Event
			let res = await erc20Lock.totalAmountStaked();
			expect(Numbers.fromExponential(res).toString()).to.equal(Number(minTokenAmount).toString());
		})
	);

	it(
		'should fail to release tokens before release date',
		mochaAsync(async () => {
			// release and withdraw unlocked tokens
			let res = await erc20Lock.release({ address: userAddress });
			expect(res).to.equal(false);
		})
	);

	it(
		'should release and withdraw unlocked tokens',
		mochaAsync(async () => {
			// wait the time needed until tokens are released
			setTimeout(async () => {
				// release and withdraw unlocked tokens
				let res = await erc20Lock.release({ address: userAddress });
				expect(res).to.not.equal(false);

				// Check if user had withdrawn unlocked tokens successfully
				res = await erc20Lock.getLockedTokens({ address: userAddress });

				expect(Numbers.fromExponential(res).toString()).to.equal(Number(0).toString());

				//'should get totalAmountStaked == 0 (all withdrawn)'
				res = await erc20Lock.totalAmountStaked();
				expect(Numbers.fromExponential(res).toString()).to.equal(Number(0).toString());

				done();
			}, lockSeconds * 1000);
		})
	);

	/*it('should get totalAmountStaked == 0 (all withdrawn)', mochaAsync(async () => {
        // Create Event
        let res = await erc20Lock.totalAmountStaked();
        expect(Numbers.fromExponential(res).toString()).to.equal(Number(0).toString());
    }));*/
});
