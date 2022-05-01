import BigNumber from 'bignumber.js';
import sablierUtils from '../sablier.utils';
import beproAssert from '../../../build/utils/beproAssert';

context('sablier.GetStream.context', async () => {
  // let sender;// = alice;
  // const opts = { from: sender };

  before('sablier.GetStream.before', async () => {
    await sablierUtils.initConfig();
    // sender = _this.alice;
  });

  describe('when the stream does not exist', () => {
    it('reverts', async () => {
      const streamId = new BigNumber(419863);
      await beproAssert.reverts(
        () => _this.sablier.getStream({ streamId }),
        'stream does not exist',
      );
    });
  });
});
