/* eslint-disable */
import { create } from 'ipfs-https-client';

class DexStorage {
  constructor({ipfsClientHTTP}={ipfsClientHTTP : null}) {
    if(!ipfsClientHTTP){
      throw new Error("Please provide a valid ipfsClientHTTP, you can find one at infura.io")
    }
    this.ipfs = new create(ipfsClientHTTP);
  }

}

export default DexStorage;
