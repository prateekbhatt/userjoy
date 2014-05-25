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
      user.meta = metadata.toObject(user.meta);

      output = {
        user: {
          user_id: user.user_id,
          email: user.email,
          name: user.meta.name
        }
      }
    });


    it('should throw error if user.meta is array, not object', function () {

      function metaArray() {
        getRenderData({
          email: 'randomemail@example.com',
          meta: [{
            k: 'name',
            v: 'Prateek'
          }]
        })
      }

      expect(metaArray).to.throw('getRenderData "user.meta" must be an object');

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
