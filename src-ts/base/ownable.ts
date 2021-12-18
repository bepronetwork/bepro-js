import {OwnableMethods} from '@methods/ownable';
import {UseModel} from '@base/use-model';
import {Errors} from '@interfaces/error-enum';

export class Ownable extends UseModel<OwnableMethods> {
  async setOwner(address: string) {
    return this.model.sendTx(this.model.contract.methods.transferOwnership(address))
  }

  async owner() {
    return this.model.callTx(this.model.contract.methods.owner());
  }

  async onlyOwner() {
    const isOwner = (await this.owner()) === (await this.model.connection.getAddress());
    if (!isOwner)
      throw new Error(Errors.OnlyAdminCanPerformThisOperation)
  }
}
