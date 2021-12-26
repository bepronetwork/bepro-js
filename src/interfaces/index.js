/* eslint-disable global-require , import/no-unresolved, import/no-extraneous-dependencies */
const index = {
  ierc20: require('../contracts/Token.json'),
  erc20distribution: require('../contracts/ERC20Distribution.json'),
  tokenlock: require('../contracts/ERC20TokenLock.json'),

  erc721collectibles: require('../contracts/ERC721Colectibles.json'),
  erc721standard: require('../contracts/ERC721Standard.json'),

  network: require('../contracts/Network.json'),
  networkFactory: require('../contracts/NetworkFactory.json'),

  staking: require('../contracts/StakingContract.json'),
  voting: require('../contracts/Votable.json'),

  marketplaceRealFvr: require('../contracts/MarketplaceRealFvr.json'),
  openerRealFvr: require('../contracts/OpenerRealFvr.json'),

  cerc20mock: require('../contracts/CERC20Mock.json'),
  erc20mock: require('../contracts/ERC20Mock.json'),
  ethutils: require('../contracts/ETHUtils.json'),
  loophole: require('../contracts/Loophole.json'),

  sablier: require('../contracts/Sablier.json'),
  uniswapFactory: require('../contracts/UniswapV3Factory.json'),
  uniswapPool: require('../contracts/UniswapV3Pool.json'),
  swapRouter: require('../contracts/SwapRouter.json'),
  uniswapCallee: require('../contracts/TestUniswapV3Callee.json'),
  uniswapRouterBridge: require('../contracts/TestUniswapV3RouterBridge.json'),
  tickMathTest: require('../contracts/TickMathTest.json'),
  // uniswapPoolSwapTest: require('../contracts/UniswapV3PoolSwapTest.json'),
};

module.exports = index;
