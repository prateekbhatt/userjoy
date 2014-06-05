describe('Helper api-key', function () {

  var apiKey = require('../../../helpers/api-key');

  describe('#new', function () {

    it('should return a new key for live env', function () {
      var a = apiKey.new('live');

      expect(a)
        .to.not.be.empty;

      expect(a.split('_')[0])
        .to.eql('live');
    });


    it('should return a new key for test env', function () {
      var a = apiKey.new('test');

      expect(a)
        .to.not.be.empty;

      expect(a.split('_')[0])
        .to.eql('test');
    });


    it('should throw error if env is neither live nor test', function () {
      var a = function () {
        return apiKey.new('random');
      }

      expect(a)
        .to.
      throw ('Environment must be "test" or "live"');
    });

  });
});
