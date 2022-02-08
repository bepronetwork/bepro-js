import {
  defaultWeb3Connection,
  erc20Deployer, getChainDate,
  getPrivateKeyFromFile,
  hasTxBlockNumber,
  modelExtensionDeployer, revertChain,
} from '../utils';
import {Account} from 'web3-core';
import {CERC20, ERC20, ETHUtils, Sablier} from '../../src';
import {
  AMOUNT_1M,
  INITIAL_EXCHANGE_RATE,
  SALARY, STANDARD_RECIPIENT_SHARE_PERCENTAGE,
  STANDARD_SABLIER_FEE, STANDARD_SENDER_SHARE_PERCENTAGE, START_TIME_DELTA, START_TIME_OFFSET,
} from '../utils/constants';
import {toSmartContractDate, toSmartContractDecimals} from '../../src/utils/numbers';
import {addSeconds} from 'date-fns'
import {expect} from 'chai';

describe.skip(`Sablier`, () => {
  const web3Connection = defaultWeb3Connection();

  let Alice: Account;
  let Bob: Account;
  let Admin: Account;
  // let Carol: Account;
  // let John: Account;
  // let ActiveUser: Account;

  let ethUtils: ETHUtils;
  let erc20: ERC20;
  let cerc20: CERC20;
  let sablier: Sablier;

  let contractAddress: string;
  let erc20ContractAddress: string;
  let cerc20ContractAddress: string;

  before(async () => {
    await web3Connection.start();
    await revertChain(web3Connection.Web3);
    Alice = await web3Connection.Web3.eth.accounts.privateKeyToAccount(getPrivateKeyFromFile(1));
    Bob = await web3Connection.Web3.eth.accounts.privateKeyToAccount(getPrivateKeyFromFile(2));
    Admin = await web3Connection.Web3.eth.accounts.privateKeyToAccount(getPrivateKeyFromFile());
    // Carol = await web3Connection.Web3.eth.accounts.create(`Carol`);
    // John = await web3Connection.Web3.eth.accounts.create(`John`);

    const ethUtilsTx = await modelExtensionDeployer(web3Connection, ETHUtils);
    ethUtils = new ETHUtils(web3Connection, ethUtilsTx.contractAddress);
    await ethUtils.loadContract();

    const erc20Tx = await erc20Deployer(`My Sablier`, `$sablier`, toSmartContractDecimals(AMOUNT_1M) as number, web3Connection);
    erc20 = new ERC20(web3Connection, erc20Tx.contractAddress);
    await erc20.loadContract();

    const cercTx = await modelExtensionDeployer(web3Connection, CERC20, [erc20.contractAddress, INITIAL_EXCHANGE_RATE, 18]);
    cerc20 = new CERC20(web3Connection, cercTx.contractAddress, erc20.contractAddress!);
    await cerc20.loadContract();

    // const addresses = [Alice, Bob,].map(({address}) => address);
    // for (const address of addresses)
    //   await erc20.transferTokenAmount(address, 25000);

    // const privateKeys = [Alice, Bob, Carol, John].map(({privateKey}) => privateKey);
    // for (const privateKey of privateKeys) {
    //   // await web3Connection.switchToAccount(privateKey);
    //   // await cerc20.approve(contractAddress, AMOUNT_1M);
    // }

    await web3Connection.switchToAccount(Admin.privateKey); // go back to the original account that created contracts
    await erc20.transferTokenAmount(Alice.address, SALARY);
    await erc20.transferTokenAmount(Bob.address, SALARY);

    await erc20.approve(cerc20.contractAddress!, AMOUNT_1M);
    await cerc20.supplyUnderlying(SALARY);

    erc20ContractAddress = erc20.contractAddress!;
    cerc20ContractAddress = erc20.contractAddress!;
  });

  it(`Should deploy sablier`, async () => {
    const tx = await modelExtensionDeployer(web3Connection, Sablier);
    expect(tx.contractAddress).to.not.be.empty;
    contractAddress = tx.contractAddress!;
  });

  describe(`With sablier contract`, () => {
    let startTime = new Date(0);
    let streamId = 0;

    before(async () => {
      sablier = new Sablier(web3Connection, contractAddress);
      await sablier.loadContract();
      startTime = await getChainDate(web3Connection);
    });

    it(`Updates fee`, async () => {
      await hasTxBlockNumber(sablier.updateFee(+STANDARD_SABLIER_FEE));
      expect(await sablier.fee()).to.eq(+STANDARD_SABLIER_FEE/100);
    });

    it(`Creates a compounding stream`, async () => {

      await hasTxBlockNumber(erc20.approve(contractAddress, AMOUNT_1M), `Admin should have approved Sablier contract`);

      await web3Connection.switchToAccount(Bob.privateKey);
      await hasTxBlockNumber(erc20.approve(contractAddress, AMOUNT_1M), `Bob should have approved Sablier contract`);

      await web3Connection.switchToAccount(Admin.privateKey);

      startTime = addSeconds(startTime, START_TIME_OFFSET);
      const endTime = addSeconds(startTime, START_TIME_DELTA);

      const stream = await sablier.createCompoundingStream(Bob.address, SALARY, cerc20ContractAddress,
                                                           toSmartContractDate(Math.round(+startTime)),
                                                           toSmartContractDate(Math.round(+endTime)),
                                                           STANDARD_SENDER_SHARE_PERCENTAGE,
                                                           STANDARD_RECIPIENT_SHARE_PERCENTAGE);
      console.log(stream);
      // const events = await sablier.contract.self.getPastEvents(`CreateStream`, {fromBlock: stream.blockNumber});
      //
      // expect(events[0].returnValues['streamId']).to.not.be.empty;
      // streamId = events[0].returnValues['streamId'];
    });

    it.skip(`Gets stream`, async () => {
      const stream = await sablier.getStream(streamId);
      expect(stream.tokenAddress).to.be(erc20ContractAddress);
    });

    it.skip(`Takes earnings`, async () => {
      await hasTxBlockNumber(sablier.withdrawFromStream(streamId, 5));
      const balance = await cerc20.balanceOf(await web3Connection.getBalance());
      const earnings = await sablier.getEarnings(cerc20.contractAddress!);
      await hasTxBlockNumber(sablier.takeEarnings(cerc20.contractAddress!, earnings));
      const newBalance = await cerc20.balanceOf(await web3Connection.getBalance());

      expect(balance).to.be.eq(newBalance - earnings);
    });

  })
})
