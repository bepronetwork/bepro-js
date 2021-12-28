class Contract {
  constructor(web3Connection, contract_json, address) {
    this.web3Connection = web3Connection;
    this.web3 = web3Connection.getWeb3();
    this.json = contract_json;
    this.abi = contract_json.abi;
    this.address = address;
    this.contract = new this.web3.eth.Contract(contract_json.abi, address);
  }

  async deploy(account, abi, byteCode, args = [], callback = () => {}) {
    this.contract = new this.web3.eth.Contract(abi);
    if (account) {
      const txSigned = await account.getAccount().signTransaction({
        data: this.contract
          .deploy({
            data: byteCode,
            arguments: args,
          })
          .encodeABI(),
        from: account.getAddress(),
        gasPrice: 5000000000,
        gas: 8913388,
      });
      return new Promise((resolve, reject) => {
        try {
          this.web3.eth
            .sendSignedTransaction(txSigned.rawTransaction)
            .on('confirmation', (confirmationNumber, receipt) => {
              if (confirmationNumber > 1) {
                resolve(receipt);
              }
            });
        }
        catch (ex) {
          reject(ex);
        }
      });
    }
    const userAddress = await this.web3Connection.getAddress();
    const res = await this.__metamaskDeploy({
      byteCode,
      args,
      acc: userAddress,
      callback,
    });
    this.address = res.contractAddress;
    return res;
  }

  __metamaskDeploy = ({
    byteCode, args, acc, callback = () => {},
  }) => new Promise((resolve, reject) => {
    try {
      this.getContract()
        .deploy({
          data: byteCode,
          arguments: args,
        })
        .send({
          from: acc,
          // BUGFIX: without gas and gasPrice set here, we get the following error:
          // Error: Node error: {"message":"base fee exceeds gas limit","code":-32000,"data":{"stack":"Error: base fee exceeds gas limit
          // ,gasPrice : 180000000000
          // ,gas : 5913388
          gasPrice: 500000000,
          gas: 5913388, // 6721975
        })
        .on('confirmation', (confirmationNumber, receipt) => {
          callback(confirmationNumber);
          if (confirmationNumber > 0) {
            resolve(receipt);
          }
        })
        .on('error', err => {
          reject(err);
        });
    }
    catch (err) {
      reject(err);
    }
  });

  async use(contract_json, address) {
    this.json = contract_json;
    this.abi = contract_json.abi;
    this.address = address || this.address;
    this.contract = new this.web3.eth.Contract(contract_json.abi, this.address);
  }

  async send(account, byteCode, value = '0x0', callback = () => {}) {
    const tx = {
      data: byteCode,
      from: account.address,
      to: this.address,
      gas: 4430000,
      gasPrice: await this.web3.eth.getGasPrice(),
      value: value || '0x0',
    };

    const result = await account.signTransaction(tx);

    return new Promise((resolve, reject) => {
      this.web3.eth
        .sendSignedTransaction(result.rawTransaction)
        .on('confirmation', (confirmationNumber, receipt) => {
          callback(confirmationNumber);
          if (confirmationNumber > 0) {
            resolve(receipt);
          }
        })
        .on('error', err => {
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
