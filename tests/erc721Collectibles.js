

import chai from 'chai';
import { mochaAsync } from './utils';
import { Application, ERC20Contract, ExchangeContract, StakingContract, ERC20TokenLock, ERC721Collectibles, ERC721Standard } from '..';
import moment from 'moment';
import delay from 'delay';
import Numbers from '../src/utils/Numbers';

var userPrivateKey = '0x7f76de05082c4d578219ca35a905f8debe922f1f00b99315ebf0706afc97f132';
const tokenAddress = "0xd3f461fef313a992fc25e681acc09c6191b08bca";
const mainnet = false;

const expect = chai.expect;
const ethAmount = 0.1;
var contractAddress = '0x949d274F63127bEd53e21Ed1Dd83dD6ACAfF7f64';
var totalMaxAmount = 100;
var individualMinimumAmount = 10;
var APR = 5;
var startDate = moment().add(1, 'minutes');
var endDate = moment().add(10, 'minutes');
var timeDiff = Numbers.timeToSmartContractTime(endDate) - Numbers.timeToSmartContractTime(startDate);
var deployed_tokenAddress;
const testConfig = {
	test: true,
	localtest: true, //ganache local blockchain
	mainnet: false
};

context('ERC721 Collectibles', async () => {
    var erc721Contract, erc20Contract;
    var tokensHeld, subscriptionId, withdrawTx, startDateSubscription, endDateSubscription;
	var userAddress;
	
    before( async () =>  {
        erc721Contract = new ERC721Collectibles(testConfig);
		userAddress = await erc721Contract.getUserAddress(); //local test with ganache
		console.log('erc721Contract.userAddress: ' + userAddress);
    });
	
	///this function is needed in all contracts working with an ERC20Contract token
	///NOTE: it deploys a new ERC20Contract token for individual contract functionality testing
	it(
		'should deploy a new ERC20Contract',
		mochaAsync(async () => {
			// Create Contract
			erc20Contract = new ERC20Contract(testConfig);
			expect(erc20Contract).to.not.equal(null);
			// Deploy
			let res = await await erc20Contract.deploy({
				name : 'test', symbol : 'B.E.P.R.O', 
				cap : Numbers.toSmartContractDecimals(100000000, 18), 
				distributionAddress : userAddress //await app.getAddress()
			});
			await erc20Contract.__assert();
			deployed_tokenAddress = erc20Contract.getAddress();
			expect(res).to.not.equal(false);
			expect(deployed_tokenAddress).to.equal(res.contractAddress);
			console.log('ERC20Contract.deployed_tokenAddress: ' + deployed_tokenAddress);
		})
	);
	
    it('should start the ERC721Collectibles', mochaAsync(async () => {
        erc721Contract = new ERC721Collectibles(testConfig);
        expect(erc721Contract).to.not.equal(null);
    }));

    it('should deploy Contract', mochaAsync(async () => {
		// Deploy
        let res = await erc721Contract.deploy({
            name : 'Art | BEPRO', symbol : 'B.E.P.R.O', 
            limitedAmount : 100, 
            erc20Purchase : deployed_tokenAddress, //tokenAddress,
            //feeAddress : app.account.getAddress()
			feeAddress : userAddress //local test with ganache
        });
        await erc721Contract.__assert();
        contractAddress = erc721Contract.getAddress();
        expect(res).to.not.equal(false);
    }));

    it('should verify if sale is limited', mochaAsync(async () => {
        let res = await erc721Contract.isLimited();
        expect(res).to.equal(true);
    }));


    it('should add base tokenURI', mochaAsync(async () => {
        let res = await erc721Contract.setBaseTokenURI({URI : 'https://bepronetwork.github.io/B.E.P.R.O/meta/'});
        expect(res).to.not.equal(false);
    }));

    it('should set Pack Price', mochaAsync(async () => {
        /* Set Price for Pack */
        let res = await erc721Contract.setPricePerPack({
           newPrice : 1000
        });
        expect(res).to.not.equal(false);
        res = await erc721Contract.getPricePerPack();
        expect(res).to.equal(Number(1000).toString());
    }));

    it('should open a pack', mochaAsync(async () => {
        /* Approve */
        await erc721Contract.approveERC20();

        /* Set Price for Pack */
        let res = await erc721Contract.openPack({
           amount : 1
        });
        expect(res).to.not.equal(false);
    }));

    it('should verify the opened packs', mochaAsync(async () => {
        let res = await erc721Contract.openedPacks();
        expect(res).to.equal(1);
    }));

    it('should verify the current Token id', mochaAsync(async () => {
        let res = await erc721Contract.currentTokenId();
        expect(res).to.equal(1001);
    }));

    it('should get the available token ids', mochaAsync(async () => {
        tokensHeld = await erc721Contract.getRegisteredIDs({address : userAddress});
        expect(tokensHeld.length).to.equal(1);
        expect(tokensHeld[0]).to.equal(1000);
    }));

    it('should verify the available token id is not minted already', mochaAsync(async () => {
        let res = await erc721Contract.isIDRegistered({address : userAddress, tokenID : tokensHeld[0]});
        expect(res).to.equal(true);
        res = await erc721Contract.exists({tokenID : tokensHeld[0]});
        expect(res).to.equal(false);
    }));

    it('should mint the token id', mochaAsync(async () => {
        let res = await erc721Contract.mint({
            tokenID : tokensHeld[0]
        });
        expect(res).to.not.equal(false);
        
    }));

    it('should verify the available token id is already', mochaAsync(async () => {
        let res = await erc721Contract.isIDRegistered({address : userAddress, tokenID : tokensHeld[0]});
        expect(res).to.equal(true);
        res = await erc721Contract.exists({tokenID : tokensHeld[0]});
        expect(res).to.equal(true);
    }));

    it('should open a pack', mochaAsync(async () => {
        /* Approve */
        await erc721Contract.approveERC20();
        let isApproved = await erc721Contract.isApproved({ address : userAddress,amount : 1000});
        expect(isApproved).to.equal(true);

        /* Set Price for Pack */
        let res = await erc721Contract.openPack({
           amount : 1
        });
        expect(res).to.not.equal(false);
    }));

    it('should verify the opened packs', mochaAsync(async () => {
        let res = await erc721Contract.openedPacks();
        expect(res).to.equal(2);
    }));


    it('should verify the current Token id', mochaAsync(async () => {
        let res = await erc721Contract.currentTokenId();
        expect(res).to.equal(1002);
    }));

    it('should verify the current Token Metadatta URI', mochaAsync(async () => {
        let res = await erc721Contract.getURITokenID({tokenID : 1000});
        console.log("res", res)
    }));

    it('should get the available token ids', mochaAsync(async () => {
        console.log("address", userAddress)
        tokensHeld = await erc721Contract.getRegisteredIDs({address : userAddress});
        expect(tokensHeld.length).to.equal(2);
        expect(tokensHeld[0]).to.equal(1000);
        expect(tokensHeld[1]).to.equal(1001);
    }));

   
    it('should mint the token id 2', mochaAsync(async () => {
        let res = await erc721Contract.mint({
            tokenID : tokensHeld[1]
        });
        expect(res).to.not.equal(false);
    }));

       
    it('shouldn´t mint a token id 3', mochaAsync(async () => {
        let res = await erc721Contract.mint({
            to : userAddress,
            tokenID : 1003
        });
        console.log("res", res)
        expect(res).to.equal(false);
    }));

    it('should be able to open a pack', mochaAsync(async () => {
        /* Approve */
        await erc721Contract.approveERC20();
        let isApproved = await erc721Contract.isApproved({ address : userAddress, amount : 1000});
        expect(isApproved).to.equal(true);

        /* Set Price for Pack */
        let res = await erc721Contract.openPack({
           amount : 1
        });

        expect(res).to.not.equal(false);
    }));


});