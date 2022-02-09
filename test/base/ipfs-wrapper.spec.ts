import {IPFSOptions, IPFSWrapper} from '../../src';
import {expect} from 'chai';
import {CID} from 'ipfs-http-client';

describe(`IPFS Wrapper`, () => {
  const options: IPFSOptions = { host: 'ipfs.infura.io', port: 5001, protocol: "https"};

  it(`starts a new wrapper and connects`, () => {
    const autoWrapper = new IPFSWrapper({...options, auto: true});
    expect(autoWrapper.IPFS).to.not.be.undefined;
  });

  it(`doesn't start because no auto`, () => {
    const autoWrapper = new IPFSWrapper(options);
    expect(autoWrapper.IPFS).to.be.undefined;
  });

  describe(`Saves and Retrieves`, () => {
    let wrapper!: IPFSWrapper;
    let cid: CID;
    before(() => {
      wrapper = new IPFSWrapper(options);
      wrapper.create();
    });

    it(`Saves`, async () => {
      const result = await wrapper.add(`hello world`);
      cid = result.cid;
      expect(cid).to.not.be.undefined;
    });

    it(`Retrieves`, async () => {
      const result = await wrapper.get(cid);
      expect(result).to.be.eq(`hello world`);
    });
  })
})
