import {Pausable} from '@base/pausable';
import {Ownable} from '@base/ownable';

export abstract class IsPausable {
  abstract readonly pausable: Pausable;
}

export abstract class IsOwnable {
  abstract readonly ownable: Ownable;
}
