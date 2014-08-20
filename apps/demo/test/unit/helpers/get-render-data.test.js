describe('Helper get-render-data', function () {

  /**
   * Helpers
   */

  var getRenderData = require('../../../helpers/get-render-data');
  var metadata = require('../../../helpers/metadata');


  before(function (done) {
    setupTestDb(done);
  });

  describe('()', function () {

    var user;

    var output;

    beforeEach(function () {
      user = saved.users.first.toJSON();
      user.custom = metadata.toObject(user.custom);

      output = {
        user: {
          email: user.email,
          user_id: user.user_id,
          name: user.custom.name
        }
      }
    });


    it('should throw error if user.custom is array, not object', function () {

      function metaArray() {
        getRenderData({
          email: 'randomemail@example.com',
          custom: [{
            k: 'name',
            v: 'Prateek'
          }]
        })
      }

      expect(metaArray).to.throw('getRenderData "user.custom" must be an object');

    });


    it('should create locals object for automessage', function () {

      var locals = getRenderData(user);

      expect(locals)
        .to.have.property("user")
        .that.is.an("object")
        .that.deep.equals(output.user);
    });

  });
});
