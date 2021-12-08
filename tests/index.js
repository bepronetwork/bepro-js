/* eslint-disable global-require */

context('Unit Tests', async () => {
  require('./application');
  require('./votingContract');
  require('./generics');
  require('./bepro/network');
  require('./erc20Contract');
  require('./erc721Collectibles');
  require('./dexStorage');
  require('./erc20TokenLock');
  require('./stakingContract');
  require('./custom/realfvr/index');
});
