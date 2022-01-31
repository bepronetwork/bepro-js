import {ContractCallMethod} from '@methods/contract-call-method';

export interface PausableMethods {
  paused(): ContractCallMethod<boolean>;
}
