import {Model} from '@base/model';
import {Web3Connection} from '@base/web3-connection';
import {Web3ConnectionOptions} from '@interfaces/web3-connection-options';
import {Deployable} from '@interfaces/deployable';
import RealFevrOpenerJson from '@abi/RealFevrOpener.json';
import {RealFevrOpenerMethods} from '@methods/real-fevr-opener';
import {AbiItem} from 'web3-utils';
import {ERC20} from '@models/erc20';
import {fromDecimals, toSmartContractDate, toSmartContractDecimals} from '@utils/numbers';
import realFevrMarketplaceDistributions from '@utils/real-fevr-marketplace-distributions';
import realFevrPack from '@utils/real-fevr-pack';

export const nativeZeroAddress: string = '0x0000000000000000000000000000000000000000';

export class RealFevrOpener extends Model<RealFevrOpenerMethods> implements Deployable {
  constructor(web3Connection: Web3Connection|Web3ConnectionOptions,
              contractAddress?: string,
              readonly purchaseTokenAddress?: string) {
    super(web3Connection, RealFevrOpenerJson.abi as AbiItem[], contractAddress);
  }

  private _decimals: number = 18;
  get decimals(): number { return this._decimals; }

  private _erc20!: ERC20;
  get erc20() { return this._erc20; }

  async loadContract() {
    if (!this.contract)
      await super.loadContract();

    const purchaseToken = await this._purchaseToken() || this.purchaseTokenAddress;
    if (purchaseToken && purchaseToken !== nativeZeroAddress) {
      this._erc20 = new ERC20(this.web3Connection, purchaseToken);
      await this._erc20.loadContract();

      this._decimals = this._erc20.decimals;
    }
  }

  async start() {
    await super.start();
    await this.loadContract();
  }

  async deployJsonAbi(name: string, symbol: string, _purchaseToken: string) {
    const deployOptions = {
        data: RealFevrOpenerJson.bytecode,
        arguments: [name, symbol, _purchaseToken]
    };

    return this.deploy(deployOptions, this.web3Connection.Account);
  }

  async getAmountOfPacksOpened() {
    return this.callTx(this.contract.methods._openedPacks());
  }

  async _purchaseToken() {
    return this.callTx(this.contract.methods._purchaseToken());
  }

  async _realFvrTokenPriceUSD() {
    return this.callTx(this.contract.methods._realFvrTokenPriceUSD());
  }

  async alreadyMinted(v1: number) {
    return this.callTx(this.contract.methods.alreadyMinted(v1));
  }

  async approve(to: string, tokenId: number) {
    return this.sendTx(this.contract.methods.approve(to, tokenId));
  }

  async balanceOf(owner: string) {
    return this.callTx(this.contract.methods.balanceOf(owner));
  }

  async baseURI() {
    return this.callTx(this.contract.methods.baseURI());
  }

  async getApproved(tokenId: number) {
    return this.callTx(this.contract.methods.getApproved(tokenId));
  }

  async isApprovedForAll(owner: string, operator: string) {
    return this.callTx(this.contract.methods.isApprovedForAll(owner, operator));
  }

  async lastNFTID() {
    return this.callTx(this.contract.methods.lastNFTID());
  }

  async name() {
    return this.callTx(this.contract.methods.name());
  }

  async owner() {
    return this.callTx(this.contract.methods.owner());
  }

  async ownerOf(tokenId: number) {
    return this.callTx(this.contract.methods.ownerOf(tokenId));
  }

  async packIncrementId() {
    return this.callTx(this.contract.methods.packIncrementId());
  }

  async packs(v1: number) {
    return this.callTx(this.contract.methods.packs(v1));
  }

  async registeredIDs(v1: string, v2: number) {
    return this.callTx(this.contract.methods.registeredIDs(v1, v2));
  }

  async registeredIDsArray(v1: string, v2: number) {
    return this.callTx(this.contract.methods.registeredIDsArray(v1, v2));
  }

  async safeTransferFrom(from: string, to: string, tokenId: number, _data?: string) {
    return this.sendTx(this.contract.methods.safeTransferFrom(from, to, tokenId, _data));
  }

  async setApprovalForAll(operator: string, approved: boolean) {
    return this.sendTx(this.contract.methods.setApprovalForAll(operator, approved));
  }

  async supportsInterface(interfaceId: string) {
    return this.callTx(this.contract.methods.supportsInterface(interfaceId));
  }

  async symbol() {
    return this.callTx(this.contract.methods.symbol());
  }

