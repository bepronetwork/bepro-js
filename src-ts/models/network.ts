import Model from '@base/model';
import Web3Connection from '@base/web3-connection';
import * as NetworkAbi from '@abi/Network.json';

export default class Network extends Model {

  constructor(web3Connection: Web3Connection, contractAddress: string) {
    super(web3Connection, contractAddress, NetworkAbi.abi as any); // investigate type: constructor messing this up
  }

  loadContract() {
    super.loadContract();
    // __assert aka loadContract aka load settler and transactional
  }
}
