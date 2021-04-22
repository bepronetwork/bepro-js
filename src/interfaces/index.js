/* eslint-disable global-require */
const index = {
  exchange: require('../../build/contracts/Exchange.json'),
  staking: require('../../build/contracts/StakingContract.json'),
  ierc20: require('../../build/contracts/Token.json'),
  erc721collectibles: require('../../build/contracts/ERC721Colectibles.json'),
  erc721standard: require('../../build/contracts/ERC721Standard.json'),
};

export default index;
