import {
  defaultWeb3Connection,
  erc20Deployer, getChainDate,
  getPrivateKeyFromFile,
  hasTxBlockNumber, increaseTime,
  modelExtensionDeployer, revertChain,
} from '../utils';
import {Account} from 'web3-core';
import {CERC20, ERC20, ETHUtils, Sablier} from '../../src';
import {
  AMOUNT_1M,
  INITIAL_EXCHANGE_RATE,
  SALARY,
  STANDARD_SABLIER_FEE, START_TIME_DELTA, START_TIME_OFFSET,
} from '../utils/constants';
import {toSmartContractDate, toSmartContractDecimals} from '../../src';
import {addSeconds} from 'date-fns'
import {expect} from 'chai';

describe(`Sablier`, () => {
  const web3Connection = defaultWeb3Connection();

  let Alice: Account;
  let Bob: Account;
  let Admin: Account;


  let ethUtils: ETHUtils;
  let erc20: ERC20;
  let cerc20: CERC20;
  let sablier: Sablier;

  let contractAddress: string;
  let erc20ContractAddress: string;

  before(async () => {
    await web3Connection.start();
    await revertChain(web3Connection.Web3);
    Alice = await web3Connection.Web3.eth.accounts.privateKeyToAccount(getPrivateKeyFromFile(1));
    Bob = await web3Connection.Web3.eth.accounts.privateKeyToAccount(getPrivateKeyFromFile(2));
    Admin = await web3Connection.Web3.eth.accounts.privateKeyToAccount(getPrivateKeyFromFile());

    const ethUtilsTx = await modelExtensionDeployer(web3Connection, ETHUtils);
    ethUtils = new ETHUtils(web3Connection, ethUtilsTx.contractAddress);
    await ethUtils.loadContract();

    const erc20Tx = await erc20Deployer(`My Sablier`, `$sablier`, toSmartContractDecimals(AMOUNT_1M) as number, web3Connection);
    erc20 = new ERC20(web3Connection, erc20Tx.contractAddress);
    await erc20.loadContract();

    const cercTx = await modelExtensionDeployer(web3Connection, CERC20, [erc20.contractAddress, INITIAL_EXCHANGE_RATE, 18]);
    cerc20 = new CERC20(web3Connection, cercTx.contractAddress, erc20.contractAddress!);
    await cerc20.loadContract();

    await web3Connection.switchToAccount(Admin.privateKey); // go back to the original account that created contracts
    await erc20.transferTokenAmount(Alice.address, SALARY);
    await erc20.transferTokenAmount(Bob.address, SALARY);

    await erc20.approve(cerc20.contractAddress!, AMOUNT_1M);
    await cerc20.supplyUnderlying(SALARY);

    erc20ContractAddress = erc20.contractAddress!;
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

      startTime = addSeconds(startTime, START_TIME_OFFSET);
      const endTime = addSeconds(startTime, START_TIME_DELTA);

      const stream = await sablier.createStream(Bob.address,
                                                SALARY,
                                                erc20ContractAddress,
                                                toSmartContractDate(Math.round(+startTime)),
                                                toSmartContractDate(Math.round(+endTime)));

      const events = await sablier.contract.self.getPastEvents(`CreateStream`, {fromBlock: stream.blockNumber});

      expect(events[0].returnValues['streamId']).to.not.be.empty;
      streamId = events[0].returnValues['streamId'];
    });

    it(`Gets stream`, async () => {
      const stream = await sablier.getStream(streamId);
      expect(stream.tokenAddress).to.be.eq(erc20ContractAddress);
    });

    it(`Withdraw from stream`, async () => {
      await increaseTime(START_TIME_OFFSET + START_TIME_DELTA + 5, web3Connection.Web3);
      const balance = await erc20.getTokenAmount(Bob.address);
      await hasTxBlockNumber(sablier.withdrawFromStream(streamId, SALARY / 2));
      const newBalance = await erc20.getTokenAmount(Bob.address);

      expect(newBalance).to.be.eq(balance + (SALARY / 2));
    });

  })
})
