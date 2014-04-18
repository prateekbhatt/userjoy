describe('Resource /query', function () {

  /**
   * npm dependencies
   */

  var async = require('async');
  var qs = require('qs');


  /**
   * fixtures
   */

  var UserFixture = require('../../fixtures/UserFixture');
  var SessionFixture = require('../../fixtures/SessionFixture');


  /**
   * test variables
   */

  var aid;
  var uids = [];


  before(function (done) {


    async.series({

        setupTestDb: setupTestDb,

        createUserFixtures: function (cb) {

          aid = saved.apps.first._id;
          UserFixture(aid, 10, function (err, uids) {
            uids = uids;
            cb(err);
          });

        },

        createSessionFixtures: function (cb) {
          SessionFixture(aid, uids, 10, cb);
        }

      },

      done);
  });

  describe('GET /query', function () {

    var aid;
    var url;

    var obj = {};


    beforeEach(function () {
      obj = {
        list: 'users',
        op: '$and',
        filters: [

          {
            method: 'count',
            type: 'pageview',
            name: 'Define Segment',
            op: '$gt',
            val: 1
          },

          {
            method: 'attr',
            name: 'healthScore',
            op: '$lt',
            val: 30
          }
        ]
      };
      aid = saved.apps.first._id.toString();
      obj.aid = aid;
    });


    it('should return unauthorized error if not logged in', function (done) {

      url = '/query?' + qs.stringify(obj);

      request
        .get(url)
        .expect('Content-Type', /json/)
        .expect({
          status: 401,
          error: 'Unauthorized',
        })
        .expect(401)
        .end(done);

    });

    it('logging in user', function (done) {
      loginUser(done);
    });

    it('should return bad request error if aid not provided', function (
      done) {

      delete obj.aid;
      url = '/query?' + qs.stringify(obj);

      request
        .get(url)
        .set('cookie', loginCookie)
        .expect('Content-Type', /json/)
        .expect({
          status: 400,
          error: 'Provide a valid app id',
        })
        .expect(400)
        .end(done);

    });


    it('should fetch users matching given filters', function (done) {

      url = '/query?' + qs.stringify(obj);

      request
        .get(url)
        .set('cookie', loginCookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function (res) {

          if (!res.body.length) {
            return 'No user found'
          }
        })
        .end(done);

    });


    it('should return empty array if not users matched', function (done) {

      // push a filter with random attr
      obj.filters.push({
        method: 'attr',
        name: 'randomAttrWhichDoesnotExist',
        op: '$eq',
        val: 'randomValHere'
      })

      url = '/query?' + qs.stringify(obj);

      request
        .get(url)
        .set('cookie', loginCookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function (res) {

          if (!(res.body instanceof Array)) {
            return 'should return an array';
          }

          if (res.body.length) {
            return 'should not match any users';
          }
        })
        .end(done);

    });


  });

});
