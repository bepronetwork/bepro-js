const BigNumber = require('bignumber.js');

// we are in './migrations' folder
const fs = require('fs');

const targetDir = '../build/contracts/';

// truffle looks for json files in '.build/contracts' folder so we copy them there
const UniswapV3FactoryJson = '../node_modules/@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json';
fs.writeFileSync(`${targetDir}UniswapV3Factory.json`, fs.readFileSync(UniswapV3FactoryJson));
const UniswapV3PoolJson = '../node_modules/@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';
fs.writeFileSync(`${targetDir}UniswapV3Pool.json`, fs.readFileSync(UniswapV3PoolJson));
const SwapRouterJson = '../node_modules/@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json';
fs.writeFileSync(`${targetDir}SwapRouter.json`, fs.readFileSync(SwapRouterJson));

// const NonfungibleTokenPositionDescriptorJson =
//  '../node_modules/@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json';
// fs.writeFileSync(targetDir + 'NonfungibleTokenPositionDescriptor.json', fs.readFileSync(NonfungibleTokenPositionDescriptorJson));

// NOTE: this is manually added into "artifacts/imported/..." folder and copied into "build/contracts" folder for convenience
// this is so because it had to be compiled with truffle as uniswap-v3-periphery compiles contracts with hardhat,
// compiled contracts that require a library to be linked, generate a different bytecode style for library bytecode section.
/// const NonfungibleTokenPositionDescriptorJson =
///  '../artifacts/imported/uniswap-v3-periphery/NonfungibleTokenPositionDescriptor.json';
/// fs.writeFileSync(targetDir + 'NonfungibleTokenPositionDescriptor.json', fs.readFileSync(NonfungibleTokenPositionDescriptorJson));

const NonfungiblePositionManagerJson = '../node_modules/@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json';
fs.writeFileSync(`${targetDir}NonfungiblePositionManager.json`, fs.readFileSync(NonfungiblePositionManagerJson));

const NFTDescriptorJson = '../node_modules/@uniswap/v3-periphery/artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json';
fs.writeFileSync(`${targetDir}NFTDescriptor.json`, fs.readFileSync(NFTDescriptorJson));

const UniswapV3Factory = artifacts.require('UniswapV3Factory');
// const UniswapV3Pool = artifacts.require('UniswapV3Pool');
const SwapRouter = artifacts.require('SwapRouter');
/// const NonfungibleTokenPositionDescriptor = artifacts.require("NonfungibleTokenPositionDescriptor");
// const NonfungiblePositionManager = artifacts.require('NonfungiblePositionManager');
const NFTDescriptor = artifacts.require('NFTDescriptor');

// uniswap-v3-periphery/contracts/interfaces/external/IWETH9.sol
// const IWETH9 = artifacts.require("@uniswap/v3-periphery/artifacts/contracts/interfaces/external/IWETH9.sol/IWETH9.json");
// const ERC20Mock = artifacts.require("./ERC20Mock.sol");
const Token = artifacts.require('./Token');

// const addressDir = './';

