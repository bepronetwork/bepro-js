/* eslint-disable */
import { create } from 'ipfs-http-client';


/**
 * DexStorage Object
 * @class DexStorage
 * @param {Object} params Parameters
 * @param {String} params.ipfsClientHTTP Optional, IPFS Infura Node API or object
 */
class DexStorage {
  constructor({ ipfsClientHTTP } = { ipfsClientHTTP: { host: 'ipfs.infura.io', port: 5001, protocol: 'https' } }) {
    if (!ipfsClientHTTP) {
      throw new Error("Please provide a valid ipfsClientHTTP, you can find one at infura.io")
    }
    this.ipfs = create(ipfsClientHTTP);
  }

  /**
   * @function
   * @description Save Data
   * @param {Object} params Parameters
   * @param {String} params.data Data String, if image blob info
   * @returns {String} CID (Hash to be used to access the params.data later)
   */
  async save({ data }) {
    const { path, cid, size } = await this.ipfs.add(data);
    return { path, cid, size };
  }

  /**
   * @function
   * @description Get Data
   * @param {Object} params Parameters
   * @param {String} params.cid CID String, if image blob info
   * @returns {String} data (Hash to be used to access the params.data later)
   */
  async get({ cid }) {
    return new Promise( async (resolve, reject) => {
      try {
        for await (const file of this.ipfs.get(cid)) {
          if (!file.content) continue;
          const content = []
          for await (const chunk of file.content) {
            content.push(chunk)
          }
          resolve(content.toString())
        }
      }
      catch(err) {
        reject(err);
      }
    })
  }
}

export default DexStorage;
