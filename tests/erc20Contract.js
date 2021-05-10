

import chai from 'chai';
import { mochaAsync } from './utils';
//import { Application } from '..';
import { Application, ERC20Contract, ExchangeContract, StakingContract, ERC20TokenLock, ERC721Collectibles, ERC721Standard } from '..';
import Numbers from '../src/utils/Numbers';
const expect = chai.expect;
//var contractAddress = '0x949d274F63127bEd53e21Ed1Dd83dD6ACAfF7f64';
// this is already deployed on rinkeby network for testing
var contractAddress = '0x4197A48d240B104f2bBbb11C0a43fA789f2A5675';
var deployed_tokenAddress = contractAddress;
const testConfig = {
	test: true,
	localtest: true, //ganache local blockchain
	mainnet: false
};

context('ERC20', async () => {
    var erc20Contract;
    var app;
	var userAddress;
   
    before( async () =>  {
		erc20Contract = new ERC20Contract(testConfig);
    });

    it('should start the ERC20Contract', mochaAsync(async () => {
		erc20Contract = new ERC20Contract(testConfig);
		expect(erc20Contract).to.not.equal(null);
    }));


    it('should deploy a new ERC20 contract', mochaAsync(async () => {
		userAddress = await erc20Contract.getUserAddress();
        console.log('---should deploy a ERC20 contract...');
		console.log('---userAddress: ' + userAddress);
		// Create Contract
        // Deploy
        let res = await erc20Contract.deploy({
            name : 'test', symbol : 'B.E.P.R.O', 
            cap : Numbers.toSmartContractDecimals(100000000, 18), 
            ///distributionAddress : app.account.getAddress() //original
			distributionAddress : userAddress //local test with ganache
        });
		await erc20Contract.__assert();
		contractAddress = erc20Contract.getAddress();
        expect(res).to.not.equal(false);
        expect(contractAddress).to.equal(res.contractAddress);
		console.log('Deployed ERC20Contract address: ' + contractAddress);
		deployed_tokenAddress = contractAddress;
    }));
});