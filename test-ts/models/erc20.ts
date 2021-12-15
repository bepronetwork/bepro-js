import ERC20 from '@models/erc20';
import Web3ConnectionOptions from '@interfaces/web3-connection-options';
import Web3Connection from '@base/web3-connection';
import {expect} from 'chai';
import {fromDecimals} from '@utils/numbers';

describe.only(`ERC20`, () => {
  let erc20: ERC20;
  let deployer: ERC20;
  let erc20ContractAddress = process.env.ERC20_ADDRESS;

  const cap = 10;
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
    });
  }

  describe(`new ERC20 Contract methods`, () => {
    before(async () => {
      erc20 = new ERC20(web3Connection, erc20ContractAddress);
      await erc20.start();
    });

    it(`ERC20 name, symbol, cap and distributionAddress match`, async () => {
      expect(await erc20.totalSupply()).to.eq(+fromDecimals(10, erc20.decimals, true))
      expect(await erc20.name()).to.eq(name)
      expect(await erc20.symbol()).to.eq(symbol)
    })
  })
})
