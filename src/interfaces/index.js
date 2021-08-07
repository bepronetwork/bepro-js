/* eslint-disable global-require , import/no-unresolved, import/no-extraneous-dependencies */
const index = {
  staking: require('../contracts/StakingContract.json'),
  voting: require('../contracts/Votable.json'),
  tokenlock: require('../contracts/ERC20TokenLock.json'),
  ierc20: require('../contracts/Token.json'),
  erc721collectibles: require('../contracts/ERC721Colectibles.json'),
  erc721standard: require('../contracts/ERC721Standard.json'),
  network: require('../contracts/Network.json'),
  openerRealFvr: require('../contracts/OpenerRealFvr.json'),
  sablier: require('../contracts/Sablier.json'),
  cerc20mock: require('../contracts/CERC20Mock.json'),
  erc20mock: require('../contracts/ERC20Mock.json'),
  ethutils: require('../contracts/ETHUtils.json'),
  loophole: require('../contracts/Loophole.json'),
  uniswapFactory: require('../contracts/UniswapV3Factory.json'),
  uniswapPool: require('../contracts/UniswapV3Pool.json'),
  swapRouter: require('../contracts/SwapRouter.json'),
};

module.exports = index;