module.exports = async (deployer, network, accounts) => {
// async function doDeploy(deployer, network, accounts) {
  // console.log('...3_deploy_uniswapV3...');
  // await deployer.deploy(Sablier);
  // const sablier = await Sablier.deployed();

  await deployer.deploy(Token, 'Token0', 'TKN', new BigNumber(100 * (1e18)), accounts[0]);
  // const token = await Token.deployed();

  // deploy tokenA for uniswap pool, WETH
  // await deployer.deploy(Token, "WrappedETH", "WETH", new BigNumber(100*(1e18)), accounts[0]);
  // const weth = await Token.deployed();
  const weth = await Token.new('WrappedETH', 'WETH', new BigNumber(100 * (1e18)), accounts[0]);

  // deploy tokenB for uniswap pool, Liquidity Provider Token LPT
  // await deployer.deploy(Token, "Liquidity Provider Token", "LPT", new BigNumber(100*(1e18)), accounts[0]);
  // const lpToken = await Token.deployed();
  // const lpToken = await Token.new('Liquidity Provider Token', 'LPT', new BigNumber(100 * (1e18)), accounts[0]);

  await deployer.deploy(UniswapV3Factory);
  const factory = await UniswapV3Factory.deployed();

  // TODO: throws error
  // await deployer.deploy(UniswapV3Pool, { from: factory.address });
  // const pool = await UniswapV3Pool.deployed();

  await deployer.deploy(SwapRouter, factory.address, weth.address);
  await SwapRouter.deployed();

  /// const fee = 3000; // 0.3% trading fee
  /// const tx = await factory.createPool({
  ///  tokenA: weth.address,
  ///  tokenB: lpToken.address,
  ///  fee,
  /// );
  /// const poolAddress = tx.logs[0].args.pool;
  /// console.log('...deployed uniswapV3 WETH/LPT tx: ', tx);
  /// console.log('...deployed uniswapV3 WETH/LPT poolAddress: ', poolAddress);

  await deployer.deploy(NFTDescriptor);
  await NFTDescriptor.deployed();
  // console.log('nftDescriptor.address: ', nftDescriptor.address);
  // link NFTDescriptor lib to NonfungibleTokenPositionDescriptor contract
  // NOTE: make sure NonfungibleTokenPositionDescriptor is compiled with truffle
  /// await deployer.link(NFTDescriptor, NonfungibleTokenPositionDescriptor);

  // NOT compiling with truffle, link library will fail and will throw this error:
  // >NonfungibleTokenPositionDescriptor contains unresolved libraries.
  // >You must deploy and link the following libraries before you can deploy
  // >a new version of NonfungibleTokenPositionDescriptor: $cea9be979eee3d87fb124d6cbb244bb0b5$.
  /// await deployer.deploy(NonfungibleTokenPositionDescriptor, weth.address);
  /// const nonfungibleTokenPositionDescriptor = await NonfungibleTokenPositionDescriptor.deployed();

  // const fakeNFTPositionDescriptor = await Token.new("fakeNFTPositionDescriptor", "FTKN", new BigNumber(100*(1e18)), accounts[0]);
  // await deployer.deploy(NonfungiblePositionManager, factory.address, weth.address, fakeNFTPositionDescriptor.address);
  /// await deployer.deploy(NonfungiblePositionManager, factory.address, weth.address, nonfungibleTokenPositionDescriptor.address);
  /// const nonfungiblePositionManager = await NonfungiblePositionManager.deployed();

  // initialize pool with sqrt encoded price
  // await nonfungiblePositionManager.createAndInitializePoolIfNecessary(token0, token1, fee, encodePriceSqrt(1, 1));

  // fs.writeFileSync(addressDir + 'NonfungibleTokenPositionDescriptor_address.txt', nonfungibleTokenPositionDescriptor.address);
  // NOTE: this does nothing, fails to write to file:
  /// fs.writeFileSync('NonfungiblePositionManager_address.txt', nonfungiblePositionManager.address);
  /// console.log('...nonfungiblePositionManager.address: ', nonfungiblePositionManager.address);
  // console.log('...uniswapV3 migration finished!');

  // if (network !== 'development') {
  //   return;
  // }

  /* const allowance = new BigNumber(3600).multipliedBy(1e18).toString(10);

  await deployer.deploy(ERC20Mock);
  const erc20 = await ERC20Mock.deployed();
  await erc20.mint(accounts[0], allowance);
  await erc20.approve(sablier.address, allowance, { from: accounts[0] });
  */

  /* const recipient = accounts[1];
  const deposit = allowance;
  const tokenAddress = erc20.address;
  const { timestamp } = await web3.eth.getBlock("latest");
  const startTime = new BigNumber(timestamp).plus(300);
  const stopTime = startTime.plus(3600);

  await sablier.createStream(recipient, deposit, tokenAddress, startTime, stopTime, { from: accounts[0] }); */
};

/* module.exports = async (deployer, network, accounts) => {
  deployer.then(async () => {
    await doDeploy(deployer, network, accounts);
  });
}; */
