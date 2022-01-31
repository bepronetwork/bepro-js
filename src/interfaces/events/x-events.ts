import {EventData} from 'web3-eth-contract';

export type XEvents<V> = { [K in keyof EventData]: EventData[K] extends V ? V : any }
