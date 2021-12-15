import ERC20 from '@models/erc20';
import Web3ConnectionOptions from '@interfaces/web3-connection-options';
import Web3Connection from '@base/web3-connection';
import {expect} from 'chai';
import {fromDecimals, toSmartContractDecimals} from '@utils/numbers';
import {describe} from 'mocha';

describe(`ERC20`, () => {
  let erc20: ERC20;
  let deployer: ERC20;
  let erc20ContractAddress = process.env.ERC20_ADDRESS;
  let total = 0;
  let contractExisted = !!erc20ContractAddress;

  const cap = toSmartContractDecimals(10, 18, true) as number;
  const name = `BEPRO`;
  const symbol = `$BEPRO`;

  const options: Web3ConnectionOptions = {
    web3Host: process.env.WEB3_HOST_PROVIDER,
    privateKey: process.env.WALLET_PRIVATE_KEY,
    skipWindowAssignment: true,
  }

  const web3Connection = new Web3Connection(options);

  if (!erc20ContractAddress) {
    it(`Deploys a ERC20 Contract`, async () => {
      deployer = new ERC20(web3Connection);
      await deployer.start();
      const address = await deployer.connection.getAddress();
      const receipt = await deployer.deployJsonAbi(name, symbol, cap, address);

      expect(receipt.contractAddress).to.not.eq(deployer.contractAddress);
      erc20ContractAddress = receipt.contractAddress!;
      console.log(`Deployed new ERC20 Contract:`, erc20ContractAddress);
    });
  }

  describe(`new ERC20 Contract methods`, () => {
    before(async () => {
      erc20 = new ERC20(web3Connection, erc20ContractAddress);
      await erc20.start();
    });

    it(`ERC20 name, symbol, cap and distributionAddress match`, async () => {
      total = +fromDecimals(cap, erc20.decimals || 18, true);
      expect(await erc20.totalSupply(), `totalSupply`).to.eq(total)
      expect(await erc20.name(), `Name`).to.eq(name);
      expect(await erc20.symbol(), `Symbol`).to.eq(symbol);

      if (contractExisted)
        expect(await erc20.getTokenAmount(web3Connection.Account.address)).to.be.greaterThan(0);
      else
        expect(await erc20.getTokenAmount(web3Connection.Account.address)).to.eq(total);
    });

    it(`Approves usage`, async () => {
      const approval = await erc20.approve(web3Connection.Account.address, total);
      expect(approval).to.not.be.empty;
    });

    it(`isApproved`, async () => {
      const approved = await erc20.isApproved(web3Connection.Account.address, total);
      expect(approved).to.be.true;
    })

    it(`Transfers some tokens`, async () => {
      const newAccount = web3Connection.Web3.eth.accounts.create(`0xB3pR0Te511Ng`);
      const transfer = await erc20.transferTokenAmount(newAccount.address, 1)
      expect(transfer).to.not.be.empty;
    });

    it(`Checks that transfer was successful`, async () => {
      expect(await erc20.getTokenAmount(web3Connection.Account.address)).to.be.lessThanOrEqual(total - 1);
    });
  });
});
