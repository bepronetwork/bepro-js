import {Model} from '@base/model';
import {PausableMethods} from '@methods/pausable';

export type NeedsFromModel = 'sendTx' | 'callTx' | 'contract' | 'connection';

export type UseModelParams<ModelMethods = any, CompositionMethods = any> =
  Pick<Model<ModelMethods & CompositionMethods>, NeedsFromModel>

export type MinimalModel = Pick<Model, NeedsFromModel>;

export class UseModel<ModelMethods = any> {
  readonly model!: MinimalModel;

  constructor({sendTx, callTx, contract, connection}: UseModelParams<ModelMethods, PausableMethods>) {
    this.model = {sendTx, callTx, contract, connection}
  }
}
