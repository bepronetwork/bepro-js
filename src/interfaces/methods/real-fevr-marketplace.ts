import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@methods/contract-call-method';

export interface RealFevrMarketplaceMethods {
  erc20Address() :ContractCallMethod<string>;
  erc721Address() :ContractCallMethod<string>;
  feeAddress() :ContractCallMethod<string>;
  saleIncrementId() :ContractCallMethod<number>;
  approveERC721use(operator: string) :ContractSendMethod;
  approveERC721use(operator: string, approved?: boolean) :ContractSendMethod;
  buyERC721(tokenId: number) :ContractSendMethod;
  buyERC721(tokenId: number, value?: number) :ContractSendMethod;
  changeERC20(erc20TokenAddress: string) :ContractSendMethod;
  changeERC721(erc721TokenAddress: string) :ContractSendMethod;
  getAmountofNFTsEverInSale() :number;
  getERC20TokenAddress() :ContractCallMethod<string>;
  getERC721TokenAddress() :ContractCallMethod<string>;
  getFeeAddress() :ContractCallMethod<string>;
  isETHTransaction() :string;
  putERC721OnSale(tokenId: number, price: number) :ContractSendMethod;
  removeERC721FromSale(tokenId: number) :ContractSendMethod;
  setFixedFees(feeAddress: string, feePercentage: number) :ContractSendMethod;
}
