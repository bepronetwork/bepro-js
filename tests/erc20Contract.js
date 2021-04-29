

import chai from 'chai';
import { mochaAsync } from './utils';
import { Application } from '..';
import Numbers from '../src/utils/Numbers';
const expect = chai.expect;
//var contractAddress = '0x949d274F63127bEd53e21Ed1Dd83dD6ACAfF7f64';
// this is already deployed on rinkeby network for testing
var contractAddress = '0x4197A48d240B104f2bBbb11C0a43fA789f2A5675';

context('ERC20', async () => {
    var erc20Contract;
    var app;
   
    before( async () =>  {
        app = new Application({test : true, mainnet : false});
    });

    it('should start the Application', mochaAsync(async () => {
        app = new Application({test : true, mainnet : false});
        expect(app).to.not.equal(null);
    }));


    it('should deploy a ERC20 contract', mochaAsync(async () => {
        /* Create Contract */
        erc20Contract = app.getERC20Contract({});
        /* Deploy */
        let res = await erc20Contract.deploy({
            name : 'test', symbol : 'B.E.P.R.O', 
            cap : Numbers.toSmartContractDecimals(100000000, 18), 
            distributionAddress : app.account.getAddress()
        });
        await erc20Contract.__assert();
        contractAddress = erc20Contract.getAddress();
        expect(res).to.not.equal(false);
        expect(contractAddress).to.equal(res.contractAddress);
		console.log('Deployed ERC20Contract address: ' + contractAddress);
    }));
});