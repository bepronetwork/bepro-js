class Account{

    constructor(web3, account){
        this.web3 = web3;
        this.account = account;
    }


    async getBalance(){
        let wei = await this.web3.eth.getBalance(this.getAddress());
        return this.web3.utils.fromWei(wei, 'ether')
    }

    getAddress(){
        return this.account.address;
    }

    getPrivateKey(){
        return this.account.privateKey;
    }

    getAccount(){
        return this.account
    }

    async sendEther(amount, address, data=null){
        let tx = {
            data : data,
            from  : this.getAddress(),
            to : address,
            gas : 443000,
            value: amount
        }
        let result = await this.account.signTransaction(tx);
        let transaction = await this.web3.eth.sendSignedTransaction(result.rawTransaction);
        return transaction;
    }
}


export default Account;