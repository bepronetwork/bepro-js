/* eslint-disable */
import { create } from 'ipfs-http-client';

class DexStorage {
  constructor({ipfsClientHTTP}={ipfsClientHTTP : { host: 'ipfs.infura.io', port: 5001, protocol: 'https' }}) {
    if(!ipfsClientHTTP){
      throw new Error("Please provide a valid ipfsClientHTTP, you can find one at infura.io")
    }
    this.ipfs = create(ipfsClientHTTP);
  }

  save = async ({data}) => {
    const { path, cid, size } = await this.ipfs.add(data);
    return { path, cid, size };
  }

  get = async ({cid}) => {
    return new Promise( async (resolve, reject) => {
      try{
        for await (const file of this.ipfs.get(cid)) {
          if (!file.content) continue;
          const content = []
          for await (const chunk of file.content) {
            content.push(chunk)
          }
          resolve(content.toString())
        }
      }catch(err){
        reject(err);
      }
    })
  }

}

export default DexStorage;
