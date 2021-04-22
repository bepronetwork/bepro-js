import { ierc20 } from '../interfaces';
import Numbers from '../utils/Numbers';
import IContract from './IContract';

class ERC20Contract extends IContract {
  constructor(params) {
    super({ abi: ierc20, ...params });
  }

  __assert = async () => {
    this.params.contract.use(ierc20, this.getAddress());
    this.params.decimals = await this.getDecimalsAsync();
  };

  getContract() {
    return this.params.contract.getContract();
  }

  getAddress() {
    return this.params.contractAddress;
  }

  async transferTokenAmount({ toAddress, tokenAmount }) {
    const amountWithDecimals = Numbers.toSmartContractDecimals(
      tokenAmount,
      this.getDecimals(),
    );
    return await this.__sendTx(
      this.params.contract
        .getContract()
        .methods.transfer(toAddress, amountWithDecimals),
    );
  }

  async getTokenAmount(address) {
    return Numbers.fromDecimals(
      await this.getContract().methods.balanceOf(address).call(),
      this.getDecimals(),
    );
  }

  async totalSupply() {
    return Numbers.fromDecimals(
      await this.getContract().methods.totalSupply().call(),
      this.getDecimals(),
    );
  }

  getABI() {
    return this.params.contract;
  }

  getDecimals() {
    return this.params.decimals;
  }

  async getDecimalsAsync() {
    return await this.getContract().methods.decimals().call();
  }

  async isApproved({ address, amount, spenderAddress }) {
    try {
      const approvedAmount = Numbers.fromDecimals(
        await this.getContract()
          .methods.allowance(address, spenderAddress)
          .call(),
        this.getDecimals(),
      );
      return approvedAmount >= amount;
    } catch (err) {
      throw err;
    }
  }

  async approve({ address, amount, callback }) {
    try {
      const amountWithDecimals = Numbers.toSmartContractDecimals(
        amount,
        this.getDecimals(),
      );
      const res = await this.__sendTx(
        this.params.contract
          .getContract()
          .methods.approve(address, amountWithDecimals),
        null,
        null,
        callback,
      );
      return res;
    } catch (err) {
      throw err;
    }
  }

  deploy = async ({
    name, symbol, cap, distributionAddress, callback,
  }) => {
    if (!distributionAddress) {
      throw new Error('Please provide an Distribution address for distro');
    }

    if (!name) {
      throw new Error('Please provide a name');
    }

    if (!symbol) {
      throw new Error('Please provide a symbol');
    }

    if (!cap) {
      throw new Error('Please provide a cap');
    }
    const params = [name, symbol, cap, distributionAddress];
    const res = await this.__deploy(params, callback);
    this.params.contractAddress = res.contractAddress;
    /* Call to Backend API */
    await this.__assert();
    return res;
  };
}

export default ERC20Contract;
