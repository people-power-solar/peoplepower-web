import { expect } from 'chai';
import { toggleValidColor } from '../../src/lib/adminUtils';

describe('adminUtils', function() {
  describe('#toggleValidColor', function() {
    it('should return "b-is-not-valid" for a blank input with type 0', function(done) {
      const ret = toggleValidColor('testcolor', 0);

      expect(ret).to.be.a('string');
      expect(ret).to.equal('b-is-not-valid');
      done();
    });
  });
});
