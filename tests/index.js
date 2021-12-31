context('Unit Tests', async () => {
  [
    'application',
    'generics',
    'dexStorage',

    'erc20Contract',
    'erc20TokenLock',

    'erc721Collectibles',

    'stakingContract',
    'votingContract',

    'bepro/network',
    'bepro/networkFactory',

    'custom/realfvr/index',

    'sablier/sablier',
    'custom/loophole/loophole',
  ].map(test => {
    try {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require(`./${test}`);
    }
    catch (ex) {
      // eslint-disable-next-line no-console
      console.error(ex);
      return ex;
    }
  });
});