  async tokenByIndex(index: number) {
    return this.callTx(this.contract.methods.tokenByIndex(index));
  }

  async tokenOfOwnerByIndex(owner: string, index: number) {
    return this.callTx(this.contract.methods.tokenOfOwnerByIndex(owner, index));
  }

  async tokenURI(tokenId: number) {
    return this.callTx(this.contract.methods.tokenURI(tokenId));
  }

  async totalSupply() {
    return this.callTx(this.contract.methods.totalSupply());
  }

  async transferFrom(from: string, to: string, tokenId: number) {
    return this.sendTx(this.contract.methods.transferFrom(from, to, tokenId));
  }

  async transferOwnership(newOwner: string) {
    return this.sendTx(this.contract.methods.transferOwnership(newOwner));
  }

  async setTokenURI(tokenId: number, uri: string) {
    return this.sendTx(this.contract.methods.setTokenURI(tokenId, uri));
  }

  async setBaseURI(baseURI: string) {
    return this.sendTx(this.contract.methods.setBaseURI(baseURI));
  }

  async exists(tokenId: number) {
    return this.callTx(this.contract.methods.exists(tokenId));
  }

  async getRegisteredIDs(_address: string) {
    return this.callTx(this.contract.methods.getRegisteredIDs(_address));
  }

  async getMarketplaceDistributionForERC721(tokenId: number) {
    return realFevrMarketplaceDistributions(await this.callTx(this.contract.methods.getMarketplaceDistributionForERC721(tokenId)));
  }

  async getPurchaseToken() {
    return this.callTx(this.contract.methods._purchaseToken());
  }

  async getTokenWorthof1USD() {
    return fromDecimals(await this.callTx(this.contract.methods._realFvrTokenPriceUSD()), this.decimals);
  }

  async getPackbyId(_packId: number) {
    return realFevrPack(await this.callTx(this.contract.methods.getPackbyId(_packId)), 3);
  }

  async getPackPriceInFVR(packId: number) {
    return this.callTx(this.contract.methods.getPackPriceInFVR(packId));
  }

  async buyPack(packId: number) {
    return this.sendTx(this.contract.methods.buyPack(packId));
  }

  async buyPacks(packIds: number[]) {
    return this.sendTx(this.contract.methods.buyPacks(packIds));
  }

  async openPack(packId: number) {
    return this.sendTx(this.contract.methods.openPack(packId));
  }

  async openPacks(packIds: number[]) {
    return this.sendTx(this.contract.methods.openPacks(packIds));
  }

  async createPack( nftAmount: number, price: number, serie: string, packType: string, drop: string,
                   saleStart: number, saleDistributionAddresses: string[], saleDistributionAmounts: number[], marketplaceDistributionAddresses: string[], marketplaceDistributionAmounts: number[]) {
    return this.sendTx(this.contract.methods.createPack(
                                                        nftAmount,
                                                        toSmartContractDecimals(price,
                                                       3) as number, serie,
                                                        packType,
                                                        drop,
                                                        toSmartContractDate(saleStart),
                                                        saleDistributionAddresses,
                                                        saleDistributionAmounts, marketplaceDistributionAddresses, marketplaceDistributionAmounts));
  }

  async offerPack(packId: number, receivingAddress: string) {
    return this.sendTx(this.contract.methods.offerPack(packId, receivingAddress));
  }

  async editPackInfo(_packId: number,
                     _saleStart: number,
                     serie: string,
                     packType: string,
                     drop: string,
                     price: number) {
    return this.sendTx(this.contract.methods.editPackInfo(_packId,
                                                          toSmartContractDate(_saleStart),
                                                          serie,
                                                          packType,
                                                          drop,
                                                          toSmartContractDecimals(price, 3) as number));
  }

  async deletePackById(packId: number) {
    return this.sendTx(this.contract.methods.deletePackById(packId));
  }

  async mint(tokenIdToMint: number) {
    return this.sendTx(this.contract.methods.mint(tokenIdToMint));
  }

  async setPurchaseTokenAddress(purchaseToken: string) {
    return this.sendTx(this.contract.methods.setPurchaseTokenAddress(purchaseToken));
  }

  async setTokenPriceInUSD(newPrice: number) {
    return this.sendTx(this.contract.methods.setTokenPriceInUSD(newPrice));
  }

  async lock() {
    return this.sendTx(this.contract.methods.lock());
  }

  async unlock() {
    return this.sendTx(this.contract.methods.unlock());
  }

}
