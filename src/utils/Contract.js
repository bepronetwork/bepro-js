class Contract {
  constructor(web3, contract_json, address) {
    this.web3 = web3;
    this.json = contract_json;
    this.abi = contract_json.abi;
    this.address = address;
    this.contract = new web3.eth.Contract(contract_json.abi, address);
  }

  async deploy(account, abi, byteCode, args = [], callback = () => {}) {
    return new Promise(async (resolve, reject) => {
      try {
        this.contract = new this.web3.eth.Contract(abi);
        if (account) {
          let txSigned = await account.getAccount().signTransaction({
            data: this.contract
              .deploy({
                data: byteCode,
                arguments: args,
              })
              .encodeABI(),
            from: account.getAddress(),
            gasPrice: 180000000000,
            gas: 8913388,
          });
          this.web3.eth
            .sendSignedTransaction(txSigned.rawTransaction)
            .on("confirmation", function (confirmationNumber, receipt) {
              if (confirmationNumber > 1) {
                resolve(receipt);
              }
            });
        } else {
          const accounts = await this.web3.eth.getAccounts();
          let res = await this.__metamaskDeploy({
            byteCode,
            args,
            acc: accounts[0],
            callback,
          });
          this.address = res.contractAddress;
          resolve(res);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  __metamaskDeploy = async ({ byteCode, args, acc, callback = () => {} }) => {
    return new Promise((resolve, reject) => {
      try {
        console.log("Contract.__metamaskDeploy.acc: " + acc);
        this.getContract()
          .deploy({
            data: byteCode,
            arguments: args,
          })
          .send({
            from: acc,
            //BUGFIX: without gas and gasPrice set here, we get the following error:
            //Error: Node error: {"message":"base fee exceeds gas limit","code":-32000,"data":{"stack":"Error: base fee exceeds gas limit
            //,gasPrice : 180000000000
            //,gas : 5913388
            gasPrice: 20000000000,
            gas: 5913388, //6721975
          })
          .on("confirmation", (confirmationNumber, receipt) => {
            console.log(
              "Contract.__metamaskDeploy.confirmationNumber: " +
                confirmationNumber
            );
            callback(confirmationNumber);
            if (confirmationNumber > 0) {
              resolve(receipt);
            }
          })
          .on("error", (err) => {
            console.log("Contract.__metamaskDeploy.error: " + err);
            reject(err);
          });
      } catch (err) {
        console.log("Contract.__metamaskDeploy.catch.error: " + err);
        reject(err);
      }
    });
  };

  async use(contract_json, address) {
    this.json = contract_json;
    this.abi = contract_json.abi;
    this.address = address ? address : this.address;
    this.contract = new this.web3.eth.Contract(contract_json.abi, this.address);
  }

  async send(account, byteCode, value = "0x0", callback = () => {}) {
    return new Promise(async (resolve, reject) => {
      let tx = {
        data: byteCode,
        from: account.address,
        to: this.address,
        gas: 4430000,
        gasPrice: 200000000000,
        value: value ? value : "0x0",
      };

      let result = await account.signTransaction(tx);
      this.web3.eth
        .sendSignedTransaction(result.rawTransaction)
        .on("confirmation", (confirmationNumber, receipt) => {
          callback(confirmationNumber);
          if (confirmationNumber > 0) {
            resolve(receipt);
          }
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  }

  getContract() {
    return this.contract;
  }

  getABI() {
    return this.abi;
  }

  getJSON() {
    return this.json;
  }

  getAddress() {
    return this.address;
  }
}

export default Contract;
