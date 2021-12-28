import BigNumber from 'bignumber.js';
import truffleAssert from 'truffle-assertions';
import sablierUtils from '../sablier.utils';

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
      await truffleAssert.reverts(_this.sablier.getStream({ streamId }), 'stream does not exist');
    });
  });
});
