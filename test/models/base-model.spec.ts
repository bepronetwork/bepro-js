import {Web3ConnectionOptions} from '@interfaces/web3-connection-options';
import {Web3Connection} from '@base/web3-connection';
import {Model} from '@base/model';
import {expect} from 'chai';
import {Errors} from '@interfaces/error-enum';
import {getPrivateKeyFromFile} from '../utils/';

describe(`Model<any>`, () => {

  const options: Web3ConnectionOptions = {
    web3Host: process.env.WEB3_HOST_PROVIDER,
    privateKey: process.env.WALLET_PRIVATE_KEY || getPrivateKeyFromFile(),
    skipWindowAssignment: true,
  }

  it(`throws because no Abi`, () => {
    const web3Connection = new Web3Connection(options);

    expect(() => new Model(web3Connection, []))
      .to.throw(Errors.MissingAbiInterfaceFromArguments);

    expect(() => new Model(web3Connection, undefined as any))
      .to.throw(Errors.MissingAbiInterfaceFromArguments);
  });
})
