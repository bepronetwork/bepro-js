import {ContractSendMethod} from 'web3-eth-contract';
export interface ERC20Methods {
  name(): ContractSendMethod;
  symbol(): ContractSendMethod;
  decimals(): ContractSendMethod;
  totalSupply(): ContractSendMethod;
  balanceOf(account: string): ContractSendMethod;
  transfer(recipient: string, amount: number): ContractSendMethod;
  allowance(owner: string, spender: string): ContractSendMethod;
  approve(spender: string, amount: number): ContractSendMethod;
  transferFrom(sender: string, recipient: string, amount: number): ContractSendMethod;
  increaseAllowance(spender: string, addedValue: number): ContractSendMethod;
  decreaseAllowance(spender: string, subtractedValue: number): ContractSendMethod;
}
