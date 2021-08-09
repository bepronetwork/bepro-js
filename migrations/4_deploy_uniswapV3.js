/* global artifacts, web3 */
const BigNumber = require("bignumber.js");

// we are in './migrations' folder
var fs = require('fs');
const targetDir = '../build/contracts/';

// truffle looks for json files in '.build/contracts' folder so we copy them there
const UniswapV3FactoryJson = '../node_modules/' + '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json';
fs.writeFileSync(targetDir + 'UniswapV3Factory.json', fs.readFileSync(UniswapV3FactoryJson));
const UniswapV3PoolJson = '../node_modules/' + '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';
fs.writeFileSync(targetDir + 'UniswapV3Pool.json', fs.readFileSync(UniswapV3PoolJson));
const SwapRouterJson = '../node_modules/' + '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json';
fs.writeFileSync(targetDir + 'SwapRouter.json', fs.readFileSync(SwapRouterJson));

const UniswapV3Factory = artifacts.require("UniswapV3Factory");
const UniswapV3Pool = artifacts.require("UniswapV3Pool");
const SwapRouter = artifacts.require("SwapRouter");

//uniswap-v3-periphery/contracts/interfaces/external/IWETH9.sol
//const IWETH9 = artifacts.require("@uniswap/v3-periphery/artifacts/contracts/interfaces/external/IWETH9.sol/IWETH9.json");
//const ERC20Mock = artifacts.require("./ERC20Mock.sol");
const Token = artifacts.require("./Token");

module.exports = async (deployer, network, accounts) => {
  console.log('...4_deploy_uniswapV3...');
  //await deployer.deploy(Sablier);
  //const sablier = await Sablier.deployed();
  
  await deployer.deploy(UniswapV3Factory);
  const factory = await UniswapV3Factory.deployed();
  
  //TODO: throws error
  //await deployer.deploy(UniswapV3Pool, { from: factory.address });
  //const pool = await UniswapV3Pool.deployed();
  
  await deployer.deploy(Token, "Token0", "TKN", new BigNumber(100*(1e18)), accounts[0]);
  const token = await Token.deployed();
  
  //token is WETH9 interface
  await deployer.deploy(SwapRouter, factory.address, token.address);
  const swapRouter = await SwapRouter.deployed();
  
  // deploy tokenA for uniswap pool, WETH
  //await deployer.deploy(Token, "WrappedETH", "WETH", new BigNumber(100*(1e18)), accounts[0]);
  //const weth = await Token.deployed();
  const weth = await Token.new("WrappedETH", "WETH", new BigNumber(100*(1e18)), accounts[0]);
  
  // deploy tokenB for uniswap pool, Liquidity Provider Token LPT
  //await deployer.deploy(Token, "Liquidity Provider Token", "LPT", new BigNumber(100*(1e18)), accounts[0]);
  //const lpToken = await Token.deployed();
  const lpToken = await Token.new("Liquidity Provider Token", "LPT", new BigNumber(100*(1e18)), accounts[0]);
  
  ///const fee = 3000; // 0.3% trading fee
  ///const tx = await factory.createPool(weth.address, lpToken.address, fee);
  ///const poolAddress = tx.logs[0].args.pool;
  ///console.log('...deployed uniswapV3 WETH/LPT tx: ', tx);
  ///console.log('...deployed uniswapV3 WETH/LPT poolAddress: ', poolAddress);

  if (network !== "development") {
    return;
  }
  
  /*const allowance = new BigNumber(3600).multipliedBy(1e18).toString(10);
  
  await deployer.deploy(ERC20Mock);
  const erc20 = await ERC20Mock.deployed();
  await erc20.mint(accounts[0], allowance);
  await erc20.approve(sablier.address, allowance, { from: accounts[0] });
  */
  
  /*const recipient = accounts[1];
  const deposit = allowance;
  const tokenAddress = erc20.address;
  const { timestamp } = await web3.eth.getBlock("latest");
  const startTime = new BigNumber(timestamp).plus(300);
  const stopTime = startTime.plus(3600);

  await sablier.createStream(recipient, deposit, tokenAddress, startTime, stopTime, { from: accounts[0] });*/
};
