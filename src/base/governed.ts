import {UseModel} from '@base/use-model';
import {GovernedMethods} from '@methods/governed';
import {PastEventOptions} from 'web3-eth-contract';
import {XEvents} from '@events/x-events';
import * as Events from '@events/governed-events';

export class Governed extends UseModel<GovernedMethods> {
  async _governor() {
    return this.model.callTx(this.model.contract.methods._governor());
  }

  async _proposedGovernor() {
    return this.model.callTx(this.model.contract.methods._proposedGovernor());
  }

  async proposeGovernor(proposedGovernor: string) {
    return this.model.callTx(this.model.contract.methods.proposeGovernor(proposedGovernor));
  }

  async claimGovernor() {
    return this.model.callTx(this.model.contract.methods.claimGovernor());
  }

  async getGovernorTransferredEvents(filter: PastEventOptions): Promise<XEvents<Events.GovernorTransferredEvent>[]> {
    return this.model.contract.self.getPastEvents(`GovernorTransferred`, filter)
  }
}
