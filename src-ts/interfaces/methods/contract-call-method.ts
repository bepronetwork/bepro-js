import {CallOptions, ContractSendMethod} from 'web3-eth-contract';

export type Call<T=any> = (options?: CallOptions, callback?: (err: Error, result: any) => void) => Promise<T>;
export type ContractCallMethod<ReturnData = any> = {call: Call<ReturnData>} & ContractSendMethod;

