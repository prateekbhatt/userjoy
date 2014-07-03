describe('Resource /apps/:aid/users', function () {

  /**
   * npm dependencies
   */

  var mongoose = require('mongoose');
  var moment = require('moment');

  var randomId = mongoose.Types.ObjectId;


  /**
   * models
   */

  var Event = require('../../../api/models/Event');


  /**
   * fixtures
   */

  var DailyReportFixture = require('../../fixtures/DailyReportFixture');
  var EventFixture = require('../../fixtures/EventFixture');


  before(function (done) {
    setupTestDb(done);
  });


  describe('GET /apps/:aid/users/:uid', function () {

    var aid, uid, testUrl;

    before(function (done) {
      aid = saved.apps.first._id;
      uid = saved.users.first._id;
      testUrl = '/apps/' + aid + '/users/' + uid;
      logoutUser(done);
    });


    it('returns error if not logged in',

      function (done) {

        request
          .get(testUrl)
          .expect('Content-Type', /json/)
          .expect(401)
          .end(done);
      });


    it('logging in user',

      function (done) {
        loginUser(done);
      });


    it('fetches app with given id',

      function (done) {

        request
          .get(testUrl)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {

            if (err) return done(err);

            expect(res.body)
              .to.have.property("_id", uid.toString());

            expect(res.body)
              .to.have.property("email");

            done();
          });

      });


    it('returns error if no user is found', function (done) {

      var testUrl = '/apps/' + aid + '/users/' + randomId();

      request
        .get(testUrl)
        .set('cookie', loginCookie)
        .expect('Content-Type', /json/)
        .expect(404)
        .expect({
          "error": "Not Found",
          "status": 404
        })
        .end(done);

    });
  });


  describe('GET /apps/:aid/users/:uid/conversations', function () {

    var aid, uid, testUrl;

    before(function (done) {
      aid = saved.apps.first._id;
      uid = saved.users.first._id;
      testUrl = '/apps/' + aid + '/users/' + uid + '/conversations';
      logoutUser(done);
    });


    it('should return error if not logged in', function (done) {

      request
        .get(testUrl)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done);
    });


    it('logging in user', function (done) {
      loginUser(done);
    });


    it('should return upto latest 10 conversations of user', function (
      done) {

      request
        .get(testUrl)
        .set('cookie', loginCookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {

          if (err) return done(err);

          expect(res.body)
            .to.be.an("array")
            .and.to.have.length.above(0);

          expect(res.body)
            .to.have.length.of.at.most(10);

          expect(res.body[0])
            .to.have.property('sub');

          expect(res.body[0])
            .to.have.property('unread')
            .that.is.a('boolean');

          expect(res.body[0])
            .to.have.property('closed');

          done();
        });

    });

  });


  describe('GET /apps/:aid/users/:uid/events', function () {

    var aid, uid, testUrl, today, yesterday;

    today = moment()
      .unix();

    yesterday = moment()
      .subtract('days', 1)
      .unix();

    before(function (done) {
      aid = saved.apps.first._id;
      uid = saved.users.first._id;
      testUrl = '/apps/' + aid + '/users/' + uid + '/events';

      async.series([

        function logout(cb) {
          logoutUser(cb);
        },

        function createEventForToday(cb) {

          Event.create({
            aid: aid,
            uid: uid,
            type: 'track',
            name: 'Clicked Notification Url',
            ct: today * 1000
          }, cb);
        },

        function createEventForYesterday(cb) {

          Event.create({
            aid: aid,
            uid: uid,
            type: 'track',
            name: 'Created Segment',
            ct: yesterday * 1000
          }, cb);
        }

      ], done)

    });


    it('should return error if not logged in', function (done) {

      request
        .get(testUrl)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done);
    });


    it('logging in user', function (done) {
      loginUser(done);
    });


    it('should return events of today by default',
      function (done) {

        request
          .get(testUrl)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {

            if (err) return done(err);

            expect(res.body)
              .to.be.an("array")
              .that.has.length(1);

            expect(res.body[0])
              .to.have.property('name', 'Clicked Notification Url');

            done();
          });

      });


    it('should accept date timestamp as query params',
      function (done) {

        request
          .get(testUrl + '/?date=' + yesterday)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {

            if (err) return done(err);

            expect(res.body)
              .to.be.an("array")
              .that.has.length(1);

            expect(res.body[0])
              .to.have.property('name', 'Created Segment');

            done();
          });

      });


  });


  describe('GET /apps/:aid/users/:uid/scores', function () {

    var aid, uid, testUrl;

    before(function (done) {
      aid = saved.apps.first._id;
      uid = saved.users.first._id;
      testUrl = '/apps/' + aid + '/users/' + uid + '/scores';
      logoutUser(function (err) {
        if (err) return done(err);

        DailyReportFixture(aid, [uid], done);
      });
    });


    it('should return error if not logged in', function (done) {

      request
        .get(testUrl)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done);
    });


    it('logging in user', function (done) {
      loginUser(done);
    });


    it('should return scores of last month by default',
      function (done) {

        request
          .get(testUrl)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {

            if (err) return done(err);

            expect(res.body)
              .to.be.an("object");

            expect(Object.keys(res.body)
              .length)
              .to.be.within(28, 31);

            _.each(res.body, function (score, timestamp) {

              expect(score)
                .to.be.within(0, 100);

              expect(moment(timestamp * 1000)
                .isValid())
                .to.be.true;

            });

            done();
          });

      });


    it('should accept from and to timestamps as query params',
      function (done) {

        var to = moment()
          .subtract('minutes', 10);

        var from = moment()
          .subtract('days', 28);

        request
          .get(testUrl + '/?from=' + from.unix() + '&to=' + to.unix())
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {

            if (err) return done(err);

            expect(res.body)
              .to.be.an("object");

            expect(Object.keys(res.body)
              .length)
              .to.eql(28);

            _.each(res.body, function (score, timestamp) {

              expect(score)
                .to.be.within(0, 100);

              expect(moment(timestamp * 1000)
                .isValid())
                .to.be.true;
            });


            done();
          });

      });


  });

});
