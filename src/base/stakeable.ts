import {Model} from '@base/model';

export class Stakeable extends Model {
  async changeTokenAddress(address: string) {
    return this.sendTx(this.contract.methods.changeTokenAddress(address))
  }

  async safeGuardAllTokens(address: string) {
    return this.sendTx(this.contract.methods.safeGuardAllTokens(address))
  }
}
