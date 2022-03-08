class Contract {
  constructor(web3Connection, contract_json, address) {
    this.web3Connection = web3Connection;
    this.web3 = web3Connection.getWeb3();
    this.json = contract_json;
    this.abi = contract_json.abi;
    this.address = address;
    this.contract = new this.web3.eth.Contract(contract_json.abi, address);
  }

  async deploy(abi, byteCode, options = {}) {
    const {
      account, args, callback, from, gasLimit, gasFactor, gasPrice,
    } = options;

    this.contract = new this.web3.eth.Contract(abi);

    // const txGasPrice = gasPrice || await this.web3Connection.web3.eth.getGasPrice();
    // const txGasLimit = gasLimit || (await this.web3Connection.web3.eth.getBlock('latest')).gasLimit;
    const txGasPrice = gasPrice || await this.web3.eth.getGasPrice();
    const txGasLimit = gasLimit || (await this.web3.eth.getBlock('latest')).gasLimit;
    const txGasFactor = gasFactor || 1;
    const txGas = Math.round(txGasLimit * txGasFactor);

    if (account) {
      const txSigned = await account.getAccount().signTransaction({
        data: this.contract
          .deploy({
            data: byteCode,
            arguments: args || [],
          })
          .encodeABI(),
        from: account.getAddress(),
        gasPrice: txGasPrice, // 180000000000,
        gas: txGas, // 8913388,
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
        } catch (err) {
          reject(err);
        }
      });
    }

    const txFrom = from || await this.web3Connection.getAddress();
    const res = await this.__metamaskDeploy({
      byteCode,
      args,
      from: txFrom,
      gas: txGas,
      gasPrice: txGasPrice,
      callback,
    });
    this.address = res.contractAddress;
    return res;
  }

  __metamaskDeploy = ({
    byteCode, args, callback, ...options
  }) => new Promise((resolve, reject) => {
    try {
      this.getContract()
        .deploy({
          data: byteCode,
          arguments: args,
        })
        // .send({
        //  from: acc,
        //  gas: 5913388, // 6721975
        // })
        .send(options)
        .on('confirmation', (confirmationNumber, receipt) => {
          if (callback) callback(confirmationNumber);
          if (confirmationNumber > 0) {
            resolve(receipt);
          }
        })
        .on('error', (err) => {
          reject(err);
        });
    } catch (err) {
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
        .on('error', (err) => {
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
