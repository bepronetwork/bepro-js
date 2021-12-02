/* eslint-disable global-require , import/no-unresolved, import/no-extraneous-dependencies */
const index = {
  staking: require('../contracts/StakingContract.json'),
  voting: require('../contracts/Votable.json'),
  tokenlock: require('../contracts/ERC20TokenLock.json'),
  ierc20: require('../contracts/Token.json'),
  erc721collectibles: require('../contracts/ERC721Colectibles.json'),
  erc721standard: require('../contracts/ERC721Standard.json'),
  network: require('../contracts/Network.json'),
  networkFactory: require('../contracts/NetworkFactory.json'),
  openerRealFvr: require('../contracts/OpenerRealFvr.json'),
  marketplaceRealFvr: require('../contracts/MarketplaceRealFvr.json'),
};

module.exports = index;
