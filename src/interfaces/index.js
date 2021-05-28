/* eslint-disable global-require , import/no-unresolved, import/no-extraneous-dependencies */
const index = {
  staking: require('../contracts/StakingContract.json'),
  tokenlock: require('../contracts/ERC20TokenLock.json'),
  ierc20: require('../contracts/Token.json'),
  erc721collectibles: require('../contracts/ERC721Colectibles.json'),
  erc721standard: require('../contracts/ERC721Standard.json'),
  beproNetwork: require('../contracts/BEPRONetwork.json'),
  openerRealFvr: require('../contracts/OpenerRealFvr.json'),
};

module.exports = index;
