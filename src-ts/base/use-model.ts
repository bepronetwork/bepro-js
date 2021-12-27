import {Model} from '@base/model';

export type NeedsFromModel = 'sendTx' | 'callTx' | 'contract' | 'connection';

export type UseModelParams<ModelMethods = any> =
  Pick<Model<ModelMethods>, NeedsFromModel>

export type MinimalModel = Pick<Model, NeedsFromModel>;

export class UseModel<ModelMethods = any> {
  readonly model!: MinimalModel;

  constructor({sendTx, callTx, contract, connection}: UseModelParams<ModelMethods>) {
    this.model = {sendTx, callTx, contract, connection}
  }
}
