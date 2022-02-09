import {Options} from 'ipfs-http-client/dist/src/types';

export interface IPFSOptions extends Options {
  host: string;
  port: number;
  protocol: "http" | "https";
  headers?: {
    [key: string]: string;
  },
  auto?: boolean;
}
