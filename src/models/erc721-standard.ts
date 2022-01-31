import {Model} from '@base/model';
import {ERC721StandardMethods} from '@methods/erc721-standard';
import {Web3Connection} from '@base/web3-connection';
import {Web3ConnectionOptions} from '@interfaces/web3-connection-options';
import ERC721Standard from '@abi/ERC721Standard.json';
import {AbiItem} from 'web3-utils';
import {Deployable} from '@interfaces/deployable';

export class Erc721Standard extends Model<ERC721StandardMethods> implements Deployable {

  constructor(web3Connection: Web3Connection|Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, ERC721Standard.abi as AbiItem[], contractAddress);
  }

  async exists(tokenId: number) {
    return this.callTx(this.contract.methods.exists(tokenId));
  }

  async setBaseURI(baseURI: string) {
    return this.sendTx(this.contract.methods.setBaseURI(baseURI));
  }

  async setTokenURI(tokenId: number, uri: string) {
    return this.sendTx(this.contract.methods.setTokenURI(tokenId, uri));
  }

  async mint(to: string, tokenId: number, data?: string) {
    return this.sendTx(this.contract.methods.mint(to, tokenId, data))
  }

  deployJsonAbi(name: string, symbol: string) {
    const options = {
      data: ERC721Standard.bytecode,
      arguments: [name, symbol]
    }

    return this.deploy(options, this.web3Connection.Account);
  }
}
