//const project_root = process.cwd();
//const { dappConstants, devConstants } = require("../../src/sablier/dev-utils");

//import { expect, assert } from "chai";
//import moment from "moment";
//import delay from "delay";
//import { mochaAsync, mochaContextAsync } from "../utils";
//import { ERC20Contract, Sablier, ETHUtils } from "../../build";
//import CERC20Mock from '../../build/models/mocks/CERC20Mock';
//import ERC20Mock  from '../../build/models/mocks/ERC20Mock';
//import Numbers from "../../build/utils/Numbers";

//import beproAssert from '../../build/utils/beproAssert';
//import { MaxUint128, MaxUint256 } from '../shared/utilities';

//const truffleAssert = require("truffle-assertions");

//const traveler = require("ganache-time-traveler");

//const { chaiPlugin } = require("../../src/sablier/dev-utils");

//const BigNumber = require("bignumber.js");
//const chai = require("chai");
//const chaiBigNumber = require("chai-bignumber");

//chai.should();
//chai.use(chaiBigNumber(BigNumber));
//chai.use(chaiPlugin);

//const { INITIAL_EXCHANGE_RATE, STANDARD_SALARY } = dappConstants;
//const { STANDARD_SABLIER_FEE } = dappConstants;

const sablierUtils = require("./sablier.utils");



context("Sablier contract", async () => {
	
	before('Sablier.before.hook', async () => {
    console.log('---sablier.before.hook. start');
		await sablierUtils.runBefore();
		console.log('---sablier.before.hook. end');
  });

	before('Sablier.initConfig.hook', async () => {
		// load wallets and required global variables
		console.log('---sablier.initConfig.hook. start');
		await sablierUtils.initConfig();
		console.log('---sablier.initConfig.hook. end');
	});

	beforeEach("Sablier.beforeEach.hook", async () => {
    //console.log('---sablier.beforeEach.hook. start');
    await sablierUtils.runBeforeEach();
    //console.log('---sablier.beforeEach.hook. end');
  });



	require("./sablier.init");
	require("./sablier.behavior");
	


	after('Sablier.after.hook', async () => {
		await sablierUtils.runAfter();
  });

});
