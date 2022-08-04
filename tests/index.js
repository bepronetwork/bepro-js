import { assert } from 'chai';

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

    'timeLockProtocolMiningReward',
    'protocolMiningReward',

  ].map(test => {
    try {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require(`./${test}`);
    }
    catch (ex) {
      it(
        `failed to load test file '${test}'`,
        () => assert.fail(ex),
      );

      return ex;
    }
  });
});
