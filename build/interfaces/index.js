'use strict'; /* eslint-disable global-require */
var index = {
  exchange: require('../../build/contracts/Exchange.json'),
  staking: require('../../build/contracts/StakingContract.json'),
  tokenlock: require('../../build/contracts/ERC20TokenLock.json'),
  ierc20: require('../../build/contracts/Token.json'),
  erc721collectibles: require('../../build/contracts/ERC721Colectibles.json'),
  erc721contract: require('../../build/contracts/ERC721Standard.json'),
  beproNetwork: require('../../build/contracts/BEPRONetwork.json'),
  openerRealFvr: require('../../build/contracts/OpenerRealFvr.json'),
  marketplaceRealFvr: require('../../build/contracts/MarketplaceRealFvr.json') };


module.exports = index;