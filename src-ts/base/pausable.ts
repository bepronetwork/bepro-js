import Model from '@base/model';

export default class Pausable extends Model {
  async pause() {
    return this.sendTx(this.contract.methods.pause());
  }

  async unpause() {
    return this.sendTx(this.contract.methods.unpause());
  }

  async paused() {
    return this.sendTx(this.contract.methods.paused(), true);
  }

}
