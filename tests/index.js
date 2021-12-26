/* eslint-disable global-require */

context('Unit Tests', async () => {
  require('./application');
  require('./generics');
  require('./dexStorage');

  require('./erc20Contract');
  require('./erc20TokenLock');

  require('./erc721Collectibles');

  require('./stakingContract');
  require('./votingContract');

  require('./bepro/network');
  require('./bepro/networkFactory');

  require('./custom/realfvr/index');

  require('./sablier/sablier');
  require('./custom/loophole/loophole');
});
