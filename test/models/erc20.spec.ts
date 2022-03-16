import 'dotenv/config';
import {ERC20} from '@models/erc20';
import {expect} from 'chai';
import {toSmartContractDecimals} from '@utils/numbers';
import {describe} from 'mocha';
import {defaultWeb3Connection, erc20Deployer, getPrivateKeyFromFile, shouldBeRejected,} from '../utils/';
import {Web3Connection, Web3Contract} from '../../src';

describe(`ERC20`, () => {
  let erc20: ERC20;
  let erc20ContractAddress: string;

  const capAmount = '1000';
  const cap = toSmartContractDecimals(capAmount, 18);
  const name = `BEPRO`;
  const symbol = `$BEPRO`;

  let web3Connection: Web3Connection;

  before(async () => {
    web3Connection = await defaultWeb3Connection(true, true)
  })

  it(`Deploys a ERC20 Contract`, async () => {
    const receipt = await erc20Deployer(name, symbol, cap, web3Connection);

    expect(receipt.contractAddress).to.not.be.empty;
    erc20ContractAddress = receipt.contractAddress!;
  });

  describe(`new ERC20 Contract methods`, () => {
    before(async () => {
      erc20 = new ERC20(web3Connection, erc20ContractAddress);
      await erc20.start();
    });

    it(`ERC20 name, symbol, cap and distributionAddress match`, async () => {
      expect(await erc20.totalSupply(), `totalSupply`).to.eq(+capAmount)
      expect(await erc20.name(), `Name`).to.eq(name);
      expect(await erc20.symbol(), `Symbol`).to.eq(symbol);

      expect(await erc20.getTokenAmount(web3Connection.Account.address)).to.eq(+capAmount);
    });

    it(`Approves usage`, async () => {
      const approval = await erc20.approve(web3Connection.Account.address, +capAmount);
      expect(approval, `approved hash`).to.not.be.empty;
    });

    it(`isApproved`, async () => {
      const approved = await erc20.isApproved(web3Connection.Account.address, +capAmount);
      expect(approved, `is approved`).to.be.true;
    })

    it(`Transfers some tokens`, async () => {
      const newAccount = web3Connection.Web3.eth.accounts.create(`0xB3pR0Te511Ng`);
      const transfer = await erc20.transferTokenAmount(newAccount.address, 1)
      expect(transfer).to.not.be.empty;
    });

    it(`Checks that transfer was successful`, async () => {
      expect(await erc20.getTokenAmount(web3Connection.Account.address)).to.be.lessThanOrEqual(+capAmount - 1);
    });

    it(`Approves other and other sends to himself`, async () => {
      const newAccount = web3Connection.Web3.eth.accounts.privateKeyToAccount(getPrivateKeyFromFile(1));
      const privateKey = newAccount.privateKey;
      const newAddress = newAccount.address;
      const web3con = new Web3Connection({privateKey, web3Host: web3Connection.options.web3Host});
      const _erc20 = new ERC20(web3con, erc20.contractAddress);

      const empty = new Web3Contract(web3Connection.Web3, [], undefined, {gasAmount: 90000, auto: true});
      await empty.sendSignedTx(web3Connection.Account, undefined as any, toSmartContractDecimals(1) as any as string, await empty.txOptions(undefined as any))

      await _erc20.start();
      await erc20.approve(newAddress, 1000);
      await _erc20.transferFrom(web3Connection.Account.address, newAddress, 3);

      expect(await erc20.getTokenAmount(newAddress)).to.eq(3);
      expect(await erc20.allowance(newAddress, web3Connection.Account.address)).to.be.eq(0)
      await shouldBeRejected(erc20.transferFrom(newAddress, web3Connection.Account.address, 3));
    });
  });

  after(() => {
    console.table(`\n\tERC20 Address:\t${erc20ContractAddress}`);
  });
});
