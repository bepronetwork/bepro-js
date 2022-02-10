import {IPFSOptions} from '@interfaces/ipfs-options';
import {create} from 'ipfs-http-client';
import {IPFS} from 'ipfs-core-types';
import {ImportCandidate, IPFSPath} from 'ipfs-core-types/src/utils';
import {GetOptions} from 'ipfs-core-types/src/root';

/**
 * Thin layer around ipfs-http-client
 * @usage
 * ```
 * const wrapper = new IPFSWrapper(options);
 * const {cid} await wrapper.IPFS.add("hello world");
 * const echo = await wrapper.IPFS.get(cid);
 * assert(echo === "hello world")
 */
export class IPFSWrapper {

  constructor(readonly options: IPFSOptions) {
    if (this.options.auto) {
      delete this.options.auto; // delete auto because we don't want to feed it into the ipfs as it's unknown
      this.create()
    }
  }

  private _IPFS!: IPFS;
  get IPFS() { return this._IPFS; }

  create(options?: IPFSOptions) {
    this._IPFS = create(options || this.options)
  }

  add(data: ImportCandidate, options?: GetOptions) {
    return this._IPFS.add(data, options);
  }

  /* eslint-disable complexity */
  async get(cid: IPFSPath, options?: GetOptions) {

    for await (const node of this._IPFS.get(cid, options))
      if (node.type === "file" && node.content) {
        const content = [];

        for await (const chunk of node.content) {
          if (chunk) {
            content.push(chunk);
          }
        }

        return content.join('');

      } else return node;
  }
  /* eslint-enable complexity */

}
