import {CallOptions, ContractSendMethod} from 'web3-eth-contract';

type call<T=any> = (options?: CallOptions, callback?: (err: Error, result: any) => void) => Promise<T>;
export type ContractCallMethod<ReturnData = any> = {call: call<ReturnData>} & ContractSendMethod;

