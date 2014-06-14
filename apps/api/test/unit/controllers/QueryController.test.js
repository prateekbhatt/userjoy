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


  /**
   * models
   */

  var User = require('../../../api/models/User');


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

          EventFixture(aid, userIds, 1000, cb);
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
            method: 'hasdone',
            type: 'track',
            name: 'Create Message'
          },

          {
            method: 'attr',
            name: 'healthScore',
            op: 'gt',
            val: 10
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

          expect(res.body)
            .to.be.an("array");

          expect(res.body)
            .to.not.be.empty;

        })
        .end(done);

    });


    it(
      'should return empty array if query has hasdone and hasnotdone filters on the same event',

      function (done) {

        var newObj = {
          list: 'users',
          op: 'and',
          filters: [

            {
              method: 'hasdone',
              type: 'track',
              name: 'Define Segment'
            },

            {
              method: 'hasnotdone',
              type: 'track',
              name: 'Define Segment'
            }
          ]
        };

        var newUrl = '/apps/' + aid + '/query?' + qs.stringify(newObj);

        request
          .get(newUrl)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {

            expect(res.body)
              .to.be.an("array");

            expect(res.body)
              .to.be.empty;

            User.count(function (err, count) {
              expect(count)
                .to.be.above(0);
              done(err);
            })

          });

      });

    it('should run count query',

      function (done) {

        var newObj = {
          list: 'users',
          op: 'and',
          filters: [

            {
              method: 'count',
              type: 'track',
              name: 'Define Segment',
              op: 'gt',
              val: 0
            }
          ]
        };

        var newUrl = '/apps/' + aid + '/query?' + qs.stringify(newObj);

        request
          .get(newUrl)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {

            expect(res.body)
              .to.be.an("array");

            expect(res.body)
              .to.not.be.empty;

            done(err);

          });

      });

    it('should return empty array if no users matched', function (done) {

      // push a filter with random attr
      obj.filters.push({
        method: 'attr',
        name: 'randomAttrWhichDoesnotExist',
        op: 'eq',
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

          expect(res.body)
            .to.be.an("array");

          expect(res.body)
            .to.be.empty;
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


    it('should return userAttributes/events on which to query',
      function (done) {

        request
          .get(url)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function (res) {

            expect(res.body.events)
              .to.be.an("array")
              .and.to.not.be.empty;

            _.each(res.body.events, function (e) {

              expect(e)
                .to.have.property('type');

              expect(e)
                .to.have.property('name');

              expect(_.contains(['auto', 'form', 'link', 'page',
                'track'
              ], e.type))
                .to.be.true;

            });


            expect(res.body.userAttributes)
              .to.contain("user_id");

            expect(res.body.userAttributes)
              .to.contain("email");
          })
          .end(done);

      });


  });

});
