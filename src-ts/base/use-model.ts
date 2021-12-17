import Model from '@base/model';
import {PausableMethods} from '@methods/pausable';

type NeedsFromModel = 'sendTx' | 'callTx' | 'contract' | 'connection';

type UseModelParams<ModelMethods = any, CompositionMethods = any> =
  Pick<Model<ModelMethods & CompositionMethods>, NeedsFromModel>

type MinimalModel = Pick<Model, NeedsFromModel>;

export default class UseModel<ModelMethods = any> {
  readonly model!: MinimalModel;

  constructor({sendTx, callTx, contract, connection}: UseModelParams<ModelMethods, PausableMethods>) {
    this.model = {sendTx, callTx, contract, connection}
  }
}
