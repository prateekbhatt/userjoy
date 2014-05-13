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
  var EventFixture = require('../../fixtures/EventFixture');


  /**
   * test variables
   */

  var aid;
  var userIds = [];


  before(function (done) {


    async.series({

        setupTestDb: setupTestDb,

        createUserFixtures: function (cb) {

          aid = saved.apps.first._id;
          UserFixture(aid, 10, function (err, uids) {
            userIds = uids;
            cb(err);
          });

        },

        createEventFixtures: function (cb) {

          if (_.isEmpty(userIds)) {
            return done(new Error(
              'QueryController test; createUserFixtures sets empty uids array'
            ));
          }

          EventFixture(aid, userIds, 10, cb);
        }

      },

      done);
  });

  describe('GET /apps/:aid/query', function () {

    var aid;
    var url;

    var obj = {};


    beforeEach(function () {
      obj = {
        list: 'users',
        op: 'and',
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
      url = '/apps/' + aid + '/query?' + qs.stringify(obj);
    });


    it('should return unauthorized error if not logged in', function (done) {

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


    it('should fetch users matching given filters', function (done) {

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

      // recreate query string
      url = '/apps/' + aid + '/query?' + qs.stringify(obj);

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

  describe('GET /apps/:aid/query/attributes', function () {

    var aid;
    var url;

    beforeEach(function () {
      aid = saved.apps.first._id.toString();
      url = '/apps/' + aid + '/query/attributes';
    });


    it('should return unauthorized error if not logged in', function (done) {

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


    it('should fetch users matching given filters', function (done) {

      request
        .get(url)
        .set('cookie', loginCookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function (res) {

          if (_.isEmpty(res.body.eventNames)) {
            return 'No eventNames found'
          }

          expect(res.body.userAttributes)
            .to.contain("user_id");

          expect(res.body.userAttributes)
            .to.contain("email");
        })
        .end(done);

    });


  });

});
