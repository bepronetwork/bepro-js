import Model from '@base/model';

export default class Ownable extends Model {
  async setOwner(address: string) {
    return this.sendTx(this.contract.methods.transferOwnership(address))
  }

  async owner() {
    return this.sendTx(this.contract.methods.owner(), true);
  }

  async onlyOwner(): Promise<boolean> {
    return (await this.owner()) === (await this.web3Connection.getAddress())
  }
}
