

import chai from 'chai';
import { mochaAsync } from './utils';
import { Application } from '..';
import Numbers from '../src/utils/Numbers';

const tokenAddress = "0xd3f461fef313a992fc25e681acc09c6191b08bca";
const mainnet = false;

var contractAddress;

context('Network', async () => {
    var networkContract;
    var app;
    var issue;
   
    before( async () =>  {
        app = new Application({test : true, mainnet});
    });

    it('should start the Application', mochaAsync(async () => {
        app = new Application({test : true, mainnet});
        expect(app).to.not.equal(null);
    }));

    it('should deploy Contract', mochaAsync(async () => {
        /* Create Contract */
        networkContract = app.getNetworkContract({});
        /* Deploy */
        let res = await networkContract.deploy({
            name : 'Art | BEPRO', symbol : 'B.E.P.R.O', 
            limitedAmount : 100, 
            erc20Purchase : tokenAddress,
            feeAddress : app.account.getAddress()
        });
        await networkContract.__assert();
        contractAddress = networkContract.getAddress();
        expect(res).to.not.equal(false);
    }));

    it('should verify if sale is limited', mochaAsync(async () => {
        let res = await networkContract.isLimited();
        expect(res).to.equal(true);
    }));


    it('should add base tokenURI', mochaAsync(async () => {
        let res = await networkContract.setBaseTokenURI({URI : 'https://bepronetwork.github.io/B.E.P.R.O/meta/'});
        expect(res).to.not.equal(false);
    }));

    it('should set Pack Price', mochaAsync(async () => {
        /* Set Price for Pack */
        let res = await networkContract.setPricePerPack({
           newPrice : 1000
        });
        expect(res).to.not.equal(false);
        res = await networkContract.getPricePerPack();
        expect(res).to.equal(Number(1000).toString());
    }));

    it('should open a pack', mochaAsync(async () => {
        /* Approve */
        await networkContract.approveERC20();

        /* Set Price for Pack */
        let res = await networkContract.openPack({
           amount : 1
        });
        expect(res).to.not.equal(false);
    }));

    it('should verify the opened packs', mochaAsync(async () => {
        let res = await networkContract.openedPacks();
        expect(res).to.equal(1);
    }));

    it('should verify the current Token id', mochaAsync(async () => {
        let res = await networkContract.currentTokenId();
        expect(res).to.equal(1001);
    }));

    it('should get the available token ids', mochaAsync(async () => {
        tokensHeld = await networkContract.getRegisteredIDs({address : app.account.getAddress()});
        expect(tokensHeld.length).to.equal(1);
        expect(tokensHeld[0]).to.equal(1000);
    }));

    it('should verify the available token id is not minted already', mochaAsync(async () => {
        let res = await networkContract.isIDRegistered({address : app.account.getAddress(), tokenID : tokensHeld[0]});
        expect(res).to.equal(true);
        res = await networkContract.exists({tokenID : tokensHeld[0]});
        expect(res).to.equal(false);
    }));

    it('should mint the token id', mochaAsync(async () => {
        let res = await networkContract.mint({
            tokenID : tokensHeld[0]
        });
        expect(res).to.not.equal(false);
        
    }));

    it('should verify the available token id is already', mochaAsync(async () => {
        let res = await networkContract.isIDRegistered({address : app.account.getAddress(), tokenID : tokensHeld[0]});
        expect(res).to.equal(true);
        res = await networkContract.exists({tokenID : tokensHeld[0]});
        expect(res).to.equal(true);
    }));

    it('should open a pack', mochaAsync(async () => {
        /* Approve */
        await networkContract.approveERC20();
        let isApproved = await networkContract.isApproved({ address : app.account.getAddress(),amount : 1000});
        expect(isApproved).to.equal(true);

        /* Set Price for Pack */
        let res = await networkContract.openPack({
           amount : 1
        });
        expect(res).to.not.equal(false);
    }));

    it('should verify the opened packs', mochaAsync(async () => {
        let res = await networkContract.openedPacks();
        expect(res).to.equal(2);
    }));


    it('should verify the current Token id', mochaAsync(async () => {
        let res = await networkContract.currentTokenId();
        expect(res).to.equal(1002);
    }));

    it('should verify the current Token Metadatta URI', mochaAsync(async () => {
        let res = await networkContract.getURITokenID({tokenID : 1000});
        console.log("res", res)
    }));

    it('should get the available token ids', mochaAsync(async () => {
        console.log("address", app.account.getAddress())
        tokensHeld = await networkContract.getRegisteredIDs({address : app.account.getAddress()});
        expect(tokensHeld.length).to.equal(2);
        expect(tokensHeld[0]).to.equal(1000);
        expect(tokensHeld[1]).to.equal(1001);
    }));

   
    it('should mint the token id 2', mochaAsync(async () => {
        let res = await networkContract.mint({
            tokenID : tokensHeld[1]
        });
        expect(res).to.not.equal(false);
    }));

       
    it('shouldn´t mint a token id 3', mochaAsync(async () => {
        let res = await networkContract.mint({
            to : app.account.getAddress(),
            tokenID : 1003
        });
        console.log("res", res)
        expect(res).to.equal(false);
    }));

    it('should be able to open a pack', mochaAsync(async () => {
        /* Approve */
        await networkContract.approveERC20();
        let isApproved = await networkContract.isApproved({ address : app.account.getAddress(), amount : 1000});
        expect(isApproved).to.equal(true);

        /* Set Price for Pack */
        let res = await networkContract.openPack({
           amount : 1
        });

        expect(res).to.not.equal(false);
    }));


});